
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { Character } from '../types/characterTraitTypes';
import { generateFallbackTraits } from './fallbackTraitsGenerator';
import { 
  buildBehavioralModulation, 
  buildLinguisticProfile, 
  buildEmotionalTriggers,
  buildCharacterMetadata 
} from './characterBuilder';

export function buildFallbackCharacter(
  formData: HistoricalCharacterFormData,
  characterId: string,
  currentDate: string
): Character {
  const fallbackTraits = generateFallbackTraits(formData);
  
  // Use user-specified traits first, then fallback traits, then probability-based assignment
  const enhancedFallbackTraits = {
    ...fallbackTraits,
    gender: formData.gender || fallbackTraits.gender,
    ethnicity: formData.ethnicity || fallbackTraits.ethnicity,
    occupation: formData.occupation || fallbackTraits.occupation,
    social_class: formData.social_class || fallbackTraits.social_class,
    region: formData.region || fallbackTraits.region,
    personality_traits: formData.personality_traits || fallbackTraits.personality_traits,
    backstory: formData.backstory || fallbackTraits.backstory,
    historical_context: formData.historical_context || fallbackTraits.historical_context,
  };
  
  // Use the same intelligent assignment as the main builder
  const metadata = buildCharacterMetadata(formData, enhancedFallbackTraits);
  
  const trait_profile = {
    ...enhancedFallbackTraits,
    physical_appearance: {
      height_build: 'average height and build',
      hair: 'brown hair',
      eye_color: 'brown eyes',
      skin_tone: 'natural complexion',
      ethnicity: metadata.race_ethnicity,
    },
  };

  const behavioral_modulation = buildBehavioralModulation();
  const linguistic_profile = buildLinguisticProfile(enhancedFallbackTraits, formData);
  const emotional_triggers = buildEmotionalTriggers();

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
    gender: metadata.gender,
    social_class: metadata.social_class_identity,
    region: metadata.region,
    physical_appearance: {
      height_build: 'average height and build',
      hair: 'brown hair',
      eye_color: 'brown eyes',
      skin_tone: 'natural complexion',
      ethnicity: metadata.race_ethnicity,
    },
  };
}
