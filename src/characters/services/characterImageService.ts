
import { supabase } from '@/integrations/supabase/client';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';

type AnyCharacter = Character | NonHumanoidCharacter;

export async function generateCharacterImage(character: AnyCharacter): Promise<string | null> {
  try {
    console.log('Generating character image for:', character.name);
    console.log('Character type check - has species_type:', 'species_type' in character);
    
    const { data, error } = await supabase.functions.invoke('generate-character-image', {
      body: { characterData: character }
    });

    if (error) {
      console.error('Error generating character image:', error);
      throw new Error(error.message || 'Failed to generate character image');
    }

    if (!data?.success || !data?.image_url) {
      console.error('Invalid response from character image generation:', data);
      throw new Error('Invalid response from image generation service');
    }

    console.log('Successfully generated character image:', data.image_url);
    return data.image_url;
  } catch (error) {
    console.error('Error in generateCharacterImage:', error);
    throw error;
  }
}

export async function uploadCharacterImageFromUrl(
  characterId: string, 
  imageUrl: string
): Promise<string | null> {
  try {
    console.log(`Uploading character image for ${characterId} from URL:`, imageUrl);
    
    if (!imageUrl) {
      console.error('Invalid image URL: empty string');
      return null;
    }
    
    // Validate the URL format
    try {
      new URL(imageUrl);
    } catch (e) {
      console.error('Invalid image URL format:', e);
      return null;
    }
    
    // Fetch the image from the URL
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch image from URL: ${response.status} ${response.statusText}`);
      return null;
    }
    
    // Convert the image to a blob
    const imageBlob = await response.blob();
    console.log(`Downloaded image blob, size: ${imageBlob.size} bytes, type: ${imageBlob.type}`);
    
    if (imageBlob.size === 0) {
      console.error('Downloaded image is empty (0 bytes)');
      return null;
    }
    
    // Generate a unique file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${characterId}_${timestamp}.png`;
    
    console.log(`Uploading to Supabase storage with filename: ${fileName}`);
    
    // Upload the image to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('character-images')
      .upload(fileName, imageBlob, {
        contentType: imageBlob.type,
        upsert: false,
        cacheControl: '3600'
      });
      
    if (error) {
      console.error('Error uploading character image to storage:', error);
      return null;
    }
    
    console.log('Successfully uploaded to storage:', data);
    
    // Get the public URL for the uploaded image
    const { data: urlData } = supabase
      .storage
      .from('character-images')
      .getPublicUrl(fileName);
      
    console.log('Generated public URL:', urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadCharacterImageFromUrl:', error);
    return null;
  }
}

export async function updateCharacterProfileImage(
  characterId: string, 
  imageUrl: string
): Promise<boolean> {
  try {
    console.log(`Updating character ${characterId} with new profile image URL:`, imageUrl);
    
    const { error } = await supabase
      .from('characters')
      .update({ profile_image_url: imageUrl })
      .eq('character_id', characterId);
    
    if (error) {
      console.error('Failed to update character with image URL:', error);
      return false;
    }
    
    console.log('Character record updated with new profile image URL');
    return true;
  } catch (error) {
    console.error('Error in updateCharacterProfileImage:', error);
    return false;
  }
}

export async function saveCharacterProfileImage(
  characterId: string, 
  imageUrl: string
): Promise<string | null> {
  try {
    console.log(`Starting process to save profile image for character: ${characterId}`);
    console.log(`Original OpenAI URL: ${imageUrl}`);
    
    // Upload the image and get the storage URL
    const storageUrl = await uploadCharacterImageFromUrl(characterId, imageUrl);
    
    if (!storageUrl) {
      console.error('Failed to upload image to storage, trying direct database update as fallback');
      
      // Fall back to using the original URL directly
      const directUpdateSuccess = await updateCharacterProfileImage(characterId, imageUrl);
      
      if (directUpdateSuccess) {
        console.log('Successfully saved original OpenAI URL as fallback');
        return imageUrl;
      }
      
      console.error('Both storage upload and direct update failed');
      return null;
    }
    
    console.log(`Successfully uploaded to storage: ${storageUrl}`);
    
    // Update the character record with the new image URL
    const updated = await updateCharacterProfileImage(characterId, storageUrl);
    
    if (!updated) {
      console.error('Failed to update character with new image URL');
      return null;
    }
    
    console.log(`Successfully saved profile image for character ${characterId}:`, storageUrl);
    return storageUrl;
  } catch (error) {
    console.error('Error in saveCharacterProfileImage:', error);
    return null;
  }
}
