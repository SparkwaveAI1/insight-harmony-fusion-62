
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";
import { toast } from "sonner";
import { savePersonaImage } from "./personaImageService";

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
    
    console.log("Successfully generated image URL from OpenAI:", response.image_url);
    
    // Use the new savePersonaImage function to both save to storage and record in persona_images
    const storedImageUrl = await savePersonaImage(persona.persona_id, response.image_url);
    
    if (!storedImageUrl) {
      console.error("Failed to save persona image");
      toast.error("Generated image but failed to save it");
      return response.image_url; // Return the temporary URL as fallback
    }
    
    console.log("Persona image successfully saved:", storedImageUrl);
    return storedImageUrl;
  } catch (error) {
    console.error("Error in generatePersonaImage:", error);
    toast.error("An unexpected error occurred while generating the persona image");
    return null;
  }
};
