
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Function to resize image to optimize file size
async function resizeImage(base64Image: string, maxSize: number = 400): Promise<string> {
  try {
    // Create canvas and context
    // Use regular canvas for Deno compatibility
    const canvas = document.createElement('canvas');
    canvas.width = maxSize;
    canvas.height = maxSize;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Convert base64 to image
    const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    const imageBitmap = await createImageBitmap(imageBlob);
    
    // Calculate scaling to maintain aspect ratio
    const { width: originalWidth, height: originalHeight } = imageBitmap;
    const scale = Math.min(maxSize / originalWidth, maxSize / originalHeight);
    const newWidth = originalWidth * scale;
    const newHeight = originalHeight * scale;
    
    // Set canvas size to the new dimensions
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    // Draw and resize image
    ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight);
    
    // Convert back to blob and then base64
    const resizedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
    const resizedBuffer = await resizedBlob.arrayBuffer();
    const resizedBase64 = btoa(String.fromCharCode(...new Uint8Array(resizedBuffer)));
    
    console.log(`Resized image from ${originalWidth}x${originalHeight} to ${newWidth}x${newHeight}`);
    return resizedBase64;
  } catch (error) {
    console.warn('Failed to resize image, using original:', error);
    return base64Image; // Fallback to original
  }
}

export async function uploadImageToStorage(
  base64Image: string, 
  personaId: string, 
  supabaseUrl: string, 
  serviceRoleKey: string
): Promise<string> {
  console.log("Uploading image to Supabase storage");
  
  // Initialize Supabase client with service role key for server-side operations
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // Resize image for optimization (400px max, JPEG format)
  const resizedBase64 = await resizeImage(base64Image, 400);
  
  // Convert resized base64 to blob
  const imageBuffer = Uint8Array.from(atob(resizedBase64), c => c.charCodeAt(0));
  const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });
  
  // Generate a unique file name with .jpg extension
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${personaId}_${timestamp}.jpg`;
  
  console.log(`Uploading to storage with filename: ${fileName}`);
  
  // Upload the image to Supabase storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('persona-images')
    .upload(fileName, imageBlob, {
      contentType: 'image/jpeg',
      upsert: false,
      cacheControl: '3600'
    });
    
  if (uploadError) {
    console.error('Error uploading image to storage:', uploadError);
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }
  
  console.log('Successfully uploaded to storage:', uploadData);
  
  // Get the public URL for the uploaded image
  const { data: urlData } = supabase
    .storage
    .from('persona-images')
    .getPublicUrl(fileName);
    
  const publicUrl = urlData.publicUrl;
  console.log('Generated public URL:', publicUrl);
  
  return publicUrl;
}

export async function updatePersonaWithImageUrl(
  personaId: string, 
  imageUrl: string, 
  supabaseUrl: string, 
  serviceRoleKey: string
): Promise<void> {
  console.log('Updating persona record with new image URL');
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  const { error: updateError } = await supabase
    .from('v4_personas')
    .update({ profile_image_url: imageUrl })
    .eq('persona_id', personaId);
    
  if (updateError) {
    console.error('Error updating persona with image URL:', updateError);
    throw new Error(`Failed to update persona: ${updateError.message}`);
  }
  
  console.log('Successfully updated persona record');
}
