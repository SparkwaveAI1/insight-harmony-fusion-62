
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { Character } from '../types/characterTraitTypes';
import { v4 as uuidv4 } from 'uuid';
import { buildCharacterMetadata } from './characterMetadata';
import { 
  buildTraitProfile, 
  buildBehavioralModulation, 
  buildLinguisticProfile, 
  buildEmotionalSystem, 
  buildPhysicalAppearance 
} from './characterProfiles';

export function buildCharacter(
  formData: HistoricalCharacterFormData,
  aiGeneratedTraits: any,
  characterId: string,
  currentDate: string
): Character {
  console.log('🏗️ Building character with enhanced emotional system:', formData.name);
  
  const metadata = buildCharacterMetadata(formData, aiGeneratedTraits);
  const trait_profile = buildTraitProfile(aiGeneratedTraits);
  const behavioral_modulation = buildBehavioralModulation();
  const linguistic_profile = buildLinguisticProfile(aiGeneratedTraits, formData);
  const emotional_system = buildEmotionalSystem(formData, aiGeneratedTraits);
  const physical_appearance = buildPhysicalAppearance(aiGeneratedTraits);

  console.log('✅ Character built with emotional system:', emotional_system);

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
    emotional_system,
    is_public: false,
    enhanced_metadata_version: 2,
    age: parseInt(formData.age) || 30,
    gender: metadata.gender, // Use the properly determined gender
    social_class: metadata.social_class_identity,
    region: metadata.region,
    physical_appearance,
  };
}

// Re-export the metadata builder for backwards compatibility
export { buildCharacterMetadata } from './characterMetadata';
