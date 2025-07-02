
import { supabase } from '@/integrations/supabase/client';
import { CreativeCharacter, CreativeCharacterData } from '../types/creativeCharacterTypes';
import { CreativeCharacterBuilder } from './creativeCharacterBuilder';
import { dbResultToCreativeCharacter, creativeCharacterToDbFormat } from './creativeCharacterTypeMappers';

export async function createCreativeCharacter(
  data: CreativeCharacterData, 
  userId: string
): Promise<CreativeCharacter> {
  console.log('Creating Character Lab character with data:', data);
  console.log('User ID:', userId);

  try {
    // Build the Character Lab character using the new builder
    const character = CreativeCharacterBuilder.buildCharacter(data, userId);

    console.log('Built Character Lab character object:', character);

    // Convert to database-compatible format
    const dbCharacter = creativeCharacterToDbFormat(character);

    // Insert into the database
    const { data: insertedData, error } = await supabase
      .from('characters')
      .insert(dbCharacter)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to save character: ${error.message}`);
    }

    console.log('Successfully created Character Lab character:', insertedData);
    
    // Convert back to CreativeCharacter type for return
    return dbResultToCreativeCharacter(insertedData);

  } catch (error) {
    console.error('Error in createCreativeCharacter:', error);
    throw error;
  }
}

// Character Lab character retrieval
export async function getCreativeCharacter(characterId: string): Promise<CreativeCharacter | null> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('character_id', characterId)
      .eq('creation_source', 'creative')
      .single();

    if (error) {
      console.error('Error fetching creative character:', error);
      return null;
    }

    return dbResultToCreativeCharacter(data);
  } catch (error) {
    console.error('Error in getCreativeCharacter:', error);
    return null;
  }
}

// Get all Character Lab characters
export async function getCreativeCharacters(userId: string): Promise<CreativeCharacter[]> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .eq('creation_source', 'creative')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching creative characters:', error);
      return [];
    }

    return (data || []).map(dbResultToCreativeCharacter);
  } catch (error) {
    console.error('Error in getCreativeCharacters:', error);
    return [];
  }
}
