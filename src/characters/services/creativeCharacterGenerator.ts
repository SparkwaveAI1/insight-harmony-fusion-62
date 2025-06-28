
import { CreativeCharacterFormData } from '../schemas/creativeCharacterSchema';
import { Character } from '../types/characterTraitTypes';
import { generateCharacterTraits } from './characterTraitService';
import { buildCharacter } from './characterBuilder';
import { buildFallbackCharacter } from './fallbackCharacterBuilder';
import { v4 as uuidv4 } from 'uuid';

export const generateCreativeCharacter = async (formData: CreativeCharacterFormData): Promise<Character> => {
  console.log('=== GENERATING CREATIVE CHARACTER FROM FORM DATA ===');
  console.log('Form data:', formData);

  const characterId = uuidv4();
  const currentDate = new Date().toISOString();

  try {
    // Generate comprehensive creative character details from the form inputs
    console.log('Generating AI-powered creative character...');
    const aiGeneratedTraits = await generateCharacterTraits({
      name: formData.name,
      description: formData.description,
      // Creative-specific context
      genre: formData.genre,
      species: formData.species,
      universe: formData.universe,
      magical_abilities: formData.magical_abilities || '',
      technological_augmentations: formData.technological_augmentations || '',
      power_level: formData.power_level || '',
      faction_allegiance: formData.faction_allegiance || '',
      // Set creative context for AI
      generation_type: 'creative',
      character_type: 'creative',
      // Map creative fields to expected AI service inputs
      age: 25, // Default age for creative characters
      date_of_birth: '', // Not relevant for creative characters
      location: formData.universe, // Use universe as location context
      gender: '', // Will be inferred by AI
      ethnicity: formData.species, // Use species as ethnicity context
      social_class: '', // Will be inferred by AI
      region: formData.universe,
      occupation: '', // Will be inferred by AI
      personality_traits: formData.personality_traits || '',
      backstory: formData.backstory || '',
      historical_context: `Creative character from ${formData.genre} genre in ${formData.universe}`,
    });

    console.log('Successfully generated AI traits for creative character');

    // Convert CreativeCharacterFormData to HistoricalCharacterFormData format for builder
    const builderData = {
      name: formData.name,
      description: formData.description,
      date_of_birth: '2000-01-01', // Placeholder for creative characters
      age: '25', // Default age string
      location: formData.universe,
      // Optional fields
      gender: '',
      ethnicity: formData.species,
      social_class: '',
      region: formData.universe,
      height_build: '',
      hair: '',
      eye_color: '',
      skin_tone: '',
      backstory: formData.backstory || '',
      personality_traits: formData.personality_traits || '',
      appearance: formData.appearance || '',
      occupation: '',
      historical_context: `${formData.genre} character from ${formData.universe}`,
    };

    const character = buildCharacter(builderData, aiGeneratedTraits, characterId, currentDate);
    
    // Override character type for creative characters
    character.character_type = 'creative';
    
    // Add creative-specific metadata
    if (character.metadata) {
      character.metadata.genre = formData.genre;
      character.metadata.species = formData.species;
      character.metadata.universe = formData.universe;
      character.metadata.magical_abilities = formData.magical_abilities;
      character.metadata.technological_augmentations = formData.technological_augmentations;
      character.metadata.power_level = formData.power_level;
      character.metadata.faction_allegiance = formData.faction_allegiance;
      character.metadata.character_subtype = 'creative';
    }

    console.log('Generated creative character with AI-powered traits:', character);
    return character;

  } catch (error) {
    console.error('Error generating AI traits for creative character, falling back to defaults:', error);
    
    // Fallback to basic character creation if AI generation fails
    const builderData = {
      name: formData.name,
      description: formData.description,
      date_of_birth: '2000-01-01',
      age: '25',
      location: formData.universe,
    };
    
    const character = buildFallbackCharacter(builderData, characterId, currentDate);
    character.character_type = 'creative';
    
    // Add creative-specific metadata to fallback
    if (character.metadata) {
      character.metadata.genre = formData.genre;
      character.metadata.species = formData.species;
      character.metadata.universe = formData.universe;
      character.metadata.character_subtype = 'creative';
    }
    
    console.log('Generated creative character with fallback traits due to AI error');
    return character;
  }
};

// Export alias for consistency
export const generateCharacterFromFormData = generateCreativeCharacter;
