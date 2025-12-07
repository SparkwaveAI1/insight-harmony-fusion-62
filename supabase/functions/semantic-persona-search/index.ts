import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  match_threshold?: number;
  max_results?: number;
  filter_collection_id?: string;
  exclude_collection_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const body: SearchRequest = await req.json();
    
    if (!body.query || body.query.trim().length === 0) {
      throw new Error('Query is required');
    }

    const query = body.query.trim();
    const matchThreshold = body.match_threshold ?? 0.3;
    const maxResults = Math.min(body.max_results ?? 50, 200);
    const filterCollectionId = body.filter_collection_id ?? null;
    const excludeCollectionId = body.exclude_collection_id ?? null;

    console.log('[semantic-search] Query:', query);
    console.log('[semantic-search] Threshold:', matchThreshold, 'Max:', maxResults);

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
      console.error('[semantic-search] OpenAI error:', errText);
      throw new Error(`OpenAI API error: ${errText}`);
    }

    const embeddingResult = await embeddingResponse.json();
    const queryEmbedding = embeddingResult.data[0].embedding;

    console.log('[semantic-search] Generated query embedding, dims:', queryEmbedding.length);

    // Call semantic search - try direct array first
    const { data: results, error: searchError } = await supabase.rpc(
      'search_personas_semantic',
      {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: maxResults,
        filter_collection_id: filterCollectionId,
        exclude_collection_id: excludeCollectionId,
      }
    );

    if (searchError) {
      console.error('[semantic-search] DB error:', searchError.message);
      throw new Error(`Search failed: ${searchError.message}`);
    }

    console.log('[semantic-search] Found', results?.length ?? 0, 'results');

    const personas = (results ?? []).map((p: any) => ({
      persona_id: p.persona_id,
      name: p.name,
      similarity: Math.round(p.similarity * 100) / 100,
      similarity_percent: Math.round(p.similarity * 100),
      demographics: {
        age: p.age_computed,
        gender: p.gender_computed,
        occupation: p.occupation_computed,
        location: [p.city_computed, p.state_region_computed, p.country_computed]
          .filter(Boolean)
          .join(', '),
      },
      profile_image_url: p.profile_image_url,
      preview_summary: p.conversation_summary?.personality_summary 
        ?? p.conversation_summary?.character_description?.slice(0, 200)
        ?? null,
    }));

    const duration = Date.now() - startTime;
    console.log('[semantic-search] Complete in', duration, 'ms');

    return new Response(
      JSON.stringify({
        success: true,
        query,
        total: personas.length,
        personas,
        duration_ms: duration,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[semantic-search] Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
