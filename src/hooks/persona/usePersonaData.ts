
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
  
  // Use the extracted image handling hook
  const { ensureImagePersistence, isOpenAIImageUrl } = usePersonaImage(personaId, persona);

  const loadPersona = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      console.log("Loading persona with ID:", id);
      const data = await getPersonaByPersonaId(id);
      if (data) {
        console.log("Persona data loaded:", data);
        console.log("Profile image URL:", data.profile_image_url);
        
        // Check if the image URL is from OpenAI and needs to be migrated to Supabase
        if (isOpenAIImageUrl(data.profile_image_url)) {
          const updatedPersona = await ensureImagePersistence(data);
          setPersona(updatedPersona);
        } else {
          setPersona(data);
        }
      } else {
        console.error("Persona not found with ID:", id);
        toast.error("Persona not found");
      }
    } catch (error) {
      console.error("Error loading persona:", error);
      toast.error("Failed to load persona details");
    } finally {
      setIsLoading(false);
    }
  }, [ensureImagePersistence, isOpenAIImageUrl]);

  useEffect(() => {
    if (personaId) {
      loadPersona(personaId);
    }
  }, [personaId, loadPersona]);

  return {
    persona,
    setPersona,
    isLoading
  };
}
