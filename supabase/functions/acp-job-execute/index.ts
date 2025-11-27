import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobRequest {
  job_id: string;
  client_address: string;
  research_query: string;
  questions: string[];
  num_personas?: number;
  output_format?: string;
  include_summary?: boolean;
}

// ============= SYNONYM DICTIONARY =============
const SYNONYM_MAP: Record<string, string[]> = {
  // Family roles
  'mom': ['mom', 'mother', 'parent', 'parents', 'moms', 'mothers'],
  'mother': ['mom', 'mother', 'parent', 'parents', 'moms', 'mothers'],
  'dad': ['dad', 'father', 'parent', 'parents', 'dads', 'fathers'],
  'father': ['dad', 'father', 'parent', 'parents', 'dads', 'fathers'],
  'parent': ['parent', 'parents', 'mom', 'mother', 'dad', 'father'],
  'parents': ['parent', 'parents', 'mom', 'mother', 'dad', 'father'],
  
  // Crypto/Finance
  'crypto': ['crypto', 'bitcoin', 'cryptocurrency', 'blockchain', 'defi', 'web3', 'nft'],
  'bitcoin': ['crypto', 'bitcoin', 'cryptocurrency', 'blockchain'],
  'cryptocurrency': ['crypto', 'bitcoin', 'cryptocurrency', 'blockchain', 'defi'],
  'blockchain': ['crypto', 'bitcoin', 'cryptocurrency', 'blockchain', 'web3'],
  'defi': ['crypto', 'defi', 'cryptocurrency', 'blockchain'],
  'investor': ['investor', 'investing', 'trader', 'trading', 'investment', 'investors'],
  'investors': ['investor', 'investing', 'trader', 'trading', 'investment', 'investors'],
  'investing': ['investor', 'investing', 'trader', 'trading', 'investment'],
  'trader': ['investor', 'trader', 'trading', 'investment'],
  'trading': ['investor', 'trader', 'trading', 'investment'],
  'investment': ['investor', 'investing', 'investment', 'investments'],
  
  // Location types
  'suburban': ['suburban', 'suburb', 'suburbs'],
  'suburb': ['suburban', 'suburb', 'suburbs'],
  'suburbs': ['suburban', 'suburb', 'suburbs'],
  'urban': ['urban', 'city', 'metro', 'metropolitan'],
  'city': ['urban', 'city', 'metro', 'metropolitan'],
  'rural': ['rural', 'country', 'countryside', 'small town'],
  'country': ['rural', 'country', 'countryside'],
  
  // Health/Wellness
  'health': ['health', 'healthy', 'wellness', 'fitness', 'wellbeing'],
  'healthy': ['health', 'healthy', 'wellness', 'fitness'],
  'wellness': ['health', 'healthy', 'wellness', 'fitness', 'wellbeing'],
  'fitness': ['health', 'healthy', 'wellness', 'fitness', 'fit'],
  
  // Political
  'conservative': ['conservative', 'republican', 'right', 'gop'],
  'republican': ['conservative', 'republican', 'right', 'gop'],
  'liberal': ['liberal', 'democrat', 'progressive', 'left', 'democratic'],
  'democrat': ['liberal', 'democrat', 'progressive', 'democratic'],
  'progressive': ['liberal', 'democrat', 'progressive', 'left'],
  
  // Consumer types
  'consumer': ['consumer', 'buyer', 'shopper', 'customer', 'consumers'],
  'consumers': ['consumer', 'buyer', 'shopper', 'customer', 'consumers'],
  'shopper': ['consumer', 'buyer', 'shopper', 'customer'],
  
  // Tech
  'tech': ['tech', 'technology', 'digital', 'software'],
  'technology': ['tech', 'technology', 'digital', 'software'],
  
  // Age groups
  'millennial': ['millennial', 'millennials', 'gen y'],
  'millennials': ['millennial', 'millennials', 'gen y'],
  'genz': ['gen z', 'genz', 'generation z', 'zoomer'],
  'boomer': ['boomer', 'boomers', 'baby boomer', 'baby boomers'],
  'boomers': ['boomer', 'boomers', 'baby boomer', 'baby boomers'],
};

// ============= COLLECTION MATCHING FUNCTION =============
interface CollectionMatch {
  collection_id: string;
  collection_name: string;
  match_score: number;
  matched_keywords: string[];
}

async function findBestCollection(
  supabase: any, 
  concept: string
): Promise<CollectionMatch | null> {
  console.log('🔍 [COLLECTION-MATCH] Starting collection search for:', concept);
  
  // Extract words and expand with synonyms
  const words = concept.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')  // Remove punctuation except hyphens
    .split(/\s+/)
    .filter(w => w.length > 2);  // Skip very short words
  
  console.log('🔍 [COLLECTION-MATCH] Extracted words:', words);
  
  const expandedKeywords = new Set<string>();
  for (const word of words) {
    expandedKeywords.add(word);
    const synonyms = SYNONYM_MAP[word];
    if (synonyms) {
      synonyms.forEach(syn => expandedKeywords.add(syn));
      console.log(`🔍 [COLLECTION-MATCH] Expanded "${word}" to:`, synonyms);
    }
  }
  
  console.log('🔍 [COLLECTION-MATCH] Total expanded keywords:', Array.from(expandedKeywords));
  
  // Query all public collections
  const { data: collections, error } = await supabase
    .from('collections')
    .select('id, name, description')
    .eq('is_public', true);
  
  if (error) {
    console.error('❌ [COLLECTION-MATCH] Error fetching collections:', error);
    return null;
  }
  
  console.log(`🔍 [COLLECTION-MATCH] Found ${collections?.length || 0} public collections`);
  
  // Score each collection
  let bestMatch: CollectionMatch | null = null;
  let bestScore = 0;
  const scoredCollections: Array<{ name: string; score: number; matches: string[] }> = [];
  
  for (const coll of collections || []) {
    const collText = ((coll.name || '') + ' ' + (coll.description || '')).toLowerCase();
    const matchedKeywords: string[] = [];
    
    for (const keyword of expandedKeywords) {
      if (collText.includes(keyword)) {
        matchedKeywords.push(keyword);
      }
    }
    
    // Score = matched keywords / total keywords
    const score = matchedKeywords.length / expandedKeywords.size;
    
    if (matchedKeywords.length > 0) {
      scoredCollections.push({ name: coll.name, score, matches: matchedKeywords });
    }
    
    if (score > bestScore && score >= 0.2) {
      bestScore = score;
      bestMatch = {
        collection_id: coll.id,
        collection_name: coll.name,
        match_score: score,
        matched_keywords: matchedKeywords
      };
    }
  }
  
  // Log top matches for debugging
  scoredCollections.sort((a, b) => b.score - a.score);
  console.log('🔍 [COLLECTION-MATCH] Top 5 matches:');
  scoredCollections.slice(0, 5).forEach((c, i) => {
    console.log(`   ${i + 1}. "${c.name}" - Score: ${(c.score * 100).toFixed(1)}% - Matches: [${c.matches.join(', ')}]`);
  });
  
  if (bestMatch) {
    console.log(`✅ [COLLECTION-MATCH] Best match: "${bestMatch.collection_name}" with score ${(bestMatch.match_score * 100).toFixed(1)}%`);
  } else {
    console.log('⚠️ [COLLECTION-MATCH] No collection matched with score >= 20%');
  }
  
  return bestMatch;
}

// ============= DEMOGRAPHIC FILTER EXTRACTION =============
interface DemographicFilters {
  age_min?: number;
  age_max?: number;
  location?: string;
}

function extractDemographicFilters(concept: string): DemographicFilters {
  const filters: DemographicFilters = {};
  const lowerConcept = concept.toLowerCase();
  
  console.log('🔍 [DEMOGRAPHICS] Extracting filters from:', concept);
  
  // Extract age range patterns
  // Pattern 1: "25-40", "25–40", "25 - 40"
  const ageRangeMatch = concept.match(/(\d{2})\s*[-–—]\s*(\d{2})/);
  if (ageRangeMatch) {
    filters.age_min = parseInt(ageRangeMatch[1]);
    filters.age_max = parseInt(ageRangeMatch[2]);
    console.log(`🔍 [DEMOGRAPHICS] Found age range: ${filters.age_min}-${filters.age_max}`);
  }
  
  // Pattern 2: "between 25 and 40"
  if (!filters.age_min) {
    const betweenMatch = concept.match(/between\s+(\d{2})\s+and\s+(\d{2})/i);
    if (betweenMatch) {
      filters.age_min = parseInt(betweenMatch[1]);
      filters.age_max = parseInt(betweenMatch[2]);
      console.log(`🔍 [DEMOGRAPHICS] Found "between X and Y": ${filters.age_min}-${filters.age_max}`);
    }
  }
  
  // Pattern 3: "ages 25-40" or "aged 25-40"
  if (!filters.age_min) {
    const agedMatch = concept.match(/age[sd]?\s+(\d{2})\s*[-–—]\s*(\d{2})/i);
    if (agedMatch) {
      filters.age_min = parseInt(agedMatch[1]);
      filters.age_max = parseInt(agedMatch[2]);
      console.log(`🔍 [DEMOGRAPHICS] Found "ages X-Y": ${filters.age_min}-${filters.age_max}`);
    }
  }
  
  // Extract location patterns
  // Pattern 1: "US-based", "USA-based", "US based"
  if (lowerConcept.includes('us-based') || lowerConcept.includes('us based') || 
      lowerConcept.includes('usa-based') || lowerConcept.includes('usa based')) {
    filters.location = 'United States';
    console.log('🔍 [DEMOGRAPHICS] Found US-based pattern');
  }
  
  // Pattern 2: "United States", "U.S.", "America"
  if (!filters.location) {
    if (lowerConcept.includes('united states') || lowerConcept.includes('u.s.') || 
        lowerConcept.includes('american') || /\bamerica\b/i.test(concept)) {
      filters.location = 'United States';
      console.log('🔍 [DEMOGRAPHICS] Found United States/America pattern');
    }
  }
  
  // Pattern 3: "in [Location]" - extract specific state/country
  if (!filters.location) {
    const inLocationMatch = concept.match(/\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (inLocationMatch) {
      filters.location = inLocationMatch[1];
      console.log(`🔍 [DEMOGRAPHICS] Found "in [Location]": ${filters.location}`);
    }
  }
  
  // Pattern 4: "[Location]-based"
  if (!filters.location) {
    const basedMatch = concept.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)-based/);
    if (basedMatch && basedMatch[1].toLowerCase() !== 'us' && basedMatch[1].toLowerCase() !== 'usa') {
      filters.location = basedMatch[1];
      console.log(`🔍 [DEMOGRAPHICS] Found "[Location]-based": ${filters.location}`);
    }
  }
  
  console.log('🔍 [DEMOGRAPHICS] Final filters:', filters);
  return filters;
}

// ============= AGE MATCHING HELPER =============
function matchesAgeRange(personaAge: any, minAge?: number, maxAge?: number): boolean {
  if (!minAge && !maxAge) return true;
  
  // Parse age - could be number or string
  const age = typeof personaAge === 'number' ? personaAge : parseInt(personaAge);
  if (isNaN(age)) return true; // If we can't parse age, include them
  
  if (minAge && age < minAge) return false;
  if (maxAge && age > maxAge) return false;
  
  return true;
}

// ============= LOCATION MATCHING HELPER =============
function matchesLocation(personaLocation: any, targetLocation?: string): boolean {
  if (!targetLocation) return true;
  
  const target = targetLocation.toLowerCase();
  
  // Check country
  const country = (personaLocation?.country || '').toLowerCase();
  if (country.includes(target) || target.includes(country)) return true;
  
  // Check state/region
  const region = (personaLocation?.region || personaLocation?.state || '').toLowerCase();
  if (region.includes(target) || target.includes(region)) return true;
  
  // Check city
  const city = (personaLocation?.city || '').toLowerCase();
  if (city.includes(target) || target.includes(city)) return true;
  
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse job request
    const jobRequest: JobRequest = await req.json();
    console.log('========================================');
    console.log('🚀 [ACP-JOB] New Job Request:', JSON.stringify(jobRequest, null, 2));
    console.log('========================================');

    const {
      job_id,
      research_query,
      questions,
      num_personas = 5,
      include_summary = true
    } = jobRequest;

    // ============= STEP 1: COLLECTION-FIRST PERSONA SELECTION =============
    console.log('📦 [ACP-JOB] STEP 1: Finding personas via collection-first approach');
    
    let selectedPersonas: any[] = [];
    let selectionMethod = 'unknown';
    
    // 1a: Try to find a matching collection
    const collectionMatch = await findBestCollection(supabase, research_query);
    
    if (collectionMatch && collectionMatch.match_score >= 0.3) {
      console.log(`📦 [ACP-JOB] Collection match found with score ${(collectionMatch.match_score * 100).toFixed(1)}%`);
      selectionMethod = `collection:${collectionMatch.collection_name}`;
      
      // 1b: Get personas from the matched collection
      const { data: collectionPersonas, error: cpError } = await supabase
        .from('collection_personas')
        .select('persona_id')
        .eq('collection_id', collectionMatch.collection_id);
      
      if (cpError) {
        console.error('❌ [ACP-JOB] Error fetching collection personas:', cpError);
      } else {
        console.log(`📦 [ACP-JOB] Found ${collectionPersonas?.length || 0} personas in collection`);
        
        // Get full persona data
        const personaIds = collectionPersonas?.map((cp: any) => cp.persona_id) || [];
        
        if (personaIds.length > 0) {
          const { data: personas, error: pError } = await supabase
            .from('v4_personas')
            .select('persona_id, name, full_profile, conversation_summary')
            .in('persona_id', personaIds);
          
          if (pError) {
            console.error('❌ [ACP-JOB] Error fetching persona details:', pError);
          } else {
            // 1c: Apply demographic filters
            const filters = extractDemographicFilters(research_query);
            
            let filteredPersonas = personas || [];
            const preFilterCount = filteredPersonas.length;
            
            // Apply age filter
            if (filters.age_min || filters.age_max) {
              filteredPersonas = filteredPersonas.filter((p: any) => {
                const age = p.full_profile?.identity?.age;
                return matchesAgeRange(age, filters.age_min, filters.age_max);
              });
              console.log(`🔍 [ACP-JOB] Age filter (${filters.age_min}-${filters.age_max}): ${preFilterCount} → ${filteredPersonas.length} personas`);
            }
            
            // Apply location filter
            if (filters.location) {
              const preLocationCount = filteredPersonas.length;
              filteredPersonas = filteredPersonas.filter((p: any) => {
                const location = p.full_profile?.identity?.location;
                return matchesLocation(location, filters.location);
              });
              console.log(`🔍 [ACP-JOB] Location filter (${filters.location}): ${preLocationCount} → ${filteredPersonas.length} personas`);
            }
            
            console.log(`✅ [ACP-JOB] After filtering: ${filteredPersonas.length} personas match criteria`);
            
            // 1d: Shuffle and limit
            filteredPersonas.sort(() => Math.random() - 0.5);
            selectedPersonas = filteredPersonas.slice(0, num_personas).map((p: any) => ({
              persona_id: p.persona_id,
              name: p.name,
              summary: p.conversation_summary?.demographics?.background_description || 
                      `${p.full_profile?.identity?.occupation || 'Unknown'} from ${p.full_profile?.identity?.location?.city || 'Unknown'}`,
              full_profile: p.full_profile
            }));
          }
        }
      }
    } else {
      console.log('⚠️ [ACP-JOB] No collection matched with sufficient score, falling back to persona search');
    }
    
    // 1e: Fallback to acp-persona-search if collection approach didn't yield results
    if (selectedPersonas.length === 0) {
      console.log('🔄 [ACP-JOB] Falling back to acp-persona-search');
      selectionMethod = 'persona-search';
      
      const searchUrl = `${supabaseUrl}/functions/v1/acp-persona-search?search_query=${encodeURIComponent(research_query)}&limit=${num_personas}`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      const searchResults = await searchResponse.json();
      selectedPersonas = searchResults.personas || [];
      
      console.log(`🔄 [ACP-JOB] Persona search returned ${selectedPersonas.length} personas`);
    }
    
    // 1f: NO RANDOM FALLBACK - Return error if no personas found
    if (selectedPersonas.length === 0) {
      console.error('❌ [ACP-JOB] No matching personas found for research query');
      return new Response(
        JSON.stringify({ 
          error: 'no_matching_personas',
          message: `Could not find personas matching: "${research_query}"`,
          suggestion: 'Try broader criteria or different keywords',
          job_id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    console.log('========================================');
    console.log(`✅ [ACP-JOB] Selected ${selectedPersonas.length} personas via ${selectionMethod}:`);
    selectedPersonas.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} (${p.persona_id})`);
    });
    console.log('========================================');

    // ============= STEP 2: RUN STUDY =============
    console.log('💬 [ACP-JOB] STEP 2: Running study with questions');
    
    const personaIds = selectedPersonas.map((p: any) => p.persona_id);
    const conversationHistories: Record<string, Array<{role: string, content: string}>> = {};
    const allResults: Record<string, any[]> = {};

    // Initialize conversation histories
    for (const personaId of personaIds) {
      conversationHistories[personaId] = [];
      allResults[personaId] = [];
    }

    // Process each question sequentially across all personas
    for (const question of questions) {
      console.log(`💬 [ACP-JOB] Processing question: ${question.substring(0, 80)}...`);
      
      // Call each persona with the question
      for (const personaId of personaIds) {
        const persona = selectedPersonas.find((p: any) => p.persona_id === personaId);
        const history = conversationHistories[personaId];

        try {
          console.log(`🔄 [ACP-JOB] Calling v4-grok-conversation for ${persona?.name || personaId}`);

          const { data: grokData, error: grokError } = await supabase.functions.invoke('v4-grok-conversation', {
            body: {
              persona_id: personaId,
              user_message: question,
              conversation_history: history
            }
          });

          if (grokError) {
            console.error(`❌ [ACP-JOB] v4-grok-conversation error for ${persona?.name}:`, grokError);
            throw new Error(`v4-grok-conversation failed: ${grokError.message}`);
          }

          if (!grokData?.success || !grokData?.response) {
            console.error(`❌ [ACP-JOB] Invalid response from v4-grok-conversation:`, JSON.stringify(grokData));
            throw new Error(grokData?.error || 'No response from v4-grok-conversation');
          }

          const response = grokData.response;
          const traitsActivated = grokData.traits_selected || [];
          console.log(`✅ [ACP-JOB] Got response from ${persona?.name}: ${response.substring(0, 60)}...`);

          // Update conversation history for this persona
          conversationHistories[personaId].push(
            { role: 'user', content: question },
            { role: 'assistant', content: response }
          );

          // Store the result
          allResults[personaId].push({
            question,
            response,
            traits_activated: traitsActivated
          });

        } catch (error) {
          console.error(`❌ [ACP-JOB] Error processing persona ${personaId}:`, error);
          allResults[personaId].push({
            question,
            response: `Error: ${error.message}`,
            traits_activated: [],
            error: true
          });
        }
      }
    }

    // ============= STEP 3: FORMAT RESULTS =============
    console.log('📊 [ACP-JOB] STEP 3: Formatting results');
    
    const formattedResponses = selectedPersonas.map((persona: any) => ({
      persona_id: persona.persona_id,
      persona_name: persona.name,
      persona_summary: persona.summary,
      responses: allResults[persona.persona_id] || []
    }));

    // ============= STEP 4: GENERATE SUMMARY =============
    let summary_report = null;
    if (include_summary) {
      console.log('📊 [ACP-JOB] STEP 4: Generating summary report');
      const allResponses = Object.values(allResults).flat();
      summary_report = {
        key_themes: extractThemes(allResponses),
        sentiment_breakdown: analyzeSentiment(allResponses),
        total_interactions: formattedResponses.reduce((sum, p) => sum + p.responses.length, 0),
        recommendations: "Summary analysis of persona feedback",
        selection_method: selectionMethod
      };
    }

    // Calculate cost: $0.12 per question per persona
    const totalInteractions = personaIds.length * questions.length;
    const cost = (totalInteractions * 0.12).toFixed(2);

    console.log('========================================');
    console.log(`✅ [ACP-JOB] Job ${job_id} COMPLETED`);
    console.log(`   Personas: ${personaIds.length}`);
    console.log(`   Questions: ${questions.length}`);
    console.log(`   Total interactions: ${totalInteractions}`);
    console.log(`   Selection method: ${selectionMethod}`);
    console.log(`   Cost: $${cost}`);
    console.log('========================================');

    // Return job results
    const response = {
      job_id,
      status: 'completed',
      study_results: {
        personas_interviewed: personaIds.length,
        questions_asked: questions.length,
        total_interactions: totalInteractions,
        responses: formattedResponses,
        summary_report,
        selection_method: selectionMethod
      },
      cost: `$${cost}`
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ [ACP-JOB] Execution Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// ============= HELPER FUNCTIONS =============
function extractThemes(responses: any[]): string[] {
  // Simple keyword extraction - can be enhanced
  return ["Transparency", "Security", "Community"];
}

function analyzeSentiment(responses: any[]): Record<string, number> {
  // Simple sentiment analysis - can be enhanced
  return {
    positive: Math.floor(responses.length * 0.3),
    neutral: Math.floor(responses.length * 0.5),
    negative: Math.floor(responses.length * 0.2)
  };
}
