
import { Character, DbCharacter } from '../types/characterTraitTypes';

export const characterToDbCharacter = (character: Character): DbCharacter => {
  console.log('=== MAPPING CHARACTER TO DB CHARACTER ===');
  console.log('Input character:', character);
  
  const dbCharacter: DbCharacter = {
    character_id: character.character_id,
    name: character.name,
    character_type: character.character_type || 'historical',
    creation_date: character.creation_date,
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
    // Map new demographic fields
    age: character.age,
    gender: character.gender,
    historical_period: character.historical_period,
    social_class: character.social_class,
    region: character.region,
    physical_appearance: character.physical_appearance,
  };
  
  console.log('Mapped DB character:', dbCharacter);
  return dbCharacter;
};

export const dbCharacterToCharacter = (dbCharacter: DbCharacter): Character => {
  console.log('=== MAPPING DB CHARACTER TO CHARACTER ===');
  console.log('Input DB character:', dbCharacter);
  
  const character: Character = {
    id: dbCharacter.id || '',
    character_id: dbCharacter.character_id,
    name: dbCharacter.name,
    character_type: dbCharacter.character_type || 'historical',
    creation_date: dbCharacter.creation_date,
    created_at: dbCharacter.created_at || new Date().toISOString(),
    metadata: dbCharacter.metadata || {},
    behavioral_modulation: dbCharacter.behavioral_modulation || {},
    interview_sections: dbCharacter.interview_sections || [],
    linguistic_profile: dbCharacter.linguistic_profile || {},
    preinterview_tags: dbCharacter.preinterview_tags || [],
    simulation_directives: dbCharacter.simulation_directives || {},
    trait_profile: dbCharacter.trait_profile || {},
    emotional_triggers: dbCharacter.emotional_triggers,
    prompt: dbCharacter.prompt,
    user_id: dbCharacter.user_id,
    is_public: dbCharacter.is_public || false,
    profile_image_url: dbCharacter.profile_image_url,
    enhanced_metadata_version: dbCharacter.enhanced_metadata_version || 1,
    // Map new demographic fields
    age: dbCharacter.age,
    gender: dbCharacter.gender,
    historical_period: dbCharacter.historical_period,
    social_class: dbCharacter.social_class,
    region: dbCharacter.region,
    physical_appearance: dbCharacter.physical_appearance || {},
  };
  
  console.log('Mapped character:', character);
  return character;
};
