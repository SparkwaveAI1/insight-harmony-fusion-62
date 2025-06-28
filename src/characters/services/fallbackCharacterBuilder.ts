
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
  
  // Create a mock AI-generated traits object with the fallback traits
  // This allows us to use the same intelligent assignment logic as the main builder
  const mockAiGeneratedTraits = {
    ...fallbackTraits,
    // Add demographic fields that would normally come from AI generation
    gender: formData.gender || null, // Let the metadata builder handle probability assignment
    ethnicity: formData.ethnicity || null,
    race_ethnicity: formData.ethnicity || null,
    occupation: formData.occupation || null,
    social_class: formData.social_class || null,
    social_class_identity: formData.social_class || null,
    region: formData.region || null,
    personality_traits: formData.personality_traits || null,
    backstory: formData.backstory || null,
    historical_context: formData.historical_context || null,
  };
  
  // Use the same intelligent assignment as the main builder
  const metadata = buildCharacterMetadata(formData, mockAiGeneratedTraits);
  
  const trait_profile = {
    ...fallbackTraits,
    physical_appearance: {
      height_build: 'average height and build',
      hair: 'brown hair',
      eye_color: 'brown eyes',
      skin_tone: 'natural complexion',
      ethnicity: metadata.race_ethnicity,
    },
  };

  const behavioral_modulation = buildBehavioralModulation();
  const linguistic_profile = buildLinguisticProfile(mockAiGeneratedTraits, formData);
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
