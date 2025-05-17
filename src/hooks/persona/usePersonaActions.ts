
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  deletePersona,
  updatePersonaName,
  updatePersonaVisibility
} from "@/services/persona";
import { useAuth } from "@/context/AuthContext";

/**
 * Hook for handling persona CRUD operations
 */
export function usePersonaActions(personaId: string | undefined) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPublic, setIsPublic] = useState(false);

  // Handle persona deletion
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
        toast.success(`Persona visibility ${newVisibility ? 'published' : 'set to private'}`);
        return true;
      } else {
        toast.error("Failed to update visibility");
        return false;
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update visibility");
      return false;
    }
  };

  // Handle name update
  const handleNameUpdate = async (name: string) => {
    if (!personaId || !user) return;
    
    try {
      const success = await updatePersonaName(personaId, name);
      if (success) {
        toast.success("Persona name updated successfully");
        return true;
      } else {
        toast.error("Failed to update persona name");
        return false;
      }
    } catch (error) {
      console.error("Error updating persona name:", error);
      toast.error("Failed to update persona name");
      throw error;
    }
  };

  return {
    isPublic,
    setIsPublic,
    handlePersonaDeleted,
    handleVisibilityChange,
    handleNameUpdate
  };
}
