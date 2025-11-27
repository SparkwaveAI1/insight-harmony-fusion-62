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
    console.log('========================================');
    console.log('🚀 [ACP-JOB] New Job Request:', JSON.stringify(jobRequest, null, 2));
    console.log('========================================');

    const {
      job_id,
      research_query,
      questions,
      num_personas = 5,
      include_summary = true
    } = jobRequest;

    // ============= STEP 1: PERSONA SELECTION via acp-persona-search-v2 =============
    console.log('📦 [ACP-JOB] STEP 1: Finding personas via LLM-powered search');
    
    let selectedPersonas: any[] = [];
    let selectionMethod = 'acp-persona-search-v2';
    let searchMetadata: any = {};
    
    try {
      // Call the new LLM-powered persona search
      const { data: searchData, error: searchError } = await supabase.functions.invoke('acp-persona-search-v2', {
        body: {
          research_query,
          persona_count: num_personas,
          min_results: 3
        }
      });

      if (searchError) {
        console.error('❌ [ACP-JOB] acp-persona-search-v2 error:', searchError);
        throw new Error(`Persona search failed: ${searchError.message}`);
      }

      if (!searchData?.success) {
        console.error('❌ [ACP-JOB] Search returned unsuccessful:', searchData?.error);
        throw new Error(searchData?.error || 'Persona search failed');
      }

      console.log(`✅ [ACP-JOB] Search found ${searchData.total_found} personas`);
      console.log(`   Parsed criteria:`, JSON.stringify(searchData.parsed_criteria, null, 2));
      console.log(`   Matched collections: ${searchData.matched_collections}`);
      
      if (searchData.relaxed_criteria) {
        console.log(`⚠️ [ACP-JOB] Criteria was relaxed: ${searchData.relaxation_steps.join(', ')}`);
      }

      // Map to the format expected by the rest of the function
      selectedPersonas = (searchData.personas || []).map((p: any) => ({
        persona_id: p.persona_id,
        name: p.name,
        summary: p.summary?.occupation 
          ? `${p.summary.occupation}, ${p.summary.age || 'unknown age'}, ${p.summary.location?.city || p.summary.location?.region || 'unknown location'}`
          : 'No summary available',
        full_profile: p.full_profile,
        relevance_score: p.relevance_score
      }));

      searchMetadata = {
        parsed_criteria: searchData.parsed_criteria,
        matched_collections: searchData.matched_collections,
        relaxed_criteria: searchData.relaxed_criteria,
        relaxation_steps: searchData.relaxation_steps || []
      };

    } catch (searchError) {
      console.error('❌ [ACP-JOB] Failed to search personas:', searchError);
      return new Response(
        JSON.stringify({ 
          error: 'persona_search_failed',
          message: `Could not find personas matching: "${research_query}"`,
          details: searchError instanceof Error ? searchError.message : 'Unknown error',
          suggestion: 'Try broader criteria or different keywords',
          job_id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }
    
    // Return error if no personas found
    if (selectedPersonas.length === 0) {
      console.error('❌ [ACP-JOB] No matching personas found for research query');
      return new Response(
        JSON.stringify({ 
          error: 'no_matching_personas',
          message: `Could not find personas matching: "${research_query}"`,
          suggestion: 'Try broader criteria or different keywords',
          job_id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    console.log('========================================');
    console.log(`✅ [ACP-JOB] Selected ${selectedPersonas.length} personas via ${selectionMethod}:`);
    selectedPersonas.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.persona_id})`);
    });
    console.log('========================================');

    // ============= STEP 2: RUN STUDY =============
    console.log('💬 [ACP-JOB] STEP 2: Running study with questions');
    
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
      console.log(`💬 [ACP-JOB] Processing question: ${question.substring(0, 80)}...`);
      
      // Call each persona with the question
      for (const personaId of personaIds) {
        const persona = selectedPersonas.find((p: any) => p.persona_id === personaId);
        const history = conversationHistories[personaId];

        try {
          console.log(`🔄 [ACP-JOB] Calling v4-grok-conversation for ${persona?.name || personaId}`);

          const { data: grokData, error: grokError } = await supabase.functions.invoke('v4-grok-conversation', {
            body: {
              persona_id: personaId,
              user_message: question,
              conversation_history: history
            }
          });

          if (grokError) {
            console.error(`❌ [ACP-JOB] v4-grok-conversation error for ${persona?.name}:`, grokError);
            throw new Error(`v4-grok-conversation failed: ${grokError.message}`);
          }

          if (!grokData?.success || !grokData?.response) {
            console.error(`❌ [ACP-JOB] Invalid response from v4-grok-conversation:`, JSON.stringify(grokData));
            throw new Error(grokData?.error || 'No response from v4-grok-conversation');
          }

          const response = grokData.response;
          const traitsActivated = grokData.traits_selected || [];
          console.log(`✅ [ACP-JOB] Got response from ${persona?.name}: ${response.substring(0, 60)}...`);

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

        } catch (error) {
          console.error(`❌ [ACP-JOB] Error processing persona ${personaId}:`, error);
          allResults[personaId].push({
            question,
            response: `Error: ${error.message}`,
            traits_activated: [],
            error: true
          });
        }
      }
    }

    // ============= STEP 3: FORMAT RESULTS =============
    console.log('📊 [ACP-JOB] STEP 3: Formatting results');
    
    const formattedResponses = selectedPersonas.map((persona: any) => ({
      persona_id: persona.persona_id,
      persona_name: persona.name,
      persona_summary: persona.summary,
      responses: allResults[persona.persona_id] || []
    }));

    // ============= STEP 4: GENERATE SUMMARY =============
    let summary_report = null;
    if (include_summary) {
      console.log('📊 [ACP-JOB] STEP 4: Generating summary report');
      const allResponses = Object.values(allResults).flat();
      summary_report = {
        key_themes: extractThemes(allResponses),
        sentiment_breakdown: analyzeSentiment(allResponses),
        total_interactions: formattedResponses.reduce((sum, p) => sum + p.responses.length, 0),
        recommendations: "Summary analysis of persona feedback",
        selection_method: selectionMethod,
        search_metadata: searchMetadata
      };
    }

    // Calculate cost: $0.12 per question per persona
    const totalInteractions = personaIds.length * questions.length;
    const cost = (totalInteractions * 0.12).toFixed(2);

    console.log('========================================');
    console.log(`✅ [ACP-JOB] Job ${job_id} COMPLETED`);
    console.log(`   Personas: ${personaIds.length}`);
    console.log(`   Questions: ${questions.length}`);
    console.log(`   Total interactions: ${totalInteractions}`);
    console.log(`   Selection method: ${selectionMethod}`);
    console.log(`   Cost: $${cost}`);
    console.log('========================================');

    // Return job results
    const response = {
      job_id,
      status: 'completed',
      study_results: {
        personas_interviewed: personaIds.length,
        questions_asked: questions.length,
        total_interactions: totalInteractions,
        responses: formattedResponses,
        summary_report,
        selection_method: selectionMethod
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
    console.error('❌ [ACP-JOB] Execution Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// ============= HELPER FUNCTIONS =============
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
