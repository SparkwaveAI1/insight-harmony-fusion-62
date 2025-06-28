
import { supabase } from '@/integrations/supabase/client';
import { Character, DbCharacter } from '../types/characterTraitTypes';
import { characterToDbCharacter, dbCharacterToCharacter } from './characterMappers';

export const saveCharacter = async (character: Character): Promise<Character> => {
  console.log('=== SAVING CHARACTER ===');
  console.log('Character to save:', character.character_id);
  
  try {
    const dbCharacter = characterToDbCharacter(character);
    
    // Use any to bypass TypeScript check until Supabase types are regenerated
    const { data, error } = await (supabase as any)
      .from('characters')
      .insert(dbCharacter)
      .select('*')
      .single();

    if (error) {
      console.error('Error saving character:', error);
      throw new Error(`Failed to save character: ${error.message}`);
    }

    console.log('✅ Character saved successfully');
    return dbCharacterToCharacter(data);
  } catch (error) {
    console.error('Error in saveCharacter:', error);
    throw error;
  }
};

export const getCharacterById = async (id: string): Promise<Character | null> => {
  console.log('=== GETTING CHARACTER BY ID ===');
  console.log('Character ID:', id);
  
  try {
    // Use any to bypass TypeScript check until Supabase types are regenerated
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

    console.log('✅ Character retrieved successfully');
    return dbCharacterToCharacter(data);
  } catch (error) {
    console.error('Error in getCharacterById:', error);
    throw error;
  }
};

export const getCharacterByCharacterId = async (characterId: string): Promise<Character | null> => {
  console.log('=== GETTING CHARACTER BY CHARACTER_ID ===');
  console.log('Character ID:', characterId);
  
  try {
    // Use any to bypass TypeScript check until Supabase types are regenerated
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

    console.log('✅ Character retrieved successfully');
    return dbCharacterToCharacter(data);
  } catch (error) {
    console.error('Error in getCharacterByCharacterId:', error);
    throw error;
  }
};

export const getAllCharacters = async (): Promise<Character[]> => {
  console.log('=== GETTING ALL CHARACTERS ===');
  
  try {
    // Use any to bypass TypeScript check until Supabase types are regenerated
    const { data, error } = await (supabase as any)
      .from('characters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting characters:', error);
      throw new Error(`Failed to get characters: ${error.message}`);
    }

    console.log(`✅ Retrieved ${data?.length || 0} characters`);
    return data ? data.map(dbCharacterToCharacter) : [];
  } catch (error) {
    console.error('Error in getAllCharacters:', error);
    throw error;
  }
};

export const updateCharacterVisibility = async (characterId: string, isPublic: boolean): Promise<void> => {
  console.log('=== UPDATING CHARACTER VISIBILITY ===');
  console.log('Character ID:', characterId, 'Public:', isPublic);
  
  try {
    // Use any to bypass TypeScript check until Supabase types are regenerated
    const { error } = await (supabase as any)
      .from('characters')
      .update({ is_public: isPublic })
      .eq('character_id', characterId);

    if (error) {
      console.error('Error updating character visibility:', error);
      throw new Error(`Failed to update character visibility: ${error.message}`);
    }

    console.log('✅ Character visibility updated successfully');
  } catch (error) {
    console.error('Error in updateCharacterVisibility:', error);
    throw error;
  }
};

export const updateCharacterName = async (characterId: string, name: string): Promise<void> => {
  console.log('=== UPDATING CHARACTER NAME ===');
  console.log('Character ID:', characterId, 'Name:', name);
  
  try {
    // Use any to bypass TypeScript check until Supabase types are regenerated
    const { error } = await (supabase as any)
      .from('characters')
      .update({ name })
      .eq('character_id', characterId);

    if (error) {
      console.error('Error updating character name:', error);
      throw new Error(`Failed to update character name: ${error.message}`);
    }

    console.log('✅ Character name updated successfully');
  } catch (error) {
    console.error('Error in updateCharacterName:', error);
    throw error;
  }
};

export const updateCharacterProfileImageUrl = async (characterId: string, profileImageUrl: string): Promise<void> => {
  console.log('=== UPDATING CHARACTER PROFILE IMAGE URL ===');
  console.log('Character ID:', characterId, 'Image URL:', profileImageUrl);
  
  try {
    // Use any to bypass TypeScript check until Supabase types are regenerated
    const { error } = await (supabase as any)
      .from('characters')
      .update({ profile_image_url: profileImageUrl })
      .eq('character_id', characterId);

    if (error) {
      console.error('Error updating character profile image URL:', error);
      throw new Error(`Failed to update character profile image URL: ${error.message}`);
    }

    console.log('✅ Character profile image URL updated successfully');
  } catch (error) {
    console.error('Error in updateCharacterProfileImageUrl:', error);
    throw error;
  }
};

export const deleteCharacter = async (characterId: string): Promise<void> => {
  console.log('=== DELETING CHARACTER ===');
  console.log('Character ID:', characterId);
  
  try {
    // Use any to bypass TypeScript check until Supabase types are regenerated
    const { error } = await (supabase as any)
      .from('characters')
      .delete()
      .eq('character_id', characterId);

    if (error) {
      console.error('Error deleting character:', error);
      throw new Error(`Failed to delete character: ${error.message}`);
    }

    console.log('✅ Character deleted successfully');
  } catch (error) {
    console.error('Error in deleteCharacter:', error);
    throw error;
  }
};

export const cloneCharacter = async (originalCharacter: Character, customizations: { name: string; customization_notes?: string }): Promise<Character> => {
  console.log('=== CLONING CHARACTER ===');
  console.log('Original Character:', originalCharacter.character_id);
  console.log('Customizations:', customizations);
  
  try {
    // Create a new character based on the original
    const clonedCharacter: Character = {
      ...originalCharacter,
      character_id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: customizations.name,
      creation_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_public: false, // Cloned characters are private by default
      profile_image_url: null, // Reset image URL for cloned character
    };

    // Add customization notes to metadata if provided
    if (customizations.customization_notes) {
      clonedCharacter.metadata = {
        ...clonedCharacter.metadata,
        customization_notes: customizations.customization_notes,
        cloned_from: originalCharacter.character_id
      };
    }

    // Save the cloned character
    const savedCharacter = await saveCharacter(clonedCharacter);
    console.log('✅ Character cloned successfully');
    return savedCharacter;
  } catch (error) {
    console.error('Error in cloneCharacter:', error);
    throw error;
  }
};
