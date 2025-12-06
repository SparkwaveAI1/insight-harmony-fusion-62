import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CollectionMatcherRequest {
  collection_id?: string;
  research_query?: string;
  max_results?: number;
  score_threshold?: number;
  skip_llm_scoring?: boolean;
  include_near_matches?: boolean;
  created_after?: string;
  filters?: {
    age_min?: number;
    age_max?: number;
    gender?: string[];
    location_country?: string;
    location_region?: string;
    occupation_keywords?: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('[collection-persona-matcher] Request received');

  try {
    // 1. Validate auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('[collection-persona-matcher] Missing authorization header');
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('[collection-persona-matcher] Auth error:', authError?.message);
      throw new Error('Unauthorized');
    }
    console.log('[collection-persona-matcher] User authenticated:', user.id);

    // 2. Parse request body
    const body: CollectionMatcherRequest = await req.json();
    console.log('[collection-persona-matcher] Request body:', JSON.stringify(body));

    // 3. Validate: must provide either collection_id or research_query
    if (!body.collection_id && !body.research_query) {
      throw new Error('Must provide either collection_id or research_query');
    }

    // 4. Set defaults (more permissive than ACP)
    const config = {
      max_results: body.max_results ?? 100,
      score_threshold: body.score_threshold ?? 0.50,
      skip_llm_scoring: body.skip_llm_scoring ?? false,
      include_near_matches: body.include_near_matches ?? true,
      created_after: body.created_after ?? null,
      filters: body.filters ?? {},
    };
    console.log('[collection-persona-matcher] Config:', JSON.stringify(config));

    // 5. If collection_id provided, fetch collection and verify access
    let collection = null;
    let excludePersonaIds: string[] = [];
    let searchQuery = body.research_query ?? '';

    if (body.collection_id) {
      console.log('[collection-persona-matcher] Fetching collection:', body.collection_id);
      
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('id, name, description, user_id, search_criteria')
        .eq('id', body.collection_id)
        .single();

      if (collectionError || !collectionData) {
        console.log('[collection-persona-matcher] Collection not found:', collectionError?.message);
        throw new Error('Collection not found');
      }

      // Verify user owns collection or is admin
      const { data: isAdmin } = await supabase.rpc('has_role', { 
        _user_id: user.id, 
        _role: 'admin' 
      });
      
      console.log('[collection-persona-matcher] User owns collection:', collectionData.user_id === user.id);
      console.log('[collection-persona-matcher] User is admin:', isAdmin);

      if (collectionData.user_id !== user.id && !isAdmin) {
        throw new Error('Not authorized to modify this collection');
      }

      collection = collectionData;
      searchQuery = `${collectionData.name}. ${collectionData.description ?? ''}`;
      console.log('[collection-persona-matcher] Search query from collection:', searchQuery);

      // Get existing persona IDs to exclude
      const { data: existingPersonas } = await supabase
        .from('collection_personas')
        .select('persona_id')
        .eq('collection_id', body.collection_id);

      excludePersonaIds = existingPersonas?.map(p => p.persona_id) ?? [];
      console.log('[collection-persona-matcher] Excluding', excludePersonaIds.length, 'existing personas');
    }

    const duration = Date.now() - startTime;
    console.log('[collection-persona-matcher] Skeleton complete in', duration, 'ms');

    // Placeholder response - we'll add search logic in next steps
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Skeleton working - search logic coming next',
        collection: collection ? { id: collection.id, name: collection.name } : null,
        search_query: searchQuery,
        exclude_count: excludePersonaIds.length,
        config,
        duration_ms: duration,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[collection-persona-matcher] Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
