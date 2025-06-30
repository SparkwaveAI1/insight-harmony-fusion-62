
import { supabase } from '@/integrations/supabase/client';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import { CreativeCharacterData } from '../types/characterTraitTypes';
import { CharacterLinguisticProfile, CharacterEmotionalSystem, CharacterBehavioralModulation } from '../types/characterLinguisticTypes';
import { generateNonHumanoidTraits } from './nonHumanoidTraitGenerator';
import { generateCharacterTraits } from './characterTraitService';
import { generateAppearancePromptFromCreativeData } from './appearancePromptGenerator';

export const createCreativeCharacter = async (
  data: CreativeCharacterData,
  userId: string
): Promise<Character | NonHumanoidCharacter> => {
  console.log('Creating creative character with data:', data);
  console.log('User ID:', userId);

  try {
    // Generate appearance prompt from the creative data
    const appearancePrompt = generateAppearancePromptFromCreativeData(data);
    console.log('Generated appearance prompt:', appearancePrompt);

    // Create character-specific emotional system from creative data
    const emotionalSystem: CharacterEmotionalSystem = {
      core_drives: data.coreDrives,
      surface_triggers: data.surfaceTriggers,
      emotional_responses: {
        change_response_style: data.changeResponseStyle
      }
    };

    // Create character-specific linguistic profile
    const linguisticProfile: CharacterLinguisticProfile = {
      communication_style: data.communication,
      vocabulary_complexity: 'moderate',
      speech_patterns: ['descriptive', 'narrative'],
      formality_level: 0.6,
      expressiveness: 0.7,
      cultural_speech_markers: []
    };

    // Create character-specific behavioral modulation
    const behavioralModulation: CharacterBehavioralModulation = {
      formality: 0.5,
      enthusiasm: 0.7,
      assertiveness: 0.6,
      empathy: data.entityType === 'non-humanoid' ? 0.4 : 0.6,
      patience: 0.5
    };

    if (data.entityType === 'non-humanoid') {
      // Create non-humanoid character
      console.log('Creating non-humanoid character');
      
      const traitProfile = await generateNonHumanoidTraits(data);
      console.log('Generated non-humanoid traits:', traitProfile);

      const characterId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const nonHumanoidCharacter: NonHumanoidCharacter = {
        character_id: characterId,
        name: data.name,
        character_type: 'multi_species',
        creation_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        appearance_prompt: appearancePrompt,
        metadata: {
          ...data,
          created_via: 'creative_genesis',
          environment: data.environment,
          physical_description: data.physicalAppearanceDescription
        },
        behavioral_modulation: behavioralModulation,
        interview_sections: [],
        linguistic_profile: linguisticProfile,
        preinterview_tags: [],
        simulation_directives: {
          preferred_environment: data.environment,
          memory_decay_profile: 'stable'
        },
        trait_profile: traitProfile,
        emotional_system: emotionalSystem,
        user_id: userId,
        is_public: false,
        origin_universe: data.narrativeDomain,
        species_type: data.entityType,
        form_factor: data.physicalForm
      };

      console.log('Saving non-humanoid character to database');
      const { data: savedCharacter, error } = await supabase
        .from('non_humanoid_characters')
        .insert({
          ...nonHumanoidCharacter,
          // Cast complex objects to Json for database compatibility
          trait_profile: traitProfile as any,
          behavioral_modulation: behavioralModulation as any,
          linguistic_profile: linguisticProfile as any,
          metadata: nonHumanoidCharacter.metadata as any,
          simulation_directives: nonHumanoidCharacter.simulation_directives as any,
          interview_sections: nonHumanoidCharacter.interview_sections as any,
          preinterview_tags: nonHumanoidCharacter.preinterview_tags as any
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving non-humanoid character:', error);
        throw new Error(`Failed to save non-humanoid character: ${error.message}`);
      }

      console.log('Non-humanoid character saved successfully:', savedCharacter);
      // Cast the database result back to our interface type
      return savedCharacter as NonHumanoidCharacter;
    } else {
      // Create humanoid character
      console.log('Creating humanoid character');
      
      const traitProfile = await generateCharacterTraits({
        name: data.name,
        description: data.description,
        age: 30,
        gender: 'unknown',
        location: data.environment,
        ethnicity: 'unknown',
        social_class: 'unknown',
        region: data.environment,
        occupation: data.functionalRole,
        personality_traits: data.coreDrives.join(', '),
        backstory: data.description,
        historical_context: data.narrativeDomain,
        date_of_birth: '1990-01-01'
      });

      console.log('Generated humanoid traits:', traitProfile);

      const characterId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const humanoidCharacter: Character = {
        character_id: characterId,
        name: data.name,
        character_type: 'fictional',
        creation_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        appearance_prompt: appearancePrompt,
        metadata: {
          ...data,
          created_via: 'creative_genesis',
          environment: data.environment,
          physical_description: data.physicalAppearanceDescription
        },
        behavioral_modulation: behavioralModulation,
        interview_sections: [],
        linguistic_profile: linguisticProfile,
        preinterview_tags: [],
        simulation_directives: {
          preferred_environment: data.environment,
          memory_decay_profile: 'stable'
        },
        trait_profile: traitProfile,
        emotional_system: emotionalSystem,
        user_id: userId,
        is_public: false,
        age: 30,
        gender: 'unknown',
        region: data.environment,
        physical_appearance: {
          description: data.physicalAppearanceDescription
        }
      };

      console.log('Saving humanoid character to database');
      const { data: savedCharacter, error } = await supabase
        .from('characters')
        .insert({
          ...humanoidCharacter,
          // Remove emotional_system as it's not in the database schema
          emotional_system: undefined,
          // Cast complex objects to Json for database compatibility
          trait_profile: traitProfile as any,
          behavioral_modulation: behavioralModulation as any,
          linguistic_profile: linguisticProfile as any,
          metadata: humanoidCharacter.metadata as any,
          simulation_directives: humanoidCharacter.simulation_directives as any,
          interview_sections: humanoidCharacter.interview_sections as any,
          preinterview_tags: humanoidCharacter.preinterview_tags as any,
          physical_appearance: humanoidCharacter.physical_appearance as any
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving humanoid character:', error);
        throw new Error(`Failed to save humanoid character: ${error.message}`);
      }

      console.log('Humanoid character saved successfully:', savedCharacter);
      // Cast the database result back to our interface type
      return savedCharacter as Character;
    }
  } catch (error) {
    console.error('Error in createCreativeCharacter:', error);
    throw error;
  }
};
