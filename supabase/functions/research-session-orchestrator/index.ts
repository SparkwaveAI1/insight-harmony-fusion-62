import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, action = 'start' } = await req.json();
    
    console.log(`Research orchestrator called for session ${session_id}, action: ${action}`);

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === 'start') {
      // Start the research session orchestration in background
      EdgeRuntime.waitUntil(orchestrateResearchSession(session_id, supabase));
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Research session started in background' 
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
      // Resume interrupted session
      EdgeRuntime.waitUntil(resumeResearchSession(session_id, supabase));
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Research session resumed in background' 
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
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function orchestrateResearchSession(sessionId: string, supabase: any) {
  console.log(`Starting orchestration for session ${sessionId}`);
  
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

    // Update session to started
    await supabase
      .from('research_survey_sessions')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    console.log(`Session ${sessionId} marked as in_progress`);

    // Execute survey for each persona
    const questions = session.research_surveys?.questions || [];
    const personas = session.selected_personas || [];

    for (const personaId of personas) {
      console.log(`Processing persona ${personaId}`);
      
      for (let questionIndex = 0; questionIndex < questions.length; questionIndex++) {
        const question = questions[questionIndex];
        
        // Check if response already exists
        const { data: existingResponse } = await supabase
          .from('research_survey_responses')
          .select('id')
          .eq('session_id', sessionId)
          .eq('persona_id', personaId)
          .eq('question_index', questionIndex)
          .single();

        if (existingResponse) {
          console.log(`Response already exists for persona ${personaId}, question ${questionIndex}`);
          continue;
        }

        // Generate response using V4 Grok conversation engine with isolation
        try {
          // Create isolated conversation context for this persona/session
          const conversationHistory = [];
          
          const response = await supabase.functions.invoke('v4-grok-conversation', {
            body: {
              persona_id: personaId,
              user_message: question.text,
              conversation_history: conversationHistory // Empty for isolation
            }
          });

          if (response.data?.response) {
            // Store the response
            await supabase
              .from('research_survey_responses')
              .insert({
                session_id: sessionId,
                persona_id: personaId,
                question_index: questionIndex,
                question_text: question.text,
                response_text: response.data.response
              });

            console.log(`Stored response for persona ${personaId}, question ${questionIndex}`);
          }

          // Add delay between requests to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Error generating response for persona ${personaId}, question ${questionIndex}:`, error);
          // Continue with next question rather than failing entire session
        }
      }
    }

    // Mark session as completed
    await supabase
      .from('research_survey_sessions')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    console.log(`Session ${sessionId} completed, starting insights generation`);

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
    
    // Mark session as failed
    await supabase
      .from('research_survey_sessions')
      .update({ 
        status: 'failed',
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId);
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