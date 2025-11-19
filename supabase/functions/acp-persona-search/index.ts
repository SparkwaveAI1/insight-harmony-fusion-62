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
  collection_ids?: string;
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
      collection_ids: url.searchParams.get('collection_ids') || undefined,
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

    // Get collection associations for these personas
    const personaIds = allPersonas?.map(p => p.persona_id) || [];
    
    // Fetch collection data separately to avoid join issues
    const { data: collectionPersonas, error: collectionError } = await supabase
      .from('collection_personas')
      .select('persona_id, collection_id')
      .in('persona_id', personaIds);

    if (collectionError) {
      console.error('Collection fetch error:', collectionError);
      console.error('Collection fetch full error:', JSON.stringify(collectionError));
      console.error('Persona IDs count:', personaIds.length);
    }

    // Get unique collection IDs and fetch their names
    const collectionIds = [...new Set(collectionPersonas?.map(cp => cp.collection_id) || [])];
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('id, name')
      .in('id', collectionIds);

    if (collectionsError) {
      console.error('Collections name fetch error:', collectionsError);
    }

    // Build collection ID to name map
    const collectionNameMap = new Map<string, string>();
    collections?.forEach(c => {
      collectionNameMap.set(c.id, c.name);
    });

    // Build persona-to-collections map
    const personaCollectionsMap = new Map<string, any[]>();
    collectionPersonas?.forEach(cp => {
      const existing = personaCollectionsMap.get(cp.persona_id) || [];
      existing.push({
        id: cp.collection_id,
        name: collectionNameMap.get(cp.collection_id) || 'Unknown'
      });
      personaCollectionsMap.set(cp.persona_id, existing);
    });

    console.log('Debug: Total personas fetched:', allPersonas?.length);
    console.log('Debug: Collection personas found:', collectionPersonas?.length);
    console.log('Debug: Persona collections map size:', personaCollectionsMap.size);

    // Filter personas based on search criteria
    const filtered = allPersonas?.filter(persona => {
      const summary = persona.conversation_summary;
      const demographics = summary?.demographics || {};

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

      // Collection filter
      if (params.collection_ids) {
        const collectionIds = params.collection_ids.split(',').map(id => id.trim());
        const personaCollections = personaCollectionsMap.get(persona.persona_id) || [];
        const personaCollectionIds = personaCollections.map(c => c.id);
        const hasMatchingCollection = collectionIds.some(id => personaCollectionIds.includes(id));
        
        console.log('Debug: Checking persona', persona.name, 'with collections:', personaCollectionIds, 'against', collectionIds, 'match:', hasMatchingCollection);
        
        if (!hasMatchingCollection) return false;
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
      const collections = personaCollectionsMap.get(persona.persona_id) || [];
      
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
        collections: collections.map(c => c.name),
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
