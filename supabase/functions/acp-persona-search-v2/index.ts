import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const QUERY_PARSER_PROMPT = `You parse natural language persona search queries into structured criteria.

SEARCHABLE FIELDS:
- age: numeric (e.g., 25, or range "23-31")
- education_level: text ("high school", "bachelor", "master", "phd", "some college")
- bmi_category: "underweight" (<18.5), "normal" (18.5-25), "overweight" (25-30), "obese" (>30)
- diet_keywords: array of terms to match in diet_pattern (e.g., ["fast food", "takeout", "junk"])
- location_country: text
- location_region: text (US states, etc.)
- occupation_keywords: array of terms (e.g., ["engineer", "developer"])
- income_bracket: text patterns like "under 25", "25k-50k", "50k-75k", "75k-100k", "100k-150k", "150k", "200k"
- interests_keywords: array for full-text search (e.g., ["gaming", "crypto", "fitness"])
- lifestyle_keywords: array for full-text search (e.g., ["sedentary", "active", "remote work"])
- collection_hints: array of likely collection names (e.g., ["Gamers", "Crypto Investors"])

RULES:
- Only include fields explicitly mentioned or strongly implied
- For age ranges, use age_min and age_max
- For BMI: "overweight" means bmi_min: 25, "obese" means bmi_min: 30
- Return null for fields not mentioned, empty arrays for keyword fields not mentioned
- collection_hints are suggestions to boost matching, not hard requirements
- Expand keywords with synonyms (e.g., "gaming" -> ["gaming", "gamer", "video game", "games"])

OUTPUT FORMAT (JSON only, no explanation):
{
  "age_min": number | null,
  "age_max": number | null,
  "education_level": string | null,
  "bmi_min": number | null,
  "bmi_max": number | null,
  "diet_keywords": string[],
  "location_country": string | null,
  "location_region": string | null,
  "occupation_keywords": string[],
  "income_bracket": string | null,
  "interests_keywords": string[],
  "lifestyle_keywords": string[],
  "collection_hints": string[]
}`;

interface ParsedCriteria {
  age_min: number | null;
  age_max: number | null;
  education_level: string | null;
  bmi_min: number | null;
  bmi_max: number | null;
  diet_keywords: string[];
  location_country: string | null;
  location_region: string | null;
  occupation_keywords: string[];
  income_bracket: string | null;
  interests_keywords: string[];
  lifestyle_keywords: string[];
  collection_hints: string[];
}

interface SearchRequest {
  research_query: string;
  persona_count?: number;
  min_results?: number;
}

async function parseQueryWithLLM(query: string, openaiKey: string): Promise<ParsedCriteria> {
  console.log('[acp-persona-search-v2] Parsing query with LLM:', query);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: QUERY_PARSER_PROMPT },
        { role: 'user', content: query }
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[acp-persona-search-v2] OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No response from LLM');
  }

  console.log('[acp-persona-search-v2] LLM response:', content);

  // Parse JSON from response (handle markdown code blocks)
  let jsonStr = content.trim();
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }
  jsonStr = jsonStr.trim();

  const parsed: ParsedCriteria = JSON.parse(jsonStr);
  
  // Ensure arrays are initialized
  parsed.diet_keywords = parsed.diet_keywords || [];
  parsed.occupation_keywords = parsed.occupation_keywords || [];
  parsed.interests_keywords = parsed.interests_keywords || [];
  parsed.lifestyle_keywords = parsed.lifestyle_keywords || [];
  parsed.collection_hints = parsed.collection_hints || [];

  console.log('[acp-persona-search-v2] Parsed criteria:', JSON.stringify(parsed, null, 2));
  return parsed;
}

async function findMatchingCollectionIds(
  supabase: any,
  collectionHints: string[]
): Promise<string[]> {
  if (!collectionHints || collectionHints.length === 0) {
    return [];
  }

  console.log('[acp-persona-search-v2] Finding collections for hints:', collectionHints);

  // Build OR conditions for collection name matching
  const orConditions = collectionHints.map(hint => `name.ilike.%${hint}%`).join(',');
  
  const { data, error } = await supabase
    .from('collections')
    .select('id, name')
    .eq('is_public', true)
    .or(orConditions);

  if (error) {
    console.error('[acp-persona-search-v2] Error finding collections:', error);
    return [];
  }

  const ids = data?.map((c: any) => c.id) || [];
  console.log('[acp-persona-search-v2] Found collection IDs:', ids, 'from:', data?.map((c: any) => c.name));
  return ids;
}

async function searchPersonas(
  supabase: any,
  criteria: ParsedCriteria,
  collectionIds: string[],
  limit: number
): Promise<any[]> {
  console.log('[acp-persona-search-v2] Searching with criteria, limit:', limit);

  const { data, error } = await supabase.rpc('search_personas_advanced', {
    p_age_min: criteria.age_min,
    p_age_max: criteria.age_max,
    p_bmi_min: criteria.bmi_min,
    p_bmi_max: criteria.bmi_max,
    p_education: criteria.education_level,
    p_location_region: criteria.location_region,
    p_location_country: criteria.location_country,
    p_occupation_keywords: criteria.occupation_keywords.length > 0 ? criteria.occupation_keywords : null,
    p_diet_keywords: criteria.diet_keywords.length > 0 ? criteria.diet_keywords : null,
    p_interest_keywords: criteria.interests_keywords.length > 0 ? criteria.interests_keywords : null,
    p_lifestyle_keywords: criteria.lifestyle_keywords.length > 0 ? criteria.lifestyle_keywords : null,
    p_income_bracket: criteria.income_bracket,
    p_collection_ids: collectionIds.length > 0 ? collectionIds : null,
    p_limit: limit,
  });

  if (error) {
    console.error('[acp-persona-search-v2] RPC error:', error);
    throw error;
  }

  console.log('[acp-persona-search-v2] Found', data?.length || 0, 'personas');
  return data || [];
}

async function searchWithRelaxation(
  supabase: any,
  criteria: ParsedCriteria,
  collectionIds: string[],
  targetCount: number,
  minResults: number
): Promise<{ personas: any[]; relaxedCriteria: boolean; relaxationSteps: string[] }> {
  const relaxationSteps: string[] = [];
  let currentCriteria = { ...criteria };
  
  // Try original criteria
  let results = await searchPersonas(supabase, currentCriteria, collectionIds, targetCount);
  
  if (results.length >= minResults) {
    return { personas: results, relaxedCriteria: false, relaxationSteps };
  }

  console.log('[acp-persona-search-v2] Not enough results, starting relaxation. Found:', results.length, 'Need:', minResults);

  // Relaxation steps in order of importance (least important first)
  const relaxations = [
    {
      name: 'bmi',
      check: () => currentCriteria.bmi_min !== null || currentCriteria.bmi_max !== null,
      apply: () => { currentCriteria.bmi_min = null; currentCriteria.bmi_max = null; },
      label: 'Removed BMI filter'
    },
    {
      name: 'diet',
      check: () => currentCriteria.diet_keywords.length > 0,
      apply: () => { currentCriteria.diet_keywords = []; },
      label: 'Removed diet requirements'
    },
    {
      name: 'lifestyle',
      check: () => currentCriteria.lifestyle_keywords.length > 0,
      apply: () => { currentCriteria.lifestyle_keywords = []; },
      label: 'Removed lifestyle requirements'
    },
    {
      name: 'education',
      check: () => currentCriteria.education_level !== null,
      apply: () => { currentCriteria.education_level = null; },
      label: 'Removed education filter'
    },
    {
      name: 'income',
      check: () => currentCriteria.income_bracket !== null,
      apply: () => { currentCriteria.income_bracket = null; },
      label: 'Removed income filter'
    },
    {
      name: 'age_expand',
      check: () => currentCriteria.age_min !== null || currentCriteria.age_max !== null,
      apply: () => {
        if (currentCriteria.age_min) currentCriteria.age_min = Math.max(18, currentCriteria.age_min - 5);
        if (currentCriteria.age_max) currentCriteria.age_max = Math.min(85, currentCriteria.age_max + 5);
      },
      label: 'Expanded age range by ±5 years'
    },
    {
      name: 'location',
      check: () => currentCriteria.location_region !== null || currentCriteria.location_country !== null,
      apply: () => { currentCriteria.location_region = null; currentCriteria.location_country = null; },
      label: 'Removed location filter'
    },
  ];

  for (const step of relaxations) {
    if (results.length >= minResults) break;
    if (!step.check()) continue;

    step.apply();
    relaxationSteps.push(step.label);
    console.log('[acp-persona-search-v2] Applied relaxation:', step.label);
    
    results = await searchPersonas(supabase, currentCriteria, collectionIds, targetCount);
    console.log('[acp-persona-search-v2] After relaxation, found:', results.length);
  }

  return { 
    personas: results, 
    relaxedCriteria: relaxationSteps.length > 0,
    relaxationSteps 
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { research_query, persona_count = 10, min_results = 3 }: SearchRequest = await req.json();

    if (!research_query) {
      return new Response(
        JSON.stringify({ error: 'research_query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[acp-persona-search-v2] Starting search for:', research_query);

    // Step 1: Parse query with LLM
    const criteria = await parseQueryWithLLM(research_query, openaiKey);

    // Step 2: Find matching collection IDs
    const collectionIds = await findMatchingCollectionIds(supabase, criteria.collection_hints);

    // Step 3: Search with relaxation fallback
    const { personas, relaxedCriteria, relaxationSteps } = await searchWithRelaxation(
      supabase,
      criteria,
      collectionIds,
      persona_count,
      min_results
    );

    // Format response
    const response = {
      success: true,
      query: research_query,
      parsed_criteria: criteria,
      matched_collections: collectionIds.length,
      total_found: personas.length,
      relaxed_criteria: relaxedCriteria,
      relaxation_steps: relaxationSteps,
      personas: personas.map((p: any) => ({
        persona_id: p.persona_id,
        name: p.name,
        relevance_score: p.relevance_score,
        profile_image_url: p.profile_image_url,
        summary: {
          age: p.full_profile?.identity?.age,
          occupation: p.full_profile?.identity?.occupation,
          location: p.full_profile?.identity?.location,
          education: p.full_profile?.identity?.education_level,
          bmi: p.full_profile?.health_profile?.bmi,
          diet: p.full_profile?.health_profile?.diet_pattern,
        },
        full_profile: p.full_profile,
        conversation_summary: p.conversation_summary,
      })),
    };

    console.log('[acp-persona-search-v2] Search complete. Found:', personas.length, 'Relaxed:', relaxedCriteria);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[acp-persona-search-v2] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
