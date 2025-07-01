
import { CreativeCharacterData } from '../types/characterTraitTypes';
import { generateCreativeCharacterTraits } from './creativeCharacterGenerator';
import { buildCreativeCharacter } from './creativeCharacterBuilder';
import { saveCharacter } from './unifiedCharacterService';
import { v4 as uuidv4 } from 'uuid';

export const createCreativeCharacter = async (
  formData: CreativeCharacterData,
  userId: string
): Promise<any> => {
  console.log('=== CREATING UNIFIED CREATIVE CHARACTER ===');
  console.log('Form data:', formData);
  console.log('User ID:', userId);

  if (!userId) {
    throw new Error('User ID is required');
  }

  const characterId = uuidv4();
  const currentDate = new Date().toISOString();

  try {
    // Generate comprehensive character traits using AI
    console.log('Generating AI-powered creative character traits...');
    const aiGeneratedTraits = await generateCreativeCharacterTraits(formData);
    
    console.log('Successfully generated AI traits for creative character');

    // Build the unified character object with creation_source = 'creative'
    const character = buildCreativeCharacter(
      formData, 
      aiGeneratedTraits, 
      characterId, 
      currentDate,
      userId
    );

    // Save using the unified character service
    const savedCharacter = await saveCharacter(character);
    
    console.log('✅ Creative character created and saved successfully:', savedCharacter.character_id);
    return savedCharacter;

  } catch (error) {
    console.error('Error creating creative character:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create creative character');
  }
};
