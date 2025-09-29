import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Declare EdgeRuntime interface for type safety
declare const EdgeRuntime: {
  waitUntil(promise: Promise<any>): void;
} | undefined;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, action = 'start' } = await req.json();
    
    console.log(`Research orchestrator called for session ${session_id}, action: ${action}`);

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === 'start') {
      // Use EdgeRuntime.waitUntil to ensure background task continues even after response
      const backgroundTask = orchestrateResearchSession(session_id, supabase);
      
      if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime && EdgeRuntime.waitUntil) {
        EdgeRuntime.waitUntil(backgroundTask);
        console.log(`Background task registered with EdgeRuntime for session ${session_id}`);
      } else {
        // Fallback for environments without EdgeRuntime
        backgroundTask.catch(console.error);
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Research session started in persistent background mode' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'status') {
      // Check session status
      const { data: session } = await supabase
        .from('research_survey_sessions')
        .select('status, completed_at, created_at')
        .eq('id', session_id)
        .single();

      return new Response(JSON.stringify({ 
        success: true, 
        session 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'resume') {
      // Use EdgeRuntime.waitUntil for resume task as well
      const resumeTask = resumeResearchSession(session_id, supabase);
      
      if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime && EdgeRuntime.waitUntil) {
        EdgeRuntime.waitUntil(resumeTask);
        console.log(`Resume task registered with EdgeRuntime for session ${session_id}`);
      } else {
        // Fallback for environments without EdgeRuntime
        resumeTask.catch(console.error);
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Research session resumed in persistent background mode' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid action' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in research orchestrator:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function orchestrateResearchSession(sessionId: string, supabase: any) {
  console.log(`Starting orchestration for session ${sessionId}`);
  
  let totalResponses = 0;
  let expectedResponses = 0;
  
  // Register shutdown handler to save progress
  const shutdownHandler = (event: any) => {
    console.log(`Function shutting down for session ${sessionId}, reason:`, event.detail?.reason);
    // Mark session as requiring resume if still in progress
    supabase
      .from('research_survey_sessions')
      .update({ 
        status: 'active', // Mark as active so it can be resumed
        last_heartbeat: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('status', 'in_progress')
      .then(() => console.log(`Session ${sessionId} marked for resumption`))
      .catch((error: any) => console.error('Error marking session for resumption:', error));
  };
  
  addEventListener('beforeunload', shutdownHandler);
  
  try {
    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('research_survey_sessions')
      .select(`
        *,
        research_surveys(name, description, questions)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('Failed to fetch session:', sessionError);
      return;
    }

    // Update session to started with heartbeat
    await supabase
      .from('research_survey_sessions')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString(),
        last_heartbeat: new Date().toISOString()
      })
      .eq('id', sessionId);

    console.log(`Session ${sessionId} marked as in_progress with heartbeat`);

    // Execute survey for each persona
    const questions = session.research_surveys?.questions || [];
    const personas = session.selected_personas || [];
    expectedResponses = personas.length * questions.length;

    for (const personaId of personas) {
      console.log(`Processing persona ${personaId}`);
      
      // Validate that this is a V4 persona
      if (!personaId.startsWith('v4_')) {
        console.error(`Skipping non-V4 persona: ${personaId}. Research sessions only support V4 personas.`);
        continue;
      }
      
      // Update heartbeat periodically
      const heartbeatInterval = setInterval(async () => {
        try {
          await supabase
            .from('research_survey_sessions')
            .update({ last_heartbeat: new Date().toISOString() })
            .eq('id', sessionId);
        } catch (error) {
          console.error('Error updating heartbeat:', error);
        }
      }, 30000); // Every 30 seconds
      
      for (let questionIndex = 0; questionIndex < questions.length; questionIndex++) {
        // Normalize question to handle both string and object formats
        const rawQuestion = questions[questionIndex];
        const question = typeof rawQuestion === 'string' 
          ? { text: rawQuestion } 
          : rawQuestion;
        
        // Check if response already exists (for recovery)
        const { data: existingResponse } = await supabase
          .from('research_survey_responses')
          .select('id')
          .eq('session_id', sessionId)
          .eq('persona_id', personaId)
          .eq('question_index', questionIndex)
          .single();

        if (existingResponse) {
          console.log(`Response already exists for persona ${personaId}, question ${questionIndex}`);
          totalResponses++;
          continue;
        }

        // Generate response using V4 Grok conversation with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        let success = false;
        
        while (retryCount < maxRetries && !success) {
          try {
            console.log(`Attempting response generation for ${personaId}, question ${questionIndex} (attempt ${retryCount + 1})`);
            
            const response = await supabase.functions.invoke('v4-grok-conversation', {
              body: {
                persona_id: personaId,
                user_message: question.text,
                imageData: question.image?.data || question.image?.url
              }
            });

            if (response.data?.success && response.data?.response) {
              // Store the response atomically
              await supabase
                .from('research_survey_responses')
                .insert({
                  session_id: sessionId,
                  persona_id: personaId,
                  question_index: questionIndex,
                  question_text: question.text,
                  response_text: response.data.response
                });

              totalResponses++;
              success = true;
              
              // Update progress in session
              const progressPercent = Math.round((totalResponses / expectedResponses) * 100);
              await supabase
                .from('research_survey_sessions')
                .update({ 
                  progress_data: { 
                    completed_responses: totalResponses,
                    total_expected: expectedResponses,
                    progress_percent: progressPercent
                  },
                  last_heartbeat: new Date().toISOString()
                })
                .eq('id', sessionId);

              console.log(`Stored response for persona ${personaId}, question ${questionIndex}. Progress: ${progressPercent}%`);
            } else {
              throw new Error(`Invalid response from V4 Grok: ${JSON.stringify(response.data)}`);
            }

          } catch (error) {
            retryCount++;
            console.error(`Error generating response for persona ${personaId}, question ${questionIndex} (attempt ${retryCount}):`, error);
            
            if (retryCount < maxRetries) {
              // Exponential backoff with jitter
              const delay = Math.min(1000 * Math.pow(2, retryCount - 1) + Math.random() * 1000, 10000);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        
        if (!success) {
          console.error(`Failed to generate response for persona ${personaId}, question ${questionIndex} after ${maxRetries} attempts`);
        }

        // Add delay between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Clear heartbeat interval for this persona
      clearInterval(heartbeatInterval);
    }

    // Mark session as completed
    await supabase
      .from('research_survey_sessions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        progress_data: { 
          completed_responses: totalResponses,
          total_expected: expectedResponses,
          progress_percent: 100
        }
      })
      .eq('id', sessionId);

    console.log(`Session ${sessionId} completed with ${totalResponses}/${expectedResponses} responses, starting insights generation`);

    // Generate insights
    try {
      const insightsResponse = await supabase.functions.invoke('compile-research-insights', {
        body: {
          survey_session_id: sessionId,
          user_id: session.user_id
        }
      });

      if (insightsResponse.error) {
        console.error('Failed to generate insights:', insightsResponse.error);
      } else {
        console.log(`Insights generated successfully for session ${sessionId}`);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    }

  } catch (error) {
    console.error(`Error orchestrating session ${sessionId}:`, error);
    
    // Mark session as failed with progress data
    await supabase
      .from('research_survey_sessions')
      .update({ 
        status: 'failed',
        completed_at: new Date().toISOString(),
        progress_data: { 
          completed_responses: totalResponses,
          total_expected: expectedResponses,
          progress_percent: Math.round((totalResponses / expectedResponses) * 100),
          error_message: error instanceof Error ? error.message : String(error)
        }
      })
      .eq('id', sessionId);
  } finally {
    // Clean up event listener
    removeEventListener('beforeunload', shutdownHandler);
  }
}

async function resumeResearchSession(sessionId: string, supabase: any) {
  console.log(`Resuming session ${sessionId}`);
  
  // Check current status
  const { data: session } = await supabase
    .from('research_survey_sessions')
    .select('status')
    .eq('id', sessionId)
    .single();

  if (session?.status === 'active' || session?.status === 'in_progress') {
    // Resume orchestration
    await orchestrateResearchSession(sessionId, supabase);
  } else {
    console.log(`Session ${sessionId} status is ${session?.status}, nothing to resume`);
  }
}