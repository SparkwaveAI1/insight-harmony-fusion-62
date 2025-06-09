
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
    
    // Check if bucket exists first
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return null;
    }
    
    const personaImagesBucket = buckets?.find(bucket => bucket.name === 'persona-images');
    
    if (!personaImagesBucket) {
      console.log('Persona-images bucket does not exist, creating...');
      const { error: bucketError } = await supabase.storage.createBucket('persona-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (bucketError) {
        console.error('Error creating persona-images bucket:', bucketError);
        return null;
      }
      console.log('Successfully created persona-images bucket');
    }
    
    // Fetch the image from the URL with special handling for OpenAI URLs
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for OpenAI
    
    let response;
    try {
      // Use a more comprehensive set of headers to bypass potential CORS/blocking issues
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.9',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      };
      
      // For OpenAI URLs, add referer
      if (imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')) {
        headers['Referer'] = 'https://chat.openai.com/';
        headers['Origin'] = 'https://chat.openai.com';
      }
      
      console.log('Fetching image with headers:', headers);
      
      response = await fetch(imageUrl, {
        signal: controller.signal,
        headers,
        mode: 'cors',
        credentials: 'omit'
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error(`Failed to fetch image from URL: ${fetchError.message}`);
      
      // If CORS fails, try a different approach using a proxy method
      if (fetchError.message.includes('CORS') || fetchError.message.includes('fetch')) {
        console.log('CORS error detected, trying alternative fetch method...');
        try {
          // Try without CORS mode
          response = await fetch(imageUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; PersonaAI/1.0)'
            },
            mode: 'no-cors'
          });
        } catch (secondFetchError) {
          console.error(`Second fetch attempt failed: ${secondFetchError.message}`);
          return null;
        }
      } else {
        return null;
      }
    }
    
    if (!response.ok) {
      console.error(`Failed to fetch image from URL: ${response.status} ${response.statusText}`);
      return null;
    }
    
    // Check content type
    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);
    
    if (!contentType || !contentType.startsWith('image/')) {
      console.error(`URL does not point to an image. Content-Type: ${contentType}`);
      return null;
    }
    
    // Convert the image to a blob
    const imageBlob = await response.blob();
    console.log(`Downloaded image blob, size: ${imageBlob.size} bytes, type: ${imageBlob.type}`);
    
    if (imageBlob.size === 0) {
      console.error('Downloaded image is empty (0 bytes)');
      return null;
    }
    
    // Generate a unique file name with proper extension
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = contentType.includes('png') ? 'png' : 
                         contentType.includes('jpeg') ? 'jpg' : 
                         contentType.includes('webp') ? 'webp' : 'png';
    const fileName = `${personaId}_${timestamp}_${uuidv4().substring(0, 8)}.${fileExtension}`;
    
    console.log(`Uploading to Supabase storage with filename: ${fileName}`);
    
    // Upload the image to Supabase storage
    const { data, error } = await supabase
      .storage
      .from('persona-images')
      .upload(fileName, imageBlob, {
        contentType: contentType,
        upsert: false, // Don't overwrite, create new file
        cacheControl: '3600' // 1 hour cache
      });
      
    if (error) {
      console.error('Error uploading persona image to storage:', error);
      return null;
    }
    
    console.log('Successfully uploaded to storage:', data);
    
    // Get the public URL for the uploaded image
    const { data: urlData } = supabase
      .storage
      .from('persona-images')
      .getPublicUrl(fileName);
      
    console.log('Generated public URL:', urlData.publicUrl);
    
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
      return false;
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
    console.log(`Original OpenAI URL: ${imageUrl}`);
    
    // Upload the image and get the storage URL
    const storageUrl = await uploadPersonaImageFromUrl(personaId, imageUrl);
    
    if (!storageUrl) {
      console.error('Failed to upload image to storage, trying direct database update as fallback');
      
      // Fall back to using the original URL directly
      const directUpdateSuccess = await updatePersonaProfileImage(personaId, imageUrl);
      
      if (directUpdateSuccess) {
        console.log('Successfully saved original OpenAI URL as fallback');
        return imageUrl;
      }
      
      console.error('Both storage upload and direct update failed');
      return null;
    }
    
    console.log(`Successfully uploaded to storage: ${storageUrl}`);
    
    // Update the persona record with the new image URL
    const updated = await updatePersonaProfileImage(personaId, storageUrl);
    
    if (!updated) {
      console.error('Failed to update persona with new image URL');
      return null;
    }
    
    console.log(`Successfully saved profile image for persona ${personaId}:`, storageUrl);
    return storageUrl;
  } catch (error) {
    console.error('Error in savePersonaProfileImage:', error);
    return null;
  }
}
