import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedCriteria {
  states?: string[];
  country?: string;
  city?: string;
  age_min?: number;
  age_max?: number;
  gender?: string;
  bmi_min?: number;
  bmi_max?: number;
  occupation_keywords?: string[];
  require_geographic_diversity?: boolean;
  semantic_query: string;
  segments?: string[];
  // NEW: Additional structured filters
  health_conditions?: string[];
  income_level?: 'low' | 'medium' | 'high' | 'very_high';
  relationship_status?: string;
  has_children?: boolean;
}

interface SmartSearchRequest {
  research_query: string;
  persona_count?: number;
  exclude_persona_ids?: string[];
  exclude_states?: string[];
  additional_context?: string;
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
- states: Array of US state names. Use array even for single state.
- country: Country name if specified. Use "United States" for queries mentioning US states.
- city: City name if specified
- age_min, age_max: Age range bounds (e.g., "adults" = 18+, "seniors" = 65+, "young adults" = 18-30)
- gender: "male", "female", or null
- bmi_min, bmi_max: Weight criteria (overweight = bmi_min:25, obese = bmi_min:30, underweight = bmi_max:18.5)
- occupation_keywords: Array of occupation-related words (e.g., ["tech", "software", "engineer"] for tech workers)
- require_geographic_diversity: true when query asks for "different states", "across the country", etc.

NEW FILTERS - Extract these as well:
- health_conditions: Array of health condition keywords when query mentions specific conditions.
  Examples: "diabetes" → ["diabetes"], "anxiety or depression" → ["anxiety", "depression"], 
  "heart disease" → ["heart", "cardiac", "cardiovascular"], "high blood pressure" → ["hypertension", "blood pressure"]
- income_level: When query mentions income/wealth:
  - "low income", "poor", "struggling" → "low" (Under $50k)
  - "middle class", "moderate income" → "medium" ($50k-$100k)
  - "high income", "wealthy", "affluent" → "high" ($100k-$200k)
  - "very wealthy", "rich", "high net worth" → "very_high" ($200k+)
- relationship_status: When query mentions marital/relationship status:
  - "married" → "married"
  - "single" → "single"
  - "divorced" → "divorced"
  - "widowed" → "widowed"
- has_children: When query mentions parental status:
  - "parents", "mothers", "fathers", "with kids", "have children" → true
  - "childless", "no children", "child-free" → false

Respond with JSON:
{
  "states": string[] | null,
  "country": string | null,
  "city": string | null,
  "age_min": number | null,
  "age_max": number | null,
  "gender": string | null,
  "bmi_min": number | null,
  "bmi_max": number | null,
  "occupation_keywords": string[] | null,
  "require_geographic_diversity": boolean | null,
  "health_conditions": string[] | null,
  "income_level": "low" | "medium" | "high" | "very_high" | null,
  "relationship_status": string | null,
  "has_children": boolean | null,
  "semantic_query": "full descriptive query for semantic matching",
  "segments": ["segment 1", "segment 2"] | null
}

Examples:
- "overweight adults from California" → {"states": ["California"], "country": "United States", "bmi_min": 25, "age_min": 18, "semantic_query": "overweight adults lifestyle health", "segments": null}
- "people with diabetes" → {"health_conditions": ["diabetes"], "semantic_query": "people with diabetes health management", "segments": null}
- "wealthy divorced women" → {"gender": "female", "income_level": "high", "relationship_status": "divorced", "semantic_query": "wealthy divorced women lifestyle", "segments": null}
- "working parents with anxiety" → {"has_children": true, "health_conditions": ["anxiety"], "semantic_query": "working parents anxiety stress mental health", "segments": null}
- "low income seniors with heart disease" → {"age_min": 65, "income_level": "low", "health_conditions": ["heart", "cardiac", "cardiovascular"], "semantic_query": "low income seniors heart disease health", "segments": null}
- "single mothers in Texas" → {"states": ["Texas"], "country": "United States", "gender": "female", "has_children": true, "relationship_status": "single", "semantic_query": "single mothers parenting lifestyle", "segments": null}
- "tech workers" → {"occupation_keywords": ["tech", "software", "engineer", "developer", "IT", "programmer"], "semantic_query": "technology workers software engineers", "segments": null}
- "obese adults" → {"bmi_min": 30, "age_min": 18, "semantic_query": "obese adults weight health", "segments": null}`
        },
        { role: 'user', content: query }
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[smart-acp-search-v2] GPT parse failed:', errText);
    throw new Error('Failed to parse query');
  }

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}

function buildDatabaseFilter(supabase: any, criteria: ParsedCriteria, excludeIds: string[], excludeStates?: string[]) {
  // Light query - doesn't fetch full_profile to save memory
  // full_profile will be fetched only for final selected personas
  let query = supabase
    .from('v4_personas')
    .select(`
      persona_id, name, user_id, is_public, created_at,
      profile_image_url, profile_thumbnail_url,
      age_computed, gender_computed, occupation_computed,
      city_computed, state_region_computed, country_computed,
      marital_status_computed, has_children_computed, income_bracket,
      profile_embedding
    `)
    .eq('creation_completed', true)
    .not('profile_embedding', 'is', null);

  // Geographic filters
  if (criteria.states && criteria.states.length > 0) {
    if (criteria.states.length === 1) {
      query = query.ilike('state_region_computed', `%${criteria.states[0]}%`);
    } else {
      const stateFilters = criteria.states.map(s => `state_region_computed.ilike.*${s}*`).join(',');
      query = query.or(stateFilters);
    }
  }
  if (criteria.country) {
    query = query.ilike('country_computed', `%${criteria.country}%`);
  }
  if (criteria.city) {
    query = query.ilike('city_computed', `%${criteria.city}%`);
  }

  // Age filters
  if (criteria.age_min) {
    query = query.gte('age_computed', criteria.age_min);
  }
  if (criteria.age_max) {
    query = query.lte('age_computed', criteria.age_max);
  }

  // Gender filter
  if (criteria.gender) {
    query = query.ilike('gender_computed', criteria.gender);
  }

  // NEW: Relationship status filter (using computed column)
  if (criteria.relationship_status) {
    query = query.ilike('marital_status_computed', `%${criteria.relationship_status}%`);
  }

  // NEW: Has children filter (using computed boolean column)
  if (criteria.has_children !== undefined && criteria.has_children !== null) {
    query = query.eq('has_children_computed', criteria.has_children);
  }

  // BMI, health conditions, and income filters moved to post-query for reliability
  // (PostgREST JSONB filtering has compatibility issues)

  // Exclusions
  if (excludeIds.length > 0) {
    query = query.not('persona_id', 'in', `(${excludeIds.join(',')})`);
  }
  if (excludeStates && excludeStates.length > 0) {
    for (const state of excludeStates) {
      query = query.not('state_region_computed', 'ilike', `%${state}%`);
    }
  }

  return query;
}

/**
 * Filter by numeric BMI value
 * Uses bmi_value from light RPC if available, otherwise falls back to full_profile
 */
function filterByBMI(personas: any[], criteria: ParsedCriteria): any[] {
  if (!criteria.bmi_min && !criteria.bmi_max) return personas;

  return personas.filter(p => {
    // Use bmi_value from light RPC if available (already extracted)
    let bmiValue: number;
    
    if (p.bmi_value !== undefined && p.bmi_value !== null) {
      // Convert to number in case it's a string from JSON
      bmiValue = typeof p.bmi_value === 'number' ? p.bmi_value : parseFloat(p.bmi_value);
    } else {
      // Fallback to full_profile if bmi_value not present
      const healthProfile = p.full_profile?.health_profile;
      if (!healthProfile) return false;
      bmiValue = parseFloat(healthProfile.bmi);
    }
    
    if (isNaN(bmiValue)) return false;
    
    if (criteria.bmi_min && bmiValue < criteria.bmi_min) {
      return false;
    }
    if (criteria.bmi_max && bmiValue > criteria.bmi_max) {
      return false;
    }
    
    return true;
  });
}

/**
 * NEW: Filter by health conditions from full_profile.health_profile.chronic_conditions
 * Uses ILIKE-style matching on the JSON array of conditions
 */
function filterByHealthConditions(personas: any[], conditions: string[]): any[] {
  if (!conditions || conditions.length === 0) return personas;

  return personas.filter(p => {
    const healthProfile = p.full_profile?.health_profile;
    if (!healthProfile) return false;
    
    // chronic_conditions is a JSON array of strings
    const chronicConditions = healthProfile.chronic_conditions;
    if (!Array.isArray(chronicConditions) || chronicConditions.length === 0) {
      return false;
    }
    
    // Convert all conditions to lowercase for matching
    const conditionsLower = chronicConditions.map((c: string) => c.toLowerCase());
    const conditionsStr = conditionsLower.join(' ');
    
    // Check if ANY of the search keywords match ANY of the conditions
    return conditions.some(keyword => {
      const keywordLower = keyword.toLowerCase();
      return conditionsStr.includes(keywordLower);
    });
  });
}

/**
 * NEW: Filter by income level
 * Handles the various income bracket formats in the database
 */
function filterByIncome(personas: any[], incomeLevel: string): any[] {
  if (!incomeLevel) return personas;

  return personas.filter(p => {
    const bracket = (p.income_bracket || '').toLowerCase();
    if (!bracket) return false;

    // Extract approximate numeric value from bracket for comparison
    // Handles formats like "$100,000 - $150,000", "100000-150000", "Under $25,000", "Over $500,000"
    let approxValue = 0;
    
    if (bracket.includes('under') || bracket.includes('<')) {
      approxValue = 25000;
    } else if (bracket.includes('over') || bracket.includes('>') || bracket.includes('500')) {
      approxValue = 600000;
    } else {
      // Extract first number from the bracket
      const numMatch = bracket.match(/[\d,]+/);
      if (numMatch) {
        approxValue = parseInt(numMatch[0].replace(/,/g, ''), 10);
      }
    }

    switch (incomeLevel) {
      case 'low':
        // Under $50k
        return approxValue < 50000;
      case 'medium':
        // $50k - $100k
        return approxValue >= 50000 && approxValue < 100000;
      case 'high':
        // $100k - $200k
        return approxValue >= 100000 && approxValue < 200000;
      case 'very_high':
        // $200k+
        return approxValue >= 200000;
      default:
        return true;
    }
  });
}

/**
 * Filter by occupation keywords (re-enabled)
 * More lenient than before - just checks if any keyword word appears
 */
function filterByOccupation(personas: any[], keywords: string[]): any[] {
  if (!keywords || keywords.length === 0) return personas;

  return personas.filter(p => {
    const occupation = (p.occupation_computed || '').toLowerCase();
    if (!occupation) return false;

    // Match if ANY word from ANY keyword appears in occupation
    return keywords.some(keyword => {
      const words = keyword.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      return words.some(word => occupation.includes(word));
    });
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
    console.error('[smart-acp-search-v2] Embedding failed, returning unranked');
    return personas.map(p => ({ ...p, similarity: 0.5 }));
  }

  const embResult = await embResponse.json();
  const queryEmbedding = embResult.data[0].embedding;

  const withScores = personas.map(p => {
    // Handle both profile_embedding (from direct query) and profile_embedding_str (from RPC)
    let personaEmbedding = p.profile_embedding || p.profile_embedding_str;
    if (typeof personaEmbedding === 'string') {
      try {
        // Handle Postgres vector format: [0.1,0.2,0.3,...] 
        const cleaned = personaEmbedding.replace(/^\[|\]$/g, '');
        personaEmbedding = cleaned.split(',').map((n: string) => parseFloat(n.trim()));
      } catch (e) {
        console.error(`[smart-acp-search-v2] Failed to parse embedding for ${p.name}: ${e}`);
        return { ...p, similarity: 0 };
      }
    }
    
    if (!Array.isArray(personaEmbedding)) {
      console.error(`[smart-acp-search-v2] Embedding is not an array for ${p.name}`);
      return { ...p, similarity: 0 };
    }
    
    const similarity = cosineSimilarity(queryEmbedding, personaEmbedding);
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

function selectDiverse(personas: any[], count: number, requireGeoDiversity = false): any[] {
  if (personas.length <= count) return personas;
  
  const selected: any[] = [];
  const remaining = [...personas];
  
  selected.push(remaining.shift()!);
  
  while (selected.length < count && remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;
    
    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const diversityScore = calculateDiversityScore(candidate, selected, requireGeoDiversity);
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

function calculateDiversityScore(candidate: any, selected: any[], requireGeoDiversity = false): number {
  let diversitySum = 0;
  
  for (const existing of selected) {
    let difference = 0;
    
    if (candidate.occupation_computed !== existing.occupation_computed) {
      difference += 0.3;
    }
    
    const ageDiff = Math.abs((candidate.age_computed || 0) - (existing.age_computed || 0));
    if (ageDiff > 10) difference += 0.2;
    else if (ageDiff > 5) difference += 0.1;
    
    if (candidate.gender_computed !== existing.gender_computed) {
      difference += 0.2;
    }
    
    if (candidate.city_computed !== existing.city_computed) {
      difference += requireGeoDiversity ? 0.4 : 0.15;
    }
    
    if (candidate.state_region_computed !== existing.state_region_computed) {
      difference += requireGeoDiversity ? 0.5 : 0.15;
    }
    
    if (candidate.country_computed !== existing.country_computed) {
      difference += requireGeoDiversity ? 0.6 : 0.3;
    }
    
    diversitySum += difference;
  }
  
  return diversitySum / selected.length;
}

/**
 * Build a human-readable match reason string
 */
function buildMatchReason(criteria: ParsedCriteria): string {
  const parts: string[] = [];
  
  if (criteria.bmi_min) parts.push(`BMI≥${criteria.bmi_min}`);
  if (criteria.bmi_max) parts.push(`BMI≤${criteria.bmi_max}`);
  if (criteria.age_min) parts.push(`age≥${criteria.age_min}`);
  if (criteria.age_max) parts.push(`age≤${criteria.age_max}`);
  if (criteria.gender) parts.push(`gender=${criteria.gender}`);
  if (criteria.states?.length) parts.push(`states=${criteria.states.join(' or ')}`);
  if (criteria.country) parts.push(`country=${criteria.country}`);
  if (criteria.city) parts.push(`city=${criteria.city}`);
  if (criteria.health_conditions?.length) parts.push(`conditions=${criteria.health_conditions.join(' or ')}`);
  if (criteria.income_level) parts.push(`income=${criteria.income_level}`);
  if (criteria.relationship_status) parts.push(`relationship=${criteria.relationship_status}`);
  if (criteria.has_children !== undefined && criteria.has_children !== null) {
    parts.push(`has_children=${criteria.has_children}`);
  }
  if (criteria.occupation_keywords?.length) parts.push(`occupation matches`);
  
  return parts.length > 0 ? `Matched: ${parts.join(', ')}` : 'semantic similarity';
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
    const excludeStates = body.exclude_states ?? [];

    console.log(`[smart-acp-search-v2] Request ${requestId}: "${body.research_query}", count: ${personaCount}`);

    // Step 1: Parse query with GPT
    const criteria = await parseQueryWithGPT(body.research_query, openaiKey);
    console.log(`[smart-acp-search-v2] Parsed criteria:`, JSON.stringify(criteria));

    // Step 2: Handle multi-segment queries
    if (criteria.segments && criteria.segments.length > 1) {
      console.log(`[smart-acp-search-v2] Multi-segment query: ${criteria.segments.length} segments`);
      
      let candidatePool: any[] = [];
      const segmentNeedsHealthRpc = criteria.bmi_min || criteria.bmi_max || 
        (criteria.health_conditions && criteria.health_conditions.length > 0);
      
      if (segmentNeedsHealthRpc) {
        // Use unified health RPC for BMI/health conditions filtering
        console.log(`[smart-acp-search-v2] Multi-segment using health RPC`);
        const idsResult = await supabase.rpc('get_health_conditions_filtered_persona_ids', {
          p_conditions: criteria.health_conditions?.length ? criteria.health_conditions : null,
          p_bmi_min: criteria.bmi_min || null,
          p_bmi_max: criteria.bmi_max || null,
          p_age_min: criteria.age_min || null,
          p_age_max: criteria.age_max || null,
          p_gender: criteria.gender || null,
          p_states: criteria.states?.length ? criteria.states : null,
          p_country: criteria.country || null,
          p_limit: 3000
        });
        
        if (idsResult.error) {
          throw new Error(`Health filter RPC failed: ${idsResult.error.message}`);
        }
        
        const matchingIds = (idsResult.data || []).map((r: any) => r.persona_id);
        console.log(`[smart-acp-search-v2] Multi-segment health RPC found ${matchingIds.length} matching IDs`);
        
        if (matchingIds.length > 0) {
          const batchSize = 500;
          for (let i = 0; i < matchingIds.length && candidatePool.length < 3000; i += batchSize) {
            const batchIds = matchingIds.slice(i, i + batchSize);
            const { data: batchData, error: batchError } = await supabase
              .from('v4_personas')
              .select(`
                persona_id, name, user_id, is_public, created_at,
                profile_image_url, profile_thumbnail_url,
                age_computed, gender_computed, occupation_computed,
                city_computed, state_region_computed, country_computed,
                marital_status_computed, has_children_computed, income_bracket,
                profile_embedding
              `)
              .in('persona_id', batchIds);
            
            if (batchError) {
              console.error(`Batch error: ${batchError.message}`);
              continue;
            }
            candidatePool.push(...(batchData || []));
          }
        }
      } else {
        const segmentDbQuery = buildDatabaseFilter(supabase, criteria, excludeIds, excludeStates);
        const { data: segmentDbResults, error: segmentDbError } = await segmentDbQuery.limit(2500);
        
        if (segmentDbError) {
          throw new Error(`Database query failed: ${segmentDbError.message}`);
        }
        candidatePool = segmentDbResults || [];
      }
      
      // Apply remaining post-filters (occupation and income)
      if (criteria.occupation_keywords?.length) {
        candidatePool = filterByOccupation(candidatePool, criteria.occupation_keywords);
      }
      if (criteria.income_level) {
        candidatePool = filterByIncome(candidatePool, criteria.income_level);
      }
      
      console.log(`[smart-acp-search-v2] Candidate pool: ${candidatePool.length} personas`);
      
      if (candidatePool.length === 0) {
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
            reason: `No personas match base criteria for multi-segment query`,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const allPersonas: any[] = [];
      const selectedIds = new Set<string>();
      const perSegment = Math.ceil(personaCount / criteria.segments.length);
      
      for (const segment of criteria.segments) {
        if (allPersonas.length >= personaCount) break;
        
        const needed = Math.min(perSegment, personaCount - allPersonas.length);
        console.log(`[smart-acp-search-v2] Segment: "${segment}", need: ${needed}`);
        
        const segmentRanked = await rankBySemantic(candidatePool, segment, openaiKey);
        
        let addedForSegment = 0;
        for (const persona of segmentRanked) {
          if (addedForSegment >= needed) break;
          if (selectedIds.has(persona.persona_id)) continue;
          
          selectedIds.add(persona.persona_id);
          allPersonas.push({ 
            ...persona, 
            segment_query: segment,
            match_reason: `Matched for: ${segment} (score: ${persona.similarity?.toFixed(3)})`
          });
          addedForSegment++;
        }
        
        console.log(`[smart-acp-search-v2] Added ${addedForSegment} personas for segment "${segment}"`);
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
    // Use RPC for BMI/health conditions filtering (much more efficient - filters at DB level)
    let dbResults: any[] = [];
    let dbError: any = null;
    
    const needsHealthRpc = criteria.bmi_min || criteria.bmi_max || 
      (criteria.health_conditions && criteria.health_conditions.length > 0);
    
    if (needsHealthRpc) {
      // Use unified health conditions RPC (handles BMI + health conditions at DB level)
      const rpcParams = {
        p_conditions: criteria.health_conditions?.length ? criteria.health_conditions : null,
        p_bmi_min: criteria.bmi_min ?? null,
        p_bmi_max: criteria.bmi_max ?? null,
        p_age_min: criteria.age_min ?? null,
        p_age_max: criteria.age_max ?? null,
        p_gender: criteria.gender || null,
        p_states: criteria.states?.length ? criteria.states : null,
        p_country: criteria.country || null,
        p_limit: 3000
      };
      console.log(`[smart-acp-search-v2] Using health RPC with params:`, JSON.stringify(rpcParams));
      const idsResult = await supabase.rpc('get_health_conditions_filtered_persona_ids', rpcParams);
      
      console.log(`[smart-acp-search-v2] RPC result - error: ${idsResult.error?.message || 'none'}, data length: ${idsResult.data?.length || 0}, raw data sample: ${JSON.stringify((idsResult.data || []).slice(0, 2))}`);
      
      if (idsResult.error) {
        console.error(`[smart-acp-search-v2] RPC error details:`, JSON.stringify(idsResult.error));
        throw new Error(`Health filter RPC failed: ${idsResult.error.message}`);
      }
      
      const matchingIds = (idsResult.data || []).map((r: any) => r.persona_id);
      console.log(`[smart-acp-search-v2] Health RPC found ${matchingIds.length} matching IDs, first 3: ${matchingIds.slice(0, 3).join(', ')}`);
      
      if (matchingIds.length > 0) {
        // Fetch lightweight details in batches (no full_profile to save memory)
        // full_profile is fetched only for final selected personas
        const batchSize = 500;
        for (let i = 0; i < matchingIds.length && dbResults.length < 3000; i += batchSize) {
          const batchIds = matchingIds.slice(i, i + batchSize);
          const { data: batchData, error: batchError } = await supabase
            .from('v4_personas')
            .select(`
              persona_id, name, user_id, is_public, created_at,
              profile_image_url, profile_thumbnail_url,
              age_computed, gender_computed, occupation_computed,
              city_computed, state_region_computed, country_computed,
              marital_status_computed, has_children_computed, income_bracket,
              profile_embedding
            `)
            .in('persona_id', batchIds);
          
          if (batchError) {
            console.error(`Batch error: ${batchError.message}`);
            continue;
          }
          dbResults.push(...(batchData || []));
        }
      }
    } else {
      // Standard query path (no BMI/health conditions filtering needed)
      const dbQuery = buildDatabaseFilter(supabase, criteria, excludeIds, excludeStates);
      const result = await dbQuery.limit(2000);
      dbResults = result.data || [];
      dbError = result.error;
    }

    if (dbError) {
      throw new Error(`Database query failed: ${dbError.message}`);
    }

    console.log(`[smart-acp-search-v2] DB query returned ${dbResults?.length ?? 0} candidates`);

    // Step 4: Apply post-query filters (JSONB fields)
    let filtered = dbResults || [];
    
    // BMI and health conditions already filtered at DB level via RPC - skip redundant filtering
    if (needsHealthRpc) {
      console.log(`[smart-acp-search-v2] BMI/health conditions pre-filtered at DB level: ${filtered.length} personas`);
    }

    // Occupation filter (RE-ENABLED - uses occupation_computed)
    if (criteria.occupation_keywords && criteria.occupation_keywords.length > 0) {
      const beforeCount = filtered.length;
      filtered = filterByOccupation(filtered, criteria.occupation_keywords);
      console.log(`[smart-acp-search-v2] Occupation filter: ${beforeCount} → ${filtered.length}`);
    }

    // Income filter (post-query due to special character issues in DB filter)
    if (criteria.income_level) {
      const beforeCount = filtered.length;
      filtered = filterByIncome(filtered, criteria.income_level);
      console.log(`[smart-acp-search-v2] Income filter: ${beforeCount} → ${filtered.length}`);
    }

    // Step 5: Check if we have results
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
      console.log(`[smart-acp-search-v2] Warning: Only ${filtered.length} personas match, requested ${personaCount}`);
    }

    // Step 6: Rank by semantic similarity
    const ranked = await rankBySemantic(filtered, criteria.semantic_query, openaiKey);

    // Step 7: Select diverse subset
    const selected = selectDiverse(ranked, personaCount, criteria.require_geographic_diversity ?? false);

    // Step 7.5: Fetch full_profile and conversation_summary for selected personas only
    // (Light queries don't include these to save memory during filtering)
    const selectedIds = selected.map(p => p.persona_id);
    if (selectedIds.length > 0) {
      const { data: fullProfiles } = await supabase
        .from('v4_personas')
        .select('persona_id, full_profile, conversation_summary')
        .in('persona_id', selectedIds);
      
      if (fullProfiles) {
        const profileMap = new Map(fullProfiles.map((p: any) => [p.persona_id, p]));
        for (const persona of selected) {
          const full = profileMap.get(persona.persona_id);
          if (full) {
            persona.full_profile = full.full_profile;
            persona.conversation_summary = full.conversation_summary;
          }
        }
      }
    }

    // Step 8: Format response
    const matchReason = buildMatchReason(criteria);
    const personas = selected.map(p => ({
      persona_id: p.persona_id,
      name: p.name,
      match_score: Math.round((p.similarity || 0.5) * 100) / 100,
      match_reason: matchReason,
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
        relationship_status: p.marital_status_computed,
        has_children: p.has_children_computed,
        income_bracket: p.income_bracket,
      },
    }));

    const duration = Date.now() - startTime;
    console.log(`[smart-acp-search-v2] Complete: ${personas.length} personas, ${duration}ms`);

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
    console.error(`[smart-acp-search-v2] Error:`, error.message);
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
