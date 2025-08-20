
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";
import { toast } from "sonner";

export interface GenerateImageResponse {
  success: boolean;
  image_url?: string;
  prompt?: string;
  error?: string;
}

export const generatePersonaImage = async (persona: Persona): Promise<string | null> => {
  try {
    console.log("=== Starting persona image generation ===");
    console.log("Persona ID:", persona.persona_id);
    console.log("Persona name:", persona.name);
    
    // Transform PersonaV2 data to expected format for the edge function
    const transformedPersona = {
      persona_id: persona.persona_id,
      name: persona.name,
      metadata: {
        age: persona.persona_data?.identity?.age || 30,
        gender: persona.persona_data?.identity?.gender || 'person',
        race_ethnicity: persona.persona_data?.identity?.ethnicity || 'diverse',
        occupation: persona.persona_data?.identity?.occupation || 'professional',
        // Add other metadata fields as needed
      }
    };
    
    const { data, error } = await supabase.functions.invoke('generate-persona-image', {
      body: { personaData: transformedPersona }
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
