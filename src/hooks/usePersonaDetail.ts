import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getPersonaByPersonaId, updatePersonaVisibility, updatePersonaName, updatePersonaDescription, generatePersonaImage, deletePersona } from "@/services/persona";
import { Persona } from "@/services/persona/types";
import { useAuth } from "@/context/AuthContext";
import { validatePersonaCompleteness, logPersonaValidation } from "@/services/persona/validation/personaValidation";

export function usePersonaDetail() {
  const { personaId } = useParams<{ personaId: string }>();
  const navigate = useNavigate();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { user } = useAuth();
  const [isPublic, setIsPublic] = useState(false);

  const loadPersona = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      console.log("Loading persona with ID:", id);
      const data = await getPersonaByPersonaId(id);
      if (data) {
        console.log("Persona data loaded:", data);
        console.log("Profile image URL:", data.profile_image_url);
        console.log("Description loaded:", data.description);
        
        // Validate the loaded persona
        console.log("=== VALIDATING LOADED PERSONA ===");
        const validationResult = validatePersonaCompleteness(data);
        logPersonaValidation(data, validationResult);
        
        if (!validationResult.isValid) {
          toast.warning(
            `This persona appears to be incomplete: ${validationResult.errors.join(', ')}`,
            { duration: 8000 }
          );
        }
        
        setPersona(data);
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
  }, []);

  useEffect(() => {
    if (personaId) {
      loadPersona(personaId);
    }
  }, [personaId, loadPersona]);

  useEffect(() => {
    if (persona) {
      setIsPublic(persona.is_public || false);
    }
  }, [persona]);

  const handlePersonaDeleted = async (): Promise<void> => {
    if (!personaId || !user) return Promise.resolve();
    
    try {
      const success = await deletePersona(personaId);
      if (success) {
        toast.success("Persona deleted successfully");
        navigate("/persona-viewer");
      } else {
        toast.error("Failed to delete persona");
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting persona:", error);
      toast.error("Failed to delete persona");
      return Promise.reject(error);
    }
  };

  // Handle visibility toggle
  const handleVisibilityChange = async (newVisibility: boolean) => {
    if (!personaId || !user) return;
    
    try {
      const success = await updatePersonaVisibility(personaId, newVisibility);
      if (success) {
        setIsPublic(newVisibility);
        setPersona(prev => prev ? { ...prev, is_public: newVisibility } : null);
        toast.success(`Persona visibility ${newVisibility ? 'published' : 'set to private'}`);
      } else {
        toast.error("Failed to update visibility");
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  // Handle name update
  const handleNameUpdate = async (name: string) => {
    if (!personaId || !user) return;
    
    try {
      const success = await updatePersonaName(personaId, name);
      if (success) {
        setPersona(prev => prev ? { ...prev, name } : null);
        toast.success("Persona name updated successfully");
      } else {
        toast.error("Failed to update persona name");
      }
    } catch (error) {
      console.error("Error updating persona name:", error);
      toast.error("Failed to update persona name");
      throw error;
    }
  };

  // Handle description update
  const handleDescriptionUpdate = async (description: string) => {
    if (!personaId || !user) {
      console.error("Missing personaId or user for description update");
      throw new Error("Missing personaId or user");
    }
    
    console.log("=== DESCRIPTION UPDATE START ===");
    console.log("Attempting to update description for persona:", personaId);
    console.log("New description:", description);
    console.log("Current persona state description:", persona?.description);
    
    try {
      console.log("Calling updatePersonaDescription service...");
      const success = await updatePersonaDescription(personaId, description);
      if (success) {
        console.log("Description update successful, updating local state");
        console.log("Previous persona description:", persona?.description);
        
        setPersona(prev => {
          const updated = prev ? { ...prev, description } : null;
          console.log("Updated persona description in state:", updated?.description);
          return updated;
        });
        
        toast.success("Persona description updated successfully");
        
        // Reload persona to verify the update persisted
        console.log("Reloading persona to verify description persistence...");
        setTimeout(async () => {
          const refreshedPersona = await getPersonaByPersonaId(personaId);
          if (refreshedPersona) {
            console.log("Refreshed persona description:", refreshedPersona.description);
            if (refreshedPersona.description !== description) {
              console.error("Description mismatch after reload!");
              console.error("Expected:", description);
              console.error("Actual:", refreshedPersona.description);
            } else {
              console.log("✅ Description successfully persisted and reloaded");
            }
          }
        }, 1000);
        
      } else {
        console.error("updatePersonaDescription returned false");
        toast.error("Failed to update persona description");
        throw new Error("Update operation failed");
      }
    } catch (error) {
      console.error("Error updating persona description:", error);
      toast.error("Failed to update persona description");
      throw error;
    }
    
    console.log("=== DESCRIPTION UPDATE END ===");
  };

  // Handle image generation
  const handleImageGenerated = async () => {
    if (!personaId || !persona || !user) return null;
    
    setIsGeneratingImage(true);
    
    try {
      toast.info("Generating profile image...");
      const imageUrl = await generatePersonaImage(persona);
      
      if (imageUrl) {
        toast.success("Profile image generated and saved successfully");
        
        // Force reload the persona to ensure we have the updated image URL
        const refreshedPersona = await getPersonaByPersonaId(personaId);
        if (refreshedPersona) {
          console.log("Refreshed persona data with new image:", refreshedPersona.profile_image_url);
          setPersona(refreshedPersona);
        } else {
          // Fallback: Update the local state with the new image URL
          setPersona(prev => prev ? { ...prev, profile_image_url: imageUrl } : null);
        }
        console.log("Updated persona in state with new image URL:", imageUrl);
        return imageUrl;
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

  // Check if current user is the owner of this persona
  const isOwner = user?.id === persona?.user_id;

  const handlePersonaUpdated = async (updatedPersona: Persona) => {
    console.log("Persona updated via enhancement:", updatedPersona.name);
    setPersona(updatedPersona);
    toast.success(`${updatedPersona.name} has been enhanced!`);
  };

  return {
    persona,
    isLoading,
    isPublic,
    isOwner,
    isGeneratingImage,
    handleVisibilityChange,
    handlePersonaDeleted,
    handleNameUpdate,
    handleDescriptionUpdate,
    handleImageGenerated,
    handlePersonaUpdated
  };
}
