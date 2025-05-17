
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
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Use the extracted image handling hook
  const { isOpenAIImageUrl, isImageMigrating } = usePersonaImage(personaId, persona);

  const loadPersona = useCallback(async (id: string) => {
    if (isRetrying) return;
    
    setIsLoading(true);
    try {
      console.log(`Loading persona with ID: ${id} (attempt ${loadAttempts + 1})`);
      const data = await getPersonaByPersonaId(id);
      
      if (data) {
        console.log("Persona data loaded successfully:", data);
        
        // Check for OpenAI image URL and handle appropriately
        if (data.profile_image_url && isOpenAIImageUrl(data.profile_image_url)) {
          console.log("OpenAI URL detected, clearing to prevent loading issues:", data.profile_image_url);
          
          // Create a copy with a fixed image URL
          const updatedData = {
            ...data,
            profile_image_url: undefined  // Clear problematic URL
          };
          
          setPersona(updatedData);
        } else {
          // Set the persona with the data as-is
          setPersona(data);
        }
      } else {
        console.error("Persona not found with ID:", id);
        toast.error("Persona not found");
      }
    } catch (error) {
      console.error("Error loading persona:", error);
      
      // If we've tried less than 3 times and still failing, try again after a delay
      if (loadAttempts < 2) {
        setLoadAttempts(prev => prev + 1);
        setIsRetrying(true);
        
        // Increase backoff time with each retry
        const backoffTime = 1000 * (loadAttempts + 1);
        
        console.log(`Retrying in ${backoffTime}ms...`);
        setTimeout(() => {
          setIsRetrying(false);
          if (personaId) {
            // Force a reload by updating the forceRefresh state
            setForceRefresh(prev => prev + 1);
          }
        }, backoffTime);
      } else {
        toast.error("Failed to load persona details after multiple attempts");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOpenAIImageUrl, loadAttempts, isRetrying, personaId]);

  // Reset attempts when personaId changes
  useEffect(() => {
    if (personaId) {
      setLoadAttempts(0);
      setIsRetrying(false);
    }
  }, [personaId]);

  // Load persona when personaId changes or forceRefresh is triggered
  useEffect(() => {
    if (personaId) {
      loadPersona(personaId);
    }
  }, [personaId, loadPersona, forceRefresh]);

  // Function to manually reload the persona
  const reloadPersona = useCallback(() => {
    if (personaId) {
      setLoadAttempts(0);
      setForceRefresh(prev => prev + 1);
    }
  }, [personaId]);

  return {
    persona,
    setPersona,
    isLoading,
    isImageMigrating,
    reloadPersona
  };
}
