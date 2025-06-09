
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";
import { toast } from "sonner";

export interface GenerateImageResponse {
  success: boolean;
  image_url?: string;
  prompt?: string;
  error?: string;
}

const downloadImage = async (imageUrl: string, fileName: string) => {
  try {
    console.log("Starting download from URL:", imageUrl);
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.log("✅ Image downloaded successfully:", fileName);
  } catch (error) {
    console.error("❌ Failed to download image:", error);
    toast.error("Failed to download image");
  }
};

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
    
    console.log("✅ Successfully generated and stored persona image:", response.image_url);
    console.log("Generated with prompt:", response.prompt);
    
    // Trigger download of the generated image
    const fileName = `${persona.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_persona_image.png`;
    console.log("Triggering download for image:", response.image_url);
    await downloadImage(response.image_url, fileName);
    
    console.log("=== Persona image generation completed ===");
    toast.success("Persona image generated, saved, and downloaded successfully!");
    return response.image_url;
  } catch (error) {
    console.error("❌ Error in generatePersonaImage:", error);
    toast.error("An unexpected error occurred while generating the persona image");
    return null;
  }
};
