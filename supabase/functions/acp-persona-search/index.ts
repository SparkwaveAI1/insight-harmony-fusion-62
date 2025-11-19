// Supabase Edge Function: acp-persona-search
// Deploy to: supabase/functions/acp-persona-search/index.ts

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
  search_query?: string;  // Natural language semantic search
  limit?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
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

    // Get completed v4 personas
    const { data: allPersonas, error: personasError } = await supabase
      .from('v4_personas')
      .select('persona_id, name, conversation_summary')
      .eq('creation_completed', true)
      .eq('schema_version', 'v4.0');

    if (personasError) {
      throw personasError;
    }

    console.log('Debug: Total personas fetched:', allPersonas?.length);

    // Filter personas based on search criteria
    const filtered = allPersonas?.filter(persona => {
      const summary = persona.conversation_summary;
      const demographics = summary?.demographics || {};

      // SEMANTIC SEARCH - if search_query provided, check text fields
      if (params.search_query) {
        const searchTerms = params.search_query.toLowerCase();
        
        // Concatenate searchable text fields
        const searchableText = [
          demographics.background_description || '',
          summary.personality_summary || '',
          summary.motivational_summary || '',
          summary.character_description || '',
          demographics.occupation || ''
        ].join(' ').toLowerCase();
        
        // Check if search terms appear in text
        if (!searchableText.includes(searchTerms)) {
          return false;
        }
      }

      // Age filter
      if (params.age_range) {
        const age = demographics.age;
        if (!matchesAgeRange(age, params.age_range)) return false;
      }

      // Location filter
      if (params.location) {
        const location = demographics.location?.toLowerCase() || '';
        if (!location.includes(params.location.toLowerCase())) return false;
      }

      // Occupation filter
      if (params.occupation) {
        const occupation = demographics.occupation?.toLowerCase() || '';
        if (!occupation.includes(params.occupation.toLowerCase())) return false;
      }

      // Education filter
      if (params.education) {
        const education = summary?.knowledge_profile?.education_level?.toLowerCase() || '';
        if (!education.includes(params.education.toLowerCase())) return false;
      }


      // Interests filter (check in background_description or expertise_domains)
      if (params.interests) {
        const interests = params.interests.toLowerCase().split(',').map(i => i.trim());
        const background = demographics.background_description?.toLowerCase() || '';
        const expertise = summary?.knowledge_profile?.expertise_domains || [];
        
        const matchesInterest = interests.some(interest => 
          background.includes(interest) || 
          expertise.some((e: string) => e.toLowerCase().includes(interest))
        );
        if (!matchesInterest) return false;
      }

      return true;
    }) || [];

    // Format response
    const results = filtered.slice(0, params.limit).map(persona => {
      const summary = persona.conversation_summary;
      const demographics = summary?.demographics || {};
      
      return {
        persona_id: persona.persona_id,
        name: persona.name,
        summary: generatePersonaSummary(summary),
        demographics: {
          age: demographics.age,
          location: demographics.location,
          occupation: demographics.occupation,
          education: summary?.knowledge_profile?.education_level,
        },
        key_traits: extractKeyTraits(summary),
        collections: [],
        availability: true,
      };
    });

    const response = {
      matching_count: filtered.length,
      personas: results,
    };

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

// Helper functions

function matchesAgeRange(age: number, rangeStr: string): boolean {
  if (!age) return false;
  
  // Handle formats like "25-40", "50+", "18-25"
  if (rangeStr.includes('-')) {
    const [min, max] = rangeStr.split('-').map(s => parseInt(s.trim()));
    return age >= min && age <= max;
  } else if (rangeStr.includes('+')) {
    const min = parseInt(rangeStr.replace('+', ''));
    return age >= min;
  }
  
  return false;
}

function generatePersonaSummary(summary: any): string {
  const demographics = summary?.demographics || {};
  const motivation = summary?.motivation_summary || '';
  
  const parts = [];
  if (demographics.age) parts.push(`${demographics.age}yo`);
  if (demographics.occupation) parts.push(demographics.occupation.toLowerCase());
  if (motivation) parts.push(motivation.split('.')[0].toLowerCase());
  
  return parts.join(', ');
}

function extractKeyTraits(summary: any): Record<string, string> {
  const traits: Record<string, string> = {};
  
  // Extract relevant traits from summary
  if (summary?.communication_style?.directness) {
    traits.communication_directness = summary.communication_style.directness;
  }
  
  if (summary?.goal_priorities) {
    const firstGoal = summary.goal_priorities.split(';')[0];
    traits.primary_motivation = firstGoal;
  }
  
  if (summary?.knowledge_profile?.expertise_domains) {
    traits.expertise = summary.knowledge_profile.expertise_domains.slice(0, 3).join(', ');
  }
  
  return traits;
}
