import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedCriteria {
  state?: string;
  country?: string;
  city?: string;
  age_min?: number;
  age_max?: number;
  gender?: string;
  bmi_min?: number;
  bmi_max?: number;
  occupation_keywords?: string[];
  semantic_query: string;
  segments?: string[];
}

interface SmartSearchRequest {
  research_query: string;
  persona_count?: number;
  exclude_persona_ids?: string[];
}

async function parseQueryWithGPT(query: string, openaiKey: string): Promise<ParsedCriteria> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: 'system',
          content: `You parse research queries to extract structured filters and semantic meaning.

Extract these hard filters when EXPLICITLY mentioned (null if not specified):
- state: US state name (e.g., "California", "Texas") 
- country: Country name if specified
- city: City name if specified
- age_min, age_max: Age range bounds (e.g., "adults" = 18+, "seniors" = 65+, "young adults" = 18-30)
- gender: "male", "female", or null
- bmi_min, bmi_max: Weight criteria (overweight = bmi_min:25, obese = bmi_min:30, underweight = bmi_max:18.5)
- occupation_keywords: Array of occupation-related words

Also detect if the query asks for DISTINCT/DIFFERENT types of people. If so, extract each type as a separate segment.

Respond with JSON:
{
  "state": string | null,
  "country": string | null,
  "city": string | null,
  "age_min": number | null,
  "age_max": number | null,
  "gender": string | null,
  "bmi_min": number | null,
  "bmi_max": number | null,
  "occupation_keywords": string[] | null,
  "semantic_query": "full descriptive query for semantic matching",
  "segments": ["segment 1", "segment 2"] | null
}

Examples:
- "overweight adults from California" → {"state": "California", "bmi_min": 25, "age_min": 18, "semantic_query": "overweight adults lifestyle health", "segments": null}
- "3 distinct crypto investors: traders, holders, analysts" → {"semantic_query": "crypto investors", "segments": ["crypto day trader active trading", "crypto long-term holder investor", "crypto market analyst researcher"]}
- "tech workers in NYC with anxiety" → {"city": "New York", "occupation_keywords": ["tech", "software", "engineer", "developer", "IT"], "semantic_query": "technology worker anxiety mental health stress", "segments": null}
- "obese women over 50" → {"gender": "female", "age_min": 50, "bmi_min": 30, "semantic_query": "obese older women health weight", "segments": null}`
        },
        { role: 'user', content: query }
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[smart-acp-search] GPT parse failed:', errText);
    throw new Error('Failed to parse query');
  }

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}

function buildDatabaseFilter(supabase: any, criteria: ParsedCriteria, excludeIds: string[]) {
  let query = supabase
    .from('v4_personas')
    .select(`
      persona_id, name, user_id, is_public, created_at,
      full_profile, conversation_summary,
      profile_image_url, profile_thumbnail_url,
      age_computed, gender_computed, occupation_computed,
      city_computed, state_region_computed, country_computed,
      profile_embedding
    `)
    .eq('creation_completed', true)
    .not('profile_embedding', 'is', null);

  if (criteria.state) {
    query = query.ilike('state_region_computed', `%${criteria.state}%`);
  }
  if (criteria.country) {
    query = query.ilike('country_computed', `%${criteria.country}%`);
  }
  if (criteria.city) {
    query = query.ilike('city_computed', `%${criteria.city}%`);
  }
  if (criteria.age_min) {
    query = query.gte('age_computed', criteria.age_min);
  }
  if (criteria.age_max) {
    query = query.lte('age_computed', criteria.age_max);
  }
  if (criteria.gender) {
    query = query.ilike('gender_computed', criteria.gender);
  }
  
  if (excludeIds.length > 0) {
    query = query.not('persona_id', 'in', `(${excludeIds.join(',')})`);
  }

  return query;
}

function filterByBMI(personas: any[], criteria: ParsedCriteria): any[] {
  return personas.filter(p => {
    const healthProfile = p.full_profile?.health_profile;
    if (!healthProfile) return !criteria.bmi_min && !criteria.bmi_max;
    
    // Try to get BMI from bmi_category or calculate from other data
    const bmiCategory = healthProfile.bmi_category?.toLowerCase() || '';
    
    // Map categories to approximate BMI ranges
    if (criteria.bmi_min) {
      if (criteria.bmi_min >= 30) {
        // Looking for obese
        return bmiCategory.includes('obese');
      } else if (criteria.bmi_min >= 25) {
        // Looking for overweight or obese
        return bmiCategory.includes('overweight') || bmiCategory.includes('obese');
      }
    }
    
    if (criteria.bmi_max) {
      if (criteria.bmi_max <= 18.5) {
        // Looking for underweight
        return bmiCategory.includes('underweight');
      } else if (criteria.bmi_max <= 25) {
        // Looking for normal or underweight
        return bmiCategory.includes('normal') || bmiCategory.includes('underweight') || bmiCategory.includes('healthy');
      }
    }
    
    return true;
  });
}

function filterByOccupation(personas: any[], keywords: string[]): any[] {
  if (!keywords || keywords.length === 0) return personas;
  
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  return personas.filter(p => {
    const occupation = (p.occupation_computed || '').toLowerCase();
    return lowerKeywords.some(kw => occupation.includes(kw));
  });
}

async function rankBySemantic(
  personas: any[], 
  semanticQuery: string, 
  openaiKey: string
): Promise<any[]> {
  if (personas.length === 0) return [];
  
  const embResponse = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: semanticQuery,
    }),
  });

  if (!embResponse.ok) {
    console.error('[smart-acp-search] Embedding failed, returning unranked');
    return personas.map(p => ({ ...p, similarity: 0.5 }));
  }

  const embResult = await embResponse.json();
  const queryEmbedding = embResult.data[0].embedding;

  const withScores = personas.map(p => {
    const similarity = cosineSimilarity(queryEmbedding, p.profile_embedding);
    return { ...p, similarity };
  });

  withScores.sort((a, b) => b.similarity - a.similarity);
  return withScores;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

function selectDiverse(personas: any[], count: number): any[] {
  if (personas.length <= count) return personas;
  
  const selected: any[] = [];
  const remaining = [...personas];
  
  // Always take the top match first
  selected.push(remaining.shift()!);
  
  while (selected.length < count && remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;
    
    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const diversityScore = calculateDiversityScore(candidate, selected);
      // Combined score: semantic relevance + diversity bonus
      const combinedScore = (candidate.similarity || 0.5) + (diversityScore * 0.3);
      
      if (combinedScore > bestScore) {
        bestScore = combinedScore;
        bestIdx = i;
      }
    }
    
    selected.push(remaining.splice(bestIdx, 1)[0]);
  }
  
  return selected;
}

function calculateDiversityScore(candidate: any, selected: any[]): number {
  let diversitySum = 0;
  
  for (const existing of selected) {
    let difference = 0;
    
    // Different occupation = +0.3
    if (candidate.occupation_computed !== existing.occupation_computed) {
      difference += 0.3;
    }
    
    // Different age bracket = +0.2
    const ageDiff = Math.abs((candidate.age_computed || 0) - (existing.age_computed || 0));
    if (ageDiff > 10) difference += 0.2;
    else if (ageDiff > 5) difference += 0.1;
    
    // Different gender = +0.2
    if (candidate.gender_computed !== existing.gender_computed) {
      difference += 0.2;
    }
    
    // Different city = +0.15
    if (candidate.city_computed !== existing.city_computed) {
      difference += 0.15;
    }
    
    // Different state = +0.15
    if (candidate.state_region_computed !== existing.state_region_computed) {
      difference += 0.15;
    }
    
    diversitySum += difference;
  }
  
  return diversitySum / selected.length;
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const body: SmartSearchRequest = await req.json();
    
    if (!body.research_query) {
      throw new Error('research_query is required');
    }

    const personaCount = body.persona_count ?? 5;
    const excludeIds = body.exclude_persona_ids ?? [];

    console.log(`[smart-acp-search] Request ${requestId}: "${body.research_query}", count: ${personaCount}`);

    // Step 1: Parse query with GPT
    const criteria = await parseQueryWithGPT(body.research_query, openaiKey);
    console.log(`[smart-acp-search] Parsed criteria:`, JSON.stringify(criteria));

    // Step 2: Check for multi-segment query
    if (criteria.segments && criteria.segments.length > 1) {
      const allPersonas: any[] = [];
      const allExcludeIds = [...excludeIds];
      const perSegment = Math.ceil(personaCount / criteria.segments.length);
      
      for (const segment of criteria.segments) {
        if (allPersonas.length >= personaCount) break;
        
        const needed = Math.min(perSegment, personaCount - allPersonas.length);
        console.log(`[smart-acp-search] Segment: "${segment}", need: ${needed}`);
        
        // Recursive call for each segment
        const { data: segmentData, error: segmentError } = await supabase.functions.invoke('smart-acp-search', {
          body: {
            research_query: segment,
            persona_count: needed,
            exclude_persona_ids: allExcludeIds,
          },
        });
        
        if (segmentError) {
          console.error(`[smart-acp-search] Segment error:`, segmentError);
          continue;
        }
        
        if (segmentData?.personas) {
          for (const p of segmentData.personas) {
            allPersonas.push({ ...p, segment_query: segment });
            allExcludeIds.push(p.persona_id);
          }
        }
      }
      
      const duration = Date.now() - startTime;
      return new Response(
        JSON.stringify({
          success: allPersonas.length > 0,
          status: allPersonas.length >= personaCount ? 'SUCCESS' : 'PARTIAL',
          request_id: requestId,
          query: body.research_query,
          parsed_criteria: criteria,
          personas: allPersonas,
          duration_ms: duration,
          reason: `Found ${allPersonas.length} personas across ${criteria.segments.length} segments`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Build and execute database query with hard filters
    const dbQuery = buildDatabaseFilter(supabase, criteria, excludeIds);
    const { data: dbResults, error: dbError } = await dbQuery.limit(500);

    if (dbError) {
      throw new Error(`Database query failed: ${dbError.message}`);
    }

    console.log(`[smart-acp-search] Hard filter returned ${dbResults?.length ?? 0} candidates`);

    // Step 4: Apply BMI filter (JSONB field)
    let filtered = dbResults || [];
    if (criteria.bmi_min || criteria.bmi_max) {
      filtered = filterByBMI(filtered, criteria);
      console.log(`[smart-acp-search] After BMI filter: ${filtered.length} candidates`);
    }

    // Step 5: Apply occupation keyword filter
    if (criteria.occupation_keywords) {
      filtered = filterByOccupation(filtered, criteria.occupation_keywords);
      console.log(`[smart-acp-search] After occupation filter: ${filtered.length} candidates`);
    }

    // Step 6: Check if we have enough results
    if (filtered.length === 0) {
      const duration = Date.now() - startTime;
      return new Response(
        JSON.stringify({
          success: false,
          status: 'NO_MATCH',
          request_id: requestId,
          query: body.research_query,
          parsed_criteria: criteria,
          personas: [],
          duration_ms: duration,
          reason: `No personas match the criteria. Filters applied: ${JSON.stringify(criteria)}`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (filtered.length < personaCount) {
      console.log(`[smart-acp-search] Warning: Only ${filtered.length} personas match, requested ${personaCount}`);
    }

    // Step 7: Rank by semantic similarity
    const ranked = await rankBySemantic(filtered, criteria.semantic_query, openaiKey);

    // Step 8: Select diverse subset
    const selected = selectDiverse(ranked, personaCount);

    // Step 9: Format response
    const personas = selected.map(p => ({
      persona_id: p.persona_id,
      name: p.name,
      match_score: Math.round((p.similarity || 0.5) * 100) / 100,
      match_reason: `Matched: ${Object.entries(criteria)
        .filter(([k, v]) => v && k !== 'semantic_query' && k !== 'segments')
        .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(',') : v}`)
        .join(', ') || 'semantic similarity'}`,
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

    const duration = Date.now() - startTime;
    console.log(`[smart-acp-search] Complete: ${personas.length} personas, ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        status: personas.length >= personaCount ? 'SUCCESS' : 'PARTIAL',
        request_id: requestId,
        query: body.research_query,
        parsed_criteria: criteria,
        total_matching: filtered.length,
        personas,
        duration_ms: duration,
        reason: `Found ${filtered.length} matching personas, selected ${personas.length} diverse results`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[smart-acp-search] Error:`, error.message);
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
