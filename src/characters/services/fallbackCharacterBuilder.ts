
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { Character } from '../types/characterTraitTypes';
import { generateFallbackTraits } from './fallbackTraitsGenerator';
import { 
  buildBehavioralModulation, 
  buildLinguisticProfile, 
  buildEmotionalTriggers
} from './characterProfiles';
import { buildCharacterMetadata } from './characterMetadata';

export function buildFallbackCharacter(
  formData: HistoricalCharacterFormData,
  characterId: string,
  currentDate: string
): Character {
  const fallbackTraits = generateFallbackTraits(formData);
  
  // Create a comprehensive mock AI-generated traits object that mimics what the persona system receives
  // This ensures we use the same intelligent assignment logic as the main builder
  const mockAiGeneratedTraits = {
    // Core personality traits from fallback generator
    ...fallbackTraits,
    
    // Demographic fields that would normally come from AI generation or user input
    // Set to null so buildCharacterMetadata can handle intelligent assignment
    gender: null, // Will be assigned based on prompt analysis or probability
    ethnicity: null,
    race_ethnicity: null,
    cultural_background: null,
    occupation: null,
    social_class: null,
    social_class_identity: null,
    region: null,
    marital_status: null,
    education_level: null,
    
    // Physical appearance fields
    physical_appearance: {
      height_build: null,
      hair: null,
      eye_color: null,
      skin_tone: null,
      ethnicity: null,
    },
    height: null,
    build_body_type: null,
    hair_color: null,
    hair_style: null,
    eye_color: null,
    skin_tone: null,
    
    // Relationship and family dynamics
    relationships_family: null, // Will be assigned based on age and marital status
    
    // Health and background
    physical_health_status: null,
    mental_health_status: null,
    fitness_activity_level: null,
    religious_affiliation: null,
    religious_practice_level: null,
    language_proficiency: null,
    
    // Context fields from form data (these take precedence)
    personality_traits: formData.personality_traits,
    backstory: formData.backstory,
    historical_context: formData.historical_context,
    
    // Location data from form
    location: formData.location,
    birthplace: formData.location,
    location_history: {
      grew_up_in: formData.location,
      current_residence: formData.location,
      places_lived: [formData.location]
    }
  };
  
  // Use the same intelligent assignment logic as the main builder
  // This will handle AI-generated -> user-specified -> probability-based assignment
  const metadata = buildCharacterMetadata(formData, mockAiGeneratedTraits);
  
  const trait_profile = {
    ...fallbackTraits,
    physical_appearance: {
      height_build: metadata.height + ' and ' + metadata.build_body_type,
      hair: metadata.hair_color + ' hair',
      eye_color: metadata.eye_color,
      skin_tone: metadata.skin_tone,
      ethnicity: metadata.race_ethnicity,
    },
  };

  const behavioral_modulation = buildBehavioralModulation();
  const linguistic_profile = buildLinguisticProfile(mockAiGeneratedTraits, formData);
  const emotional_triggers = buildEmotionalTriggers(formData, mockAiGeneratedTraits);

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
      height_build: metadata.height + ' and ' + metadata.build_body_type,
      hair: metadata.hair_color + ' hair',
      eye_color: metadata.eye_color,
      skin_tone: metadata.skin_tone,
      ethnicity: metadata.race_ethnicity,
    },
  };
}
