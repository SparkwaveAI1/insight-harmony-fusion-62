// Supabase Edge Function: acp-persona-search (v2 - DB-level filtering)
// Fixed: WORKER_LIMIT caused by loading all 3880+ full_profile blobs into memory.
// v1 fetched ALL personas with full_profile (3880+ rows × large JSON blobs).
// v2 uses DB-level filtering on computed columns + minimal field selection.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Minimal field set — NO full_profile blob
const SEARCH_SELECT = 'persona_id,name,age_computed,gender_computed,occupation_computed,city_computed,state_region_computed,country_computed,income_bracket,education_level,interest_tags,health_tags,work_role_tags,ethnicity_computed,marital_status_computed,has_children_computed,is_public,profile_image_url,conversation_summary';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Support both GET (query string) and POST (JSON body)
    let age_range: string | undefined;
    let location: string | undefined;
    let occupation: string | undefined;
    let income_bracket: string | undefined;
    let education: string | undefined;
    let interests: string | undefined;
    let search_query: string | undefined;
    let limit_val = 10;

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      age_range = body.age_range;
      location = body.location;
      occupation = body.occupation;
      income_bracket = body.income_bracket;
      education = body.education;
      interests = body.interests;
      search_query = body.search_query;
      limit_val = Math.min(body.limit || 10, 50);
    } else {
      const url = new URL(req.url);
      age_range = url.searchParams.get('age_range') || undefined;
      location = url.searchParams.get('location') || undefined;
      occupation = url.searchParams.get('occupation') || undefined;
      income_bracket = url.searchParams.get('income_bracket') || undefined;
      education = url.searchParams.get('education') || undefined;
      interests = url.searchParams.get('interests') || undefined;
      search_query = url.searchParams.get('search_query') || undefined;
      limit_val = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
    }

    const hasFilters = !!(occupation || location || income_bracket || education || age_range || interests || search_query);

    // Build DB query — filters on indexed/computed columns only
    let query = supabase
      .from('v4_personas')
      .select(SEARCH_SELECT)
      .eq('creation_completed', true)
      .limit(limit_val * 4); // Overfetch to allow post-filter

    if (occupation) {
      query = query.ilike('occupation_computed', `%${occupation}%`);
    }

    if (income_bracket) {
      query = query.ilike('income_bracket', `%${income_bracket}%`);
    }

    if (education) {
      query = query.ilike('education_level', `%${education}%`);
    }

    if (age_range) {
      const parsed = parseAgeRange(age_range);
      if (parsed) {
        if (parsed.min !== undefined) query = query.gte('age_computed', parsed.min);
        if (parsed.max !== undefined) query = query.lte('age_computed', parsed.max);
      }
    }

    // Location: search city first (most selective), then state fallback handled in post-filter
    if (location) {
      query = query.ilike('city_computed', `%${location}%`);
    }

    const { data: personas, error } = await query;

    if (error) {
      throw new Error(`DB error: ${error.message}`);
    }

    // Post-filter: location fallback (state) + search_query on lightweight text fields
    let filtered = (personas || []);

    // If location filter returned 0 with city filter, try state_region fallback
    if (location && filtered.length === 0) {
      const { data: stateResults } = await supabase
        .from('v4_personas')
        .select(SEARCH_SELECT)
        .eq('creation_completed', true)
        .ilike('state_region_computed', `%${location}%`)
        .limit(limit_val * 4);
      filtered = stateResults || [];
    }

    if (search_query) {
      const terms = search_query.toLowerCase().split(' ').filter((t: string) => t.length > 2);
      if (terms.length > 0) {
        filtered = filtered.filter((persona: any) => {
          const summary = persona.conversation_summary || {};
          const demographics = summary.demographics || {};
          const text = [
            persona.name || '',
            persona.occupation_computed || '',
            persona.city_computed || '',
            persona.state_region_computed || '',
            persona.ethnicity_computed || '',
            (persona.interest_tags || []).join(' '),
            (persona.work_role_tags || []).join(' '),
            demographics.background_description || '',
            summary.personality_summary || '',
          ].join(' ').toLowerCase();
          return terms.some((term: string) => text.includes(term));
        });
      }
    }

    // Fallback: if no results and filters were applied, return random sample
    let usedFallback = false;
    if (filtered.length === 0 && hasFilters) {
      const { data: fallback } = await supabase
        .from('v4_personas')
        .select(SEARCH_SELECT)
        .eq('creation_completed', true)
        .limit(limit_val);
      filtered = fallback || [];
      usedFallback = true;
    }

    const results = filtered.slice(0, limit_val).map((persona: any) => {
      const summary = persona.conversation_summary || {};
      const demographics = summary.demographics || {};
      return {
        persona_id: persona.persona_id,
        name: persona.name,
        profile_image_url: persona.profile_image_url,
        summary: buildSummary(persona, demographics),
        demographics: {
          age: persona.age_computed || demographics.age,
          gender: persona.gender_computed,
          location: [persona.city_computed, persona.state_region_computed].filter(Boolean).join(', ') || demographics.location || '',
          occupation: persona.occupation_computed || demographics.occupation || '',
          education: persona.education_level || '',
          income_bracket: persona.income_bracket || '',
          ethnicity: persona.ethnicity_computed || '',
          relationship_status: persona.marital_status_computed || '',
          has_children: persona.has_children_computed,
        },
        key_traits: {
          interests: (persona.interest_tags || []).slice(0, 5).join(', '),
          work_roles: (persona.work_role_tags || []).slice(0, 3).join(', '),
        },
        is_public: persona.is_public,
        availability: true,
      };
    });

    return new Response(
      JSON.stringify({
        matching_count: filtered.length,
        personas: results,
        used_fallback: usedFallback,
        version: 'v2-db-filtered',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('ACP Search v2 Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function parseAgeRange(rangeStr: string): { min?: number; max?: number } | null {
  if (rangeStr.includes('-')) {
    const parts = rangeStr.split('-');
    return { min: parseInt(parts[0].trim()), max: parseInt(parts[1].trim()) };
  } else if (rangeStr.includes('+')) {
    return { min: parseInt(rangeStr.replace('+', '').trim()) };
  }
  return null;
}

function buildSummary(persona: any, demographics: any): string {
  const parts: string[] = [];
  const age = persona.age_computed || demographics.age;
  if (age) parts.push(`${age}yo`);
  if (persona.gender_computed) parts.push(persona.gender_computed);
  const occ = persona.occupation_computed || demographics.occupation;
  if (occ) parts.push(occ);
  const city = persona.city_computed || demographics.location;
  if (city) parts.push(`from ${city}`);
  return parts.join(', ') || 'No summary available';
}
