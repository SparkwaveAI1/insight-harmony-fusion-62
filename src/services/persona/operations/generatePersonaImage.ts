
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";
import { toast } from "sonner";
import { savePersonaProfileImage } from "@/services/supabase/storage/imageUploadService";
import { updatePersonaProfileImageUrl } from "./updatePersona";

export interface GenerateImageResponse {
  success: boolean;
  image_url?: string;
  prompt?: string;
  error?: string;
}

export const generatePersonaImage = async (persona: Persona): Promise<string | null> => {
  try {
    console.log("Generating image for persona:", persona.persona_id);
    
    const { data, error } = await supabase.functions.invoke('generate-persona-image', {
      body: { personaData: persona }
    });

    if (error) {
      console.error("Error calling generate-persona-image function:", error);
      toast.error("Failed to generate persona image");
      return null;
    }
    
    const response = data as GenerateImageResponse;
    
    if (!response.success || !response.image_url) {
      console.error("Image generation failed:", response.error || "No image URL returned");
      toast.error("Failed to generate persona image");
      return null;
    }
    
    console.log("Successfully generated persona image:", response.image_url);
    
    // Save the generated image to Supabase storage and update the persona record
    const storedImageUrl = await savePersonaProfileImage(persona.persona_id, response.image_url);
    
    if (!storedImageUrl) {
      console.error("Failed to save persona image to storage");
      toast.error("Generated image but failed to save it permanently");
      
      // Attempt direct database update with the temporary URL as a fallback
      console.log("Attempting direct database update with temporary URL...");
      const { data: updateResult, error: updateError } = await supabase
        .from('personas')
        .update({ profile_image_url: response.image_url })
        .eq('persona_id', persona.persona_id)
        .select('profile_image_url')
        .single();
        
      if (updateError) {
        console.error("Direct database update failed:", updateError);
        // Return the temporary URL anyway so the user can see the image
        return response.image_url;
      }
      
      console.log("Direct database update result:", updateResult);
      return updateResult.profile_image_url;
    }
    
    // Double-check if the persona record was updated correctly
    console.log("Stored image URL:", storedImageUrl);
    console.log("Verifying persona record was updated with this URL...");
    
    // Fetch the persona again to verify the update
    const { data: updatedPersona, error: fetchError } = await supabase
      .from('personas')
      .select('profile_image_url')
      .eq('persona_id', persona.persona_id)
      .single();
      
    if (fetchError) {
      console.error("Error verifying persona update:", fetchError);
      // Return stored URL even if verification failed
      return storedImageUrl;
    } else {
      console.log("Persona record now has profile_image_url:", updatedPersona?.profile_image_url);
      if (updatedPersona?.profile_image_url !== storedImageUrl) {
        console.warn("Image URL mismatch! Expected:", storedImageUrl, "Got:", updatedPersona?.profile_image_url);
        
        // Try one more update if there's a mismatch
        const { error: retryError } = await supabase
          .from('personas')
          .update({ profile_image_url: storedImageUrl })
          .eq('persona_id', persona.persona_id);
          
        if (retryError) {
          console.error("Failed to update persona with correct URL on retry:", retryError);
        } else {
          console.log("Successfully updated persona with correct URL on retry");
        }
      }
    }
    
    console.log("Persona image saved to database:", storedImageUrl);
    return storedImageUrl;
  } catch (error) {
    console.error("Error in generatePersonaImage:", error);
    toast.error("An unexpected error occurred while generating the persona image");
    return null;
  }
};
