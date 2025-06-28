
import { supabase } from '@/integrations/supabase/client';

interface CharacterTraitRequest {
  name: string;
  age: number;
  gender: string;
  social_class: string;
  region: string;
  occupation?: string;
  personality_traits?: string;
  backstory?: string;
  historical_context?: string;
  date_of_birth?: string;
  ethnicity?: string;
  description?: string; // Added description field for AI generation
  location?: string; // Added location field
}

export const generateCharacterTraits = async (characterData: CharacterTraitRequest) => {
  console.log('Calling character trait generation service for:', characterData.name);
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-character-traits', {
      body: characterData
    });

    if (error) {
      console.error('Error from character trait service:', error);
      throw new Error(`Failed to generate character traits: ${error.message}`);
    }

    if (!data?.traitProfile) {
      throw new Error('No trait profile returned from service');
    }

    console.log('Successfully generated traits for character:', characterData.name);
    return data.traitProfile;
  } catch (error) {
    console.error('Error generating character traits:', error);
    throw error;
  }
};
