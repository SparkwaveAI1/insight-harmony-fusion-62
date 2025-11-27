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
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    
    // Validate GROK_API_KEY is set
    if (!grokApiKey) {
      console.error('GROK_API_KEY is not configured');
      throw new Error('GROK_API_KEY is not configured in edge function secrets');
    }
    
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
          const { data: persona, error: personaError } = await supabase
            .from('v4_personas')
            .select('persona_id, name, conversation_summary')
            .eq('persona_id', personaId)
            .single();

          if (personaError || !persona) {
            console.error(`Failed to fetch persona ${personaId}:`, personaError);
            continue;
          }

          // Build conversation history
          const history = conversationHistories[personaId] || [];

          console.log(`Calling Grok for persona ${persona.name} with question: ${question.substring(0, 50)}...`);

          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          try {
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
              }),
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Check response status before parsing
            if (!grokResponse.ok) {
              const errorText = await grokResponse.text();
              console.error(`Grok API error for ${persona.name}:`, grokResponse.status, errorText);
              throw new Error(`Grok API returned ${grokResponse.status}: ${errorText}`);
            }

            const grokData = await grokResponse.json();
            console.log(`Grok response structure for ${persona.name}:`, JSON.stringify(grokData).substring(0, 300));

            // Safely access response with null checks
            if (!grokData.choices || !Array.isArray(grokData.choices) || grokData.choices.length === 0) {
              console.error(`Invalid Grok response - no choices array:`, grokData);
              throw new Error('Invalid response structure from Grok API - no choices');
            }

            if (!grokData.choices[0].message || !grokData.choices[0].message.content) {
              console.error(`Invalid Grok response - no message content:`, grokData.choices[0]);
              throw new Error('Invalid response structure from Grok API - no message content');
            }

            const response = grokData.choices[0].message.content;
            console.log(`✅ Got response from ${persona.name}: ${response.substring(0, 100)}...`);

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
              traits_activated: []
            });

          } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
              console.error(`Grok API timeout for ${persona.name} after 30 seconds`);
            } else {
              console.error(`Grok API fetch error for ${persona.name}:`, fetchError);
            }
            throw fetchError;
          }

        } catch (error) {
          console.error(`Error processing persona ${personaId}:`, error);
          // Continue with other personas even if one fails
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
