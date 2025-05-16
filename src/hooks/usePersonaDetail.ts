
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getPersonaByPersonaId, updatePersonaVisibility } from "@/services/persona";
import { Persona } from "@/services/persona/types";
import { useAuth } from "@/context/AuthContext";

export function usePersonaDetail() {
  const { personaId } = useParams<{ personaId: string }>();
  const navigate = useNavigate();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (personaId) {
      loadPersona(personaId);
    }
  }, [personaId]);

  useEffect(() => {
    if (persona) {
      setIsPublic(persona.is_public || false);
    }
  }, [persona]);

  const loadPersona = async (id: string) => {
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
  };
  
  const handlePersonaDeleted = () => {
    // Navigate back to personas list after deletion
    toast.success("Persona deleted successfully");
    navigate("/persona-viewer");
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

  // Check if current user is the owner of this persona
  const isOwner = user?.id === persona?.user_id;

  return {
    persona,
    isLoading,
    isPublic,
    isOwner,
    handleVisibilityChange,
    handlePersonaDeleted
  };
}
