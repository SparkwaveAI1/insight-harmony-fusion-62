import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getPersonaV2ById, updatePersonaV2Visibility, updatePersonaV2Name, updatePersonaV2Description, updatePersonaV2ProfileImageUrl, deletePersonaV2 } from "@/services/persona";
import { DbPersonaV2 } from "@/services/persona/types/persona-v2-db";
import { useAuth } from "@/context/AuthContext";
import { validatePersonaCompleteness, logPersonaValidation } from "@/services/persona/validation/personaValidation";

export function usePersonaDetail() {
  const { personaId } = useParams<{ personaId: string }>();
  const navigate = useNavigate();
  const [persona, setPersona] = useState<DbPersonaV2 | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { user } = useAuth();
  const [isPublic, setIsPublic] = useState(false);

  const loadPersona = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      console.log("Loading persona with ID:", id);
      const data = await getPersonaV2ById(id);
      if (data) {
        console.log("Persona data loaded:", data);
        console.log("Profile image URL:", data.profile_image_url);
        console.log("Description loaded:", data.description);
        
        // Note: V2 personas have different validation logic
        // For now, skip V1-style validation as V2 has structured PersonaV2 data
        
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
      await deletePersonaV2(personaId);
      const success = true;
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
      await updatePersonaV2Visibility(personaId, newVisibility);
      const success = true;
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
      await updatePersonaV2Name(personaId, name);
      const success = true;
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
      await updatePersonaV2Description(personaId, description);
      const success = true;
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
        const refreshedPersona = await getPersonaV2ById(personaId);
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

  // Handle image generation - simplified for V2
  const handleImageGenerated = async () => {
    if (!personaId || !persona || !user) return null;
    
    setIsGeneratingImage(true);
    
    try {
      toast.info("V2 image generation not yet implemented");
      // TODO: Implement V2 image generation
      return null;
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

  const handlePersonaUpdated = async (updatedPersona: DbPersonaV2) => {
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
