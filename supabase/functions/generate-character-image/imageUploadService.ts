
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

export async function uploadImageToStorage(
  base64Image: string, 
  characterId: string, 
  supabaseUrl: string, 
  serviceRoleKey: string
): Promise<string> {
  console.log("Uploading character image to Supabase storage");
  
  // Initialize Supabase client with service role key for server-side operations
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // Convert base64 to blob
  const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
  const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
  
  // Generate a unique file name
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${characterId}_${timestamp}.png`;
  
  console.log(`Uploading to character-images storage with filename: ${fileName}`);
  
  // Upload the image to Supabase storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('character-images')
    .upload(fileName, imageBlob, {
      contentType: 'image/png',
      upsert: false,
      cacheControl: '3600'
    });
    
  if (uploadError) {
    console.error('Error uploading character image to storage:', uploadError);
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }
  
  console.log('Successfully uploaded character image to storage:', uploadData);
  
  // Get the public URL for the uploaded image
  const { data: urlData } = supabase
    .storage
    .from('character-images')
    .getPublicUrl(fileName);
    
  const publicUrl = urlData.publicUrl;
  console.log('Generated public URL for character image:', publicUrl);
  
  return publicUrl;
}

export async function updateCharacterWithImageUrl(
  characterId: string, 
  imageUrl: string, 
  supabaseUrl: string, 
  serviceRoleKey: string
): Promise<void> {
  console.log('Updating character record with new image URL');
  console.log('Character ID:', characterId);
  console.log('Image URL:', imageUrl);
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // First try to update the humanoid characters table
  console.log('Trying to update characters table...');
  const { data: characterData, error: characterError } = await supabase
    .from('characters')
    .update({ profile_image_url: imageUrl })
    .eq('character_id', characterId)
    .select();
    
  if (!characterError && characterData && characterData.length > 0) {
    console.log('Successfully updated character record with image URL:', characterData[0]);
    return;
  }
  
  // If not found in characters table, try non_humanoid_characters table
  console.log('Character not found in characters table, trying non_humanoid_characters table...');
  const { data: nonHumanoidData, error: nonHumanoidError } = await supabase
    .from('non_humanoid_characters')
    .update({ profile_image_url: imageUrl })
    .eq('character_id', characterId)
    .select();
    
  if (nonHumanoidError) {
    console.error('Error updating non_humanoid_characters table:', nonHumanoidError);
    throw new Error(`Failed to update non-humanoid character: ${nonHumanoidError.message}`);
  }
  
  if (nonHumanoidData && nonHumanoidData.length > 0) {
    console.log('Successfully updated non-humanoid character record with image URL:', nonHumanoidData[0]);
  } else {
    console.log('Character not found in either table');
    throw new Error('Character not found - unable to update with image URL');
  }
}
