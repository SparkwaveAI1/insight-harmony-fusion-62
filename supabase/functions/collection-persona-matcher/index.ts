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

    // ============================================
    // STAGE 1: Parse query into structured criteria
    // ============================================
    console.log('[collection-persona-matcher] Stage 1: Parsing query');
    const stage1Start = Date.now();

    let parsedCriteria: any = null;

    try {
      const parseResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/acp-parse-query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({ query: searchQuery }),
        }
      );

      if (parseResponse.ok) {
        const parseResult = await parseResponse.json();
        parsedCriteria = parseResult.criteria || parseResult;
        console.log('[collection-persona-matcher] Parsed criteria:', JSON.stringify(parsedCriteria));
      } else {
        console.log('[collection-persona-matcher] Parse query failed, using fallback');
      }
    } catch (parseError) {
      console.log('[collection-persona-matcher] Parse query error:', parseError.message);
    }

    // Fallback: extract basic keywords if LLM parsing failed
    if (!parsedCriteria) {
      parsedCriteria = {
        occupation_keywords: [],
        health_keywords: [],
        interest_keywords: [],
        suggested_collections: [],
      };
      
      // Simple keyword extraction from search query
      const words = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      parsedCriteria.occupation_keywords = words.slice(0, 5);
      console.log('[collection-persona-matcher] Using fallback keywords:', parsedCriteria.occupation_keywords);
    }

    // Merge any user-provided filter keywords
    if (config.filters.occupation_keywords?.length) {
      parsedCriteria.occupation_keywords = [
        ...(parsedCriteria.occupation_keywords || []),
        ...config.filters.occupation_keywords,
      ];
    }

    const stage1Duration = Date.now() - stage1Start;
    console.log('[collection-persona-matcher] Stage 1 complete in', stage1Duration, 'ms');

    const stages = [
      { stage: 'parse_query', count: Object.keys(parsedCriteria).length, duration_ms: stage1Duration }
    ];

    // ============================================
    // STAGE 2: Database search for candidates
    // ============================================
    console.log('[collection-persona-matcher] Stage 2: DB search');
    const stage2Start = Date.now();

    // Build search parameters from parsed criteria and user filters
    const searchParams: any = {
      p_limit: config.max_results * 2, // Get extra candidates for LLM filtering
      p_age_min: config.filters.age_min ?? parsedCriteria.age_min ?? null,
      p_age_max: config.filters.age_max ?? parsedCriteria.age_max ?? null,
      p_gender: config.filters.gender ?? (parsedCriteria.gender ? [parsedCriteria.gender] : null),
      p_country: config.filters.location_country ?? parsedCriteria.location_country ?? null,
      p_state_region: config.filters.location_region ?? parsedCriteria.location_region ?? null,
      p_occupation_keywords: parsedCriteria.occupation_keywords ?? [],
      p_health_tags: parsedCriteria.health_keywords ?? [],
      p_interest_tags: parsedCriteria.interest_keywords ?? [],
    };

    console.log('[collection-persona-matcher] Search params:', JSON.stringify(searchParams));

    const { data: candidates, error: searchError } = await supabase.rpc(
      'search_personas_stage1',
      searchParams
    );

    if (searchError) {
      console.error('[collection-persona-matcher] DB search error:', searchError.message);
      throw new Error(`Database search failed: ${searchError.message}`);
    }

    console.log('[collection-persona-matcher] Raw candidates:', candidates?.length ?? 0);

    // Filter out personas already in the collection
    let filteredCandidates = candidates ?? [];
    if (excludePersonaIds.length > 0) {
      filteredCandidates = filteredCandidates.filter(
        (p: any) => !excludePersonaIds.includes(p.persona_id)
      );
      console.log('[collection-persona-matcher] After exclusion:', filteredCandidates.length);
    }

    // Filter by created_after if specified (for "new personas only")
    if (config.created_after) {
      const afterDate = new Date(config.created_after);
      filteredCandidates = filteredCandidates.filter((p: any) => {
        const createdAt = new Date(p.created_at);
        return createdAt >= afterDate;
      });
      console.log('[collection-persona-matcher] After date filter:', filteredCandidates.length);
    }

    const stage2Duration = Date.now() - stage2Start;
    console.log('[collection-persona-matcher] Stage 2 complete in', stage2Duration, 'ms');

    stages.push({
      stage: 'db_search',
      count: filteredCandidates.length,
      duration_ms: stage2Duration,
    });

    // Format candidates for response (without LLM scoring for now)
    const formattedPersonas = filteredCandidates.slice(0, config.max_results).map((p: any) => ({
      persona_id: p.persona_id,
      name: p.name,
      match_score: null, // Will be filled by LLM scoring in next step
      match_reasons: [],
      confidence: 'pending' as const,
      demographics: {
        age: p.age_computed,
        gender: p.gender_computed,
        location: [p.city_computed, p.state_region_computed, p.country_computed]
          .filter(Boolean)
          .join(', '),
        occupation: p.occupation_computed,
      },
      preview_summary: p.conversation_summary?.personality_summary 
        ?? p.conversation_summary?.character_description?.slice(0, 200)
        ?? 'No summary available',
      profile_image_url: p.profile_image_url,
    }));

    // Placeholder response - we'll add LLM scoring in next step
    return new Response(
      JSON.stringify({
        success: true,
        message: config.skip_llm_scoring 
          ? 'Search complete (LLM scoring skipped)' 
          : 'Stage 2 complete - LLM scoring coming next',
        collection: collection ? { id: collection.id, name: collection.name } : null,
        search_query: searchQuery,
        total_candidates: filteredCandidates.length,
        parsed_criteria: parsedCriteria,
        personas: formattedPersonas,
        config,
        stages,
        duration_ms: Date.now() - startTime,
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
