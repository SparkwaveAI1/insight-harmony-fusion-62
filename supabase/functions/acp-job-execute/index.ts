import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobRequest {
  action?: 'execute' | 'status';
  job_id: string;
  client_address?: string;
  research_query?: string;
  persona_criteria?: string;
  questions?: string[];
  num_personas?: number;
  output_format?: string;
  include_summary?: boolean;
}

// Background task to execute the ACP job
async function executeAcpJob(
  internalJobId: string,
  jobRequest: JobRequest,
  supabase: any
) {
  const { job_id, research_query, persona_criteria, questions = [], num_personas = 5, include_summary = true } = jobRequest;
  
  // Register shutdown handler
  const shutdownHandler = (event: any) => {
    console.log(`⚠️ [ACP-JOB] Job ${job_id} shutting down:`, event.detail?.reason);
    supabase.from('acp_jobs')
      .update({ 
        status: 'interrupted', 
        last_heartbeat: new Date().toISOString(),
        error_message: `Shutdown: ${event.detail?.reason || 'unknown'}`
      })
      .eq('id', internalJobId)
      .then(() => {});
  };
  addEventListener('beforeunload', shutdownHandler);

  // Helper to update progress
  const updateProgress = async (message: string, percent: number) => {
    await supabase.from('acp_jobs')
      .update({ 
        progress_data: { message, percent, updated_at: new Date().toISOString() },
        last_heartbeat: new Date().toISOString()
      })
      .eq('id', internalJobId);
    console.log(`📊 [ACP-JOB] Progress: ${percent}% - ${message}`);
  };

  try {
    // Determine effective query
    let effectiveQuery = persona_criteria || research_query || '';
    if (!effectiveQuery || effectiveQuery.length < 10) {
      effectiveQuery = `Find personas relevant to: ${questions.join(' ')}`;
    }

    // ============= STEP 1: PERSONA SELECTION =============
    await updateProgress('Searching for matching personas...', 10);
    
    const { data: searchData, error: searchError } = await supabase.functions.invoke('acp-persona-search-v2', {
      body: {
        research_query: effectiveQuery,
        persona_count: num_personas,
        min_results: 3
      }
    });

    if (searchError || !searchData?.success) {
      const errorMsg = searchError?.message || searchData?.reason || 'Persona search failed';
      throw new Error(`persona_search_failed: ${errorMsg}`);
    }

    const selectedPersonas = (searchData.personas || []).map((p: any) => ({
      persona_id: p.persona_id,
      name: p.name,
      match_score: p.match_score || 0.5,
      match_reason: p.match_reason || 'No evaluation',
      summary: p.demographics?.occupation 
        ? `${p.demographics.occupation}, ${p.demographics.age || 'unknown age'}, ${p.demographics.location || 'unknown location'}`
        : 'No summary available',
      full_profile: p.full_profile,
      demographics: p.demographics
    }));

    if (selectedPersonas.length === 0) {
      throw new Error(`no_matching_personas: No personas found for "${effectiveQuery}"`);
    }

    const searchMetadata = {
      parsed_criteria: searchData.parsed_criteria,
      matched_collections: searchData.matched_collections,
      decision_summary: searchData.decision_summary,
      stages: searchData.stages || []
    };

    console.log(`✅ [ACP-JOB] Found ${selectedPersonas.length} personas`);
    await updateProgress(`Found ${selectedPersonas.length} personas, starting interviews...`, 20);

    // ============= STEP 2: RUN STUDY (PARALLELIZED) =============
    const personaIds = selectedPersonas.map((p: any) => p.persona_id);
    const allResults: Record<string, any[]> = {};
    for (const personaId of personaIds) {
      allResults[personaId] = [];
    }

    const totalSteps = personaIds.length;
    let completedPersonas = 0;

    const personaConversationPromises = personaIds.map(async (personaId: string) => {
      const persona = selectedPersonas.find((p: any) => p.persona_id === personaId);
      const history: Array<{role: string, content: string}> = [];
      const results: any[] = [];

      for (const question of questions) {
        try {
          const { data: grokData, error: grokError } = await supabase.functions.invoke('v4-grok-conversation', {
            body: {
              persona_id: personaId,
              user_message: question,
              conversation_history: history
            }
          });

          if (grokError || !grokData?.success) {
            results.push({
              question,
              response: `Error: ${grokError?.message || grokData?.error || 'No response'}`,
              traits_activated: [],
              error: true
            });
            continue;
          }

          const response = grokData.response;
          history.push(
            { role: 'user', content: question },
            { role: 'assistant', content: response }
          );

          results.push({
            question,
            response,
            traits_activated: grokData.traits_selected || []
          });

        } catch (error: any) {
          results.push({
            question,
            response: `Error: ${error.message}`,
            traits_activated: [],
            error: true
          });
        }
      }

      completedPersonas++;
      const progressPercent = 20 + Math.round((completedPersonas / totalSteps) * 60);
      await updateProgress(`Interviewed ${completedPersonas}/${totalSteps} personas`, progressPercent);

      return { personaId, results };
    });

    const personaResults = await Promise.all(personaConversationPromises);
    for (const { personaId, results } of personaResults) {
      allResults[personaId] = results;
    }

    // ============= STEP 3: FORMAT RESULTS =============
    await updateProgress('Formatting results...', 85);

    const formattedResponses = selectedPersonas.map((persona: any) => ({
      persona_id: persona.persona_id,
      persona_name: persona.name,
      persona_summary: persona.summary,
      responses: allResults[persona.persona_id] || []
    }));

    // ============= STEP 4: GENERATE SUMMARY =============
    let summary_report = null;
    if (include_summary) {
      await updateProgress('Generating insights report...', 90);

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

      // Generate qualitative insights
      let qualitative_report = null;
      try {
        const flatResponses: Array<any> = [];
        selectedPersonas.forEach((persona: any) => {
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

        const personasForAnalysis = selectedPersonas.map((p: any) => ({
          persona_id: p.persona_id,
          name: p.name,
          full_profile: p.full_profile,
          summary: p.summary
        }));

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

        if (!insightsError && insightsData?.insights) {
          qualitative_report = insightsData.insights;
        }
      } catch (insightsErr) {
        console.error('❌ [ACP-JOB] Error generating insights:', insightsErr);
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
          method: 'acp-persona-search-v2',
          parsedCriteria: searchMetadata.parsed_criteria,
          matchedCollections: searchMetadata.matched_collections,
          decisionSummary: searchMetadata.decision_summary || null,
          stages: searchMetadata.stages || []
        },
        qualitative_report
      };
    }

    // Calculate cost
    const totalInteractions = personaIds.length * questions.length;
    const cost = (totalInteractions * 0.12).toFixed(2);

    // Store final results
    const finalResponse = {
      job_id,
      status: 'completed',
      study_results: {
        personas_interviewed: personaIds.length,
        questions_asked: questions.length,
        total_interactions: totalInteractions,
        responses: formattedResponses,
        summary_report,
        selection_method: 'acp-persona-search-v2'
      },
      cost: `$${cost}`
    };

    await supabase.from('acp_jobs')
      .update({
        status: 'completed',
        results: finalResponse,
        completed_at: new Date().toISOString(),
        progress_data: { message: 'Complete', percent: 100 }
      })
      .eq('id', internalJobId);

    console.log(`✅ [ACP-JOB] Job ${job_id} COMPLETED and stored. Cost: $${cost}`);

  } catch (error: any) {
    console.error(`❌ [ACP-JOB] Job ${job_id} FAILED:`, error.message);
    await supabase.from('acp_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', internalJobId);
  } finally {
    removeEventListener('beforeunload', shutdownHandler);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const jobRequest: JobRequest = await req.json();
    const action = jobRequest.action || 'execute';

    console.log(`🔔 [ACP-JOB] ${action.toUpperCase()} request for job_id: ${jobRequest.job_id}`);

    // ============= STATUS ACTION =============
    if (action === 'status') {
      const { data: job, error: fetchError } = await supabase
        .from('acp_jobs')
        .select('*')
        .eq('external_job_id', jobRequest.job_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !job) {
        return new Response(
          JSON.stringify({ error: 'job_not_found', job_id: jobRequest.job_id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      // If completed, return full results
      if (job.status === 'completed' && job.results) {
        return new Response(
          JSON.stringify(job.results),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // If failed, return error
      if (job.status === 'failed') {
        return new Response(
          JSON.stringify({ 
            job_id: job.external_job_id,
            status: 'failed',
            error: job.error_message,
            cost: '$0.00'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Otherwise return progress
      return new Response(
        JSON.stringify({
          job_id: job.external_job_id,
          status: job.status,
          progress: job.progress_data,
          started_at: job.started_at,
          last_heartbeat: job.last_heartbeat
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // ============= EXECUTE ACTION =============
    // Validate required fields
    if (!jobRequest.job_id || !jobRequest.questions || jobRequest.questions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: job_id and questions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check for existing job (idempotency)
    const { data: existingJob } = await supabase
      .from('acp_jobs')
      .select('id, status, results')
      .eq('external_job_id', jobRequest.job_id)
      .single();

    if (existingJob) {
      // If already completed, return results
      if (existingJob.status === 'completed' && existingJob.results) {
        console.log(`✅ [ACP-JOB] Returning cached results for ${jobRequest.job_id}`);
        return new Response(
          JSON.stringify(existingJob.results),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      // If still processing, return status
      return new Response(
        JSON.stringify({
          job_id: jobRequest.job_id,
          status: existingJob.status,
          message: 'Job already in progress. Poll with action:\\"status\\" for updates.',
          poll_interval_seconds: 5
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 202 }
      );
    }

    // Create new job record
    const { data: newJob, error: insertError } = await supabase
      .from('acp_jobs')
      .insert({
        external_job_id: jobRequest.job_id,
        status: 'processing',
        request_data: jobRequest,
        started_at: new Date().toISOString(),
        progress_data: { message: 'Starting...', percent: 0 }
      })
      .select()
      .single();

    if (insertError || !newJob) {
      console.error('❌ [ACP-JOB] Failed to create job record:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to initialize job' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Start background task
    const backgroundTask = executeAcpJob(newJob.id, jobRequest, supabase);
    
    // Use EdgeRuntime.waitUntil if available (Supabase Edge Functions)
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime?.waitUntil) {
      EdgeRuntime.waitUntil(backgroundTask);
    } else {
      // Fallback for local dev
      backgroundTask.catch(err => console.error('Background task error:', err));
    }

    console.log(`🚀 [ACP-JOB] Job ${jobRequest.job_id} started in background`);

    // Return immediately with 202 Accepted
    return new Response(
      JSON.stringify({
        job_id: jobRequest.job_id,
        status: 'processing',
        message: 'Job started. Poll with action:\\"status\\" to get results.',
        poll_interval_seconds: 5
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 202 }
    );

  } catch (error: any) {
    console.error(`❌ [ACP-JOB] FATAL ERROR:`, error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
