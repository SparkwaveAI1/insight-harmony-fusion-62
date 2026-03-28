/**
 * Enhanced ACP Search Module with Diversity Support
 * Handles complex queries with diversity constraints and sophisticated selection logic
 */

interface ParsedCriteria {
  // Basic filters
  age_min?: number;
  age_max?: number;
  gender?: string;
  genders?: string[];
  states?: string[];
  occupation_keywords?: string[];
  education_level?: string;
  education_levels?: string[];
  income_brackets?: string[];
  ethnicities?: string[];
  has_children?: boolean;
  health_tags?: string[];
  political_leans?: string[];
  text_contains?: string;
  semantic_query?: string;

  // Diversity requirements
  diversity_requirements?: DiversityRequirement[];
  
  // Quantity specifications
  total_count?: number;
  category_counts?: CategoryCount[];
}

interface DiversityRequirement {
  field: string;           // e.g., "political_lean", "gender", "age_group", "state_region"
  type: 'unique' | 'balanced' | 'range_coverage' | 'variety';
  min_unique?: number;     // minimum number of unique values required
  target_distribution?: { [key: string]: number }; // for balanced requirements
}

interface CategoryCount {
  filters: { [field: string]: any };  // specific filters for this category
  count: number;                      // how many from this category
}

interface SearchResult {
  persona_id: string;
  name: string;
  age: number;
  gender: string;
  occupation: string;
  state_region: string;
  city: string;
  ethnicity: string;
  education_level: string;
  income_bracket: string;
  has_children: boolean;
  political_lean: string;
  total_count: number;
}

/**
 * Enhanced query parser that extracts diversity requirements
 */
/**
 * Try LLM API with failover. Attempts OpenAI first, falls back to Grok (via xAI) on failure.
 */
async function callLlmWithFailover(
  messages: any[],
  openaiKey: string,
  grokKey?: string
): Promise<any> {
  // Try OpenAI first
  if (openaiKey) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0, response_format: { type: 'json_object' }, messages }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.choices?.[0]?.message?.content) {
          return JSON.parse(data.choices[0].message.content);
        }
      }
      const errText = await resp.text().catch(() => '');
      console.warn('[LLM] OpenAI failed:', resp.status, errText.slice(0, 200));
    } catch (e: any) {
      console.warn('[LLM] OpenAI error:', e?.message);
    }
  }

  // Fall back to Grok (xAI API)
  if (grokKey) {
    try {
      const resp = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${grokKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'grok-3-mini', temperature: 0, response_format: { type: 'json_object' }, messages }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.choices?.[0]?.message?.content) {
          return JSON.parse(data.choices[0].message.content);
        }
      }
      const errText = await resp.text().catch(() => '');
      console.warn('[LLM] Grok failed:', resp.status, errText.slice(0, 200));
    } catch (e: any) {
      console.warn('[LLM] Grok error:', e?.message);
    }
  }

  throw new Error('All LLM providers failed');
}

export async function parseQueryWithGPT(query: string, openaiKey: string): Promise<ParsedCriteria> {
  // Also read Grok key from env for failover
  const grokKey: string | undefined = (typeof Deno !== 'undefined')
    ? (Deno.env.get('GROK_API_KEY') || Deno.env.get('XAI_API_KEY'))
    : undefined;

  const systemPrompt = `You parse research queries into database search filters AND diversity requirements.

**CRITICAL: Parse BOTH basic filters AND diversity requirements**

BASIC FILTERS (same as before):
- age_min, age_max: Age range
- gender: "male" or "female" 
- genders: Array when multiple specified
- states: Array of US state names
- occupation_keywords: Array of occupation-related words (SINGULAR FORM: "nurse" not "nurses", "worker" not "workers", "doctor" not "doctors")
- education_level/education_levels: Education requirements
- income_brackets: Income ranges
- ethnicities: Ethnicity requirements
- has_children: true/false if mentioned
- health_tags: Health conditions
- political_leans: Array of political orientations
- text_contains: Key phrases for open-ended topics (burnout, stress, anxiety, etc.)
- total_count: Total number requested (default from context)

IMPORTANT: occupation_keywords must be SINGULAR. Always strip trailing 's' from occupation nouns.
Examples: "nurses" → ["nurse"], "doctors" → ["doctor"], "healthcare workers" → ["healthcare worker"]

DIVERSITY REQUIREMENTS - Extract these patterns:
- "different X" / "variety of X" / "mix of X" → {"field": "X", "type": "unique"}
- "balanced X" / "equal X" → {"field": "X", "type": "balanced"}
- "one from each X" → {"field": "X", "type": "unique", "min_unique": parsed_count}

FIELD MAPPINGS for diversity:
- "political orientations/views/leans" → "political_lean"
- "ages/age groups" → "age_group" 
- "genders" → "gender"
- "states/regions" → "state_region"
- "ethnicities/backgrounds" → "ethnicity"
- "income levels/brackets" → "income_bracket"
- "education levels/backgrounds" → "education_level"
- "occupations/jobs" → "occupation"

CATEGORY COUNTS - Extract specific quantities:
- "2 conservatives and 3 liberals" → category_counts with specific filters and counts
- "equal men and women" → category_counts with balanced gender split

EXAMPLES:
Query: "3 people with different political orientations"
Response: {
  "total_count": 3,
  "diversity_requirements": [{"field": "political_lean", "type": "unique", "min_unique": 3}]
}

Query: "2 conservative women and 2 liberal men from different states" 
Response: {
  "total_count": 4,
  "category_counts": [
    {"filters": {"political_leans": ["conservative"], "gender": "female"}, "count": 2},
    {"filters": {"political_leans": ["liberal"], "gender": "male"}, "count": 2}
  ],
  "diversity_requirements": [{"field": "state_region", "type": "unique"}]
}

Return JSON with these fields. Use null for unspecified filters.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query }
  ];

  return callLlmWithFailover(messages, openaiKey, grokKey);
}

/**
 * Build RPC parameters from parsed criteria
 */
/**
 * Normalize an occupation keyword for ILIKE substring matching.
 * Strips common plural suffixes so "nurses" → "nurse", "workers" → "worker", etc.
 * Persona occupations are stored singular ("Nurse", "Healthcare Worker") so plural queries
 * return 0 results. This normalization bridges the gap.
 */
function normalizeOccupationKeyword(kw: string): string {
  const lower = kw.toLowerCase().trim();
  // Strip trailing 's' for common plural forms, but not short words (≤3 chars)
  // and not words that end in 'ss' (e.g., "boss") or 'ess' (e.g., "actress")
  if (lower.length > 4 && lower.endsWith('ers')) return lower.slice(0, -1);  // "workers" → "worker"
  if (lower.length > 4 && lower.endsWith('ists')) return lower.slice(0, -1); // "analysts" → "analyst"
  if (lower.length > 4 && lower.endsWith('ors')) return lower.slice(0, -1);  // "doctors" → "doctor"
  if (lower.length > 4 && lower.endsWith('ians')) return lower.slice(0, -1); // "physicians" → "physician"
  if (lower.length > 3 && lower.endsWith('ves')) return lower.slice(0, -3) + 'fe'; // "wives" → "wife"
  if (lower.length > 4 && lower.endsWith('es') && !lower.endsWith('ses')) return lower.slice(0, -1); // "nurses" → "nurse"
  if (lower.length > 4 && lower.endsWith('s') && !lower.endsWith('ss') && !lower.endsWith('ess')) return lower.slice(0, -1); // generic plural strip
  return lower;
}

function buildRpcParams(criteria: ParsedCriteria, limit: number, excludeIds: string[] = []): any {
  const params: any = { 
    p_limit: limit,
    p_public_only: true,
    p_offset: 0,
    p_sort_by: 'random'  // Random sort for diversity
  };
  
  if (criteria.age_min) params.p_age_min = criteria.age_min;
  if (criteria.age_max) params.p_age_max = criteria.age_max;
  if (criteria.genders?.length) params.p_genders = criteria.genders;
  if (criteria.states?.length) params.p_states = criteria.states;
  if (criteria.occupation_keywords?.length) {
    // Normalize to singular form — DB stores "Nurse" not "nurses", "Healthcare Worker" not "healthcare workers"
    params.p_occupation_contains = normalizeOccupationKeyword(criteria.occupation_keywords[0]);
  }
  if (criteria.education_levels?.length) params.p_education_levels = criteria.education_levels;
  if (criteria.income_brackets?.length) params.p_income_brackets = criteria.income_brackets;
  if (criteria.ethnicities?.length) params.p_ethnicities = criteria.ethnicities;
  if (criteria.political_leans?.length) params.p_political_leans = criteria.political_leans;
  if (criteria.health_tags?.length) params.p_health_tags_any = criteria.health_tags;
  if (criteria.text_contains) params.p_text_contains = criteria.text_contains;
  if (criteria.has_children !== undefined) params.p_has_children = criteria.has_children;
  if (excludeIds.length) params.p_exclude_persona_ids = excludeIds;
  
  return params;
}

/**
 * Apply diversity constraints to selection
 */
function applyDiversityConstraints(
  personas: SearchResult[], 
  requirements: DiversityRequirement[], 
  targetCount: number
): SearchResult[] {
  if (!requirements?.length || !personas.length) {
    return shuffleArray(personas).slice(0, targetCount);
  }

  let selected: SearchResult[] = [];
  let remaining = [...personas];

  for (const req of requirements) {
    const fieldKey = getFieldKey(req.field);
    
    if (req.type === 'unique') {
      // Ensure unique values for this field
      const uniqueGroups = groupBy(remaining, (p) => getFieldValue(p, fieldKey));
      const minUnique = req.min_unique || Math.min(targetCount, Object.keys(uniqueGroups).length);
      
      // Take one from each unique group (randomized)
      const selectedFromGroups: SearchResult[] = [];
      let groupKeys = shuffleArray(Object.keys(uniqueGroups));
      
      for (let i = 0; i < Math.min(minUnique, groupKeys.length); i++) {
        const groupKey = groupKeys[i];
        const group = uniqueGroups[groupKey];
        if (group.length > 0) {
          selectedFromGroups.push(group[Math.floor(Math.random() * group.length)]);
        }
      }
      
      selected.push(...selectedFromGroups);
      remaining = remaining.filter(p => !selectedFromGroups.includes(p));
      
    } else if (req.type === 'balanced') {
      // Try to balance representation across values
      const uniqueGroups = groupBy(remaining, (p) => getFieldValue(p, fieldKey));
      const numGroups = Object.keys(uniqueGroups).length;
      const perGroup = Math.max(1, Math.floor(targetCount / numGroups));
      
      const selectedFromGroups: SearchResult[] = [];
      Object.values(uniqueGroups).forEach(group => {
        const shuffledGroup = shuffleArray(group);
        selectedFromGroups.push(...shuffledGroup.slice(0, perGroup));
      });
      
      selected.push(...selectedFromGroups);
      remaining = remaining.filter(p => !selectedFromGroups.includes(p));
    }
  }

  // Fill remaining slots randomly
  const stillNeeded = targetCount - selected.length;
  if (stillNeeded > 0 && remaining.length > 0) {
    selected.push(...shuffleArray(remaining).slice(0, stillNeeded));
  }

  return selected.slice(0, targetCount);
}

/**
 * Handle category count requirements
 */
async function handleCategoryCounts(
  supabase: any,
  openaiKey: string,
  categoryCounts: CategoryCount[],
  baseParams: any,
  diversityRequirements: DiversityRequirement[]
): Promise<SearchResult[]> {
  const allResults: SearchResult[] = [];
  
  for (const categoryCount of categoryCounts) {
    // Merge base params with category-specific filters
    const categoryParams = { ...baseParams };
    
    // Apply category filters
    Object.entries(categoryCount.filters).forEach(([field, value]) => {
      if (field === 'political_leans') {
        categoryParams.p_political_leans = Array.isArray(value) ? value : [value];
      } else if (field === 'gender') {
        categoryParams.p_genders = [value];
      } else if (field === 'states') {
        categoryParams.p_states = Array.isArray(value) ? value : [value];
      }
      // Add more field mappings as needed
    });
    
    // Increase limit to allow for diversity filtering
    categoryParams.p_limit = Math.min(categoryCount.count * 5, 100);
    
    // Search for this category
    const { data: results, error } = await supabase.rpc('search_personas_unified', categoryParams);
    
    if (error) {
      throw new Error(`Category search failed: ${error.message}`);
    }
    
    // Apply diversity constraints within this category if needed
    const categoryDiversityReqs = diversityRequirements.filter(req => 
      req.field !== 'political_lean' && req.field !== 'gender' // these are already handled by category filters
    );
    
    const selectedFromCategory = applyDiversityConstraints(
      results || [], 
      categoryDiversityReqs, 
      categoryCount.count
    );
    
    allResults.push(...selectedFromCategory);
  }
  
  return allResults;
}

/**
 * Enhanced search with diversity support
 */
export async function searchPersonasEnhanced(
  supabase: any,
  openaiKey: string,
  query: string,
  count: number,
  excludeIds: string[] = [],
  precheckOnly: boolean = false
): Promise<AcpSearchResult> {
  const startTime = Date.now();
  
  try {
    console.log(`[acpSearchEnhanced] Starting search for: "${query}"`);
    
    // Step 1: Parse query with enhanced GPT
    const criteria = await parseQueryWithGPT(query, openaiKey);
    console.log(`[acpSearchEnhanced] Parsed criteria:`, JSON.stringify(criteria, null, 2));
    
    // Use parsed total_count if available, otherwise use provided count
    const targetCount = criteria.total_count || count;
    
    // Step 2: Handle category counts (specific quantity requirements)
    if (criteria.category_counts?.length) {
      const baseParams = buildRpcParams(criteria, 100, excludeIds);
      const results = await handleCategoryCounts(
        supabase, 
        openaiKey, 
        criteria.category_counts, 
        baseParams,
        criteria.diversity_requirements || []
      );
      
      return {
        success: results.length >= targetCount,
        personas: await enrichPersonas(supabase, results),
        match_count: results.length,
        parsed_criteria: criteria,
        duration_ms: Date.now() - startTime
      };
    }
    
    // Step 3: Build RPC parameters for basic search
    // Use large buffer to ensure we have diverse pool to select from
    // RPC returns alphabetically, so we need many more to get past common names
    const bufferMultiplier = precheckOnly ? 1 : 50; // Get 50x more to ensure diversity
    const searchLimit = Math.min(targetCount * bufferMultiplier, 500);
    const rpcParams = buildRpcParams(criteria, searchLimit, excludeIds);
    
    console.log(`[acpSearchEnhanced] RPC params:`, JSON.stringify(rpcParams, null, 2));
    
    // Step 4: Execute search
    const { data: results, error: rpcError } = await supabase.rpc(
      'search_personas_unified',
      rpcParams
    );
    
    if (rpcError) {
      throw new Error(`Database search failed: ${rpcError.message}`);
    }
    
    const totalCount = results?.[0]?.total_count || 0;
    console.log(`[acpSearchEnhanced] RPC returned ${results?.length || 0} results (total: ${totalCount})`);
    
    if (precheckOnly) {
      return {
        success: totalCount >= targetCount,
        personas: [],
        match_count: totalCount,
        parsed_criteria: criteria,
        duration_ms: Date.now() - startTime
      };
    }
    
    // Step 5: Apply diversity constraints and intelligent selection
    let selectedPersonas: SearchResult[];
    
    if (criteria.diversity_requirements?.length) {
      selectedPersonas = applyDiversityConstraints(
        results || [], 
        criteria.diversity_requirements, 
        targetCount
      );
    } else {
      // No diversity requirements - randomize selection
      selectedPersonas = shuffleArray(results || []).slice(0, targetCount);
    }
    
    console.log(`[acpSearchEnhanced] Selected ${selectedPersonas.length} personas after diversity filtering`);
    
    // Step 6: Validate results meet criteria
    const validation = validateResults(selectedPersonas, criteria);
    if (!validation.valid) {
      console.warn(`[acpSearchEnhanced] Validation failed: ${validation.reason}`);
      return {
        success: false,
        personas: [],
        match_count: totalCount,
        parsed_criteria: criteria,
        duration_ms: Date.now() - startTime,
        error: `Cannot satisfy criteria: ${validation.reason}`
      };
    }
    
    // Step 7: Enrich with full profiles
    const enrichedPersonas = await enrichPersonas(supabase, selectedPersonas);
    
    return {
      success: enrichedPersonas.length >= targetCount,
      personas: enrichedPersonas,
      match_count: totalCount,
      parsed_criteria: criteria,
      duration_ms: Date.now() - startTime
    };
    
  } catch (error: any) {
    console.error(`[acpSearchEnhanced] Error:`, error.message);
    return {
      success: false,
      personas: [],
      match_count: 0,
      parsed_criteria: {},
      duration_ms: Date.now() - startTime,
      error: error.message
    };
  }
}

// Utility functions
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function groupBy<T>(array: T[], keyFn: (item: T) => string): { [key: string]: T[] } {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as { [key: string]: T[] });
}

function getFieldKey(diversityField: string): string {
  const fieldMap: { [key: string]: string } = {
    'political_lean': 'political_lean',
    'age_group': 'age',
    'gender': 'gender',
    'state_region': 'state_region',
    'ethnicity': 'ethnicity',
    'income_bracket': 'income_bracket',
    'education_level': 'education_level',
    'occupation': 'occupation'
  };
  return fieldMap[diversityField] || diversityField;
}

function getFieldValue(persona: SearchResult, field: string): string {
  if (field === 'age') {
    // Group ages into decades for diversity
    return `${Math.floor(persona.age / 10) * 10}s`;
  }
  return (persona as any)[field] || 'unknown';
}

function validateResults(personas: SearchResult[], criteria: ParsedCriteria): { valid: boolean; reason?: string } {
  if (!criteria.diversity_requirements?.length) {
    return { valid: true };
  }
  
  for (const req of criteria.diversity_requirements) {
    const fieldKey = getFieldKey(req.field);
    const uniqueValues = new Set(personas.map(p => getFieldValue(p, fieldKey)));
    
    if (req.type === 'unique' && req.min_unique && uniqueValues.size < req.min_unique) {
      return { 
        valid: false, 
        reason: `Need ${req.min_unique} unique ${req.field} values, found only ${uniqueValues.size}` 
      };
    }
  }
  
  return { valid: true };
}

async function enrichPersonas(supabase: any, personas: SearchResult[]): Promise<any[]> {
  if (!personas.length) return [];
  
  const selectedIds = personas.map(p => p.persona_id);
  const { data: fullProfiles } = await supabase
    .from('v4_personas')
    .select('persona_id, name, full_profile, conversation_summary')
    .in('persona_id', selectedIds);
  
  const profileMap = new Map(fullProfiles?.map((p: any) => [p.persona_id, p]) || []);
  
  return personas.map(p => {
    const profile = profileMap.get(p.persona_id);
    return {
      persona_id: p.persona_id,
      name: p.name,
      demographics: {
        age: p.age,
        gender: p.gender,
        occupation: p.occupation,
        location: `${p.city}, ${p.state_region}`,
        ethnicity: p.ethnicity,
        education_level: p.education_level,
        income_bracket: p.income_bracket,
        political_lean: p.political_lean,
      },
      full_profile: profile?.full_profile || null,
      conversation_summary: profile?.conversation_summary || null,
      match_score: 0.9,
      match_reason: 'Selected via enhanced diversity-aware search',
    };
  });
}

export interface AcpSearchResult {
  success: boolean;
  personas: any[];
  match_count: number;
  parsed_criteria: ParsedCriteria;
  duration_ms: number;
  error?: string;
}

// Export the enhanced search as the main function
export { searchPersonasEnhanced as searchPersonas };