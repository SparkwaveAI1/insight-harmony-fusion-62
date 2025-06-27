
import { Character } from '../types/characterTraitTypes';
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { supabase } from '@/integrations/supabase/client';

export const generateCharacterFromFormData = async (formData: HistoricalCharacterFormData): Promise<Character> => {
  console.log('=== GENERATING CHARACTER FROM FORM DATA USING PERSONA SYSTEM ===');
  console.log('Form data:', formData);

  // Create a detailed prompt for the persona generation system
  const prompt = `Create a historical character: ${formData.name}, born ${formData.date_of_birth}, age ${formData.age}, from ${formData.location}. 
  
  Occupation: ${formData.occupation || 'Historical figure'}
  
  Background: ${formData.backstory || 'A notable figure from their historical period'}
  
  Personality traits: ${formData.personality_traits || 'Shaped by the times and circumstances of their era'}
  
  Historical context: ${formData.historical_context || 'Lived during a significant period in history'}
  
  Please generate comprehensive demographics, realistic personality traits, and detailed metadata appropriate for this historical character.`;

  // Use the existing persona generation system
  const { data, error } = await supabase.functions.invoke('generate-persona', {
    body: { prompt }
  });

  if (error) {
    console.error("❌ Error calling generate-persona function:", error);
    throw new Error(`Failed to generate character: ${error.message}`);
  }

  if (!data.success || !data.persona) {
    console.error("❌ Character generation failed:", data.error || "Unknown error");
    throw new Error(`Failed to generate character: ${data.error || "Unknown error"}`);
  }

  console.log("✅ Successfully generated character using persona system:", data.persona.name);

  // Convert the persona to a character format
  const generatedPersona = data.persona;
  
  const character: Character = {
    id: '', // Will be set by database
    character_id: generatedPersona.persona_id, // Use the generated persona ID
    name: generatedPersona.name,
    character_type: 'historical',
    creation_date: generatedPersona.creation_date,
    created_at: new Date().toISOString(),
    metadata: generatedPersona.metadata,
    trait_profile: generatedPersona.trait_profile,
    behavioral_modulation: generatedPersona.behavioral_modulation,
    linguistic_profile: generatedPersona.linguistic_profile,
    emotional_triggers: generatedPersona.emotional_triggers,
    preinterview_tags: generatedPersona.preinterview_tags || ['historical', 'generated'],
    simulation_directives: generatedPersona.simulation_directives,
    interview_sections: generatedPersona.interview_sections,
    prompt: prompt,
    user_id: undefined, // Will be set by the calling code
    is_public: false,
    profile_image_url: null,
    enhanced_metadata_version: generatedPersona.enhanced_metadata_version || 2
  };

  console.log('✅ Character converted from persona successfully');
  return character;
};
