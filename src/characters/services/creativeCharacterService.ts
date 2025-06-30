import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import { CreativeCharacterData } from '../types/characterTraitTypes';
import { generateNonHumanoidTraits } from './nonHumanoidTraitGenerator';
import { generateCharacterTraits } from './characterTraitService';
import { saveCharacter } from './characterService';
import { saveNonHumanoidCharacter } from './nonHumanoidCharacterService';
import { generateAppearancePromptFromCreativeData, generateAppearancePrompt } from './appearancePromptGenerator';

export const createCreativeCharacter = async (data: CreativeCharacterData, userId: string): Promise<Character | NonHumanoidCharacter> => {
  console.log('=== CREATING CREATIVE CHARACTER ===');
  console.log('Creative character data:', data);
  console.log('User ID provided:', userId);

  try {
    if (!userId) {
      console.error('No user ID provided');
      throw new Error('You must be logged in to create characters. Please sign in and try again.');
    }

    console.log('Creating character for user:', userId);

    // Verify the user is authenticated by checking with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication check failed:', authError);
      throw new Error('Authentication required. Please sign in and try again.');
    }

    if (user.id !== userId) {
      console.error('User ID mismatch - provided:', userId, 'authenticated:', user.id);
      throw new Error('Authentication error. Please refresh and try again.');
    }

    console.log('Authentication verified for user:', user.id);

    if (data.entityType === 'non-humanoid') {
      return await createNonHumanoidCreativeCharacter(data, user.id);
    } else {
      return await createHumanoidCreativeCharacter(data, user.id);
    }
  } catch (error) {
    console.error('Error creating creative character:', error);
    throw new Error(`Failed to create creative character: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const createNonHumanoidCreativeCharacter = async (data: CreativeCharacterData, userId: string): Promise<NonHumanoidCharacter> => {
  console.log('Creating non-humanoid creative character');
  
  // Generate non-humanoid traits based on the creative data
  const traitProfile = await generateNonHumanoidTraits({
    name: data.name,
    description: data.description,
    entityType: data.entityType,
    narrativeDomain: data.narrativeDomain,
    functionalRole: data.functionalRole,
    environment: data.environment,
    physicalForm: data.physicalForm,
    communication: data.communication,
    coreDrives: data.coreDrives,
    surfaceTriggers: data.surfaceTriggers,
    changeResponseStyle: data.changeResponseStyle
  });

  // Generate appearance prompt from Physical Manifestation data
  const appearancePrompt = generateAppearancePrompt({
    name: data.name,
    entityType: data.entityType,
    environment: data.environment,
    physicalManifestation: traitProfile.physical_manifestation,
    speciesType: traitProfile.species_type,
    formFactor: traitProfile.form_factor
  });

  console.log('Generated appearance prompt for non-humanoid:', appearancePrompt);

  // Create the non-humanoid character object
  const nonHumanoidCharacter: NonHumanoidCharacter = {
    character_id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    character_type: 'multi_species',
    creation_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    user_id: userId,
    appearance_prompt: appearancePrompt,
    metadata: {
      description: data.description,
      narrative_domain: data.narrativeDomain,
      functional_role: data.functionalRole,
      environment: data.environment,
      communication: data.communication,
      core_drives: data.coreDrives,
      surface_triggers: data.surfaceTriggers,
      change_response_style: data.changeResponseStyle,
      created_via: 'creative_genesis'
    },
    trait_profile: traitProfile,
    behavioral_modulation: {
      formality: 0.5,
      enthusiasm: 0.6,
      assertiveness: 0.5,
      empathy: 0.4,
      patience: 0.7
    },
    linguistic_profile: {
      speech_register: 'alien_translated',
      cultural_speech_patterns: `Translated from ${data.communication}`,
      sample_phrasing: [
        `Communication patterns reflect ${data.entityType} nature`,
        `Universal Translator active for ${data.communication} modality`
      ]
    },
    interview_sections: [],
    preinterview_tags: [data.entityType, data.narrativeDomain, data.functionalRole],
    simulation_directives: traitProfile.simulation_directives,
    emotional_triggers: {
      positive_triggers: data.coreDrives.map(drive => ({
        trigger: drive,
        keywords: [drive.toLowerCase()],
        emotion_type: 'positive' as const,
        intensity: 0.7,
        intensity_multiplier: 1.0,
        description: `Responds positively to ${drive.toLowerCase()}`
      })),
      negative_triggers: data.surfaceTriggers.map(trigger => ({
        trigger: trigger,
        keywords: [trigger.toLowerCase()],
        emotion_type: 'negative' as const,
        intensity: 0.8,
        intensity_multiplier: 1.2,
        description: `Becomes agitated by ${trigger.toLowerCase()}`
      }))
    },
    // Non-humanoid specific fields
    origin_universe: data.narrativeDomain,
    species_type: traitProfile.species_type,
    form_factor: traitProfile.form_factor,
    is_public: false,
    enhanced_metadata_version: 2
  };

  console.log('Non-humanoid character object before saving:', {
    character_id: nonHumanoidCharacter.character_id,
    user_id: nonHumanoidCharacter.user_id,
    name: nonHumanoidCharacter.name,
    species_type: nonHumanoidCharacter.species_type,
    appearance_prompt: nonHumanoidCharacter.appearance_prompt?.substring(0, 100) + '...'
  });

  // Save the non-humanoid character to the dedicated table
  const savedCharacter = await saveNonHumanoidCharacter(nonHumanoidCharacter);
  
  console.log('✅ Creative non-humanoid character created successfully');
  return savedCharacter;
};

const createHumanoidCreativeCharacter = async (data: CreativeCharacterData, userId: string): Promise<Character> => {
  console.log('Creating humanoid creative character');
  
  // Build a description for AI trait generation
  const fullDescription = buildHumanoidDescription(data);
  
  // Generate appearance prompt from physical description
  const appearancePrompt = generateAppearancePromptFromCreativeData(data);
  console.log('Generated appearance prompt for humanoid:', appearancePrompt);
  
  // Generate humanoid traits using the existing character trait service
  const aiGeneratedTraits = await generateCharacterTraits({
    name: data.name,
    description: fullDescription,
    date_of_birth: '1990-01-01', // Default, can be inferred from description
    age: 30, // Default, can be inferred from description
    location: data.environment,
    gender: '',
    ethnicity: '',
    social_class: '',
    region: '',
    occupation: data.functionalRole,
    personality_traits: data.coreDrives.join(', '),
    backstory: fullDescription,
    historical_context: data.narrativeDomain
  });

  // Create the humanoid character object
  const humanoidCharacter: Character = {
    character_id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    character_type: 'fictional',
    creation_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    user_id: userId,
    appearance_prompt: appearancePrompt,
    metadata: {
      description: data.description,
      narrative_domain: data.narrativeDomain,
      functional_role: data.functionalRole,
      environment: data.environment,
      core_drives: data.coreDrives,
      surface_triggers: data.surfaceTriggers,
      change_response_style: data.changeResponseStyle,
      created_via: 'creative_genesis'
    },
    trait_profile: aiGeneratedTraits,
    behavioral_modulation: {
      formality: 0.5,
      enthusiasm: 0.6,
      assertiveness: 0.5,
      empathy: 0.7,
      patience: 0.6
    },
    linguistic_profile: {
      speech_register: 'conversational',
      cultural_speech_patterns: `Reflects ${data.narrativeDomain} setting`,
      sample_phrasing: [
        `Speech patterns reflect ${data.functionalRole} background`,
        `Language influenced by ${data.environment} environment`
      ]
    },
    interview_sections: [],
    preinterview_tags: [data.entityType, data.narrativeDomain, data.functionalRole],
    simulation_directives: aiGeneratedTraits.simulation_directives || {},
    emotional_triggers: {
      positive_triggers: data.coreDrives.map(drive => ({
        trigger: drive,
        keywords: [drive.toLowerCase()],
        emotion_type: 'positive' as const,
        intensity: 0.7,
        intensity_multiplier: 1.0,
        description: `Motivated by ${drive.toLowerCase()}`
      })),
      negative_triggers: data.surfaceTriggers.map(trigger => ({
        trigger: trigger,
        keywords: [trigger.toLowerCase()],
        emotion_type: 'negative' as const,
        intensity: 0.8,
        intensity_multiplier: 1.2,
        description: `Troubled by ${trigger.toLowerCase()}`
      }))
    },
    is_public: false,
    enhanced_metadata_version: 2
  };

  console.log('Humanoid character object before saving:', {
    character_id: humanoidCharacter.character_id,
    user_id: humanoidCharacter.user_id,
    name: humanoidCharacter.name,
    character_type: humanoidCharacter.character_type,
    appearance_prompt: humanoidCharacter.appearance_prompt?.substring(0, 100) + '...'
  });

  // Save the humanoid character to the characters table
  const savedCharacter = await saveCharacter(humanoidCharacter);
  
  console.log('✅ Creative humanoid character created successfully');
  return savedCharacter;
};

const buildHumanoidDescription = (data: CreativeCharacterData): string => {
  const drives = data.coreDrives.length > 0 ? `Core drives: ${data.coreDrives.join(', ')}. ` : '';
  const triggers = data.surfaceTriggers.length > 0 ? `Surface triggers: ${data.surfaceTriggers.join(', ')}. ` : '';
  const role = data.functionalRole ? `Role: ${data.functionalRole}. ` : '';
  const physicalForm = data.physicalForm ? `Physical form: ${data.physicalForm}. ` : '';
  
  return `${data.description} ${drives}${triggers}${role}${physicalForm}Environment: ${data.environment}. Setting: ${data.narrativeDomain}.`.trim();
};
