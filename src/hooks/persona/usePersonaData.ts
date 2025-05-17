
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Persona } from "@/services/persona/types";
import { getPersonaByPersonaId } from "@/services/persona";
import { usePersonaImage } from "./usePersonaImage";

/**
 * Hook for loading and managing persona data
 */
export function usePersonaData(personaId: string | undefined) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Use the extracted image handling hook
  const { ensureImagePersistence, isOpenAIImageUrl, isImageMigrating } = usePersonaImage(personaId, persona);

  const loadPersona = useCallback(async (id: string) => {
    if (isRetrying) return;
    
    setIsLoading(true);
    try {
      console.log("Loading persona with ID:", id);
      const data = await getPersonaByPersonaId(id);
      
      if (data) {
        console.log("Persona data loaded:", data);
        
        // Set persona immediately with current data
        setPersona(data);
        
        // Check if the image URL is potentially expired
        if (data.profile_image_url) {
          console.log("Profile image URL:", data.profile_image_url);
          
          if (isOpenAIImageUrl(data.profile_image_url)) {
            console.log("OpenAI image URL detected, attempting to migrate");
            
            try {
              // Try to migrate the image with a timeout
              const timeoutPromise = new Promise<null>((_, reject) => {
                setTimeout(() => reject(new Error("Image migration timed out")), 3000);
              });
              
              // Race between the actual migration and the timeout
              const updatedPersona = await Promise.race([
                ensureImagePersistence(data),
                timeoutPromise
              ]);
              
              if (updatedPersona) {
                setPersona(updatedPersona);
              }
            } catch (imageError) {
              console.error("Failed to process image, clearing URL:", imageError);
              // Update the persona with a cleared image URL
              setPersona(prevPersona => {
                if (!prevPersona) return data;
                return {
                  ...prevPersona,
                  profile_image_url: undefined // Clear potentially expired URL
                };
              });
            }
          }
        }
      } else {
        console.error("Persona not found with ID:", id);
        toast.error("Persona not found");
      }
    } catch (error) {
      console.error("Error loading persona:", error);
      toast.error("Failed to load persona details");
      
      // If we've tried less than 3 times and still failing, try again after a delay
      if (loadAttempts < 3) {
        setLoadAttempts(prev => prev + 1);
        setIsRetrying(true);
        
        setTimeout(() => {
          setIsRetrying(false);
          if (personaId) loadPersona(personaId);
        }, 1500);
      }
    } finally {
      setIsLoading(false);
    }
  }, [ensureImagePersistence, isOpenAIImageUrl, loadAttempts, isRetrying, personaId]);

  // Reset attempts when personaId changes
  useEffect(() => {
    if (personaId) {
      setLoadAttempts(0);
      setIsRetrying(false);
    }
  }, [personaId]);

  useEffect(() => {
    if (personaId) {
      loadPersona(personaId);
    }
  }, [personaId, loadPersona]);

  return {
    persona,
    setPersona,
    isLoading,
    isImageMigrating,
    reloadPersona: personaId ? () => loadPersona(personaId) : undefined
  };
}
