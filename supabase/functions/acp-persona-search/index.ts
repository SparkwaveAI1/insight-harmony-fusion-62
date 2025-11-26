// Supabase Edge Function: acp-persona-search
// Searches v4_personas using full_profile data with fallback to random selection

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchParams {
  age_range?: string;
  location?: string;
  occupation?: string;
  income_bracket?: string;
  education?: string;
  interests?: string;
  behaviors?: string;
  search_query?: string;
  limit?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse query parameters
    const url = new URL(req.url);
    const params: SearchParams = {
      age_range: url.searchParams.get('age_range') || undefined,
      location: url.searchParams.get('location') || undefined,
      occupation: url.searchParams.get('occupation') || undefined,
      income_bracket: url.searchParams.get('income_bracket') || undefined,
      education: url.searchParams.get('education') || undefined,
      interests: url.searchParams.get('interests') || undefined,
      behaviors: url.searchParams.get('behaviors') || undefined,
      search_query: url.searchParams.get('search_query') || undefined,
      limit: parseInt(url.searchParams.get('limit') || '10'),
    };

    console.log('ACP Search Request:', params);

    // Fetch completed v4 personas with full_profile
    const { data: allPersonas, error: personasError } = await supabase
      .from('v4_personas')
      .select('persona_id, name, full_profile, conversation_summary, is_public')
      .eq('creation_completed', true)
      .eq('schema_version', 'v4.0');

    if (personasError) {
      throw personasError;
    }

    console.log('Total personas fetched:', allPersonas?.length);

    // Check if any filters are actually applied
    const hasFilters = params.search_query || params.age_range || params.location || 
                       params.occupation || params.income_bracket || params.education || 
                       params.interests || params.behaviors;

    // Filter personas based on search criteria using full_profile
    let filtered = allPersonas?.filter(persona => {
      const profile = persona.full_profile || {};
      const identity = profile.identity || {};
      const location = identity.location || {};
      const motivation = profile.motivation_profile || {};
      const dailyLife = profile.daily_life || {};
      
      // Also check conversation_summary as fallback
      const summary = persona.conversation_summary || {};
      const summaryDemographics = summary.demographics || {};

      // SEMANTIC SEARCH - search across multiple text fields
      if (params.search_query) {
        const searchTerms = params.search_query.toLowerCase();
        
        // Build searchable text from full_profile
        const searchableText = [
          // Identity fields
          identity.name || '',
          identity.occupation || '',
          identity.background || '',
          identity.ethnicity || '',
          identity.nationality || '',
          // Location
          location.city || '',
          location.region || '',
          location.country || '',
          // Motivation
          motivation.attitude_narrative || '',
          JSON.stringify(motivation.primary_motivation_labels || []),
          // Daily life
          JSON.stringify(dailyLife.mental_preoccupations || []),
          // Conversation summary fallback
          summaryDemographics.background_description || '',
          summary.personality_summary || '',
          summary.motivational_summary || '',
          summary.character_description || '',
        ].join(' ').toLowerCase();
        
        // Check if any search term appears
        const terms = searchTerms.split(' ').filter(t => t.length > 2);
        const matchesSearch = terms.some(term => searchableText.includes(term));
        if (!matchesSearch) return false;
      }

      // Age filter - use full_profile.identity.age
      if (params.age_range) {
        const age = identity.age || summaryDemographics.age;
        if (!matchesAgeRange(age, params.age_range)) return false;
      }

      // Location filter - check city, region, country
      if (params.location) {
        const searchLoc = params.location.toLowerCase();
        const locationMatch = [
          location.city || '',
          location.region || '',
          location.country || '',
          summaryDemographics.location || ''
        ].some(loc => loc.toLowerCase().includes(searchLoc));
        if (!locationMatch) return false;
      }

      // Occupation filter
      if (params.occupation) {
        const occupation = (identity.occupation || summaryDemographics.occupation || '').toLowerCase();
        if (!occupation.includes(params.occupation.toLowerCase())) return false;
      }

      // Education filter
      if (params.education) {
        const education = (identity.education_level || '').toLowerCase();
        if (!education.includes(params.education.toLowerCase())) return false;
      }

      // Income bracket filter
      if (params.income_bracket) {
        const income = (identity.income_bracket || '').toLowerCase();
        if (!income.includes(params.income_bracket.toLowerCase())) return false;
      }

      // Interests filter - search in background, motivations, daily life
      if (params.interests) {
        const interests = params.interests.toLowerCase().split(',').map(i => i.trim());
        const interestText = [
          identity.background || '',
          JSON.stringify(motivation.primary_motivation_labels || []),
          JSON.stringify(dailyLife.mental_preoccupations || []),
        ].join(' ').toLowerCase();
        
        const matchesInterest = interests.some(interest => interestText.includes(interest));
        if (!matchesInterest) return false;
      }

      return true;
    }) || [];

    console.log('Filtered personas count:', filtered.length);

    // FALLBACK: If no matches found, return random public personas
    if (filtered.length === 0 && hasFilters) {
      console.log('No matches found - using random fallback');
      
      // Get public personas for fallback
      const publicPersonas = allPersonas?.filter(p => p.is_public) || [];
      
      if (publicPersonas.length > 0) {
        // Shuffle and take random sample
        const shuffled = publicPersonas.sort(() => Math.random() - 0.5);
        const fallbackCount = Math.min(params.limit || 10, shuffled.length, 10);
        filtered = shuffled.slice(0, fallbackCount);
        
        console.log(`Returning ${filtered.length} random public personas as fallback`);
      } else {
        // If no public personas, use any available personas
        const shuffled = (allPersonas || []).sort(() => Math.random() - 0.5);
        const fallbackCount = Math.min(params.limit || 10, shuffled.length, 10);
        filtered = shuffled.slice(0, fallbackCount);
        
        console.log(`Returning ${filtered.length} random personas as fallback (no public personas available)`);
      }
    }

    // Format response with rich data from full_profile
    const results = filtered.slice(0, params.limit).map(persona => {
      const profile = persona.full_profile || {};
      const identity = profile.identity || {};
      const location = identity.location || {};
      const motivation = profile.motivation_profile || {};
      const communication = profile.communication_style || {};
      const summary = persona.conversation_summary || {};
      const summaryDemographics = summary.demographics || {};
      
      return {
        persona_id: persona.persona_id,
        name: persona.name,
        summary: generatePersonaSummary(profile, summary),
        demographics: {
          age: identity.age || summaryDemographics.age,
          gender: identity.gender,
          location: formatLocation(location) || summaryDemographics.location,
          occupation: identity.occupation || summaryDemographics.occupation,
          education: identity.education_level,
          income_bracket: identity.income_bracket,
          ethnicity: identity.ethnicity,
          relationship_status: identity.relationship_status,
        },
        key_traits: extractKeyTraits(profile, summary),
        motivations: {
          primary_labels: motivation.primary_motivation_labels || [],
          primary_drivers: motivation.primary_drivers || {},
        },
        communication_style: {
          formality: communication.voice_foundation?.formality,
          directness: communication.voice_foundation?.directness,
        },
        is_public: persona.is_public,
        availability: true,
      };
    });

    const response = {
      matching_count: filtered.length,
      total_available: allPersonas?.length || 0,
      used_fallback: filtered.length > 0 && hasFilters && filtered.every(p => 
        !matchesSearchCriteria(p, params)
      ),
      personas: results,
    };

    console.log(`Returning ${results.length} personas`);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('ACP Search Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper: Check if age matches range
function matchesAgeRange(age: number | undefined, rangeStr: string): boolean {
  if (!age) return false;
  
  if (rangeStr.includes('-')) {
    const [min, max] = rangeStr.split('-').map(s => parseInt(s.trim()));
    return age >= min && age <= max;
  } else if (rangeStr.includes('+')) {
    const min = parseInt(rangeStr.replace('+', ''));
    return age >= min;
  }
  
  return false;
}

// Helper: Format location from full_profile
function formatLocation(location: any): string {
  if (!location) return '';
  const parts = [location.city, location.region, location.country].filter(Boolean);
  return parts.join(', ');
}

// Helper: Generate summary string
function generatePersonaSummary(profile: any, summary: any): string {
  const identity = profile?.identity || {};
  const summaryDemographics = summary?.demographics || {};
  const motivation = profile?.motivation_profile || {};
  
  const parts = [];
  
  const age = identity.age || summaryDemographics.age;
  if (age) parts.push(`${age}yo`);
  
  if (identity.gender) parts.push(identity.gender);
  
  const occupation = identity.occupation || summaryDemographics.occupation;
  if (occupation) parts.push(occupation);
  
  const location = formatLocation(identity.location) || summaryDemographics.location;
  if (location) parts.push(`from ${location}`);
  
  // Add primary motivation if available
  const primaryMotivation = motivation.primary_motivation_labels?.[0];
  if (primaryMotivation) parts.push(`motivated by ${primaryMotivation}`);
  
  return parts.join(', ') || 'No summary available';
}

// Helper: Extract key traits from full_profile
function extractKeyTraits(profile: any, summary: any): Record<string, string> {
  const traits: Record<string, string> = {};
  const motivation = profile?.motivation_profile || {};
  const communication = profile?.communication_style || {};
  const adoption = profile?.adoption_profile || {};
  
  // Primary motivation
  if (motivation.primary_motivation_labels?.length > 0) {
    traits.primary_motivations = motivation.primary_motivation_labels.slice(0, 3).join(', ');
  }
  
  // Communication style
  if (communication.voice_foundation?.directness) {
    traits.communication_directness = communication.voice_foundation.directness;
  }
  if (communication.voice_foundation?.formality) {
    traits.communication_formality = communication.voice_foundation.formality;
  }
  
  // Risk tolerance
  if (adoption?.risk_tolerance !== undefined) {
    const riskLevel = adoption.risk_tolerance > 0.6 ? 'high' : 
                      adoption.risk_tolerance > 0.3 ? 'medium' : 'low';
    traits.risk_tolerance = riskLevel;
  }
  
  // Deal breakers
  if (motivation.deal_breakers?.length > 0) {
    traits.deal_breakers = motivation.deal_breakers.slice(0, 2).join(', ');
  }
  
  return traits;
}

// Helper: Check if persona matches original search criteria (for fallback detection)
function matchesSearchCriteria(persona: any, params: SearchParams): boolean {
  // Simple check - if we had search params but persona doesn't match, it's a fallback
  if (!params.search_query) return true;
  
  const profile = persona.full_profile || {};
  const identity = profile.identity || {};
  const searchText = [
    identity.name || '',
    identity.occupation || '',
    identity.background || '',
  ].join(' ').toLowerCase();
  
  const terms = params.search_query.toLowerCase().split(' ').filter(t => t.length > 2);
  return terms.some(term => searchText.includes(term));
}
