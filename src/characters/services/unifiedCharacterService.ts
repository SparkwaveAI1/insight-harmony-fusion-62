
import { supabase } from '@/integrations/supabase/client';
import { Character, DbCharacter } from '../types/characterTraitTypes';
import { characterToDbCharacter, dbCharacterToCharacter } from './characterMappers';

export const saveCharacter = async (character: Character): Promise<Character> => {
  console.log('=== SAVING UNIFIED CHARACTER ===');
  console.log('Character to save:', character.character_id, 'Creation source:', character.creation_source);
  
  try {
    const dbCharacter = characterToDbCharacter(character);
    
    const { data, error } = await (supabase as any)
      .from('characters')
      .insert(dbCharacter)
      .select('*')
      .single();

    if (error) {
      console.error('Error saving character:', error);
      throw new Error(`Failed to save character: ${error.message}`);
    }

    console.log('✅ Unified character saved successfully');
    return dbCharacterToCharacter(data);
  } catch (error) {
    console.error('Error in saveCharacter:', error);
    throw error;
  }
};

export const getCharactersByCreationSource = async (creationSource: 'historical' | 'creative'): Promise<Character[]> => {
  console.log('=== GETTING CHARACTERS BY CREATION SOURCE ===');
  console.log('Creation source:', creationSource);
  
  try {
    const { data, error } = await (supabase as any)
      .from('characters')
      .select('*')
      .eq('creation_source', creationSource)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting characters:', error);
      throw new Error(`Failed to get characters: ${error.message}`);
    }

    console.log(`✅ Retrieved ${data?.length || 0} ${creationSource} characters`);
    return data ? data.map(dbCharacterToCharacter) : [];
  } catch (error) {
    console.error('Error in getCharactersByCreationSource:', error);
    throw error;
  }
};

export const getAllCreativeCharacters = async (): Promise<Character[]> => {
  return getCharactersByCreationSource('creative');
};

export const getAllHistoricalCharacters = async (): Promise<Character[]> => {
  return getCharactersByCreationSource('historical');
};

export const getCharacterById = async (id: string): Promise<Character | null> => {
  console.log('=== GETTING UNIFIED CHARACTER BY ID ===');
  console.log('Character ID:', id);
  
  try {
    const { data, error } = await (supabase as any)
      .from('characters')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error getting character:', error);
      throw new Error(`Failed to get character: ${error.message}`);
    }

    if (!data) {
      console.log('Character not found');
      return null;
    }

    console.log('✅ Unified character retrieved successfully');
    return dbCharacterToCharacter(data);
  } catch (error) {
    console.error('Error in getCharacterById:', error);
    throw error;
  }
};

export const getCharacterByCharacterId = async (characterId: string): Promise<Character | null> => {
  console.log('=== GETTING UNIFIED CHARACTER BY CHARACTER_ID ===');
  console.log('Character ID:', characterId);
  
  try {
    const { data, error } = await (supabase as any)
      .from('characters')
      .select('*')
      .eq('character_id', characterId)
      .maybeSingle();

    if (error) {
      console.error('Error getting character:', error);
      throw new Error(`Failed to get character: ${error.message}`);
    }

    if (!data) {
      console.log('Character not found');
      return null;
    }

    console.log('✅ Unified character retrieved successfully');
    return dbCharacterToCharacter(data);
  } catch (error) {
    console.error('Error in getCharacterByCharacterId:', error);
    throw error;
  }
};

export const updateCharacterVisibility = async (characterId: string, isPublic: boolean): Promise<void> => {
  console.log('=== UPDATING UNIFIED CHARACTER VISIBILITY ===');
  console.log('Character ID:', characterId, 'Public:', isPublic);
  
  try {
    const { error } = await (supabase as any)
      .from('characters')
      .update({ is_public: isPublic })
      .eq('character_id', characterId);

    if (error) {
      console.error('Error updating character visibility:', error);
      throw new Error(`Failed to update character visibility: ${error.message}`);
    }

    console.log('✅ Unified character visibility updated successfully');
  } catch (error) {
    console.error('Error in updateCharacterVisibility:', error);
    throw error;
  }
};

export const deleteCharacter = async (characterId: string): Promise<void> => {
  console.log('=== DELETING UNIFIED CHARACTER ===');
  console.log('Character ID:', characterId);
  
  try {
    const { error } = await (supabase as any)
      .from('characters')
      .delete()
      .eq('character_id', characterId);

    if (error) {
      console.error('Error deleting character:', error);
      throw new Error(`Failed to delete character: ${error.message}`);
    }

    console.log('✅ Unified character deleted successfully');
  } catch (error) {
    console.error('Error in deleteCharacter:', error);
    throw error;
  }
};
