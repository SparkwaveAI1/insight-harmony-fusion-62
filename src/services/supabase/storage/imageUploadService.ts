
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { updatePersonaProfileImageUrl } from '@/services/persona/operations/updatePersona';

// Ensure the required storage buckets exist
export async function ensurePersonaImageBucket(): Promise<boolean> {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'persona-images');
    
    if (!bucketExists) {
      console.log('Creating persona-images bucket...');
      const { error: createError } = await supabase.storage.createBucket('persona-images', {
        public: true
      });
      
      if (createError) {
        console.error('Error creating persona-images bucket:', createError);
        return false;
      }
      
      console.log('Successfully created persona-images bucket');
    } else {
      console.log('Persona-images bucket already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring persona-images bucket:', error);
    return false;
  }
}

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
    
    // Ensure the bucket exists
    const bucketReady = await ensurePersonaImageBucket();
    if (!bucketReady) {
      console.error('Failed to ensure persona-images bucket');
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
      return null;
    }
    
    // Update the persona record with the new image URL
    const updated = await updatePersonaProfileImageUrl(personaId, storageUrl);
    
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
