
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Function to resize image to optimize file size
async function resizeImage(base64Image: string, maxSize: number = 400): Promise<string> {
  try {
    // Note: Canvas operations not available in Deno edge functions
    // Return original image for now
    return base64Image;
  } catch (error) {
    console.warn('Failed to resize image, using original:', error);
    return base64Image; // Fallback to original
  }
}

// Helper function to upload to Supabase with custom path
async function uploadToSupabase(
  base64Image: string, 
  filePath: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<string> {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const file = new File([buffer], filePath, { type: 'image/jpeg' });

    const { data, error } = await supabase.storage
      .from('persona-images')
      .upload(filePath, file, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('persona-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadToSupabase:', error);
    throw error;
  }
}

// New function to upload both full and thumbnail versions
export async function uploadImageWithThumbnail(
  base64Image: string,
  personaId: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<{ fullUrl: string; thumbnailUrl: string }> {
  const timestamp = Date.now();
  const fullPath = `full/${personaId}_${timestamp}.jpg`;
  const thumbPath = `thumbnails/${personaId}_${timestamp}.jpg`;
  
  // Upload full-size image
  const fullUrl = await uploadToSupabase(base64Image, fullPath, supabaseUrl, serviceRoleKey);
  
  // For now, upload same image as thumbnail (512x512 is already smaller)
  // This creates the folder structure we need
  const thumbnailUrl = await uploadToSupabase(base64Image, thumbPath, supabaseUrl, serviceRoleKey);
  
  return { fullUrl, thumbnailUrl };
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
  serviceRoleKey: string,
  thumbnailUrl?: string
): Promise<void> {
  console.log('Updating persona record with new image URL');
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  const updateData: { profile_image_url: string; profile_thumbnail_url?: string } = {
    profile_image_url: imageUrl
  };
  
  if (thumbnailUrl) {
    updateData.profile_thumbnail_url = thumbnailUrl;
  }
  
  const { error: updateError } = await supabase
    .from('v4_personas')
    .update(updateData)
    .eq('persona_id', personaId);
    
  if (updateError) {
    console.error('Error updating persona with image URL:', updateError);
    throw new Error(`Failed to update persona: ${updateError.message}`);
  }
  
  console.log('Successfully updated persona record');
}
