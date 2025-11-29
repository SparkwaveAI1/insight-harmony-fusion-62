import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================
// COUNTRY NORMALIZATION
// ============================================================
const COUNTRY_ALIASES: Record<string, string> = {
  'us': 'United States',
  'usa': 'United States',
  'u.s.': 'United States',
  'u.s.a.': 'United States',
  'america': 'United States',
  'united states': 'United States',
  'united states of america': 'United States',
  'uk': 'United Kingdom',
  'gb': 'United Kingdom',
  'great britain': 'United Kingdom',
  'britain': 'United Kingdom',
  'england': 'United Kingdom',
  'uae': 'United Arab Emirates',
  'canada': 'Canada',
  'ca': 'Canada',
  'australia': 'Australia',
  'au': 'Australia',
  'new zealand': 'New Zealand',
  'nz': 'New Zealand',
  'germany': 'Germany',
  'de': 'Germany',
  'france': 'France',
  'fr': 'France',
  'spain': 'Spain',
  'es': 'Spain',
  'italy': 'Italy',
  'it': 'Italy',
  'japan': 'Japan',
  'jp': 'Japan',
  'china': 'China',
  'cn': 'China',
  'india': 'India',
  'in': 'India',
  'brazil': 'Brazil',
  'br': 'Brazil',
  'mexico': 'Mexico',
  'mx': 'Mexico',
  'russia': 'Russia',
  'russian': 'Russia',
};

// US State abbreviations and names
const US_STATES: Record<string, string> = {
  'al': 'Alabama', 'ak': 'Alaska', 'az': 'Arizona', 'ar': 'Arkansas',
  'ca': 'California', 'co': 'Colorado', 'ct': 'Connecticut', 'de': 'Delaware',
  'fl': 'Florida', 'ga': 'Georgia', 'hi': 'Hawaii', 'id': 'Idaho',
  'il': 'Illinois', 'in': 'Indiana', 'ia': 'Iowa', 'ks': 'Kansas',
  'ky': 'Kentucky', 'la': 'Louisiana', 'me': 'Maine', 'md': 'Maryland',
  'ma': 'Massachusetts', 'mi': 'Michigan', 'mn': 'Minnesota', 'ms': 'Mississippi',
  'mo': 'Missouri', 'mt': 'Montana', 'ne': 'Nebraska', 'nv': 'Nevada',
  'nh': 'New Hampshire', 'nj': 'New Jersey', 'nm': 'New Mexico', 'ny': 'New York',
  'nc': 'North Carolina', 'nd': 'North Dakota', 'oh': 'Ohio', 'ok': 'Oklahoma',
  'or': 'Oregon', 'pa': 'Pennsylvania', 'ri': 'Rhode Island', 'sc': 'South Carolina',
  'sd': 'South Dakota', 'tn': 'Tennessee', 'tx': 'Texas', 'ut': 'Utah',
  'vt': 'Vermont', 'va': 'Virginia', 'wa': 'Washington', 'wv': 'West Virginia',
  'wi': 'Wisconsin', 'wy': 'Wyoming', 'dc': 'Washington D.C.',
  // Full names map to themselves
  'alabama': 'Alabama', 'alaska': 'Alaska', 'arizona': 'Arizona', 'arkansas': 'Arkansas',
  'california': 'California', 'colorado': 'Colorado', 'connecticut': 'Connecticut', 'delaware': 'Delaware',
  'florida': 'Florida', 'georgia': 'Georgia', 'hawaii': 'Hawaii', 'idaho': 'Idaho',
  'illinois': 'Illinois', 'indiana': 'Indiana', 'iowa': 'Iowa', 'kansas': 'Kansas',
  'kentucky': 'Kentucky', 'louisiana': 'Louisiana', 'maine': 'Maine', 'maryland': 'Maryland',
  'massachusetts': 'Massachusetts', 'michigan': 'Michigan', 'minnesota': 'Minnesota', 'mississippi': 'Mississippi',
  'missouri': 'Missouri', 'montana': 'Montana', 'nebraska': 'Nebraska', 'nevada': 'Nevada',
  'new hampshire': 'New Hampshire', 'new jersey': 'New Jersey', 'new mexico': 'New Mexico', 'new york': 'New York',
  'north carolina': 'North Carolina', 'north dakota': 'North Dakota', 'ohio': 'Ohio', 'oklahoma': 'Oklahoma',
  'oregon': 'Oregon', 'pennsylvania': 'Pennsylvania', 'rhode island': 'Rhode Island', 'south carolina': 'South Carolina',
  'south dakota': 'South Dakota', 'tennessee': 'Tennessee', 'texas': 'Texas', 'utah': 'Utah',
  'vermont': 'Vermont', 'virginia': 'Virginia', 'washington': 'Washington', 'west virginia': 'West Virginia',
  'wisconsin': 'Wisconsin', 'wyoming': 'Wyoming',
};

// Stopwords to filter from keyword extraction
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'shall', 'can', 'need', 'dare', 'ought', 'used', 'i', 'me', 'my', 'myself', 'we',
  'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he',
  'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
  'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom',
  'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'about',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
  'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also',
  'now', 'find', 'get', 'give', 'looking', 'want', 'need', 'personas', 'persona',
  'people', 'participants', 'respondents', 'users', 'individuals', 'aged', 'ages',
  'years', 'year', 'old', 'between', 'range', 'around', 'approximately', 'about',
  'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'one', 'two',
]);

// ============================================================
// INTERFACES
// ============================================================
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

interface SearchResult {
  personas: any[];
  relaxation_applied: string | null;
  attempts: string[];
}

// ============================================================
// DETERMINISTIC QUERY PARSER (NO LLM!)
// ============================================================

function parseQueryDeterministic(query: string): ParsedCriteria {
  const q = query.toLowerCase();
  const originalQuery = query;
  
  console.log(`📝 [PARSER] Input: "${originalQuery}"`);
  
  // Initialize empty criteria
  const criteria: ParsedCriteria = {
    age_min: null,
    age_max: null,
    education_level: null,
    bmi_min: null,
    bmi_max: null,
    diet_keywords: [],
    location_country: null,
    location_region: null,
    occupation_keywords: [],
    income_bracket: null,
    interests_keywords: [],
    lifestyle_keywords: [],
    search_keywords: [],
  };

  // ---- EXTRACT AGE RANGE ----
  // Patterns: "age 30-50", "ages 30 to 50", "30-50 years old", "in their 30s", "aged 25-35"
  const agePatterns = [
    /(?:age[sd]?\s*)?(\d{2})\s*[-–to]+\s*(\d{2})(?:\s*years?\s*old)?/i,  // "30-50" or "30 to 50"
    /(?:age[sd]?\s+)(\d{2})(?:\s*years?\s*old)?/i,                        // "age 30" (single age)
    /in\s+their\s+(\d)0s/i,                                                // "in their 30s"
    /(\d{2})\+?\s*years?\s*old/i,                                          // "30 years old" or "30+ years old"
  ];
  
  for (const pattern of agePatterns) {
    const match = q.match(pattern);
    if (match) {
      if (match[2]) {
        // Range found
        criteria.age_min = parseInt(match[1]);
        criteria.age_max = parseInt(match[2]);
      } else if (pattern.source.includes('their')) {
        // "in their 30s" -> 30-39
        const decade = parseInt(match[1]) * 10;
        criteria.age_min = decade;
        criteria.age_max = decade + 9;
      } else {
        // Single age - use as center point with ±5 range
        const age = parseInt(match[1]);
        criteria.age_min = Math.max(18, age - 5);
        criteria.age_max = age + 5;
      }
      console.log(`   📅 Age: ${criteria.age_min}-${criteria.age_max}`);
      break;
    }
  }

  // ---- EXTRACT COUNTRY ----
  // Check for country patterns
  for (const [alias, country] of Object.entries(COUNTRY_ALIASES)) {
    // Use word boundaries for short codes, flexible for longer names
    const regex = alias.length <= 3 
      ? new RegExp(`\\b${alias}\\b`, 'i')
      : new RegExp(alias, 'i');
    
    if (regex.test(q)) {
      criteria.location_country = country;
      console.log(`   🌍 Country: ${country} (matched: "${alias}")`);
      break;
    }
  }

  // ---- EXTRACT US STATE (implies US country) ----
  if (!criteria.location_country || criteria.location_country === 'United States') {
    for (const [stateKey, stateName] of Object.entries(US_STATES)) {
      const regex = stateKey.length <= 2
        ? new RegExp(`\\b${stateKey}\\b`, 'i')
        : new RegExp(`\\b${stateKey}\\b`, 'i');
      
      if (regex.test(q)) {
        criteria.location_region = stateName;
        criteria.location_country = 'United States';
        console.log(`   🏛️ State: ${stateName} (matched: "${stateKey}")`);
        break;
      }
    }
  }

  // ---- EXTRACT BMI/WEIGHT KEYWORDS ----
  if (/\b(overweight|heavy|obese|fat)\b/i.test(q)) {
    criteria.bmi_min = 25;
    console.log(`   ⚖️ BMI: overweight (≥25)`);
  }
  if (/\bobese\b/i.test(q)) {
    criteria.bmi_min = 30;
    console.log(`   ⚖️ BMI: obese (≥30)`);
  }
  if (/\b(underweight|thin|skinny)\b/i.test(q)) {
    criteria.bmi_max = 18.5;
    console.log(`   ⚖️ BMI: underweight (≤18.5)`);
  }

  // ---- EXTRACT EDUCATION ----
  const eduPatterns: [RegExp, string][] = [
    [/\b(phd|doctorate|doctoral)\b/i, 'phd'],
    [/\b(master'?s?|mba|graduate)\b/i, 'master'],
    [/\b(bachelor'?s?|college|university)\b/i, 'bachelor'],
    [/\b(high\s*school|hs|secondary)\b/i, 'high school'],
    [/\b(some\s*college|associate)\b/i, 'some college'],
  ];
  
  for (const [pattern, edu] of eduPatterns) {
    if (pattern.test(q)) {
      criteria.education_level = edu;
      console.log(`   🎓 Education: ${edu}`);
      break;
    }
  }

  // ---- EXTRACT INCOME ----
  const incomePatterns: [RegExp, string][] = [
    [/\b(low[- ]?income|poor|struggling)\b/i, 'under 25k'],
    [/\b(middle[- ]?class|middle[- ]?income)\b/i, '50k-75k'],
    [/\b(upper[- ]?middle)\b/i, '100k-150k'],
    [/\b(high[- ]?income|wealthy|affluent|rich)\b/i, '150k+'],
    [/\b(\d{2,3})k\s*[-–to]+\s*(\d{2,3})k\b/i, '$1k-$2k'],
    [/\bunder\s*(\d{2,3})k\b/i, 'under $1k'],
    [/\bover\s*(\d{2,3})k\b/i, '$1k+'],
  ];
  
  for (const [pattern, income] of incomePatterns) {
    const match = q.match(pattern);
    if (match) {
      let bracket = income;
      if (match[1] && income.includes('$1')) {
        bracket = income.replace('$1', match[1]).replace('$2', match[2] || '');
      }
      criteria.income_bracket = bracket;
      console.log(`   💰 Income: ${bracket}`);
      break;
    }
  }

  // ---- EXTRACT ALL KEYWORDS ----
  // Split on whitespace and punctuation, filter stopwords
  const words = q
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOPWORDS.has(w.toLowerCase()))
    .map(w => w.toLowerCase());
  
  // Remove words that are just numbers (ages, counts)
  const keywords = words.filter(w => !/^\d+$/.test(w));
  
  // Also extract compound terms (2-word phrases that aren't stopwords)
  const compounds: string[] = [];
  const wordsArray = q.replace(/[^\w\s-]/g, ' ').split(/\s+/).map(w => w.toLowerCase());
  for (let i = 0; i < wordsArray.length - 1; i++) {
    const w1 = wordsArray[i];
    const w2 = wordsArray[i + 1];
    if (w1.length >= 3 && w2.length >= 3 && !STOPWORDS.has(w1) && !STOPWORDS.has(w2)) {
      compounds.push(`${w1} ${w2}`);
    }
  }

  // Combine individual keywords and compounds
  const allKeywords = [...new Set([...keywords, ...compounds])];
  
  // Assign keywords to appropriate categories
  const occupationIndicators = ['owner', 'manager', 'worker', 'employee', 'professional', 'executive', 'ceo', 'founder', 'entrepreneur', 'developer', 'engineer', 'designer', 'analyst', 'consultant', 'director', 'specialist', 'technician', 'nurse', 'doctor', 'teacher', 'driver', 'chef', 'artist'];
  const lifestyleIndicators = ['active', 'sedentary', 'remote', 'urban', 'rural', 'suburban', 'fitness', 'health', 'wellness'];
  const dietIndicators = ['vegan', 'vegetarian', 'keto', 'paleo', 'organic', 'fast food', 'junk', 'healthy'];
  
  for (const kw of allKeywords) {
    // Check if it's an occupation keyword
    if (occupationIndicators.some(ind => kw.includes(ind)) || 
        kw.includes('business') || kw.includes('small business') || kw.includes('owner')) {
      criteria.occupation_keywords.push(kw);
    }
    // Check if it's a lifestyle keyword
    else if (lifestyleIndicators.some(ind => kw.includes(ind))) {
      criteria.lifestyle_keywords.push(kw);
    }
    // Check if it's a diet keyword
    else if (dietIndicators.some(ind => kw.includes(ind))) {
      criteria.diet_keywords.push(kw);
    }
    // Everything else goes to search_keywords for collection matching
    else if (kw.length >= 3) {
      criteria.search_keywords.push(kw);
    }
  }

  // Dedupe occupation_keywords and split compound terms for better matching
  const expandedOccupation = new Set<string>();
  for (const kw of criteria.occupation_keywords) {
    expandedOccupation.add(kw);
    // Also add individual words from compound terms
    kw.split(/\s+/).forEach(w => {
      if (w.length >= 3 && !STOPWORDS.has(w)) {
        expandedOccupation.add(w);
      }
    });
  }
  criteria.occupation_keywords = [...expandedOccupation];

  // Move occupation keywords to search_keywords too for collection matching
  criteria.search_keywords = [...new Set([...criteria.search_keywords, ...criteria.occupation_keywords])];

  console.log(`   🔑 Occupation keywords: [${criteria.occupation_keywords.join(', ')}]`);
  console.log(`   🔍 Search keywords: [${criteria.search_keywords.join(', ')}]`);

  return criteria;
}

// ============================================================
// COLLECTION MATCHING (keyword-based)
// ============================================================
async function findMatchingCollections(
  supabase: any,
  criteria: ParsedCriteria
): Promise<{ ids: string[]; matchedCollections: Array<{ id: string; name: string; matchedKeywords: string[] }> }> {
  const allKeywords = new Set<string>();
  
  criteria.search_keywords.forEach(k => allKeywords.add(k.toLowerCase()));
  criteria.occupation_keywords.forEach(k => allKeywords.add(k.toLowerCase()));
  criteria.lifestyle_keywords.forEach(k => allKeywords.add(k.toLowerCase()));
  criteria.diet_keywords.forEach(k => allKeywords.add(k.toLowerCase()));
  
  // Add BMI keywords
  if (criteria.bmi_min !== null && criteria.bmi_min >= 25) {
    allKeywords.add('overweight');
    if (criteria.bmi_min >= 30) allKeywords.add('obese');
  }

  const keywordArray = Array.from(allKeywords).filter(k => k.length >= 3);
  
  if (keywordArray.length === 0) {
    console.log(`   📁 No keywords for collection matching`);
    return { ids: [], matchedCollections: [] };
  }

  console.log(`   📁 Searching collections with keywords: [${keywordArray.join(', ')}]`);

  const { data: collections, error } = await supabase
    .from('collections')
    .select('id, name, description')
    .eq('is_public', true);

  if (error) {
    console.error(`   ❌ Collection fetch error:`, error);
    return { ids: [], matchedCollections: [] };
  }

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
      matchedCollections.push({ id: collection.id, name: collection.name, matchedKeywords });
    }
  }

  matchedCollections.sort((a, b) => b.matchedKeywords.length - a.matchedKeywords.length);
  
  console.log(`   📁 Matched ${matchedCollections.length} collections`);
  matchedCollections.slice(0, 5).forEach(c => {
    console.log(`      - "${c.name}": [${c.matchedKeywords.join(', ')}]`);
  });
  
  return { ids: matchedCollections.map(c => c.id), matchedCollections };
}

// ============================================================
// PERSONA SEARCH
// ============================================================
async function searchPersonas(
  supabase: any,
  criteria: ParsedCriteria,
  collectionIds: string[],
  limit: number
): Promise<any[]> {
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
    console.error(`   ❌ RPC error:`, error);
    throw error;
  }

  return data || [];
}

// ============================================================
// SEARCH WITH LIMITED RELAXATION
// Only drop region, then give up - NO aggressive relaxation
// ============================================================
async function searchWithRetry(
  supabase: any,
  criteria: ParsedCriteria,
  collectionIds: string[],
  requestedCount: number
): Promise<SearchResult> {
  const attempts: string[] = [];
  
  // Attempt 1: Full criteria
  attempts.push('full_criteria');
  console.log(`   🔍 Attempt 1: Full criteria`);
  let personas = await searchPersonas(supabase, criteria, collectionIds, requestedCount);
  console.log(`      → Found ${personas.length}/${requestedCount}`);
  
  if (personas.length >= requestedCount) {
    return { personas, relaxation_applied: null, attempts };
  }

  // Attempt 2: Drop region only (keep country, occupation, age)
  if (criteria.location_region) {
    attempts.push('dropped_region');
    console.log(`   🔍 Attempt 2: Dropping region filter`);
    const criteriaNoRegion = { ...criteria, location_region: null };
    personas = await searchPersonas(supabase, criteriaNoRegion, collectionIds, requestedCount);
    console.log(`      → Found ${personas.length}/${requestedCount}`);
    
    if (personas.length >= requestedCount) {
      return { personas, relaxation_applied: 'dropped_region', attempts };
    }
  }

  // NO FURTHER RELAXATION - return what we have
  // This prevents returning irrelevant personas for impossible queries
  console.log(`   ⚠️ Search complete: ${personas.length} personas (no further relaxation)`);
  
  return { 
    personas, 
    relaxation_applied: personas.length > 0 ? 'partial_match' : 'no_match', 
    attempts 
  };
}

// ============================================================
// MAIN HANDLER
// ============================================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = crypto.randomUUID().slice(0, 8);

  try {
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

    // ========== COMPREHENSIVE LOGGING ==========
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔎 [ACP-SEARCH] Request ${requestId}`);
    console.log(`   Query: "${research_query}"`);
    console.log(`   Requested: ${persona_count} personas`);
    console.log(`   Time: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}`);

    // Step 1: Parse query DETERMINISTICALLY (no LLM!)
    const criteria = parseQueryDeterministic(research_query);

    // Step 2: Find matching collections
    const { ids: collectionIds, matchedCollections } = await findMatchingCollections(supabase, criteria);

    // Step 3: Search with limited relaxation
    const { personas, relaxation_applied, attempts } = await searchWithRetry(
      supabase, 
      criteria, 
      collectionIds, 
      persona_count
    );

    const duration = Date.now() - startTime;

    // ========== RESULT LOGGING ==========
    console.log(`\n📊 [ACP-SEARCH] Result ${requestId}`);
    console.log(`   Found: ${personas.length}/${persona_count} personas`);
    console.log(`   Relaxation: ${relaxation_applied || 'none'}`);
    console.log(`   Attempts: ${attempts.join(' → ')}`);
    console.log(`   Duration: ${duration}ms`);
    if (personas.length > 0) {
      console.log(`   Sample personas:`);
      personas.slice(0, 3).forEach((p: any) => {
        console.log(`      - ${p.name} (${p.persona_id})`);
      });
    }
    console.log(`${'='.repeat(60)}\n`);

    // Build response
    let result_note: string | null = null;
    if (personas.length < persona_count) {
      result_note = `Found ${personas.length}/${persona_count} personas. Attempts: ${attempts.join(' → ')}`;
    }
    if (relaxation_applied && relaxation_applied !== 'no_match') {
      result_note = (result_note || '') + ` [${relaxation_applied}]`;
    }

    const response = {
      success: true,
      request_id: requestId,
      query: research_query,
      parsed_criteria: criteria,
      matched_collections: matchedCollections.length,
      matched_collection_details: matchedCollections.slice(0, 10),
      total_found: personas.length,
      requested_count: persona_count,
      relaxation_applied,
      search_attempts: attempts,
      result_note,
      duration_ms: duration,
      personas: personas.map((p: any) => ({
        persona_id: p.persona_id,
        name: p.name,
        relevance_score: p.relevance_score,
        profile_image_url: p.profile_image_url,
        demographics: {
          age: p.full_profile?.identity?.age,
          location: p.full_profile?.identity?.location,
          occupation: p.full_profile?.identity?.occupation,
          education: p.full_profile?.identity?.education_level,
          income: p.full_profile?.identity?.income_bracket,
        },
        summary: p.conversation_summary,
      })),
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ [ACP-SEARCH] Error ${requestId}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Duration: ${duration}ms`);
    console.error(`   Stack: ${error.stack}`);
    console.error(`${'='.repeat(60)}\n`);

    return new Response(
      JSON.stringify({ 
        error: error.message,
        request_id: requestId,
        duration_ms: duration,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
