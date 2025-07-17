
import { Character, DbCharacter } from '../types/characterTraitTypes';

export function characterToDbCharacter(character: Character): DbCharacter {
  return {
    id: character.id,
    character_id: character.character_id,
    name: character.name,
    character_type: character.character_type,
    creation_source: character.creation_source || 'historical', // Default for backwards compatibility
    creation_date: character.creation_date,
    created_at: character.created_at,
    metadata: character.metadata,
    behavioral_modulation: character.behavioral_modulation,
    interview_sections: character.interview_sections,
    linguistic_profile: character.linguistic_profile,
    preinterview_tags: character.preinterview_tags,
    simulation_directives: character.simulation_directives,
    trait_profile: character.trait_profile,
    emotional_triggers: character.emotional_triggers,
    prompt: character.prompt,
    user_id: character.user_id,
    is_public: character.is_public,
    profile_image_url: character.profile_image_url,
    enhanced_metadata_version: character.enhanced_metadata_version,
    age: character.age,
    gender: character.gender,
    historical_period: character.historical_period,
    social_class: character.social_class,
    region: character.region,
    physical_appearance: character.physical_appearance,
    origin_universe: character.origin_universe,
    species_type: character.species_type,
    form_factor: character.form_factor,
  };
}

export function dbCharacterToCharacter(dbCharacter: DbCharacter): Character {
  return {
    id: dbCharacter.id,
    character_id: dbCharacter.character_id,
    name: dbCharacter.name,
    character_type: dbCharacter.character_type,
    creation_source: dbCharacter.creation_source || 'historical', // Default for backwards compatibility
    creation_date: dbCharacter.creation_date,
    created_at: dbCharacter.created_at || dbCharacter.creation_date,
    metadata: dbCharacter.metadata,
    behavioral_modulation: dbCharacter.behavioral_modulation,
    interview_sections: dbCharacter.interview_sections,
    linguistic_profile: dbCharacter.linguistic_profile,
    preinterview_tags: dbCharacter.preinterview_tags,
    simulation_directives: dbCharacter.simulation_directives,
    trait_profile: dbCharacter.trait_profile,
    emotional_triggers: dbCharacter.emotional_triggers,
    prompt: dbCharacter.prompt,
    user_id: dbCharacter.user_id,
    is_public: dbCharacter.is_public,
    profile_image_url: dbCharacter.profile_image_url,
    enhanced_metadata_version: dbCharacter.enhanced_metadata_version,
    age: dbCharacter.age,
    gender: dbCharacter.gender,
    historical_period: dbCharacter.historical_period,
    social_class: dbCharacter.social_class,
    region: dbCharacter.region,
    physical_appearance: dbCharacter.physical_appearance,
    origin_universe: dbCharacter.origin_universe,
    species_type: dbCharacter.species_type,
    form_factor: dbCharacter.form_factor,
  };
}
