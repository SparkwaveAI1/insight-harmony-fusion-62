import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getPersonaById, updatePersonaVisibility, updatePersonaName, updatePersonaDescription, updatePersonaProfileImageUrl, deletePersona } from "@/services/persona";
import { DbPersona } from "@/services/persona";
import { useAuth } from "@/context/AuthContext";
import { validatePersonaCompleteness, logPersonaValidation } from "@/services/persona/validation/personaValidation";

export function usePersonaDetail() {
  const { personaId } = useParams<{ personaId: string }>();
  const navigate = useNavigate();
  const [persona, setPersona] = useState<DbPersona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { user } = useAuth();
  const [isPublic, setIsPublic] = useState(false);

  const loadPersona = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      console.log("Loading persona with ID:", id);
      const data = await getPersonaById(id);
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
      await deletePersona(personaId);
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
      await updatePersonaVisibility(personaId, newVisibility);
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
      await updatePersonaName(personaId, name);
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
      await updatePersonaDescription(personaId, description);
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
        const refreshedPersona = await getPersonaById(personaId);
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

  // Handle image generation for V2 personas
  const handleImageGenerated = async () => {
    if (!personaId || !persona || !user) return null;
    
    setIsGeneratingImage(true);
    
    try {
      // Convert DbPersonaV2 to legacy Persona format for image generation
      const legacyPersona = {
        id: persona.id,
        persona_id: persona.persona_id,
        name: persona.name,
        description: persona.description || '',
        profile_image_url: persona.profile_image_url || undefined,
        creation_date: persona.created_at,
        created_at: persona.created_at,
        persona_context: 'legacy',
        persona_type: 'legacy' as any,
        metadata: {
          age: String(persona.persona_data?.identity?.age || ''),
          gender: persona.persona_data?.identity?.gender || '',
          race_ethnicity: persona.persona_data?.identity?.ethnicity || '',
          education_level: '',
          occupation: persona.persona_data?.identity?.occupation || '',
          employment_type: '',
          income_level: '',
          social_class_identity: '',
          marital_status: persona.persona_data?.identity?.relationship_status || ''
        },
        behavioral_modulation: {},
        interview_sections: [],
        linguistic_profile: {},
        preinterview_tags: [],
        trait_profile: {
          big_five: {
            openness: persona.persona_data.cognitive_profile?.big_five?.openness || 0.5,
            conscientiousness: persona.persona_data.cognitive_profile?.big_five?.conscientiousness || 0.5,
            extraversion: persona.persona_data.cognitive_profile?.big_five?.extraversion || 0.5,
            agreeableness: persona.persona_data.cognitive_profile?.big_five?.agreeableness || 0.5,
            neuroticism: persona.persona_data.cognitive_profile?.big_five?.neuroticism || 0.5
          },
          moral_foundations: {
            care: persona.persona_data.cognitive_profile?.moral_foundations?.care_harm || 0.5,
            fairness: persona.persona_data.cognitive_profile?.moral_foundations?.fairness_cheating || 0.5,
            loyalty: persona.persona_data.cognitive_profile?.moral_foundations?.loyalty_betrayal || 0.5,
            authority: persona.persona_data.cognitive_profile?.moral_foundations?.authority_subversion || 0.5,
            sanctity: persona.persona_data.cognitive_profile?.moral_foundations?.sanctity_degradation || 0.5,
            liberty: persona.persona_data.cognitive_profile?.moral_foundations?.liberty_oppression || 0.5
          }
        },
        emotional_triggers: persona.persona_data.emotional_triggers || { positive_triggers: [], negative_triggers: [] }
      };

      const { generatePersonaImage } = await import("@/services/persona/operations/generatePersonaImage");
      const imageUrl = await generatePersonaImage(legacyPersona);
      
      if (imageUrl) {
        // Update the persona with the new image URL
        await updatePersonaProfileImageUrl(personaId, imageUrl);
        setPersona(prev => prev ? { ...prev, profile_image_url: imageUrl } : null);
        toast.success("Profile image generated successfully!");
        return imageUrl;
      }
      
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

  const handlePersonaUpdated = async (updatedPersona: DbPersona) => {
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
