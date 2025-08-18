import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TraitSample {
  demographics: {
    age?: number;
    location?: string;
    occupation?: string;
    income_level?: string;
    education?: string;
  };
  bigFive: {
    openness?: number;
    conscientiousness?: number;
    extraversion?: number;
    agreeableness?: number;
    neuroticism?: number;
  };
  behavioral: {
    communication_style?: string;
    decision_making?: string;
    stress_response?: string;
    social_orientation?: string;
  };
  essence: string;
}

function samplePersonaTraits(persona: any): TraitSample {
  const sample: TraitSample = {
    demographics: {},
    bigFive: {},
    behavioral: {},
    essence: ''
  };

  // Extract demographics from metadata
  if (persona.metadata) {
    sample.demographics = {
      age: persona.metadata.age,
      location: persona.metadata.location || persona.metadata.region,
      occupation: persona.metadata.occupation || persona.metadata.profession,
      income_level: persona.metadata.income_level,
      education: persona.metadata.education
    };
  }

  // Extract Big Five traits from trait_profile
  if (persona.trait_profile) {
    const traits = persona.trait_profile;
    sample.bigFive = {
      openness: traits.openness || traits.curiosity || traits.creativity,
      conscientiousness: traits.conscientiousness || traits.discipline || traits.organization,
      extraversion: traits.extraversion || traits.sociability || traits.assertiveness,
      agreeableness: traits.agreeableness || traits.empathy || traits.cooperation,
      neuroticism: traits.neuroticism || traits.anxiety || traits.emotional_stability
    };
  }

  // Extract behavioral patterns
  if (persona.linguistic_profile || persona.simulation_directives) {
    const linguistic = persona.linguistic_profile || {};
    const simulation = persona.simulation_directives || {};
    
    sample.behavioral = {
      communication_style: linguistic.communication_style || simulation.communication_style,
      decision_making: simulation.decision_making_style || linguistic.decision_approach,
      stress_response: simulation.stress_response || linguistic.conflict_approach,
      social_orientation: linguistic.social_context_adaptation || simulation.social_behavior
    };
  }

  // Generate natural language essence
  sample.essence = generatePersonaEssence(persona, sample);
  return sample;
}

function generatePersonaEssence(persona: any, sample: TraitSample): string {
  const parts: string[] = [];

  if (persona.name) {
    parts.push(`A person named ${persona.name}`);
  }

  if (sample.demographics.age) {
    parts.push(`aged ${sample.demographics.age}`);
  }
  if (sample.demographics.occupation) {
    parts.push(`working as a ${sample.demographics.occupation}`);
  }
  if (sample.demographics.location) {
    parts.push(`living in ${sample.demographics.location}`);
  }

  // Add personality traits
  const traitDescriptions: string[] = [];
  if (sample.bigFive.openness && sample.bigFive.openness > 0.7) {
    traitDescriptions.push('highly creative and open-minded');
  }
  if (sample.bigFive.conscientiousness && sample.bigFive.conscientiousness > 0.7) {
    traitDescriptions.push('very organized and disciplined');
  }
  if (sample.bigFive.extraversion && sample.bigFive.extraversion > 0.7) {
    traitDescriptions.push('highly social and outgoing');
  }
  if (sample.bigFive.agreeableness && sample.bigFive.agreeableness > 0.7) {
    traitDescriptions.push('compassionate and cooperative');
  }

  if (traitDescriptions.length > 0) {
    parts.push(`who is ${traitDescriptions.join(', ')}`);
  }

  if (persona.description) {
    parts.push(`Originally described as: "${persona.description}"`);
  }

  return parts.join(', ') + '.';
}

function generatePersonaV2Prompt(sample: TraitSample): string {
  let prompt = `Create a detailed persona with the following characteristics:\n\n`;
  
  prompt += `**Core Identity**: ${sample.essence}\n\n`;
  
  if (Object.keys(sample.demographics).length > 0) {
    prompt += `**Demographics**:\n`;
    Object.entries(sample.demographics).forEach(([key, value]) => {
      if (value) prompt += `- ${key.replace('_', ' ')}: ${value}\n`;
    });
    prompt += `\n`;
  }

  if (Object.keys(sample.bigFive).length > 0) {
    prompt += `**Personality Traits** (Big Five scale 0-1):\n`;
    Object.entries(sample.bigFive).forEach(([key, value]) => {
      if (value !== undefined) prompt += `- ${key}: ${value}\n`;
    });
    prompt += `\n`;
  }

  prompt += `Please generate a comprehensive PersonaV2 that captures this personality accurately while filling in missing details with realistic, consistent characteristics.`;
  
  return prompt;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { personaId, mode = 'single' } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    if (mode === 'single' && !personaId) {
      throw new Error('personaId required for single migration');
    }

    // Get personas to migrate
    let query = supabase.from('personas').select('*');
    
    if (mode === 'single') {
      query = query.eq('persona_id', personaId);
    } else {
      query = query.eq('user_id', user.id);
    }

    const { data: v1Personas, error: fetchError } = await query;
    
    if (fetchError) {
      throw new Error(`Failed to fetch personas: ${fetchError.message}`);
    }

    if (!v1Personas || v1Personas.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No personas found to migrate' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const v1Persona of v1Personas) {
      try {
        console.log(`Migrating persona: ${v1Persona.name} (${v1Persona.persona_id})`);
        
        // Sample traits from V1 persona
        const traitSample = samplePersonaTraits(v1Persona);
        const prompt = generatePersonaV2Prompt(traitSample);

        console.log(`Generated prompt for ${v1Persona.name}:`, prompt);

        // Generate PersonaV2 using the existing generate-persona function
        const generateResponse = await supabase.functions.invoke('generate-persona', {
          body: { prompt },
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json'
          }
        });

        if (generateResponse.error) {
          throw new Error(`Failed to generate PersonaV2: ${generateResponse.error.message}`);
        }

        const generatedPersona = generateResponse.data?.persona;
        if (!generatedPersona) {
          throw new Error('No persona data returned from generation');
        }

        // Save to personas_v2 table, preserving key attributes
        const v2PersonaRecord = {
          persona_id: v1Persona.persona_id, // Keep same ID
          user_id: v1Persona.user_id,
          name: v1Persona.name,
          description: v1Persona.description,
          persona_data: generatedPersona,
          persona_type: 'humanoid',
          is_public: v1Persona.is_public || false,
          profile_image_url: v1Persona.profile_image_url
        };

        const { data: savedPersona, error: saveError } = await supabase
          .from('personas_v2')
          .upsert(v2PersonaRecord)
          .select()
          .single();

        if (saveError) {
          throw new Error(`Failed to save PersonaV2: ${saveError.message}`);
        }

        results.push({
          persona_id: v1Persona.persona_id,
          name: v1Persona.name,
          status: 'success',
          message: 'Successfully migrated to PersonaV2'
        });

        console.log(`Successfully migrated: ${v1Persona.name}`);

      } catch (error) {
        console.error(`Failed to migrate persona ${v1Persona.name}:`, error);
        results.push({
          persona_id: v1Persona.persona_id,
          name: v1Persona.name,
          status: 'error',
          message: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Migration completed`,
        results,
        total: v1Personas.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});