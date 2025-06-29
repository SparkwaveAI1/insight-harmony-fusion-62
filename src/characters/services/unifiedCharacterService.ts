
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import { 
  getCharacterById as getHumanoidCharacterById, 
  getCharacterByCharacterId as getHumanoidCharacterByCharacterId,
  getAllCharacters as getAllHumanoidCharacters
} from './characterService';
import { 
  getNonHumanoidCharacterById, 
  getNonHumanoidCharacterByCharacterId,
  getAllNonHumanoidCharacters
} from './nonHumanoidCharacterService';

export type UnifiedCharacter = Character | NonHumanoidCharacter;

// Helper function to determine if a character is non-humanoid
export const isNonHumanoidCharacter = (character: UnifiedCharacter): character is NonHumanoidCharacter => {
  return 'species_type' in character && character.character_type === 'multi_species';
};

export const getAnyCharacterById = async (id: string): Promise<UnifiedCharacter | null> => {
  console.log('=== FETCHING ANY CHARACTER BY ID ===');
  console.log('ID:', id);

  try {
    // Try humanoid first
    const humanoidCharacter = await getHumanoidCharacterById(id);
    if (humanoidCharacter) {
      console.log('✅ Found humanoid character');
      return humanoidCharacter;
    }

    // Try non-humanoid
    const nonHumanoidCharacter = await getNonHumanoidCharacterById(id);
    if (nonHumanoidCharacter) {
      console.log('✅ Found non-humanoid character');
      return nonHumanoidCharacter;
    }

    console.log('No character found with ID:', id);
    return null;
  } catch (error) {
    console.error('Error in getAnyCharacterById:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching character');
  }
};

export const getAnyCharacterByCharacterId = async (characterId: string): Promise<UnifiedCharacter | null> => {
  console.log('=== FETCHING ANY CHARACTER BY CHARACTER_ID ===');
  console.log('Character ID:', characterId);

  try {
    // Try humanoid first
    const humanoidCharacter = await getHumanoidCharacterByCharacterId(characterId);
    if (humanoidCharacter) {
      console.log('✅ Found humanoid character');
      return humanoidCharacter;
    }

    // Try non-humanoid
    const nonHumanoidCharacter = await getNonHumanoidCharacterByCharacterId(characterId);
    if (nonHumanoidCharacter) {
      console.log('✅ Found non-humanoid character');
      return nonHumanoidCharacter;
    }

    console.log('No character found with character_id:', characterId);
    return null;
  } catch (error) {
    console.error('Error in getAnyCharacterByCharacterId:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching character');
  }
};

export const getAllUnifiedCharacters = async (): Promise<UnifiedCharacter[]> => {
  console.log('=== FETCHING ALL UNIFIED CHARACTERS ===');

  try {
    const [humanoidCharacters, nonHumanoidCharacters] = await Promise.all([
      getAllHumanoidCharacters(),
      getAllNonHumanoidCharacters()
    ]);

    const allCharacters = [...humanoidCharacters, ...nonHumanoidCharacters];
    
    // Sort by creation date (most recent first)
    allCharacters.sort((a, b) => {
      const dateA = new Date(a.created_at || a.creation_date);
      const dateB = new Date(b.created_at || b.creation_date);
      return dateB.getTime() - dateA.getTime();
    });

    console.log(`✅ Fetched ${allCharacters.length} total characters (${humanoidCharacters.length} humanoid, ${nonHumanoidCharacters.length} non-humanoid)`);
    return allCharacters;
  } catch (error) {
    console.error('Error in getAllUnifiedCharacters:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching characters');
  }
};
