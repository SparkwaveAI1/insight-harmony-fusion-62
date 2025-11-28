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
- search_keywords: array of ALL relevant keywords from the query for collection matching (e.g., ["overweight", "gamer", "gaming", "30s"])

RULES:
- Only include fields explicitly mentioned or strongly implied
- For age ranges, use age_min and age_max
- For BMI: "overweight" means bmi_min: 25, "obese" means bmi_min: 30
- Return null for fields not mentioned, empty arrays for keyword fields not mentioned
- search_keywords should include ALL meaningful keywords extracted from the query, including synonyms
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
  "search_keywords": string[]
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
  search_keywords: string[];
}

interface SearchRequest {
  research_query: string;
  persona_count?: number;
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
  parsed.search_keywords = parsed.search_keywords || [];

  console.log('[acp-persona-search-v2] Parsed criteria:', JSON.stringify(parsed, null, 2));
  return parsed;
}

/**
 * KEYWORD-BASED collection matching
 * Instead of relying on LLM to guess collection names, we:
 * 1. Extract ALL keywords from the parsed criteria
 * 2. Find ALL collections whose name or description contains any of those keywords
 */
async function findMatchingCollectionsByKeywords(
  supabase: any,
  criteria: ParsedCriteria
): Promise<{ ids: string[]; matchedCollections: Array<{ id: string; name: string; matchedKeywords: string[] }> }> {
  // Gather ALL keywords from the criteria
  const allKeywords = new Set<string>();
  
  // Add search_keywords from LLM
  criteria.search_keywords.forEach(k => allKeywords.add(k.toLowerCase()));
  
  // Add interest keywords
  criteria.interests_keywords.forEach(k => allKeywords.add(k.toLowerCase()));
  
  // Add occupation keywords
  criteria.occupation_keywords.forEach(k => allKeywords.add(k.toLowerCase()));
  
  // Add lifestyle keywords  
  criteria.lifestyle_keywords.forEach(k => allKeywords.add(k.toLowerCase()));
  
  // Add diet keywords
  criteria.diet_keywords.forEach(k => allKeywords.add(k.toLowerCase()));
  
  // Add BMI-related keywords if BMI filter is set
  if (criteria.bmi_min !== null && criteria.bmi_min >= 25) {
    allKeywords.add('overweight');
    if (criteria.bmi_min >= 30) {
      allKeywords.add('obese');
      allKeywords.add('obesity');
    }
  }
  if (criteria.bmi_max !== null && criteria.bmi_max <= 18.5) {
    allKeywords.add('underweight');
  }

  const keywordArray = Array.from(allKeywords).filter(k => k.length >= 3); // Skip very short keywords
  
  if (keywordArray.length === 0) {
    console.log('[acp-persona-search-v2] No keywords to match collections');
    return { ids: [], matchedCollections: [] };
  }

  console.log('[acp-persona-search-v2] Finding collections with keywords:', keywordArray);

  // Fetch ALL public collections
  const { data: collections, error } = await supabase
    .from('collections')
    .select('id, name, description')
    .eq('is_public', true);

  if (error) {
    console.error('[acp-persona-search-v2] Error fetching collections:', error);
    return { ids: [], matchedCollections: [] };
  }

  // Match collections by checking if any keyword appears in name or description
  const matchedCollections: Array<{ id: string; name: string; matchedKeywords: string[] }> = [];
  
  for (const collection of collections || []) {
    const nameLower = (collection.name || '').toLowerCase();
    const descLower = (collection.description || '').toLowerCase();
    const matchedKeywords: string[] = [];
    
    for (const keyword of keywordArray) {
      if (nameLower.includes(keyword) || descLower.includes(keyword)) {
        matchedKeywords.push(keyword);
      }
    }
    
    if (matchedKeywords.length > 0) {
      matchedCollections.push({
        id: collection.id,
        name: collection.name,
        matchedKeywords
      });
    }
  }

  // Sort by number of matched keywords (more matches = more relevant)
  matchedCollections.sort((a, b) => b.matchedKeywords.length - a.matchedKeywords.length);
  
  const ids = matchedCollections.map(c => c.id);
  
  console.log('[acp-persona-search-v2] Matched', matchedCollections.length, 'collections:');
  matchedCollections.forEach(c => {
    console.log(`  - ${c.name}: matched [${c.matchedKeywords.join(', ')}]`);
  });
  
  return { ids, matchedCollections };
}

async function searchPersonas(
  supabase: any,
  criteria: ParsedCriteria,
  collectionIds: string[],
  limit: number
): Promise<any[]> {
  console.log('[acp-persona-search-v2] Searching with criteria, limit:', limit, 'collections:', collectionIds.length);

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

    const { research_query, persona_count = 10 }: SearchRequest = await req.json();

    if (!research_query) {
      return new Response(
        JSON.stringify({ error: 'research_query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[acp-persona-search-v2] Starting search for:', research_query);

    // Step 1: Parse query with LLM
    const criteria = await parseQueryWithLLM(research_query, openaiKey);

    // Step 2: Find matching collections using KEYWORD-BASED lookup (not LLM guessing)
    const { ids: collectionIds, matchedCollections } = await findMatchingCollectionsByKeywords(supabase, criteria);

    // Step 3: Search personas (NO RELAXATION - return exact matches only)
    const personas = await searchPersonas(supabase, criteria, collectionIds, persona_count);

    // Build note if fewer results than requested
    let result_note: string | null = null;
    if (personas.length < persona_count) {
      result_note = `Found ${personas.length} personas matching criteria (requested ${persona_count})`;
    }

    // Format response
    const response = {
      success: true,
      query: research_query,
      parsed_criteria: criteria,
      matched_collections: matchedCollections.length,
      matched_collection_details: matchedCollections.slice(0, 10),
      total_found: personas.length,
      requested_count: persona_count,
      result_note,
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

    console.log('[acp-persona-search-v2] Search complete. Found:', personas.length, 'of', persona_count, 'requested. Collections matched:', matchedCollections.length);

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
