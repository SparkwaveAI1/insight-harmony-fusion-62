
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
  description?: string; // CRITICAL: This should be the primary input for AI generation
  location?: string;
}

export const generateCharacterTraits = async (characterData: CharacterTraitRequest) => {
  console.log('🎯 Calling character trait generation service with enhanced processing for:', characterData.name);
  console.log('📝 Description to process:', characterData.description);
  
  try {
    // Prepare the request with description as the primary input (like personas)
    const requestData = {
      ...characterData,
      // Ensure description is prioritized for AI processing
      primary_description: characterData.description,
      // Include date context for historical period extraction
      historical_date: characterData.date_of_birth,
      // Add context flags for better processing
      generation_type: 'comprehensive_from_description',
    };

    const { data, error } = await supabase.functions.invoke('generate-character-traits', {
      body: requestData
    });

    if (error) {
      console.error('❌ Error from character trait service:', error);
      throw new Error(`Failed to generate character traits: ${error.message}`);
    }

    if (!data?.traitProfile) {
      console.error('❌ No trait profile returned from service');
      throw new Error('No trait profile returned from service');
    }

    console.log('✅ Successfully generated comprehensive traits for character:', characterData.name);
    console.log('🔍 Generated trait categories:', Object.keys(data.traitProfile));
    
    // Log key demographics to verify they're being processed correctly
    if (data.traitProfile.demographics) {
      console.log('👤 Demographics generated:', {
        gender: data.traitProfile.demographics.gender || data.traitProfile.gender,
        age: data.traitProfile.demographics.age || characterData.age,
        historical_period: data.traitProfile.historical_period
      });
    }

    return data.traitProfile;
  } catch (error) {
    console.error('❌ Error generating character traits:', error);
    throw error;
  }
};
