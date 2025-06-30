
import { CharacterBehavioralModulation, CharacterLinguisticProfile, CharacterEmotionalSystem } from '../types/characterLinguisticTypes';
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';

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

export function buildLinguisticProfile(aiGeneratedTraits: any, formData: HistoricalCharacterFormData): CharacterLinguisticProfile {
  return {
    communication_style: 'formal',
    vocabulary_complexity: 'moderate',
    speech_patterns: ['descriptive', 'analytical', 'historical'],
    formality_level: 0.8,
    expressiveness: 0.6,
    cultural_speech_markers: [aiGeneratedTraits.region || formData.location || 'European'],
  };
}

export function buildEmotionalSystem(
  formData: HistoricalCharacterFormData, 
  aiGeneratedTraits: any
): CharacterEmotionalSystem {
  console.log('🎭 Building emotional system for character:', formData.name);
  return {
    core_drives: aiGeneratedTraits.personality_traits || [formData.personality_traits || 'Historical accuracy'],
    surface_triggers: ['historical events', 'social interactions', 'cultural references'],
    emotional_responses: {
      change_response_style: 'gradual adaptation based on historical context'
    }
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
