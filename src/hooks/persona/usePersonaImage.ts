
import { useState } from "react";
import { toast } from "sonner";
import { Persona } from "@/services/persona/types";
import { 
  generatePersonaImage, 
  getPersonaByPersonaId, 
  savePersonaImage 
} from "@/services/persona";

/**
 * Hook for handling persona image functionality
 */
export function usePersonaImage(personaId: string | undefined, persona: Persona | null) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Check if an image URL is from OpenAI (temporary) rather than Supabase storage
  const isOpenAIImageUrl = (url?: string): boolean => {
    if (!url) return false;
    return url.includes('oaidalleapiprodscus.blob.core') || 
           url.includes('api.openai.com');
  };

  // Ensure OpenAI images are saved to Supabase storage
  const ensureImagePersistence = async (loadedPersona: Persona): Promise<Persona> => {
    if (!loadedPersona.profile_image_url || !isOpenAIImageUrl(loadedPersona.profile_image_url)) {
      return loadedPersona;
    }

    console.log("Detected OpenAI temporary URL, saving to permanent storage:", loadedPersona.profile_image_url);
    
    try {
      // Use the savePersonaImage function
      const storedImageUrl = await savePersonaImage(
        loadedPersona.persona_id, 
        loadedPersona.profile_image_url
      );
      
      if (storedImageUrl) {
        console.log("Successfully migrated OpenAI image to Supabase storage:", storedImageUrl);
        return {
          ...loadedPersona,
          profile_image_url: storedImageUrl
        };
      }
      
      console.error("Failed to migrate OpenAI image to Supabase storage");
      return {
        ...loadedPersona,
        profile_image_url: undefined // Clear the expired URL
      };
    } catch (error) {
      console.error("Error migrating OpenAI image to Supabase storage:", error);
      return {
        ...loadedPersona,
        profile_image_url: undefined // Clear the expired URL
      };
    }
  };

  // Handle image generation
  const handleImageGenerated = async () => {
    if (!personaId || !persona) return null;
    
    setIsGeneratingImage(true);
    
    try {
      toast.info("Generating profile image...");
      const imageUrl = await generatePersonaImage(persona);
      
      if (imageUrl) {
        toast.success("Profile image generated and saved successfully");
        
        // Force reload the persona to ensure we have the updated image URL
        const refreshedPersona = await getPersonaByPersonaId(personaId);
        console.log("Refreshed persona data with new image:", refreshedPersona?.profile_image_url);
        
        return refreshedPersona?.profile_image_url || imageUrl;
      } else {
        toast.error("Failed to generate profile image");
        return null;
      }
    } catch (error) {
      console.error("Error generating profile image:", error);
      toast.error("An error occurred while generating the profile image");
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return {
    isGeneratingImage,
    ensureImagePersistence,
    handleImageGenerated,
    isOpenAIImageUrl
  };
}
