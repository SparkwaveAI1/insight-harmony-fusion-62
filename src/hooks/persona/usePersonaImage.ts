
import { useState } from "react";
import { toast } from "sonner";
import { Persona } from "@/services/persona/types";
import { 
  generatePersonaImage, 
  getPersonaByPersonaId
} from "@/services/persona";

/**
 * Hook for handling persona image functionality
 */
export function usePersonaImage(personaId: string | undefined, persona: Persona | null) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isImageMigrating, setIsImageMigrating] = useState(false);

  // Check if an image URL is from OpenAI (temporary) rather than Supabase storage
  const isOpenAIImageUrl = (url?: string): boolean => {
    if (!url) return false;
    return url.includes('oaidalleapiprodscus.blob.core') || 
           url.includes('api.openai.com');
  };

  // Handle image generation with improved error handling
  const handleImageGenerated = async () => {
    if (!personaId || !persona) return null;
    
    setIsGeneratingImage(true);
    
    try {
      // Use a timeout to prevent hanging
      const generatePromise = generatePersonaImage(persona);
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn("Image generation timed out");
          resolve(null);
        }, 30000); // 30 second timeout
      });
      
      // Race between the generation and timeout
      const result = await Promise.race([generatePromise, timeoutPromise]);
      
      if (!result) {
        console.error("Image generation timed out or failed");
        return null;
      }
      
      // Attempt to refresh persona data to get the latest image URL
      try {
        const refreshedPersona = await getPersonaByPersonaId(personaId);
        if (refreshedPersona?.profile_image_url) {
          return refreshedPersona.profile_image_url;
        }
      } catch (refreshError) {
        console.error("Error refreshing persona data:", refreshError);
      }
      
      return result; // Return the image URL from generation
      
    } catch (error) {
      console.error("Error generating profile image:", error);
      return null;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return {
    isGeneratingImage,
    isImageMigrating,
    handleImageGenerated,
    isOpenAIImageUrl
  };
}
