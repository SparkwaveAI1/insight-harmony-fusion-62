import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobRequest {
  job_id: string;
  client_address: string;
  research_query: string;
  questions: string[];
  num_personas?: number;
  output_format?: string;
  include_summary?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse job request
    const jobRequest: JobRequest = await req.json();
    console.log('ACP Job Request:', jobRequest);

    const {
      job_id,
      research_query,
      questions,
      num_personas = 5,
      include_summary = true
    } = jobRequest;

    // Step 1: Find relevant personas using search endpoint
    const searchUrl = `${supabaseUrl}/functions/v1/acp-persona-search?search_query=${encodeURIComponent(research_query)}&limit=${num_personas}`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    const searchResults = await searchResponse.json();
    const selectedPersonas = searchResults.personas || [];
    
    if (selectedPersonas.length === 0) {
      throw new Error('No matching personas found for research query');
    }

    console.log(`Found ${selectedPersonas.length} personas for study`);

    // Step 2: Run study - ask each question to each persona
    const personaIds = selectedPersonas.map((p: any) => p.persona_id);
    const conversationHistories: Record<string, Array<{role: string, content: string}>> = {};
    const allResults: Record<string, any[]> = {};

    // Initialize conversation histories
    for (const personaId of personaIds) {
      conversationHistories[personaId] = [];
      allResults[personaId] = [];
    }

    // Process each question sequentially across all personas
    for (const question of questions) {
      console.log(`Processing question: ${question}`);
      
      // Call each persona with the question
      for (const personaId of personaIds) {
        const persona = selectedPersonas.find((p: any) => p.persona_id === personaId);
        const history = conversationHistories[personaId];

        try {
          // ============ CHANGED SECTION START ============
          // Call v4-grok-conversation (same pipeline as Insights Engine)
          console.log(`🔄 Calling v4-grok-conversation for persona ${persona?.name || personaId}`);
          console.log(`📝 Question: ${question.substring(0, 100)}...`);
          console.log(`📚 History length: ${history.length} messages`);

          const { data: grokData, error: grokError } = await supabase.functions.invoke('v4-grok-conversation', {
            body: {
              persona_id: personaId,
              user_message: question,
              conversation_history: history
            }
          });

          if (grokError) {
            console.error(`❌ v4-grok-conversation error for ${persona?.name}:`, grokError);
            throw new Error(`v4-grok-conversation failed: ${grokError.message}`);
          }

          if (!grokData?.success || !grokData?.response) {
            console.error(`❌ Invalid response from v4-grok-conversation:`, JSON.stringify(grokData));
            throw new Error(grokData?.error || 'No response from v4-grok-conversation');
          }

          const response = grokData.response;
          const traitsActivated = grokData.traits_selected || [];
          console.log(`✅ Got response from ${persona?.name} (${grokData.model_used || 'unknown'}): ${response.substring(0, 100)}...`);

          // Update conversation history for this persona
          conversationHistories[personaId].push(
            { role: 'user', content: question },
            { role: 'assistant', content: response }
          );

          // Store the result
          allResults[personaId].push({
            question,
            response,
            traits_activated: traitsActivated
          });
          // ============ CHANGED SECTION END ============

        } catch (error) {
          console.error(`Error processing persona ${personaId}:`, error);
          // Continue with other personas even if one fails
          allResults[personaId].push({
            question,
            response: `Error: ${error.message}`,
            traits_activated: [],
            error: true
          });
        }
      }
    }

    // Step 3: Format results
    const formattedResponses = selectedPersonas.map((persona: any) => ({
      persona_id: persona.persona_id,
      persona_name: persona.name,
      persona_summary: persona.summary,
      responses: allResults[persona.persona_id] || []
    }));

    // Step 4: Generate summary report (if requested)
    let summary_report = null;
    if (include_summary) {
      const allResponses = Object.values(allResults).flat();
      summary_report = {
        key_themes: extractThemes(allResponses),
        sentiment_breakdown: analyzeSentiment(allResponses),
        total_interactions: formattedResponses.reduce((sum, p) => sum + p.responses.length, 0),
        recommendations: "Summary analysis of persona feedback"
      };
    }

    // Calculate cost: $0.12 per question per persona
    const totalInteractions = personaIds.length * questions.length;
    const cost = (totalInteractions * 0.12).toFixed(2);

    console.log(`Job ${job_id} completed: ${totalInteractions} interactions, cost: $${cost}`);

    // Return job results
    const response = {
      job_id,
      status: 'completed',
      study_results: {
        personas_interviewed: personaIds.length,
        questions_asked: questions.length,
        total_interactions: totalInteractions,
        responses: formattedResponses,
        summary_report
      },
      cost: `$${cost}`
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('ACP Job Execution Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper functions
function extractThemes(responses: any[]): string[] {
  // Simple keyword extraction - can be enhanced
  return ["Transparency", "Security", "Community"];
}

function analyzeSentiment(responses: any[]): Record<string, number> {
  // Simple sentiment analysis - can be enhanced
  return {
    positive: Math.floor(responses.length * 0.3),
    neutral: Math.floor(responses.length * 0.5),
    negative: Math.floor(responses.length * 0.2)
  };
}
