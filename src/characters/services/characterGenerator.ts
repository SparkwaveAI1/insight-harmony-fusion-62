
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { Character } from '../types/characterTraitTypes';
import { generateCharacterTraits } from './characterTraitService';
import { buildCharacter } from './characterBuilder';
import { buildFallbackCharacter } from './fallbackCharacterBuilder';
import { v4 as uuidv4 } from 'uuid';

export const generateHistoricalCharacter = async (formData: HistoricalCharacterFormData): Promise<Character> => {
  console.log('=== GENERATING HISTORICAL CHARACTER FROM MINIMAL INPUT ===');
  console.log('Form data:', formData);

  const characterId = uuidv4();
  const currentDate = new Date().toISOString();

  try {
    // Generate comprehensive character details from the description and core inputs
    console.log('Generating AI-powered character from description...');
    const aiGeneratedTraits = await generateCharacterTraits({
      name: formData.name,
      description: formData.description,
      date_of_birth: formData.date_of_birth,
      age: parseInt(formData.age) || 30,
      location: formData.location,
      // AI will infer these from the description
      gender: formData.gender || '',
      ethnicity: formData.ethnicity || '',
      social_class: formData.social_class || '',
      region: formData.region || '',
      occupation: formData.occupation || '',
      personality_traits: formData.personality_traits || '',
      backstory: formData.backstory || '',
      historical_context: formData.historical_context || '',
    });

    console.log('Successfully generated AI traits for character from description');

    const character = buildCharacter(formData, aiGeneratedTraits, characterId, currentDate);
    console.log('Generated character with AI-powered traits from user description:', character);
    return character;

  } catch (error) {
    console.error('Error generating AI traits for character, falling back to defaults:', error);
    
    // Fallback to basic character creation if AI generation fails
    const character = buildFallbackCharacter(formData, characterId, currentDate);
    console.log('Generated character with fallback traits due to AI error');
    return character;
  }
};

// Export alias for consistency with the form component
export const generateCharacterFromFormData = generateHistoricalCharacter;
