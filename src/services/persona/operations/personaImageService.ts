
import { supabase } from "@/integrations/supabase/client";
import { uploadPersonaImageFromUrl } from "@/services/supabase/storage/imageUploadService";
import { v4 as uuidv4 } from "uuid";

// Interface for persona image records
export interface PersonaImage {
  id: string;
  persona_id: string;
  file_path: string;
  storage_url: string;
  original_url: string | null;
  created_at: string;
  is_current: boolean;
}

// Save an image URL to storage and record it in the persona_images table
export async function savePersonaImage(
  personaId: string,
  imageUrl: string
): Promise<string | null> {
  try {
    console.log(`Saving image for persona ${personaId} from URL:`, imageUrl);
    
    // 1. Upload the image to storage
    const filePath = `${personaId}/${uuidv4()}.png`;
    const storageUrl = await uploadPersonaImageFromUrl(personaId, imageUrl);
    
    if (!storageUrl) {
      console.error("Failed to upload image to storage");
      return null;
    }
    
    // 2. Record the image in the persona_images table
    const { data, error } = await supabase
      .from("persona_images")
      .insert({
        persona_id: personaId,
        file_path: filePath,
        storage_url: storageUrl,
        original_url: imageUrl,
        is_current: true // This will automatically set other images to false
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error recording persona image in database:", error);
      return null;
    }
    
    console.log("Successfully saved persona image:", data);
    
    // 3. Update the persona's profile_image_url to the new image
    await updatePersonaProfileImage(personaId, storageUrl);
    
    return storageUrl;
  } catch (error) {
    console.error("Error in savePersonaImage:", error);
    return null;
  }
}

// Update a persona's profile image URL
export async function updatePersonaProfileImage(
  personaId: string,
  imageUrl: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("personas")
      .update({ profile_image_url: imageUrl })
      .eq("persona_id", personaId);
      
    if (error) {
      console.error("Error updating persona profile image URL:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updatePersonaProfileImage:", error);
    return false;
  }
}

// Get the current image for a persona
export async function getCurrentPersonaImage(
  personaId: string
): Promise<PersonaImage | null> {
  try {
    const { data, error } = await supabase
      .from("persona_images")
      .select("*")
      .eq("persona_id", personaId)
      .eq("is_current", true)
      .single();
      
    if (error) {
      console.error("Error fetching current persona image:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getCurrentPersonaImage:", error);
    return null;
  }
}

// Get all images for a persona
export async function getPersonaImages(
  personaId: string
): Promise<PersonaImage[]> {
  try {
    const { data, error } = await supabase
      .from("persona_images")
      .select("*")
      .eq("persona_id", personaId)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Error fetching persona images:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getPersonaImages:", error);
    return [];
  }
}
