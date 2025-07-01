
import { supabase } from '@/integrations/supabase/client';
import { CreativeCharacter, CreativeCharacterData, DbCreativeCharacter } from '../types/creativeCharacterTypes';
import { CreativeCharacterBuilder } from './creativeCharacterBuilder';

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
    const dbCharacter: DbCreativeCharacter = {
      ...character,
      // Ensure JSON fields are properly serialized
      trait_profile: character.trait_profile as any,
      metadata: character.metadata as any,
      behavioral_modulation: character.behavioral_modulation as any,
      linguistic_profile: character.linguistic_profile as any
      // NO emotional_triggers field
    };

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
    return {
      ...insertedData,
      trait_profile: insertedData.trait_profile as any,
      metadata: insertedData.metadata as any,
      behavioral_modulation: insertedData.behavioral_modulation as any,
      linguistic_profile: insertedData.linguistic_profile as any
      // NO emotional_triggers field
    } as CreativeCharacter;

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

    // Convert database JSON fields back to proper types
    return {
      ...data,
      trait_profile: data.trait_profile as any,
      metadata: data.metadata as any,
      behavioral_modulation: data.behavioral_modulation as any,
      linguistic_profile: data.linguistic_profile as any
      // NO emotional_triggers field
    } as CreativeCharacter;
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

    // Convert database JSON fields back to proper types
    return (data || []).map(item => ({
      ...item,
      trait_profile: item.trait_profile as any,
      metadata: item.metadata as any,
      behavioral_modulation: item.behavioral_modulation as any,
      linguistic_profile: item.linguistic_profile as any
      // NO emotional_triggers field
    })) as CreativeCharacter[];
  } catch (error) {
    console.error('Error in getCreativeCharacters:', error);
    return [];
  }
}
