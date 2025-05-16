
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { updatePersonaProfileImageUrl } from '@/services/persona/operations/updatePersona';

// Upload a persona profile image from a URL
export async function uploadPersonaImageFromUrl(
  personaId: string, 
  imageUrl: string
): Promise<string | null> {
  try {
    console.log(`Uploading image for persona ${personaId} from URL`);
    
    // Fetch the image from the URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.status}`);
    }
    
    // Convert the image to a blob
    const imageBlob = await response.blob();
    
    // Generate a unique file name
    const fileName = `${personaId}_${uuidv4()}.png`;
    
    // Upload the image to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('persona-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        upsert: true
      });
      
    if (error) {
      console.error('Error uploading persona image to storage:', error);
      throw error;
    }
    
    // Get the public URL for the uploaded image
    const { data: urlData } = supabase
      .storage
      .from('persona-images')
      .getPublicUrl(fileName);
      
    console.log('Image uploaded successfully, public URL:', urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadPersonaImageFromUrl:', error);
    return null;
  }
}

// Update persona record with new profile image URL - using the new function
export async function updatePersonaProfileImage(
  personaId: string, 
  imageUrl: string
): Promise<boolean> {
  try {
    console.log(`Updating persona ${personaId} with new profile image URL`);
    
    // Use the new function from updatePersona.ts
    const success = await updatePersonaProfileImageUrl(personaId, imageUrl);
    
    if (!success) {
      throw new Error('Failed to update persona with image URL');
    }
    
    console.log('Persona record updated with new profile image URL');
    return true;
  } catch (error) {
    console.error('Error in updatePersonaProfileImage:', error);
    return false;
  }
}

// Save persona profile image - combined operation
export async function savePersonaProfileImage(
  personaId: string, 
  imageUrl: string
): Promise<string | null> {
  try {
    // Upload the image and get the storage URL
    const storageUrl = await uploadPersonaImageFromUrl(personaId, imageUrl);
    
    if (!storageUrl) {
      throw new Error('Failed to upload image to storage');
    }
    
    // Update the persona record with the new image URL
    const updated = await updatePersonaProfileImage(personaId, storageUrl);
    
    if (!updated) {
      throw new Error('Failed to update persona with new image URL');
    }
    
    return storageUrl;
  } catch (error) {
    console.error('Error in savePersonaProfileImage:', error);
    return null;
  }
}
