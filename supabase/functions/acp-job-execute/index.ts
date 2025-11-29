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
  persona_criteria?: string;  // NEW: Target audience description from Butler
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
    // DIAGNOSTIC: First line timestamp
    console.log(`🔔 [ACP-JOB] REQUEST RECEIVED at ${new Date().toISOString()}`);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse job request
    const jobRequest: JobRequest = await req.json();
    
    // Log raw request from Butler for debugging
    console.log('========================================');
    console.log(`⏱️ [ACP-JOB] ${new Date().toISOString()} - Parsed request`);
    console.log('🚀 [ACP-JOB] Raw request from Butler:', JSON.stringify({
      job_id: jobRequest.job_id,
      persona_criteria: jobRequest.persona_criteria,
      research_query: jobRequest.research_query,
      questions: jobRequest.questions,
      num_personas: jobRequest.num_personas
    }, null, 2));
    console.log('========================================');

    const {
      job_id,
      research_query,
      persona_criteria,
      questions,
      num_personas = 5,
      include_summary = true
    } = jobRequest;

    // Determine the effective query for persona search
    // Priority: persona_criteria > research_query > inferred from questions
    let effectiveQuery = persona_criteria || research_query || '';

    if (!effectiveQuery || effectiveQuery.length < 10) {
      // Fall back to inferring from questions if query is missing or too short
      effectiveQuery = `Find personas relevant to: ${questions.join(' ')}`;
      console.log(`⚠️ [ACP-JOB] No specific criteria provided, inferring from questions`);
    }

    console.log(`🎯 [ACP-JOB] Effective query for persona search: "${effectiveQuery}"`);

    // ============= STEP 1: PERSONA SELECTION via acp-persona-search-v2 =============
    console.log('📦 [ACP-JOB] STEP 1: Finding personas via deterministic search');
    
    let selectedPersonas: any[] = [];
    let selectionMethod = 'acp-persona-search-v2';
    let searchMetadata: any = {};
    
    try {
      // DIAGNOSTIC: Before persona search
      console.log(`⏱️ [ACP-JOB] ${new Date().toISOString()} - STARTING acp-persona-search-v2`);
      
      // Call the new LLM-powered persona search with effectiveQuery
      const { data: searchData, error: searchError } = await supabase.functions.invoke('acp-persona-search-v2', {
        body: {
          research_query: effectiveQuery,
          persona_count: num_personas,
          min_results: 3
        }
      });
      
      // DIAGNOSTIC: After persona search
      console.log(`⏱️ [ACP-JOB] ${new Date().toISOString()} - COMPLETED acp-persona-search-v2`);

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
          message: `Could not find personas matching: "${effectiveQuery}"${persona_criteria ? ` (criteria: ${persona_criteria})` : ''}`,
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
    
    // Return error if no personas found - NO CHARGE
    if (selectedPersonas.length === 0) {
      console.error(`❌ [ACP-JOB] NO PERSONAS FOUND - Returning 404 with $0.00 cost`);
      console.error(`   Query: "${effectiveQuery}"`);
      console.error(`   Parsed criteria: ${JSON.stringify(searchMetadata.parsed_criteria)}`);
      return new Response(
        JSON.stringify({ 
          error: 'no_matching_personas',
          message: `No personas found matching: "${effectiveQuery}"`,
          parsed_criteria: searchMetadata.parsed_criteria,
          suggestion: 'Try broader search terms (e.g., remove specific locations or occupations)',
          job_id,
          cost: '$0.00'
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
          // DIAGNOSTIC: Before Grok call
          console.log(`⏱️ [ACP-JOB] ${new Date().toISOString()} - STARTING v4-grok-conversation for ${persona?.name || personaId}`);

          const { data: grokData, error: grokError } = await supabase.functions.invoke('v4-grok-conversation', {
            body: {
              persona_id: personaId,
              user_message: question,
              conversation_history: history
            }
          });
          
          // DIAGNOSTIC: After Grok call
          console.log(`⏱️ [ACP-JOB] ${new Date().toISOString()} - COMPLETED v4-grok-conversation for ${persona?.name || personaId}`);

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

    // ============= STEP 4: GENERATE SUMMARY REPORT =============
    let summary_report = null;
    if (include_summary) {
      console.log('📊 [ACP-JOB] STEP 4: Generating structured summary report with qualitative insights');
      
      // Build responsesByQuestion
      const responsesByQuestion = questions.map((questionText, questionIndex) => ({
        questionIndex,
        questionText,
        responses: selectedPersonas.map((persona: any) => {
          const personaResults = allResults[persona.persona_id] || [];
          const matchingResponse = personaResults.find((r: any) => r.question === questionText);
          return {
            personaId: persona.persona_id,
            personaName: persona.name,
            responseText: matchingResponse?.response || 'No response',
            error: matchingResponse?.error || false
          };
        }).filter((r: any) => !r.error)
      }));

      // Build responsesByPersona
      const responsesByPersona = selectedPersonas.map((persona: any) => ({
        personaId: persona.persona_id,
        personaName: persona.name,
        personaSummary: persona.summary,
        responses: (allResults[persona.persona_id] || []).map((r: any, idx: number) => ({
          questionIndex: idx,
          questionText: r.question,
          responseText: r.response,
          traitsActivated: r.traits_activated || []
        }))
      }));

      // Generate qualitative insights using the SAME function as the app
      let qualitative_report = null;
      try {
        // DIAGNOSTIC: Before insights call
        console.log(`⏱️ [ACP-JOB] ${new Date().toISOString()} - STARTING compile-research-insights`);
        
        // Build responses in the format expected by compile-research-insights
        const flatResponses: Array<{
          persona_id: string;
          question_index: number;
          question_text: string;
          response_text: string;
        }> = [];
        
        selectedPersonas.forEach((persona: any, personaIdx: number) => {
          const personaResults = allResults[persona.persona_id] || [];
          personaResults.forEach((result: any, questionIdx: number) => {
            if (!result.error) {
              flatResponses.push({
                persona_id: persona.persona_id,
                question_index: questionIdx,
                question_text: result.question,
                response_text: result.response
              });
            }
          });
        });

        // Build personas in the format expected
        const personasForAnalysis = selectedPersonas.map((p: any) => ({
          persona_id: p.persona_id,
          name: p.name,
          full_profile: p.full_profile,
          summary: p.summary
        }));

        // Call compile-research-insights with direct data
        const { data: insightsData, error: insightsError } = await supabase.functions.invoke('compile-research-insights', {
          body: {
            direct_data: {
              responses: flatResponses,
              personas: personasForAnalysis,
              questions: questions,
              study_name: persona_criteria || research_query || 'ACP Research Study',
              study_description: `ACP research study with ${selectedPersonas.length} personas and ${questions.length} questions`
            }
          }
        });
        
        // DIAGNOSTIC: After insights call
        console.log(`⏱️ [ACP-JOB] ${new Date().toISOString()} - COMPLETED compile-research-insights`);

        if (insightsError) {
          console.error('❌ [ACP-JOB] Failed to generate qualitative insights:', insightsError);
        } else if (insightsData?.insights) {
          qualitative_report = insightsData.insights;
          console.log('✅ [ACP-JOB] Qualitative insights generated successfully');
        }
      } catch (insightsErr) {
        console.error('❌ [ACP-JOB] Error calling compile-research-insights:', insightsErr);
      }

      summary_report = {
        surveyName: persona_criteria || research_query || 'ACP Research Study',
        timestamp: new Date().toISOString(),
        questions: questions,
        totalResponses: formattedResponses.reduce((sum, p) => sum + p.responses.filter((r: any) => !r.error).length, 0),
        personasInterviewed: selectedPersonas.length,
        responsesByQuestion,
        responsesByPersona,
        selectionMetadata: {
          method: selectionMethod,
          parsedCriteria: searchMetadata.parsed_criteria,
          matchedCollections: searchMetadata.matched_collections,
          relaxedCriteria: searchMetadata.relaxed_criteria || false,
          relaxationSteps: searchMetadata.relaxation_steps || []
        },
        // Include the qualitative insights report (same format as the app)
        qualitative_report
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
    // DIAGNOSTIC: Error with timestamp and stack
    console.error(`❌ [ACP-JOB] ${new Date().toISOString()} - FATAL ERROR:`, error);
    console.error(`   Stack:`, error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
