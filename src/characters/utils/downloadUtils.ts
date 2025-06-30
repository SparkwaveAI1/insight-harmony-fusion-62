
import { Character } from '../types/characterTraitTypes';

export const downloadCharacterAsJSON = (character: Character) => {
  // Create a clean copy of the character data
  const characterData = {
    character_id: character.character_id,
    id: character.id,
    name: character.name,
    character_type: character.character_type,
    creation_date: character.creation_date,
    created_at: character.created_at,
    metadata: character.metadata,
    trait_profile: character.trait_profile,
    behavioral_modulation: character.behavioral_modulation,
    linguistic_profile: character.linguistic_profile,
    emotional_system: character.emotional_system,
    interview_sections: character.interview_sections,
    simulation_directives: character.simulation_directives,
    preinterview_tags: character.preinterview_tags,
    prompt: character.prompt,
    user_id: character.user_id,
    is_public: character.is_public,
    profile_image_url: character.profile_image_url,
    enhanced_metadata_version: character.enhanced_metadata_version,
    age: character.age,
    gender: character.gender,
    social_class: character.social_class,
    region: character.region,
    physical_appearance: character.physical_appearance
  };

  // Convert to formatted JSON
  const jsonString = JSON.stringify(characterData, null, 2);
  
  // Create blob and download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `character-${character.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${character.character_id}.json`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
