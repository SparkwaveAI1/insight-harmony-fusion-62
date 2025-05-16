
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { updatePersonaProfileImageUrl } from '@/services/persona/operations/updatePersona';

// Upload a persona profile image from a URL
export async function uploadPersonaImageFromUrl(
  personaId: string, 
  imageUrl: string
): Promise<string | null> {
  try {
    console.log(`Uploading image for persona ${personaId} from URL:`, imageUrl);
    
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
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch image from URL: ${response.status}`);
      throw new Error(`Failed to fetch image from URL: ${response.status}`);
    }
    
    // Check content type to ensure it's an image
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.error(`URL does not point to an image. Content-Type: ${contentType}`);
      throw new Error(`URL does not point to an image. Content-Type: ${contentType}`);
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

// Update persona record with new profile image URL
export async function updatePersonaProfileImage(
  personaId: string, 
  imageUrl: string
): Promise<boolean> {
  try {
    console.log(`Updating persona ${personaId} with new profile image URL:`, imageUrl);
    
    // Use the function from updatePersona.ts
    const success = await updatePersonaProfileImageUrl(personaId, imageUrl);
    
    if (!success) {
      console.error('Failed to update persona with image URL');
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
    console.log(`Starting process to save profile image for persona: ${personaId}`);
    
    // Upload the image and get the storage URL
    const storageUrl = await uploadPersonaImageFromUrl(personaId, imageUrl);
    
    if (!storageUrl) {
      console.error('Failed to upload image to storage');
      throw new Error('Failed to upload image to storage');
    }
    
    // Update the persona record with the new image URL
    const updated = await updatePersonaProfileImage(personaId, storageUrl);
    
    if (!updated) {
      console.error('Failed to update persona with new image URL');
      throw new Error('Failed to update persona with new image URL');
    }
    
    console.log(`Successfully saved profile image for persona ${personaId}:`, storageUrl);
    return storageUrl;
  } catch (error) {
    console.error('Error in savePersonaProfileImage:', error);
    return null;
  }
}
