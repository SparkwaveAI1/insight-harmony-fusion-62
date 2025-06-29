
import { supabase } from '@/integrations/supabase/client';

export interface CharacterImage {
  id: string;
  character_id: string;
  original_url?: string;
  storage_url: string;
  file_path: string;
  generation_prompt?: string;
  physical_attributes?: any;
  created_at: string;
  is_current: boolean;
}

export async function getCharacterImages(characterId: string): Promise<CharacterImage[]> {
  try {
    console.log('Fetching images for character:', characterId);
    
    const { data, error } = await supabase
      .from('character_images')
      .select('*')
      .eq('character_id', characterId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching character images:', error);
      throw error;
    }

    console.log('Found character images:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in getCharacterImages:', error);
    throw error;
  }
}

export async function saveCharacterImage(
  characterId: string,
  storageUrl: string,
  filePath: string,
  originalUrl?: string,
  generationPrompt?: string,
  physicalAttributes?: any,
  isCurrent: boolean = false
): Promise<CharacterImage | null> {
  try {
    console.log('Saving character image:', { characterId, storageUrl, filePath, isCurrent });
    
    // If isCurrent is true, first set all other images for this character to not current
    if (isCurrent) {
      const { error: updateError } = await supabase
        .from('character_images')
        .update({ is_current: false })
        .eq('character_id', characterId);
      
      if (updateError) {
        console.error('Error updating current images:', updateError);
        // Don't throw here, continue with insert
      }
    }
    
    const { data, error } = await supabase
      .from('character_images')
      .insert({
        character_id: characterId,
        storage_url: storageUrl,
        file_path: filePath,
        original_url: originalUrl || storageUrl,
        generation_prompt: generationPrompt || '',
        physical_attributes: physicalAttributes || {},
        is_current: isCurrent
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving character image:', error);
      throw error;
    }

    console.log('Saved character image:', data);
    return data;
  } catch (error) {
    console.error('Error in saveCharacterImage:', error);
    throw error;
  }
}

export async function setCurrentCharacterImage(characterId: string, imageId: string): Promise<boolean> {
  try {
    console.log('Setting current image for character:', characterId, 'imageId:', imageId);
    
    // First, set all images for this character to not current
    const { error: updateAllError } = await supabase
      .from('character_images')
      .update({ is_current: false })
      .eq('character_id', characterId);

    if (updateAllError) {
      console.error('Error updating all character images:', updateAllError);
      throw updateAllError;
    }

    // Then set the specific image as current
    const { error } = await supabase
      .from('character_images')
      .update({ is_current: true })
      .eq('character_id', characterId)
      .eq('id', imageId);

    if (error) {
      console.error('Error setting current character image:', error);
      throw error;
    }

    console.log('Successfully set current character image');
    return true;
  } catch (error) {
    console.error('Error in setCurrentCharacterImage:', error);
    return false;
  }
}

export async function updateCharacterWithImageUrl(characterId: string, imageUrl: string): Promise<boolean> {
  try {
    console.log('Updating character profile image:', characterId, imageUrl);
    
    // First try humanoid characters table
    const { data: humanoidData, error: humanoidError } = await supabase
      .from('characters')
      .update({ profile_image_url: imageUrl })
      .eq('character_id', characterId)
      .select();
    
    if (!humanoidError && humanoidData && humanoidData.length > 0) {
      console.log('Updated humanoid character profile image');
      return true;
    }
    
    // Try non-humanoid characters table
    const { data: nonHumanoidData, error: nonHumanoidError } = await supabase
      .from('non_humanoid_characters')
      .update({ profile_image_url: imageUrl })
      .eq('character_id', characterId)
      .select();
    
    if (nonHumanoidError) {
      console.error('Error updating character profile image:', nonHumanoidError);
      throw nonHumanoidError;
    }
    
    if (nonHumanoidData && nonHumanoidData.length > 0) {
      console.log('Updated non-humanoid character profile image');
      return true;
    }
    
    console.log('Character not found in either table');
    return false;
  } catch (error) {
    console.error('Error in updateCharacterWithImageUrl:', error);
    return false;
  }
}

export async function deleteCharacterImage(imageId: string): Promise<boolean> {
  try {
    console.log('Deleting character image:', imageId);
    
    const { error } = await supabase
      .from('character_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      console.error('Error deleting character image:', error);
      throw error;
    }

    console.log('Successfully deleted character image');
    return true;
  } catch (error) {
    console.error('Error in deleteCharacterImage:', error);
    return false;
  }
}

export async function getCurrentCharacterImage(characterId: string): Promise<CharacterImage | null> {
  try {
    console.log('Getting current image for character:', characterId);
    
    const { data, error } = await supabase
      .from('character_images')
      .select('*')
      .eq('character_id', characterId)
      .eq('is_current', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error getting current character image:', error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error in getCurrentCharacterImage:', error);
    return null;
  }
}
