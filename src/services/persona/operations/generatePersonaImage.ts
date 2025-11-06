
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";
import { toast } from "sonner";

export interface GenerateImageResponse {
  success: boolean;
  image_url?: string;
  thumbnail_url?: string;
  prompt?: string;
  error?: string;
}

export const generatePersonaImage = async (persona: Persona): Promise<string | null> => {
  try {
    console.log("=== Starting persona image generation ===");
    console.log("Persona ID:", persona.persona_id);
    console.log("Persona name:", persona.name);
    
    const { data, error } = await supabase.functions.invoke('generate-persona-image', {
      body: { personaData: persona }
    });

    if (error) {
      console.error("Error calling generate-persona-image function:", error);
      toast.error("Failed to generate persona image");
      return null;
    }
    
    const response = data as GenerateImageResponse;
    console.log("Edge function response:", response);
    
    if (!response.success || !response.image_url) {
      console.error("Image generation failed:", response.error || "No image URL returned");
      toast.error("Failed to generate persona image");
      return null;
    }

    // Update persona with new image URLs
    const { error: updateError } = await supabase
      .from('v4_personas')
      .update({
        profile_image_url: response.image_url,
        profile_thumbnail_url: response.thumbnail_url
      })
      .eq('persona_id', persona.persona_id);

    if (updateError) {
      console.error("Failed to update persona with new image:", updateError);
      toast.error("Image generated but failed to save");
      return null;
    }
    
    console.log("✅ Successfully generated and stored persona image:", response.image_url);
    console.log("Generated with prompt:", response.prompt);
    console.log("=== Persona image generation completed ===");
    
    toast.success("Persona image generated and saved successfully!");
    
    return response.image_url;
  } catch (error) {
    console.error("❌ Error in generatePersonaImage:", error);
    toast.error("An unexpected error occurred while generating the persona image");
    return null;
  }
};
