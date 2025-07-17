
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { Character } from '../types/characterTraitTypes';
import { generateFallbackTraits } from './fallbackTraitsGenerator';

export function buildFallbackCharacter(
  formData: HistoricalCharacterFormData,
  characterId: string,
  currentDate: string
): Character {
  console.log('🔧 Building fallback character with basic traits:', formData.name);
  
  const fallbackTraits = generateFallbackTraits(formData);
  
  return {
    character_id: characterId,
    name: formData.name,
    character_type: 'historical',
    creation_source: 'historical', // Add the required field
    creation_date: currentDate,
    created_at: currentDate,
    metadata: fallbackTraits.metadata,
    behavioral_modulation: fallbackTraits.behavioral_modulation,
    interview_sections: [],
    linguistic_profile: fallbackTraits.linguistic_profile,
    preinterview_tags: [],
    simulation_directives: {},
    trait_profile: fallbackTraits.trait_profile,
    emotional_triggers: fallbackTraits.emotional_triggers,
    is_public: false,
    enhanced_metadata_version: 2,
    age: parseInt(formData.age) || 30,
    gender: formData.gender || 'unspecified',
    social_class: formData.social_class || 'middle',
    region: formData.region || formData.location,
    physical_appearance: {},
  };
}
