
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { Character } from '../types/characterTraitTypes';
import { v4 as uuidv4 } from 'uuid';
import { buildCharacterMetadata } from './characterMetadata';
import { 
  buildTraitProfile, 
  buildBehavioralModulation, 
  buildLinguisticProfile, 
  buildEmotionalTriggers, 
  buildPhysicalAppearance 
} from './characterProfiles';

export function buildCharacter(
  formData: HistoricalCharacterFormData,
  aiGeneratedTraits: any,
  characterId: string,
  currentDate: string
): Character {
  console.log('🏗️ Building character with enhanced emotional triggers:', formData.name);
  
  const metadata = buildCharacterMetadata(formData, aiGeneratedTraits);
  const trait_profile = buildTraitProfile(aiGeneratedTraits);
  const behavioral_modulation = buildBehavioralModulation();
  const linguistic_profile = buildLinguisticProfile(aiGeneratedTraits, formData);
  const emotional_triggers = buildEmotionalTriggers(formData, aiGeneratedTraits);
  const physical_appearance = buildPhysicalAppearance(aiGeneratedTraits);

  console.log('✅ Character built with', 
    emotional_triggers.positive_triggers.length, 'positive and', 
    emotional_triggers.negative_triggers.length, 'negative emotional triggers'
  );

  return {
    character_id: characterId,
    name: formData.name,
    character_type: 'historical',
    creation_source: 'historical', // Add the required field
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
    gender: metadata.gender, // Use the properly determined gender
    social_class: metadata.social_class_identity,
    region: metadata.region,
    physical_appearance,
  };
}

// Re-export the metadata builder for backwards compatibility
export { buildCharacterMetadata } from './characterMetadata';
