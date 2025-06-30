
import { CharacterBehavioralModulation } from '../types/characterTraitTypes';
import { EmotionalTriggersProfile } from '../../services/persona/types/trait-profile';
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { generateCharacterEmotionalTriggers } from './emotionalTriggerGenerator';

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

export function buildEmotionalTriggers(
  formData: HistoricalCharacterFormData, 
  aiGeneratedTraits: any
): EmotionalTriggersProfile {
  console.log('🎭 Building emotional triggers for character:', formData.name);
  return generateCharacterEmotionalTriggers(formData, aiGeneratedTraits);
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
