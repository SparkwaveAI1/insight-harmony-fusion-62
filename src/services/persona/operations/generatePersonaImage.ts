
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
    
    console.log("Successfully generated image URL:", response.image_url);
    
    // Save the generated image to Supabase storage and update the persona record
    const storedImageUrl = await savePersonaProfileImage(persona.persona_id, response.image_url);
    
    if (!storedImageUrl) {
      console.error("Failed to save persona image to storage");
      toast.error("Generated image but failed to save it permanently");
      
      // Attempt direct database update with the temporary URL as a fallback
      console.log("Attempting direct database update with temporary URL...");
      await updatePersonaProfileImageUrl(persona.persona_id, response.image_url);
      return response.image_url;
    }
    
    console.log("Persona image saved to Supabase storage:", storedImageUrl);
    return storedImageUrl;
  } catch (error) {
    console.error("Error in generatePersonaImage:", error);
    toast.error("An unexpected error occurred while generating the persona image");
    return null;
  }
};
