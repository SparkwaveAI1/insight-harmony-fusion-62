
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { Character } from '../types/characterTraitTypes';
import { CharacterLinguisticProfile, CharacterEmotionalSystem, CharacterBehavioralModulation } from '../types/characterLinguisticTypes';

export function buildFallbackCharacter(
  formData: HistoricalCharacterFormData,
  characterId: string,
  currentDate: string
): Character {
  console.log('🔧 Building fallback character for:', formData.name);
  
  const fallbackTraitProfile = {
    age: parseInt(formData.age) || 30,
    gender: formData.gender || 'unknown',
    social_class: formData.social_class || 'unknown',
    occupation: formData.occupation || 'unknown',
    education_level: 'moderate',
    personality_traits: formData.personality_traits ? [formData.personality_traits] : ['thoughtful', 'curious'],
    character_background: formData.backstory || formData.description || 'A person from history',
    motivations: ['Historical accuracy', 'Sharing knowledge'],
    fears: ['Being misunderstood', 'Anachronisms'],
    goals: ['Educate others about their time period', 'Represent their era authentically'],
    physical_appearance: {
      height: 'average height',
      build_body_type: 'average build',
      hair_color: 'brown',
      hair_style: 'period appropriate',
      eye_color: 'brown',
      skin_tone: 'natural complexion'
    }
  };

  const fallbackBehavioralModulation: CharacterBehavioralModulation = {
    formality: 0.8,
    enthusiasm: 0.6,
    assertiveness: 0.7,
    empathy: 0.6,
    patience: 0.7,
  };

  const fallbackLinguisticProfile: CharacterLinguisticProfile = {
    communication_style: 'formal',
    vocabulary_complexity: 'moderate',
    speech_patterns: ['descriptive', 'analytical', 'historical'],
    formality_level: 0.8,
    expressiveness: 0.6,
    cultural_speech_markers: [formData.location || formData.region || 'European'],
  };

  const fallbackEmotionalSystem: CharacterEmotionalSystem = {
    core_drives: ['Historical accuracy', 'Knowledge sharing'],
    surface_triggers: ['Historical events', 'Cultural references', 'Social interactions'],
    emotional_responses: {
      change_response_style: 'Gradual adaptation based on historical context'
    }
  };

  const fallbackMetadata = {
    gender: formData.gender || 'unknown',
    social_class_identity: formData.social_class || 'unknown',
    region: formData.location || formData.region || 'unknown',
    occupation: formData.occupation || 'unknown',
    birth_date: formData.date_of_birth || '1900-01-01',
    creation_method: 'fallback_generation',
    description: formData.description || 'A historical figure',
    backstory: formData.backstory || 'Details about this person are limited',
  };

  return {
    character_id: characterId,
    name: formData.name,
    character_type: 'historical',
    creation_date: currentDate,
    created_at: currentDate,
    metadata: fallbackMetadata,
    behavioral_modulation: fallbackBehavioralModulation,
    interview_sections: [],
    linguistic_profile: fallbackLinguisticProfile,
    preinterview_tags: [],
    simulation_directives: {},
    trait_profile: fallbackTraitProfile,
    emotional_system: fallbackEmotionalSystem,
    is_public: false,
    enhanced_metadata_version: 2,
    age: parseInt(formData.age) || 30,
    gender: formData.gender || 'unknown',
    social_class: formData.social_class || 'unknown',
    region: formData.location || formData.region || 'unknown',
    physical_appearance: fallbackTraitProfile.physical_appearance,
  };
}
