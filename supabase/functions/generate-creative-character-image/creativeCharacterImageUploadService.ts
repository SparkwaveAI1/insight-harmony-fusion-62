
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export async function uploadImageToStorage(
  base64Image: string,
  characterId: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<string> {
  console.log("Uploading creative character image to storage...");
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Convert base64 to buffer
    const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
    console.log("Image buffer size:", imageBuffer.length, "bytes");
    
    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `creative-character-${characterId}-${timestamp}.png`;
    
    console.log("Uploading with filename:", fileName);
    
    const { data, error } = await supabase.storage
      .from('creative-character-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (error) {
      console.error("Error uploading creative character image:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    console.log("Upload successful, data:", data);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('creative-character-images')
      .getPublicUrl(fileName);
    
    console.log("Public URL generated:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadImageToStorage:", error);
    throw error;
  }
}

export async function updateCharacterWithImageUrl(
  characterId: string,
  imageUrl: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<void> {
  console.log("Updating creative character with image URL...");
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error } = await supabase
      .from('characters')
      .update({ profile_image_url: imageUrl })
      .eq('character_id', characterId);
    
    if (error) {
      console.error("Error updating creative character with image:", error);
      throw new Error(`Failed to update character: ${error.message}`);
    }
    
    console.log("Creative character updated with image URL successfully");
  } catch (error) {
    console.error("Error in updateCharacterWithImageUrl:", error);
    throw error;
  }
}

export async function saveToCharacterImagesTable(
  characterId: string,
  originalUrl: string,
  filePath: string,
  storageUrl: string,
  prompt: string,
  supabaseUrl: string,
  supabaseServiceKey: string
): Promise<void> {
  console.log("Saving creative character image to gallery table...");
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error } = await supabase
      .from('character_images')
      .insert({
        character_id: characterId,
        original_url: originalUrl,
        storage_url: storageUrl,
        file_path: filePath,
        generation_prompt: prompt,
        is_current: true
      });
    
    if (error) {
      console.error("Error saving creative character image to gallery:", error);
      throw new Error(`Failed to save to gallery: ${error.message}`);
    }
    
    console.log("Creative character image saved to gallery successfully");
  } catch (error) {
    console.error("Error in saveToCharacterImagesTable:", error);
    throw error;
  }
}
