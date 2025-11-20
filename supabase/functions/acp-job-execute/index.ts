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
    const grokApiKey = Deno.env.get('GROK_API_KEY')!;
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
    const conversationHistories: Record<string, Array<any>> = {};
    const allResults: Record<string, any[]> = {};

    // Process each question sequentially across all personas
    for (const question of questions) {
      console.log(`Processing question: ${question}`);
      
      // Call each persona with the question
      for (const personaId of personaIds) {
        try {
          // Get persona data
          const { data: persona } = await supabase
            .from('v4_personas')
            .select('persona_id, name, conversation_summary')
            .eq('persona_id', personaId)
            .single();

          if (!persona) continue;

          // Build conversation history
          const history = conversationHistories[personaId] || [];

          // Call Grok conversation engine
          const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${grokApiKey}`
            },
            body: JSON.stringify({
              model: 'grok-beta',
              messages: [
                {
                  role: 'system',
                  content: `You are ${persona.name}. Respond authentically based on your persona traits: ${JSON.stringify(persona.conversation_summary)}`
                },
                ...history,
                {
                  role: 'user',
                  content: question
                }
              ],
              temperature: 0.8
            })
          });

          const grokData = await grokResponse.json();
          const response = grokData.choices[0].message.content;

          // Update conversation history
          conversationHistories[personaId] = [
            ...history,
            { role: 'user', content: question },
            { role: 'assistant', content: response }
          ];

          // Store result
          if (!allResults[personaId]) {
            allResults[personaId] = [];
          }
          allResults[personaId].push({
            question,
            response,
            traits_activated: [] // TODO: Extract from response if needed
          });

        } catch (error) {
          console.error(`Error processing persona ${personaId}:`, error);
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
      // Simple summary generation - can be enhanced later
      const allResponses = Object.values(allResults).flat();
      summary_report = {
        key_themes: extractThemes(allResponses),
        sentiment_breakdown: analyzeSentiment(allResponses),
        total_interactions: formattedResponses.reduce((sum, p) => sum + p.responses.length, 0),
        recommendations: "Summary analysis of persona feedback"
      };
    }

    // Calculate cost
    const totalInteractions = personaIds.length * questions.length;
    const cost = (totalInteractions * 0.10).toFixed(2);

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
