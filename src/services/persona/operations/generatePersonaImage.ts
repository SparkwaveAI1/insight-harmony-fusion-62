
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
    
    console.log("✅ Successfully generated persona image URL:", response.image_url);
    console.log("Generated with prompt:", response.prompt);
    
    // Save the generated image to Supabase storage and update the persona record
    console.log("=== Starting image upload to Supabase storage ===");
    const storedImageUrl = await savePersonaProfileImage(persona.persona_id, response.image_url);
    
    if (!storedImageUrl) {
      console.error("❌ Failed to save persona image to storage");
      toast.error("Generated image but failed to save it permanently");
      return null;
    }
    
    console.log("✅ Successfully saved image to storage:", storedImageUrl);
    
    // Check if the URL is from Supabase storage or still the original OpenAI URL
    const isSupabaseUrl = storedImageUrl.includes('.supabase.co/storage/');
    console.log(`Image saved as: ${isSupabaseUrl ? 'Supabase storage URL' : 'OpenAI fallback URL'}`);
    
    // Verify the persona record was updated correctly
    console.log("=== Verifying persona record update ===");
    const { data: updatedPersona, error: fetchError } = await supabase
      .from('personas')
      .select('profile_image_url')
      .eq('persona_id', persona.persona_id)
      .single();
      
    if (fetchError) {
      console.error("❌ Error verifying persona update:", fetchError);
    } else {
      console.log("✅ Persona record verified, profile_image_url:", updatedPersona?.profile_image_url);
      
      if (updatedPersona?.profile_image_url !== storedImageUrl) {
        console.warn("⚠️  URL mismatch detected!");
        console.warn("Expected:", storedImageUrl);
        console.warn("Found in DB:", updatedPersona?.profile_image_url);
        
        // Try one more update if there's a mismatch
        console.log("Attempting to fix URL mismatch...");
        const { error: retryError } = await supabase
          .from('personas')
          .update({ profile_image_url: storedImageUrl })
          .eq('persona_id', persona.persona_id);
          
        if (retryError) {
          console.error("❌ Failed to fix URL mismatch:", retryError);
        } else {
          console.log("✅ Successfully fixed URL mismatch");
        }
      }
    }
    
    console.log("=== Persona image generation completed ===");
    return storedImageUrl;
  } catch (error) {
    console.error("❌ Error in generatePersonaImage:", error);
    toast.error("An unexpected error occurred while generating the persona image");
    return null;
  }
};
