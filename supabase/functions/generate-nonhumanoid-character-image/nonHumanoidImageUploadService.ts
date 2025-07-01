
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

export async function uploadNonHumanoidImageToStorage(
  base64Image: string, 
  characterId: string, 
  supabaseUrl: string, 
  serviceRoleKey: string
): Promise<string> {
  console.log("Uploading non-humanoid character image to Supabase storage");
  
  // Initialize Supabase client with service role key for server-side operations
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // Convert base64 to blob
  const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
  const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
  
  // Generate a unique file name
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `nonhumanoid_${characterId}_${timestamp}.png`;
  
  console.log(`Uploading to non-humanoid-character-images storage with filename: ${fileName}`);
  
  // Upload the image to Supabase storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('non-humanoid-character-images')
    .upload(fileName, imageBlob, {
      contentType: 'image/png',
      upsert: false,
      cacheControl: '3600'
    });
    
  if (uploadError) {
    console.error('Error uploading non-humanoid character image to storage:', uploadError);
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }
  
  console.log('Successfully uploaded non-humanoid character image to storage:', uploadData);
  
  // Get the public URL for the uploaded image
  const { data: urlData } = supabase
    .storage
    .from('non-humanoid-character-images')
    .getPublicUrl(fileName);
    
  const publicUrl = urlData.publicUrl;
  console.log('Generated public URL for non-humanoid character image:', publicUrl);
  
  return publicUrl;
}

export async function saveToNonHumanoidCharacterImagesTable(
  characterId: string,
  storageUrl: string,
  filePath: string,
  originalUrl: string,
  generationPrompt: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<void> {
  console.log('Saving non-humanoid character image to non_humanoid_character_images table');
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  const { data, error } = await supabase
    .from('non_humanoid_character_images')
    .insert({
      character_id: characterId,
      storage_url: storageUrl,
      file_path: filePath,
      original_url: originalUrl,
      generation_prompt: generationPrompt,
      is_current: true // New images are set as current
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error saving to non_humanoid_character_images table:', error);
    throw new Error(`Failed to save image record: ${error.message}`);
  }
  
  console.log('Successfully saved non-humanoid character image to non_humanoid_character_images table:', data);
}

export async function updateNonHumanoidCharacterWithImageUrl(
  characterId: string, 
  imageUrl: string, 
  supabaseUrl: string, 
  serviceRoleKey: string
): Promise<void> {
  console.log('Updating non-humanoid character record with new image URL');
  console.log('Character ID:', characterId);
  console.log('Image URL:', imageUrl);
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // Update the non-humanoid characters table only
  console.log('Updating non_humanoid_characters table...');
  const { data: characterData, error: characterError } = await supabase
    .from('non_humanoid_characters')
    .update({ profile_image_url: imageUrl })
    .eq('character_id', characterId)
    .select();
    
  if (characterError) {
    console.error('Error updating non_humanoid_characters table:', characterError);
    throw new Error(`Failed to update non-humanoid character: ${characterError.message}`);
  }
  
  if (characterData && characterData.length > 0) {
    console.log('Successfully updated non-humanoid character record with image URL:', characterData[0]);
  } else {
    console.log('Non-humanoid character not found in non_humanoid_characters table');
    throw new Error('Non-humanoid character not found - unable to update with image URL');
  }
}
