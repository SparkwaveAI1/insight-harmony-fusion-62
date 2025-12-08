import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ACPSearchRequest {
  research_query: string;
  persona_count?: number;
  min_results?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const body: ACPSearchRequest = await req.json();
    
    if (!body.research_query) {
      throw new Error('research_query is required');
    }

    const personaCount = body.persona_count ?? 5;
    const query = body.research_query;

    console.log(`[acp-semantic-search] Request ${requestId}: "${query}", count: ${personaCount}`);

    // Generate embedding for the search query
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      const errText = await embeddingResponse.text();
      throw new Error(`OpenAI API error: ${errText}`);
    }

    const embeddingResult = await embeddingResponse.json();
    const queryEmbedding = embeddingResult.data[0].embedding;

    // Call semantic search - get more than needed to ensure quality
    const { data: results, error: searchError } = await supabase.rpc(
      'search_personas_semantic',
      {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: 0.25, // Lower threshold to get more candidates
        match_count: Math.max(personaCount * 2, 20), // Get extras for selection
        filter_collection_id: null,
        exclude_collection_id: null,
      }
    );

    if (searchError) {
      console.error(`[acp-semantic-search] DB error:`, searchError.message);
      throw new Error(`Search failed: ${searchError.message}`);
    }

    console.log(`[acp-semantic-search] Found ${results?.length ?? 0} candidates`);

    // Take top N personas by similarity
    const topPersonas = (results ?? []).slice(0, personaCount);

    // Transform to ACP-compatible format
    const personas = topPersonas.map((p: any) => ({
      persona_id: p.persona_id,
      name: p.name,
      match_score: Math.round(p.similarity * 100) / 100,
      match_reason: `Semantic match: ${Math.round(p.similarity * 100)}% relevance to "${query.slice(0, 50)}${query.length > 50 ? '...' : ''}"`,
      profile_image_url: p.profile_image_url,
      full_profile: p.full_profile,
      conversation_summary: p.conversation_summary,
      demographics: {
        age: p.age_computed,
        gender: p.gender_computed,
        location: [p.city_computed, p.state_region_computed, p.country_computed]
          .filter(Boolean)
          .join(', '),
        occupation: p.occupation_computed,
      },
    }));

    // Determine success status
    const hasEnoughResults = personas.length >= (body.min_results ?? 1);
    const status = personas.length === 0 
      ? 'NO_MATCH' 
      : hasEnoughResults 
        ? 'SUCCESS' 
        : 'INSUFFICIENT_QUALIFIED';

    const duration = Date.now() - startTime;
    console.log(`[acp-semantic-search] Complete: ${status}, ${personas.length} personas, ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: hasEnoughResults && personas.length > 0,
        status,
        request_id: requestId,
        query,
        parsed_criteria: { raw_query: query },
        matched_collections: 0,
        stages: [
          { stage: 'embedding', count: 1, duration_ms: 0 },
          { stage: 'semantic_search', count: results?.length ?? 0, duration_ms: 0 },
          { stage: 'selection', count: personas.length, duration_ms: 0 },
        ],
        decision_summary: {
          requested: personaCount,
          found: results?.length ?? 0,
          returned: personas.length,
        },
        reason: personas.length === 0 
          ? 'No personas matched the search criteria'
          : `Found ${personas.length} matching personas via semantic search`,
        duration_ms: duration,
        personas,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[acp-semantic-search] Error:`, error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        status: 'ERROR',
        error: error.message,
        personas: [],
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
