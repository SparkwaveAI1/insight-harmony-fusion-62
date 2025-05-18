
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getPersonaByPersonaId, updatePersonaVisibility, updatePersonaName, deletePersona } from "@/services/persona";
import { Persona } from "@/services/persona/types";
import { useAuth } from "@/context/AuthContext";

export function usePersonaDetail() {
  const { personaId } = useParams<{ personaId: string }>();
  const navigate = useNavigate();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [isPublic, setIsPublic] = useState(false);

  const loadPersona = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      console.log("Loading persona with ID:", id);
      const data = await getPersonaByPersonaId(id);
      if (data) {
        console.log("Persona data loaded:", data);
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

  // This is a no-op placeholder that returns null since we're removing image functionality
  const handleImageGenerated = async () => {
    return null;
  };

  // Check if current user is the owner of this persona
  const isOwner = user?.id === persona?.user_id;

  return {
    persona,
    isLoading,
    isPublic,
    isOwner,
    handleVisibilityChange,
    handlePersonaDeleted,
    handleNameUpdate,
    handleImageGenerated
  };
}
