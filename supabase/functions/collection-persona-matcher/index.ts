import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CollectionMatcherRequest {
  collection_id: string;
  max_results?: number;
  match_threshold?: number;
  custom_query?: string; // Optional override for collection description
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

    const body: CollectionMatcherRequest = await req.json();
    
    if (!body.collection_id) {
      throw new Error('collection_id is required');
    }

    const maxResults = body.max_results ?? 100;
    const matchThreshold = body.match_threshold ?? 0.3;

    // Fetch collection
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id, name, description, user_id')
      .eq('id', body.collection_id)
      .single();

    if (collectionError || !collection) {
      throw new Error('Collection not found');
    }

    // Verify user owns collection or is admin
    const { data: isAdmin } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    });
    
    if (collection.user_id !== user.id && !isAdmin) {
      throw new Error('Not authorized to modify this collection');
    }

    // Build search query from collection name + description
    const searchQuery = body.custom_query || `${collection.name}. ${collection.description || ''}`;

    console.log('[collection-matcher] Collection:', collection.name);
    console.log('[collection-matcher] Search query:', searchQuery);

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
        input: searchQuery,
      }),
    });

    if (!embeddingResponse.ok) {
      const errText = await embeddingResponse.text();
      throw new Error(`OpenAI API error: ${errText}`);
    }

    const embeddingResult = await embeddingResponse.json();
    const queryEmbedding = embeddingResult.data[0].embedding;

    // Call semantic search, excluding personas already in the collection
    const { data: results, error: searchError } = await supabase.rpc(
      'search_personas_semantic',
      {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: maxResults,
        filter_collection_id: null,
        exclude_collection_id: body.collection_id, // Exclude personas already in collection
      }
    );

    if (searchError) {
      throw new Error(`Search failed: ${searchError.message}`);
    }

    console.log('[collection-matcher] Found', results?.length ?? 0, 'candidates');

    // Format results
    const personas = (results ?? []).map((p: any) => ({
      persona_id: p.persona_id,
      name: p.name,
      similarity: Math.round(p.similarity * 100) / 100,
      similarity_percent: Math.round(p.similarity * 100),
      user_id: p.user_id,
      is_public: p.is_public,
      profile_image_url: p.profile_image_url,
      profile_thumbnail_url: p.profile_thumbnail_url,
      age_computed: p.age_computed,
      gender_computed: p.gender_computed,
      occupation_computed: p.occupation_computed,
      location: [p.city_computed, p.state_region_computed, p.country_computed]
        .filter(Boolean)
        .join(', '),
      preview_summary: p.conversation_summary?.personality_summary?.slice(0, 200) 
        || p.conversation_summary?.character_description?.slice(0, 200)
        || null,
    }));

    const duration = Date.now() - startTime;
    console.log('[collection-matcher] Complete in', duration, 'ms');

    return new Response(
      JSON.stringify({
        success: true,
        collection: {
          id: collection.id,
          name: collection.name,
          description: collection.description,
        },
        search_query: searchQuery,
        total: personas.length,
        personas,
        duration_ms: duration,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[collection-matcher] Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
