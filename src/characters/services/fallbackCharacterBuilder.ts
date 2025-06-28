
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { Character } from '../types/characterTraitTypes';
import { generateFallbackTraits } from './fallbackTraitsGenerator';
import { 
  buildBehavioralModulation, 
  buildLinguisticProfile, 
  buildEmotionalTriggers 
} from './characterBuilder';

export function buildFallbackCharacter(
  formData: HistoricalCharacterFormData,
  characterId: string,
  currentDate: string
): Character {
  const fallbackTraits = generateFallbackTraits(formData);
  
  const trait_profile = {
    ...fallbackTraits,
    physical_appearance: {
      height_build: 'average height and build',
      hair: 'brown hair',
      eye_color: 'brown eyes',
      skin_tone: 'natural complexion',
      ethnicity: 'not specified',
    },
  };

  const behavioral_modulation = buildBehavioralModulation();
  const linguistic_profile = buildLinguisticProfile({}, formData);
  const emotional_triggers = buildEmotionalTriggers();

  const metadata = {
    name: formData.name,
    date_of_birth: formData.date_of_birth,
    age: parseInt(formData.age) || 30,
    location: formData.location,
    description: formData.description,
    gender: 'not specified',
    ethnicity: 'not specified',
    social_class: 'middle class',
    region: 'Europe',
    height_build: 'average height and build',
    hair: 'brown hair',
    eye_color: 'brown eyes',
    skin_tone: 'natural complexion',
    backstory: 'Generated from user description',
    personality_traits: 'To be determined from description',
    appearance: 'Average appearance for the historical period',
    occupation: 'To be determined from description',
    historical_context: 'Historical context based on date and location',
  };

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
    gender: 'not specified',
    social_class: 'middle class',
    region: 'Europe',
    physical_appearance: {
      height_build: 'average height and build',
      hair: 'brown hair',
      eye_color: 'brown eyes',
      skin_tone: 'natural complexion',
      ethnicity: 'not specified',
    },
  };
}
