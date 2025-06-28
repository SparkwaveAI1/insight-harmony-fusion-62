
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { Character, CharacterBehavioralModulation } from '../types/characterTraitTypes';
import { EmotionalTriggersProfile } from '../../services/persona/types/trait-profile';
import { v4 as uuidv4 } from 'uuid';

export function buildCharacterMetadata(formData: HistoricalCharacterFormData, aiGeneratedTraits: any) {
  return {
    // Core user inputs
    name: formData.name,
    date_of_birth: formData.date_of_birth,
    age: parseInt(formData.age) || 30,
    location: formData.location,
    description: formData.description,
    
    // AI-generated details
    gender: aiGeneratedTraits.gender || 'not specified',
    ethnicity: aiGeneratedTraits.ethnicity || 'not specified',
    social_class: aiGeneratedTraits.social_class || 'middle class',
    region: aiGeneratedTraits.region || 'Europe',
    
    // Physical appearance (AI-generated)
    height_build: aiGeneratedTraits.physical_appearance?.height_build || 'average height and build',
    hair: aiGeneratedTraits.physical_appearance?.hair || 'brown hair',
    eye_color: aiGeneratedTraits.physical_appearance?.eye_color || 'brown eyes',
    skin_tone: aiGeneratedTraits.physical_appearance?.skin_tone || 'natural complexion',
    
    // Character details (AI-generated)
    backstory: aiGeneratedTraits.backstory || 'Generated from character description',
    personality_traits: aiGeneratedTraits.personality_traits || 'Generated personality traits',
    appearance: aiGeneratedTraits.appearance || 'Generated appearance description',
    occupation: aiGeneratedTraits.occupation || 'Generated occupation',
    historical_context: aiGeneratedTraits.historical_context || 'Generated historical context',
  };
}

export function buildTraitProfile(aiGeneratedTraits: any) {
  return {
    ...aiGeneratedTraits,
    physical_appearance: {
      height_build: aiGeneratedTraits.physical_appearance?.height_build || 'average height and build',
      hair: aiGeneratedTraits.physical_appearance?.hair || 'brown hair',
      eye_color: aiGeneratedTraits.physical_appearance?.eye_color || 'brown eyes',
      skin_tone: aiGeneratedTraits.physical_appearance?.skin_tone || 'natural complexion',
      ethnicity: aiGeneratedTraits.physical_appearance?.ethnicity || 'not specified',
    },
  };
}

export function buildBehavioralModulation(): CharacterBehavioralModulation {
  return {
    formality: 0.8,
    enthusiasm: 0.6,
    assertiveness: 0.7,
    empathy: 0.6,
    patience: 0.7,
  };
}

export function buildLinguisticProfile(aiGeneratedTraits: any, formData: HistoricalCharacterFormData) {
  return {
    default_output_length: 'medium',
    speech_register: 'formal',
    regional_influence: aiGeneratedTraits.region || formData.location || 'European',
    professional_or_educational_influence: aiGeneratedTraits.occupation || null,
    cultural_speech_patterns: 'Historical speech patterns',
    generational_or_peer_influence: null,
    speaking_style: {
      formal: true,
      casual: false,
      technical: false,
      storytelling: true,
    },
    sample_phrasing: [],
  };
}

export function buildEmotionalTriggers(): EmotionalTriggersProfile {
  return {
    positive_triggers: [],
    negative_triggers: [],
  };
}

export function buildPhysicalAppearance(aiGeneratedTraits: any) {
  return {
    height_build: aiGeneratedTraits.physical_appearance?.height_build || 'average height and build',
    hair: aiGeneratedTraits.physical_appearance?.hair || 'brown hair',
    eye_color: aiGeneratedTraits.physical_appearance?.eye_color || 'brown eyes',
    skin_tone: aiGeneratedTraits.physical_appearance?.skin_tone || 'natural complexion',
    ethnicity: aiGeneratedTraits.physical_appearance?.ethnicity || 'not specified',
  };
}

export function buildCharacter(
  formData: HistoricalCharacterFormData,
  aiGeneratedTraits: any,
  characterId: string,
  currentDate: string
): Character {
  const metadata = buildCharacterMetadata(formData, aiGeneratedTraits);
  const trait_profile = buildTraitProfile(aiGeneratedTraits);
  const behavioral_modulation = buildBehavioralModulation();
  const linguistic_profile = buildLinguisticProfile(aiGeneratedTraits, formData);
  const emotional_triggers = buildEmotionalTriggers();
  const physical_appearance = buildPhysicalAppearance(aiGeneratedTraits);

  return {
    character_id: characterId,
    name: formData.name,
    character_type: 'historical',
    creation_date: currentDate,
    created_at: currentDate,
    metadata,
    behavioral_modulation,
    interview_sections: [],
    linguistic_profile,
    preinterview_tags: [],
    simulation_directives: {},
    trait_profile,
    emotional_triggers,
    is_public: false,
    enhanced_metadata_version: 2,
    age: parseInt(formData.age) || 30,
    gender: aiGeneratedTraits.gender || 'not specified',
    social_class: aiGeneratedTraits.social_class || 'middle class',
    region: aiGeneratedTraits.region || 'Europe',
    physical_appearance,
  };
}
