
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePersonaData } from "./persona/usePersonaData";
import { usePersonaActions } from "./persona/usePersonaActions";
import { usePersonaImage } from "./persona/usePersonaImage";
import { useEffect } from "react";

/**
 * Main hook for persona detail functionality, composed of smaller specialized hooks
 */
export function usePersonaDetail() {
  const { personaId } = useParams<{ personaId: string }>();
  const { user } = useAuth();
  
  // Use the extracted specialized hooks
  const { persona, setPersona, isLoading, reloadPersona } = usePersonaData(personaId);
  const { isPublic, setIsPublic, handleVisibilityChange, handlePersonaDeleted, handleNameUpdate } = usePersonaActions(personaId);
  const { isGeneratingImage, handleImageGenerated } = usePersonaImage(personaId, persona);

  // Sync isPublic state with persona data
  useEffect(() => {
    if (persona) {
      setIsPublic(persona.is_public || false);
    }
  }, [persona, setIsPublic]);

  // Update persona in state after operations that modify it
  const updatePersonaAfterAction = (updatedFields: Partial<typeof persona>) => {
    if (persona) {
      setPersona({ ...persona, ...updatedFields });
    }
  };

  // Wrapped actions that update the local state
  const wrappedHandleVisibilityChange = async (newVisibility: boolean) => {
    const success = await handleVisibilityChange(newVisibility);
    if (success) {
      updatePersonaAfterAction({ is_public: newVisibility });
    }
    return success;
  };

  const wrappedHandleNameUpdate = async (name: string) => {
    const success = await handleNameUpdate(name);
    if (success) {
      updatePersonaAfterAction({ name });
    }
    return success;
  };

  const wrappedHandleImageGenerated = async () => {
    const imageUrl = await handleImageGenerated();
    if (imageUrl) {
      updatePersonaAfterAction({ profile_image_url: imageUrl });
      // After setting the image URL, reload the persona to ensure we have the latest data
      if (reloadPersona) {
        setTimeout(reloadPersona, 500);
      }
    }
    return imageUrl;
  };

  // Check if current user is the owner of this persona
  const isOwner = user?.id === persona?.user_id;

  return {
    persona,
    isLoading,
    isPublic,
    isOwner,
    isGeneratingImage,
    handleVisibilityChange: wrappedHandleVisibilityChange,
    handlePersonaDeleted,
    handleNameUpdate: wrappedHandleNameUpdate,
    handleImageGenerated: wrappedHandleImageGenerated
  };
}
