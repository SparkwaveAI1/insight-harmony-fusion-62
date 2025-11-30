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
  gender: string[] | null;
  marital_status: string[] | null;
  has_children: boolean | null;
  location_country: string | null;
  location_region: string | null;
  location_city: string | null;
  location_cities: string[] | null;  // NEW: For LLM-expanded regional terms
  location_counties: string[] | null; // NEW: For county-level filtering
  occupation_keywords: string[];
  education_level: string | null;
  income_bracket: string | null;
  interests_keywords: string[];
  health_keywords: string[];
  lifestyle_keywords: string[];
  search_keywords: string[];
  suggested_collections: string[];  // NEW: Collections suggested by LLM
  // Strictness settings
  strictness: {
    hard_match_min: number;
    soft_match_min: number;
    allow_near_matches: boolean;
    max_near_match_fraction: number;
  };
}

interface LLMParseResult {
  success: boolean;
  recommendation: 'PROCEED' | 'PROCEED_WITH_WARNING' | 'CANNOT_INTERPRET';
  confidence: number;
  parsed: {
    count: number | null;
    age_min: number | null;
    age_max: number | null;
    gender: string[] | null;
    marital_status: string[] | null;
    has_children: boolean | null;
    location_country: string | null;
    location_state: string | null;
    location_cities: string[] | null;
    location_counties: string[] | null;
    occupation_keywords: string[];
    health_keywords: string[];
    interest_keywords: string[];
    suggested_collections: string[];
  };
  assumptions_made: string[];
  warnings: string[];
  error?: string;
}

interface SearchRequest {
  research_query: string;
  persona_count?: number;
  strictness?: {
    hard_match_min?: number;
    soft_match_min?: number;
    allow_near_matches?: boolean;
  };
}

interface StageResult {
  stage: string;
  count: number;
  relaxation?: string;
}

// ============================================================
// DETERMINISTIC QUERY PARSER (NO LLM!)
// ============================================================
function parseQueryDeterministic(query: string, customStrictness?: SearchRequest['strictness']): ParsedCriteria {
  const q = query.toLowerCase();
  
  console.log(`📝 [PARSER] Input: "${query}"`);
  
  // Initialize criteria with defaults
  const criteria: ParsedCriteria = {
    age_min: null,
    age_max: null,
    gender: null,
    marital_status: null,
    has_children: null,
    location_country: null,
    location_region: null,
    location_city: null,
    location_cities: null,
    location_counties: null,
    occupation_keywords: [],
    education_level: null,
    income_bracket: null,
    interests_keywords: [],
    health_keywords: [],
    lifestyle_keywords: [],
    search_keywords: [],
    suggested_collections: [],
    strictness: {
      hard_match_min: customStrictness?.hard_match_min ?? 0.85,
      soft_match_min: customStrictness?.soft_match_min ?? 0.70,
      allow_near_matches: customStrictness?.allow_near_matches ?? true,
      max_near_match_fraction: 0.3,
    },
  };

  // ---- EXTRACT GENDER ----
  if (/\b(women|woman|female|females|ladies)\b/i.test(q)) {
    criteria.gender = ['female', 'woman', 'Female', 'Woman'];
    console.log(`   👤 Gender: female`);
  } else if (/\b(men|man|male|males|guys)\b/i.test(q)) {
    criteria.gender = ['male', 'man', 'Male', 'Man'];
    console.log(`   👤 Gender: male`);
  }

  // ---- EXTRACT MARITAL STATUS ----
  if (/\b(married|spouse|husband|wife)\b/i.test(q)) {
    criteria.marital_status = ['married', 'Married'];
    console.log(`   💑 Marital: married`);
  } else if (/\b(single|unmarried|bachelor)\b/i.test(q)) {
    criteria.marital_status = ['single', 'Single', 'never married'];
    console.log(`   💑 Marital: single`);
  } else if (/\b(divorced|separated)\b/i.test(q)) {
    criteria.marital_status = ['divorced', 'Divorced', 'separated'];
    console.log(`   💑 Marital: divorced`);
  }

  // ---- EXTRACT HAS CHILDREN ----
  if (/\b(parent|parents|mother|father|mom|dad|kids|children|child)\b/i.test(q)) {
    if (/\b(no\s+kids|no\s+children|childless|child-?free)\b/i.test(q)) {
      criteria.has_children = false;
      console.log(`   👶 Has children: false`);
    } else {
      criteria.has_children = true;
      console.log(`   👶 Has children: true`);
    }
  }

  // ---- EXTRACT AGE RANGE ----
  const agePatterns = [
    /(?:age[sd]?\s*)?(\d{2})\s*[-–to]+\s*(\d{2})(?:\s*years?\s*old)?/i,
    /(?:age[sd]?\s+)(\d{2})(?:\s*years?\s*old)?/i,
    /in\s+their\s+(\d)0s/i,
    /(\d{2})\+?\s*years?\s*old/i,
  ];
  
  for (const pattern of agePatterns) {
    const match = q.match(pattern);
    if (match) {
      if (match[2]) {
        criteria.age_min = parseInt(match[1]);
        criteria.age_max = parseInt(match[2]);
      } else if (pattern.source.includes('their')) {
        const decade = parseInt(match[1]) * 10;
        criteria.age_min = decade;
        criteria.age_max = decade + 9;
      } else {
        const age = parseInt(match[1]);
        criteria.age_min = Math.max(18, age - 5);
        criteria.age_max = age + 5;
      }
      console.log(`   📅 Age: ${criteria.age_min}-${criteria.age_max}`);
      break;
    }
  }

  // ---- EXTRACT COUNTRY ----
  for (const [alias, country] of Object.entries(COUNTRY_ALIASES)) {
    const regex = alias.length <= 3 
      ? new RegExp(`\\b${alias}\\b`, 'i')
      : new RegExp(alias, 'i');
    
    if (regex.test(q)) {
      criteria.location_country = country;
      console.log(`   🌍 Country: ${country}`);
      break;
    }
  }

  // ---- EXTRACT US STATE ----
  if (!criteria.location_country || criteria.location_country === 'United States') {
    for (const [stateKey, stateName] of Object.entries(US_STATES)) {
      const regex = stateKey.length <= 2
        ? new RegExp(`\\b${stateKey}\\b`, 'i')
        : new RegExp(`\\b${stateKey}\\b`, 'i');
      
      if (regex.test(q)) {
        criteria.location_region = stateName;
        criteria.location_country = 'United States';
        console.log(`   🏛️ State: ${stateName}`);
        break;
      }
    }
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
  ];
  
  for (const [pattern, income] of incomePatterns) {
    if (pattern.test(q)) {
      criteria.income_bracket = income;
      console.log(`   💰 Income: ${income}`);
      break;
    }
  }

  // ---- EXTRACT HEALTH KEYWORDS ----
  const healthPatterns = [
    'diabetes', 'diabetic', 'type 2', 'type2', 'hypertension', 'high blood pressure',
    'obese', 'overweight', 'heart disease', 'cardiac', 'cancer', 'asthma',
    'depression', 'anxiety', 'mental health', 'chronic', 'autoimmune',
  ];
  for (const hp of healthPatterns) {
    if (q.includes(hp)) {
      criteria.health_keywords.push(hp);
    }
  }
  if (criteria.health_keywords.length > 0) {
    console.log(`   🏥 Health: [${criteria.health_keywords.join(', ')}]`);
  }

  // ---- EXTRACT ALL KEYWORDS ----
  const words = q
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOPWORDS.has(w.toLowerCase()))
    .map(w => w.toLowerCase());
  
  const keywords = words.filter(w => !/^\d+$/.test(w));

  // Occupation keywords
  const occupationIndicators = ['owner', 'manager', 'worker', 'employee', 'professional', 'executive', 'ceo', 'founder', 'entrepreneur', 'developer', 'engineer', 'designer', 'analyst', 'consultant', 'director', 'specialist', 'technician', 'nurse', 'doctor', 'teacher', 'driver', 'chef', 'artist', 'restaurant', 'retail', 'healthcare', 'tech', 'finance'];
  
  for (const kw of keywords) {
    if (occupationIndicators.some(ind => kw.includes(ind))) {
      criteria.occupation_keywords.push(kw);
    }
  }
  
  // Dedupe and expand occupation keywords
  const expandedOccupation = new Set<string>();
  for (const kw of criteria.occupation_keywords) {
    expandedOccupation.add(kw);
    kw.split(/\s+/).forEach(w => {
      if (w.length >= 3 && !STOPWORDS.has(w)) {
        expandedOccupation.add(w);
      }
    });
  }
  criteria.occupation_keywords = [...expandedOccupation];

  // Store all keywords for search
  criteria.search_keywords = [...new Set([...keywords, ...criteria.occupation_keywords])];

  console.log(`   🔑 Occupation: [${criteria.occupation_keywords.join(', ')}]`);
  console.log(`   🔍 Keywords: [${criteria.search_keywords.slice(0, 10).join(', ')}${criteria.search_keywords.length > 10 ? '...' : ''}]`);

  return criteria;
}

// ============================================================
// COLLECTION MATCHING
// ============================================================
async function findMatchingCollections(
  supabase: any,
  criteria: ParsedCriteria
): Promise<{ ids: string[]; matchedCollections: Array<{ id: string; name: string }> }> {
  const allKeywords = new Set<string>();
  
  criteria.search_keywords.forEach(k => allKeywords.add(k.toLowerCase()));
  criteria.occupation_keywords.forEach(k => allKeywords.add(k.toLowerCase()));
  criteria.health_keywords.forEach(k => allKeywords.add(k.toLowerCase()));
  
  const keywordArray = Array.from(allKeywords).filter(k => k.length >= 3);
  
  if (keywordArray.length === 0) {
    return { ids: [], matchedCollections: [] };
  }

  const { data: collections, error } = await supabase
    .from('collections')
    .select('id, name, description')
    .eq('is_public', true);

  if (error || !collections) {
    console.error(`Collection fetch error:`, error);
    return { ids: [], matchedCollections: [] };
  }

  const matchedCollections: Array<{ id: string; name: string }> = [];
  
  for (const collection of collections) {
    const nameLower = (collection.name || '').toLowerCase();
    const descLower = (collection.description || '').toLowerCase();
    
    for (const keyword of keywordArray) {
      if (nameLower.includes(keyword) || descLower.includes(keyword)) {
        matchedCollections.push({ id: collection.id, name: collection.name });
        break;
      }
    }
  }

  console.log(`   📁 Matched ${matchedCollections.length} collections`);
  return { ids: matchedCollections.map(c => c.id), matchedCollections };
}

// ============================================================
// STAGE 1: HARD FILTER (SQL via RPC)
// ============================================================
async function stage1HardFilter(
  supabase: any,
  criteria: ParsedCriteria,
  collectionIds: string[],
  limit: number = 500
): Promise<{ candidates: any[]; relaxation: string | null }> {
  console.log(`\n🔍 [STAGE 1] Hard filter with indexed columns`);
  
  // First attempt: full criteria
  let { data, error } = await supabase.rpc('search_personas_stage1', {
    p_age_min: criteria.age_min,
    p_age_max: criteria.age_max,
    p_gender: criteria.gender,
    p_marital_status: criteria.marital_status,
    p_has_children: criteria.has_children,
    p_country: criteria.location_country,
    p_state_region: criteria.location_region,
    p_city: criteria.location_city,
    p_occupation_keywords: criteria.occupation_keywords.length > 0 ? criteria.occupation_keywords : null,
    p_collection_ids: collectionIds.length > 0 ? collectionIds : null,
    p_limit: limit,
  });

  if (error) {
    console.error(`   ❌ Stage 1 RPC error:`, error);
    throw error;
  }

  console.log(`   → Found ${data?.length || 0} candidates (full criteria)`);

  if (data && data.length > 0) {
    return { candidates: data, relaxation: null };
  }

  // Relaxation 1: Drop state/region, keep country
  if (criteria.location_region) {
    console.log(`   🔄 Relaxing: dropping state/region filter`);
    const { data: relaxed1, error: err1 } = await supabase.rpc('search_personas_stage1', {
      p_age_min: criteria.age_min,
      p_age_max: criteria.age_max,
      p_gender: criteria.gender,
      p_marital_status: criteria.marital_status,
      p_has_children: criteria.has_children,
      p_country: criteria.location_country,
      p_state_region: null,
      p_city: null,
      p_occupation_keywords: criteria.occupation_keywords.length > 0 ? criteria.occupation_keywords : null,
      p_collection_ids: collectionIds.length > 0 ? collectionIds : null,
      p_limit: limit,
    });

    if (!err1 && relaxed1 && relaxed1.length > 0) {
      console.log(`   → Found ${relaxed1.length} candidates (dropped region)`);
      return { candidates: relaxed1, relaxation: 'dropped_region' };
    }
  }

  // Relaxation 2: Widen age by ±5
  if (criteria.age_min !== null || criteria.age_max !== null) {
    console.log(`   🔄 Relaxing: widening age range ±5`);
    const { data: relaxed2, error: err2 } = await supabase.rpc('search_personas_stage1', {
      p_age_min: criteria.age_min ? criteria.age_min - 5 : null,
      p_age_max: criteria.age_max ? criteria.age_max + 5 : null,
      p_gender: criteria.gender,
      p_marital_status: criteria.marital_status,
      p_has_children: criteria.has_children,
      p_country: criteria.location_country,
      p_state_region: null,
      p_city: null,
      p_occupation_keywords: criteria.occupation_keywords.length > 0 ? criteria.occupation_keywords : null,
      p_collection_ids: collectionIds.length > 0 ? collectionIds : null,
      p_limit: limit,
    });

    if (!err2 && relaxed2 && relaxed2.length > 0) {
      console.log(`   → Found ${relaxed2.length} candidates (widened age)`);
      return { candidates: relaxed2, relaxation: 'widened_age' };
    }
  }

  // No candidates found even after relaxation
  console.log(`   ⚠️ No candidates found after relaxation`);
  return { candidates: [], relaxation: 'no_match' };
}

// ============================================================
// STAGE 3: LLM EVALUATION (via evaluate-persona-batch)
// ============================================================
async function stage3LLMEvaluation(
  supabaseUrl: string,
  supabaseKey: string,
  originalQuery: string,
  criteria: ParsedCriteria,
  candidates: any[]
): Promise<{ evaluations: any[]; summary: any }> {
  console.log(`\n🤖 [STAGE 3] LLM evaluation of ${candidates.length} candidates`);

  if (candidates.length === 0) {
    return { evaluations: [], summary: { exact_matches: 0, near_matches: 0, best_score: 0 } };
  }

  // Call the evaluate-persona-batch edge function
  const evalUrl = `${supabaseUrl}/functions/v1/evaluate-persona-batch`;
  
  const response = await fetch(evalUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      spec: {
        demographics: {
          age: criteria.age_min || criteria.age_max ? { min: criteria.age_min, max: criteria.age_max } : undefined,
          gender: criteria.gender,
          marital_status: criteria.marital_status,
          has_children: criteria.has_children,
          location: {
            country: criteria.location_country,
            state_region: criteria.location_region,
            city: criteria.location_city,
          },
        },
        occupation_keywords: criteria.occupation_keywords,
        interests: criteria.interests_keywords.map(k => ({ tag: k, weight: 0.5 })),
        health: criteria.health_keywords.map(k => ({ tag: k, hard: true })),
        original_query: originalQuery,
      },
      candidates: candidates,
      strictness: {
        hard_match_min: criteria.strictness.hard_match_min,
        soft_match_min: criteria.strictness.soft_match_min,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`   ❌ Evaluation failed:`, errorText);
    // Fallback: return candidates with neutral scores
    return {
      evaluations: candidates.map(c => ({
        persona_id: c.persona_id,
        overall_match: 0.5,
        fails_hard_requirements: false,
        reason: 'LLM evaluation unavailable',
      })),
      summary: { exact_matches: 0, near_matches: candidates.length, best_score: 0.5 },
    };
  }

  const result = await response.json();
  console.log(`   → Evaluation complete: ${result.summary?.exact_matches || 0} exact, ${result.summary?.near_matches || 0} near`);
  
  return {
    evaluations: result.evaluations || [],
    summary: result.summary || { exact_matches: 0, near_matches: 0, best_score: 0 },
  };
}

// ============================================================
// STRICT DECISION GATE
// ============================================================
function applyDecisionGate(
  requestedCount: number,
  evaluations: any[],
  strictness: ParsedCriteria['strictness'],
  candidates: any[]
): {
  success: boolean;
  status: 'SUCCESS' | 'NO_MATCH' | 'INSUFFICIENT_EXACT' | 'INSUFFICIENT_QUALIFIED';
  reason: string;
  selectedPersonas: any[];
  summary: {
    requested: number;
    exact_matches: number;
    near_matches: number;
    returned: number;
  };
} {
  console.log(`\n🚦 [DECISION GATE] Applying strict rules`);

  // Create lookup for evaluations
  const evalMap = new Map(evaluations.map(e => [e.persona_id, e]));

  // Categorize candidates
  const exact: any[] = [];
  const near: any[] = [];
  const failed: any[] = [];

  for (const candidate of candidates) {
    const evaluation = evalMap.get(candidate.persona_id);
    if (!evaluation) {
      // No evaluation = treat as near match
      near.push({ ...candidate, evaluation: { overall_match: 0.5, reason: 'Not evaluated' } });
      continue;
    }

    if (evaluation.fails_hard_requirements) {
      failed.push({ ...candidate, evaluation });
      continue;
    }

    if (evaluation.overall_match >= strictness.hard_match_min) {
      exact.push({ ...candidate, evaluation });
    } else if (evaluation.overall_match >= strictness.soft_match_min) {
      near.push({ ...candidate, evaluation });
    } else {
      failed.push({ ...candidate, evaluation });
    }
  }

  // Sort by score
  exact.sort((a, b) => b.evaluation.overall_match - a.evaluation.overall_match);
  near.sort((a, b) => b.evaluation.overall_match - a.evaluation.overall_match);

  const bestScore = exact[0]?.evaluation?.overall_match || near[0]?.evaluation?.overall_match || 0;

  console.log(`   Exact matches: ${exact.length}`);
  console.log(`   Near matches: ${near.length}`);
  console.log(`   Failed hard: ${failed.length}`);
  console.log(`   Best score: ${bestScore.toFixed(2)}`);

  // Rule 1: Strong deny - nothing comes close
  if (bestScore < 0.5) {
    return {
      success: false,
      status: 'NO_MATCH',
      reason: `No personas meet the requirements. Best match score: ${bestScore.toFixed(2)}. Try broadening your criteria.`,
      selectedPersonas: [],
      summary: { requested: requestedCount, exact_matches: exact.length, near_matches: near.length, returned: 0 },
    };
  }

  // Rule 2: Check if we have enough exact matches
  if (exact.length >= requestedCount) {
    const selected = exact.slice(0, requestedCount);
    return {
      success: true,
      status: 'SUCCESS',
      reason: `Found ${exact.length} exact matches`,
      selectedPersonas: selected,
      summary: { requested: requestedCount, exact_matches: exact.length, near_matches: near.length, returned: selected.length },
    };
  }

  // Rule 3: Try to fill with near matches if allowed
  if (strictness.allow_near_matches) {
    const combined = [...exact, ...near];
    const maxNear = Math.floor(requestedCount * strictness.max_near_match_fraction);
    
    if (combined.length >= requestedCount) {
      // Select up to requestedCount, respecting max_near_match_fraction
      const selected: any[] = [...exact];
      let nearAdded = 0;
      
      for (const n of near) {
        if (selected.length >= requestedCount) break;
        if (nearAdded < maxNear || exact.length < requestedCount - maxNear) {
          selected.push(n);
          nearAdded++;
        }
      }

      if (selected.length >= requestedCount) {
        return {
          success: true,
          status: 'SUCCESS',
          reason: `Returning ${exact.length} exact + ${nearAdded} near matches`,
          selectedPersonas: selected.slice(0, requestedCount),
          summary: { requested: requestedCount, exact_matches: exact.length, near_matches: nearAdded, returned: Math.min(selected.length, requestedCount) },
        };
      }
    }

    // Partial fulfillment - return what we have
    const selected = [...exact, ...near.slice(0, maxNear)];
    if (selected.length > 0) {
      return {
        success: true,
        status: 'SUCCESS',
        reason: `Partial match: ${exact.length} exact + ${Math.min(near.length, maxNear)} near (requested ${requestedCount})`,
        selectedPersonas: selected,
        summary: { requested: requestedCount, exact_matches: exact.length, near_matches: Math.min(near.length, maxNear), returned: selected.length },
      };
    }
  }

  // Rule 4: Insufficient matches
  return {
    success: false,
    status: exact.length > 0 ? 'INSUFFICIENT_EXACT' : 'INSUFFICIENT_QUALIFIED',
    reason: `Found only ${exact.length} exact + ${near.length} near matches but ${requestedCount} requested. ${!strictness.allow_near_matches ? 'Near matches not allowed.' : ''}`,
    selectedPersonas: [],
    summary: { requested: requestedCount, exact_matches: exact.length, near_matches: near.length, returned: 0 },
  };
}

// ============================================================
// LLM QUERY PARSER (calls acp-parse-query)
// ============================================================
async function parseQueryWithLLM(
  supabaseUrl: string,
  supabaseKey: string,
  query: string,
  availableCollections: Array<{ name: string; description?: string }>,
  customStrictness?: SearchRequest['strictness']
): Promise<{ criteria: ParsedCriteria; llmResult: LLMParseResult | null; usedFallback: boolean }> {
  console.log(`\n🧠 [LLM PARSER] Attempting LLM parse...`);
  
  try {
    const parseUrl = `${supabaseUrl}/functions/v1/acp-parse-query`;
    
    const response = await fetch(parseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        available_collections: availableCollections,
      }),
    });

    if (!response.ok) {
      console.warn(`   ⚠️ LLM parser returned ${response.status}, falling back to deterministic`);
      const criteria = parseQueryDeterministic(query, customStrictness);
      return { criteria, llmResult: null, usedFallback: true };
    }

    const llmResult: LLMParseResult = await response.json();
    
    if (!llmResult.success || llmResult.recommendation === 'CANNOT_INTERPRET') {
      console.warn(`   ⚠️ LLM could not interpret, falling back to deterministic`);
      const criteria = parseQueryDeterministic(query, customStrictness);
      return { criteria, llmResult, usedFallback: true };
    }

    console.log(`   ✅ LLM parsed successfully (confidence: ${llmResult.confidence})`);
    console.log(`   Assumptions: ${llmResult.assumptions_made?.join(', ') || 'none'}`);

    // Convert LLM result to ParsedCriteria format
    const criteria: ParsedCriteria = {
      age_min: llmResult.parsed.age_min,
      age_max: llmResult.parsed.age_max,
      gender: llmResult.parsed.gender,
      marital_status: llmResult.parsed.marital_status,
      has_children: llmResult.parsed.has_children,
      location_country: llmResult.parsed.location_country,
      location_region: llmResult.parsed.location_state,
      location_city: null, // Deprecated, using location_cities instead
      location_cities: llmResult.parsed.location_cities,
      location_counties: llmResult.parsed.location_counties,
      occupation_keywords: llmResult.parsed.occupation_keywords || [],
      education_level: null,
      income_bracket: null,
      interests_keywords: llmResult.parsed.interest_keywords || [],
      health_keywords: llmResult.parsed.health_keywords || [],
      lifestyle_keywords: [],
      search_keywords: [
        ...(llmResult.parsed.occupation_keywords || []),
        ...(llmResult.parsed.interest_keywords || []),
        ...(llmResult.parsed.health_keywords || []),
      ],
      suggested_collections: llmResult.parsed.suggested_collections || [],
      strictness: {
        hard_match_min: customStrictness?.hard_match_min ?? 0.85,
        soft_match_min: customStrictness?.soft_match_min ?? 0.70,
        allow_near_matches: customStrictness?.allow_near_matches ?? true,
        max_near_match_fraction: 0.3,
      },
    };

    return { criteria, llmResult, usedFallback: false };

  } catch (error) {
    console.error(`   ❌ LLM parser error: ${error.message}, falling back to deterministic`);
    const criteria = parseQueryDeterministic(query, customStrictness);
    return { criteria, llmResult: null, usedFallback: true };
  }
}

// ============================================================
// ENHANCED STAGE 1: Supports city/county arrays
// ============================================================
async function stage1HardFilterEnhanced(
  supabase: any,
  criteria: ParsedCriteria,
  collectionIds: string[],
  limit: number = 500
): Promise<{ candidates: any[]; relaxation: string | null; searchedLocations?: string }> {
  console.log(`\n🔍 [STAGE 1] Hard filter with indexed columns`);
  
  // If we have city/county arrays from LLM, search each one
  const cities = criteria.location_cities || [];
  const counties = criteria.location_counties || [];
  
  // Build location search description for error messages
  let searchedLocations = '';
  if (cities.length > 0) {
    searchedLocations = `cities: ${cities.join(', ')}`;
  } else if (counties.length > 0) {
    searchedLocations = `counties: ${counties.join(', ')}`;
  } else if (criteria.location_city) {
    searchedLocations = `city: ${criteria.location_city}`;
  } else if (criteria.location_region) {
    searchedLocations = `state: ${criteria.location_region}`;
  } else if (criteria.location_country) {
    searchedLocations = `country: ${criteria.location_country}`;
  }
  
  // Strategy: If we have expanded cities/counties, try each one
  if (cities.length > 0) {
    console.log(`   Searching across ${cities.length} cities: ${cities.join(', ')}`);
    
    const allCandidates: any[] = [];
    const seenIds = new Set<string>();
    
    for (const city of cities) {
      const { data, error } = await supabase.rpc('search_personas_stage1', {
        p_age_min: criteria.age_min,
        p_age_max: criteria.age_max,
        p_gender: criteria.gender,
        p_marital_status: criteria.marital_status,
        p_has_children: criteria.has_children,
        p_country: criteria.location_country,
        p_state_region: criteria.location_region,
        p_city: city,
        p_occupation_keywords: criteria.occupation_keywords.length > 0 ? criteria.occupation_keywords : null,
        p_collection_ids: collectionIds.length > 0 ? collectionIds : null,
        p_limit: Math.ceil(limit / cities.length),
      });
      
      if (!error && data) {
        for (const candidate of data) {
          if (!seenIds.has(candidate.persona_id)) {
            seenIds.add(candidate.persona_id);
            allCandidates.push(candidate);
          }
        }
      }
    }
    
    console.log(`   → Found ${allCandidates.length} candidates across cities`);
    if (allCandidates.length > 0) {
      return { candidates: allCandidates.slice(0, limit), relaxation: null, searchedLocations };
    }
  }
  
  // Fallback to original stage1HardFilter logic
  return { ...(await stage1HardFilter(supabase, criteria, collectionIds, limit)), searchedLocations };
}

// ============================================================
// GENERATE ACTIONABLE FAILURE EXPLANATION
// ============================================================
function generateFailureExplanation(
  criteria: ParsedCriteria,
  llmResult: LLMParseResult | null,
  searchedLocations: string,
  candidateCount: number
): { status: string; reason: string; suggestion: string; alternatives?: string[] } {
  // If we had location criteria and found nothing, it's likely NO_COVERAGE
  if (searchedLocations && candidateCount === 0) {
    const alternatives = [];
    
    // Suggest broadening location
    if (criteria.location_cities && criteria.location_cities.length > 0) {
      alternatives.push(`Try searching the entire state of ${criteria.location_region || 'the region'}`);
    }
    if (criteria.location_region) {
      alternatives.push(`Try searching all of ${criteria.location_country || 'the country'}`);
    }
    if (criteria.occupation_keywords.length > 0) {
      alternatives.push(`Remove occupation filter to see all personas in this area`);
    }
    
    const assumptionNote = llmResult?.assumptions_made?.length 
      ? ` (Note: We interpreted your query as ${llmResult.assumptions_made[0]})`
      : '';
    
    return {
      status: 'NO_COVERAGE',
      reason: `No personas found in ${searchedLocations}.${assumptionNote}`,
      suggestion: `We don't have personas in this specific location yet. ${alternatives[0] || 'Try a different location.'}`,
      alternatives,
    };
  }
  
  // If we have very restrictive criteria
  const criteriaCount = [
    criteria.age_min !== null,
    criteria.gender !== null,
    criteria.marital_status !== null,
    criteria.has_children !== null,
    criteria.location_country !== null,
    criteria.occupation_keywords.length > 0,
  ].filter(Boolean).length;
  
  if (criteriaCount >= 4 && candidateCount === 0) {
    return {
      status: 'TOO_RESTRICTIVE',
      reason: `Your search criteria may be too specific (${criteriaCount} filters applied).`,
      suggestion: 'Try removing some filters. For example, remove the age range or location specificity.',
    };
  }
  
  return {
    status: 'NO_MATCH',
    reason: 'No personas match the specified criteria.',
    suggestion: 'Try broadening your search terms or using different keywords.',
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

    const { research_query, persona_count = 10, strictness: customStrictness }: SearchRequest = await req.json();

    if (!research_query) {
      return new Response(
        JSON.stringify({ error: 'research_query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔎 [ACP-SEARCH-V4] Request ${requestId}`);
    console.log(`   Query: "${research_query}"`);
    console.log(`   Requested: ${persona_count} personas`);
    console.log(`   Time: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}`);

    const stages: StageResult[] = [];

    // Step 1: Fetch available collections for LLM context
    const { data: publicCollections } = await supabase
      .from('collections')
      .select('id, name, description')
      .eq('is_public', true);
    
    const availableCollections = (publicCollections || []).map((c: any) => ({
      name: c.name,
      description: c.description,
    }));

    // Step 2: Parse query with LLM (falls back to deterministic)
    const { criteria, llmResult, usedFallback } = await parseQueryWithLLM(
      supabaseUrl,
      supabaseServiceKey,
      research_query,
      availableCollections,
      customStrictness
    );
    
    stages.push({ 
      stage: 'query_parsing', 
      count: usedFallback ? 0 : 1,
      relaxation: usedFallback ? 'deterministic_fallback' : undefined,
    });

    // Step 3: Find matching collections (combine LLM suggestions + keyword matching)
    const { ids: keywordCollectionIds, matchedCollections } = await findMatchingCollections(supabase, criteria);
    
    // Add LLM-suggested collections
    let allCollectionIds = [...keywordCollectionIds];
    if (criteria.suggested_collections.length > 0 && publicCollections) {
      for (const suggestedName of criteria.suggested_collections) {
        const match = publicCollections.find((c: any) => 
          c.name.toLowerCase().includes(suggestedName.toLowerCase()) ||
          suggestedName.toLowerCase().includes(c.name.toLowerCase())
        );
        if (match && !allCollectionIds.includes(match.id)) {
          allCollectionIds.push(match.id);
          matchedCollections.push({ id: match.id, name: match.name });
        }
      }
    }

    // Step 4: STAGE 1 - Enhanced hard filter with city/county support
    const { candidates, relaxation, searchedLocations } = await stage1HardFilterEnhanced(
      supabase, 
      criteria, 
      allCollectionIds
    );
    stages.push({ stage: 'hard_filter', count: candidates.length, relaxation: relaxation || undefined });

    // Step 5: Handle NO CANDIDATES - Generate actionable explanation
    if (candidates.length === 0) {
      const duration = Date.now() - startTime;
      const failure = generateFailureExplanation(criteria, llmResult, searchedLocations || '', 0);
      
      console.log(`\n❌ [ACP-SEARCH-V4] ${failure.status}: ${failure.reason}`);
      
      return new Response(
        JSON.stringify({
          success: false,
          status: failure.status,
          request_id: requestId,
          query: research_query,
          parsed_criteria: criteria,
          assumptions_made: llmResult?.assumptions_made || [],
          reason: failure.reason,
          suggestion: failure.suggestion,
          alternatives: failure.alternatives,
          note: llmResult?.assumptions_made?.length 
            ? `We made the following assumptions: ${llmResult.assumptions_made.join('; ')}`
            : undefined,
          stages,
          duration_ms: duration,
          personas: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 6: STAGE 3 - LLM Evaluation
    const { evaluations, summary: evalSummary } = await stage3LLMEvaluation(
      supabaseUrl,
      supabaseServiceKey,
      research_query,
      criteria,
      candidates.slice(0, 60)
    );
    stages.push({ stage: 'llm_evaluation', count: evaluations.length });

    // Step 7: DECISION GATE
    const decision = applyDecisionGate(persona_count, evaluations, criteria.strictness, candidates);

    const duration = Date.now() - startTime;

    console.log(`\n📊 [ACP-SEARCH-V4] Result ${requestId}`);
    console.log(`   Status: ${decision.status}`);
    console.log(`   Returned: ${decision.selectedPersonas.length}/${persona_count}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`${'='.repeat(60)}\n`);

    // Build response with note about assumptions
    const response: any = {
      success: decision.success,
      status: decision.status,
      request_id: requestId,
      query: research_query,
      parsed_criteria: criteria,
      matched_collections: matchedCollections.length,
      stages,
      decision_summary: decision.summary,
      reason: decision.reason,
      duration_ms: duration,
      personas: decision.selectedPersonas.map((p: any) => ({
        persona_id: p.persona_id,
        name: p.name,
        match_score: p.evaluation?.overall_match || 0.5,
        match_reason: p.evaluation?.reason || 'No evaluation',
        profile_image_url: p.profile_image_url,
        demographics: {
          age: p.age_computed || p.full_profile?.identity?.age,
          gender: p.gender_computed || p.full_profile?.identity?.gender,
          location: [p.city_computed, p.state_region_computed, p.country_computed].filter(Boolean).join(', ') || 
                    p.full_profile?.identity?.location,
          occupation: p.occupation_computed || p.full_profile?.identity?.occupation,
        },
        summary: p.conversation_summary,
      })),
    };

    // Add note about assumptions if any were made
    if (llmResult?.assumptions_made?.length) {
      response.note = `Search included the following assumptions: ${llmResult.assumptions_made.join('; ')}`;
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ [ACP-SEARCH-V4] Error ${requestId}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        request_id: requestId,
        duration_ms: duration,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
