
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '../types';

export const clonePersona = async (originalPersonaId: string, newName: string): Promise<string> => {
  // First get the original persona
  const { data: originalPersona, error: fetchError } = await supabase
    .from('personas')
    .select('*')
    .eq('persona_id', originalPersonaId)
    .single();

  if (fetchError) {
    console.error('Error fetching original persona:', fetchError);
    throw fetchError;
  }

  // Create new persona with cloned data
  const newPersonaId = `persona_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const { data, error } = await supabase
    .from('personas')
    .insert({
      persona_id: newPersonaId,
      name: newName,
      description: originalPersona.description,
      prompt: originalPersona.prompt,
      is_public: false, // Cloned personas are private by default
      creation_date: new Date().toISOString(),
      trait_profile: originalPersona.trait_profile,
      metadata: originalPersona.metadata,
      interview_sections: originalPersona.interview_sections,
      preinterview_tags: originalPersona.preinterview_tags,
      behavioral_modulation: originalPersona.behavioral_modulation,
      simulation_directives: originalPersona.simulation_directives,
      linguistic_profile: originalPersona.linguistic_profile,
      emotional_triggers: originalPersona.emotional_triggers,
      user_id: originalPersona.user_id
    })
    .select()
    .single();

  if (error) {
    console.error('Error cloning persona:', error);
    throw error;
  }

  return data.persona_id;
};

export const generatePersona = async (prompt: string): Promise<Persona> => {
  // This is a placeholder implementation
  // In a real app, this would call an AI service to generate a persona
  const personaId = `persona_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const generatedPersona: Persona = {
    id: personaId,
    persona_id: personaId,
    user_id: null,
    name: "Generated Persona",
    description: "This is a generated persona",
    prompt: prompt,
    is_public: false,
    creation_date: new Date().toISOString(),
    trait_profile: {
      big_five: {
        openness: 0.5,
        conscientiousness: 0.5,
        extraversion: 0.5,
        agreeableness: 0.5,
        neuroticism: 0.5
      }
    },
    metadata: {
      age: "25-35",
      gender: "Unknown",
      occupation: "Unknown"
    },
    interview_sections: [],
    preinterview_tags: [],
    behavioral_modulation: {},
    simulation_directives: {},
    linguistic_profile: {}
  };

  return generatedPersona;
};

export const generatePersonaImage = async (personaId: string, prompt: string): Promise<string> => {
  // This is a placeholder implementation
  // In a real app, this would call an image generation service
  console.log('Generating image for persona:', personaId, 'with prompt:', prompt);
  
  // Return a placeholder image URL
  return "https://via.placeholder.com/400x400?text=Generated+Image";
};
