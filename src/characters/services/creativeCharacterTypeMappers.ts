
import { CreativeCharacter, DbCreativeCharacter } from '../types/creativeCharacterTypes';
import { Character } from '../types/characterTraitTypes';

/**
 * Maps CreativeCharacter to Character for component compatibility
 */
export function creativeCharacterToCharacter(creativeCharacter: CreativeCharacter): Character {
  return {
    id: creativeCharacter.id,
    character_id: creativeCharacter.character_id,
    name: creativeCharacter.name,
    character_type: creativeCharacter.character_type as 'historical' | 'fictional' | 'multi_species',
    creation_source: 'creative',
    creation_date: creativeCharacter.creation_date,
    created_at: creativeCharacter.created_at,
    metadata: creativeCharacter.metadata,
    behavioral_modulation: creativeCharacter.behavioral_modulation,
    interview_sections: creativeCharacter.interview_sections,
    linguistic_profile: creativeCharacter.linguistic_profile,
    preinterview_tags: creativeCharacter.preinterview_tags,
    simulation_directives: creativeCharacter.simulation_directives,
    trait_profile: {
      ...creativeCharacter.trait_profile,
      // Convert communication method from object to string for backward compatibility
      communication_method: typeof creativeCharacter.trait_profile?.communication_method === 'object' 
        ? creativeCharacter.trait_profile.communication_method?.modality || 'unknown'
        : creativeCharacter.trait_profile?.communication_method
    },
    // Handle emotional_triggers - convert to the expected EmotionalTriggersProfile format
    ...(creativeCharacter.emotional_triggers && {
      emotional_triggers: {
        positive_triggers: creativeCharacter.emotional_triggers.positive_triggers.map(trigger => ({
          keywords: [trigger],
          emotion_type: 'positive',
          intensity_multiplier: 0.5,
          description: `Positive response to ${trigger}` // Add required description field
        })),
        negative_triggers: creativeCharacter.emotional_triggers.negative_triggers.map(trigger => ({
          keywords: [trigger],
          emotion_type: 'negative',
          intensity_multiplier: 0.5,
          description: `Negative response to ${trigger}` // Add required description field
        }))
      }
    }),
    prompt: creativeCharacter.prompt,
    user_id: creativeCharacter.user_id,
    is_public: creativeCharacter.is_public,
    profile_image_url: creativeCharacter.profile_image_url,
    enhanced_metadata_version: creativeCharacter.enhanced_metadata_version,
    age: creativeCharacter.age,
    gender: creativeCharacter.gender,
    historical_period: creativeCharacter.historical_period,
    social_class: creativeCharacter.social_class,
    region: creativeCharacter.region,
    physical_appearance: creativeCharacter.physical_appearance,
    origin_universe: creativeCharacter.origin_universe,
    species_type: creativeCharacter.species_type,
    form_factor: creativeCharacter.form_factor
  };
}

/**
 * Maps database result to CreativeCharacter with proper type handling
 */
export function dbResultToCreativeCharacter(dbRow: any): CreativeCharacter {
  return {
    id: dbRow.id,
    character_id: dbRow.character_id,
    name: dbRow.name,
    character_type: dbRow.character_type as 'fictional' | 'multi_species',
    creation_source: 'creative',
    creation_date: dbRow.creation_date,
    created_at: dbRow.created_at || dbRow.creation_date,
    user_id: dbRow.user_id,
    metadata: typeof dbRow.metadata === 'object' && dbRow.metadata !== null ? dbRow.metadata : {},
    behavioral_modulation: typeof dbRow.behavioral_modulation === 'object' && dbRow.behavioral_modulation !== null 
      ? dbRow.behavioral_modulation : {},
    interview_sections: Array.isArray(dbRow.interview_sections) ? dbRow.interview_sections : [],
    linguistic_profile: typeof dbRow.linguistic_profile === 'object' && dbRow.linguistic_profile !== null
      ? dbRow.linguistic_profile : {},
    preinterview_tags: Array.isArray(dbRow.preinterview_tags) ? dbRow.preinterview_tags : [],
    simulation_directives: typeof dbRow.simulation_directives === 'object' && dbRow.simulation_directives !== null
      ? dbRow.simulation_directives : {},
    trait_profile: typeof dbRow.trait_profile === 'object' && dbRow.trait_profile !== null
      ? dbRow.trait_profile : {},
    // Handle emotional_triggers conditionally - only include if it exists and is properly structured
    ...(dbRow.emotional_triggers && 
        typeof dbRow.emotional_triggers === 'object' && 
        dbRow.emotional_triggers !== null &&
        (dbRow.emotional_triggers.positive_triggers || dbRow.emotional_triggers.negative_triggers) && {
      emotional_triggers: {
        positive_triggers: Array.isArray(dbRow.emotional_triggers.positive_triggers) 
          ? dbRow.emotional_triggers.positive_triggers 
          : [],
        negative_triggers: Array.isArray(dbRow.emotional_triggers.negative_triggers) 
          ? dbRow.emotional_triggers.negative_triggers 
          : []
      }
    }),
    prompt: dbRow.prompt || undefined,
    is_public: dbRow.is_public || false,
    profile_image_url: dbRow.profile_image_url || undefined,
    enhanced_metadata_version: dbRow.enhanced_metadata_version || undefined,
    age: dbRow.age || undefined,
    gender: dbRow.gender || undefined,
    historical_period: dbRow.historical_period || undefined,
    social_class: dbRow.social_class || undefined,
    region: dbRow.region || undefined,
    physical_appearance: typeof dbRow.physical_appearance === 'object' && dbRow.physical_appearance !== null
      ? dbRow.physical_appearance : undefined,
    origin_universe: dbRow.origin_universe || undefined,
    species_type: dbRow.species_type || undefined,
    form_factor: dbRow.form_factor || undefined
  };
}

/**
 * Maps CreativeCharacter to database format with proper JSON serialization
 */
export function creativeCharacterToDbFormat(character: CreativeCharacter): any {
  return {
    id: character.id,
    character_id: character.character_id,
    name: character.name,
    character_type: character.character_type,
    creation_source: character.creation_source,
    creation_date: character.creation_date,
    created_at: character.created_at,
    user_id: character.user_id,
    metadata: character.metadata || {},
    behavioral_modulation: character.behavioral_modulation || {},
    interview_sections: character.interview_sections || [],
    linguistic_profile: character.linguistic_profile || {},
    preinterview_tags: character.preinterview_tags || [],
    simulation_directives: character.simulation_directives || {},
    trait_profile: character.trait_profile || {},
    emotional_triggers: character.emotional_triggers || null,
    prompt: character.prompt || null,
    is_public: character.is_public || false,
    profile_image_url: character.profile_image_url || null,
    enhanced_metadata_version: character.enhanced_metadata_version || null,
    age: character.age || null,
    gender: character.gender || null,
    historical_period: character.historical_period || null,
    social_class: character.social_class || null,
    region: character.region || null,
    physical_appearance: character.physical_appearance || null,
    origin_universe: character.origin_universe || null,
    species_type: character.species_type || null,
    form_factor: character.form_factor || null
  };
}
