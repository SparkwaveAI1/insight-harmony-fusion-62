
import React, { createContext, useState, useEffect } from "react";
import { Persona } from "@/services/persona/types";
import { V4Persona } from "@/types/persona-v4";
import { useAuth } from "./AuthContext";
import { PersonaContextType } from "./PersonaContext.types";
import { getV4Personas, getV4PersonaById } from "@/services/v4-persona/getV4Personas";
import { getPersonaByPersonaId } from "@/services/persona/operations/getPersonas";

export const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

interface PersonaProviderProps {
  children: React.ReactNode;
}

export const PersonaProvider: React.FC<PersonaProviderProps> = ({ children }) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [activePersonas, setActivePersonas] = useState<Persona[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPersonas = async () => {
      if (!user) {
        setPersonas([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // Use V4 personas service exclusively
        const v4Personas = await getV4Personas(user.id);
        
        // Convert V4Persona to Persona format for compatibility
        const convertedPersonas: Persona[] = v4Personas.map(v4p => ({
          persona_id: v4p.persona_id,
          name: v4p.name,
          description: v4p.conversation_summary?.demographics?.background_description || `${v4p.name}`,
          user_id: v4p.user_id,
          is_public: v4p.is_public || false,
          created_at: v4p.created_at || '',
          updated_at: v4p.updated_at || '',
          profile_image_url: v4p.profile_image_url,
          schema_version: v4p.schema_version,
          full_profile: v4p.full_profile,
          conversation_summary: v4p.conversation_summary,
          // Legacy fields (empty/null for compatibility)
          metadata: null,
          trait_profile: null,
          behavioral_modulation: {},
          linguistic_profile: {},
          emotional_triggers: null,
          preinterview_tags: [],
          simulation_directives: {},
          interview_sections: [],
          prompt: null
        }));
        
        setPersonas(convertedPersonas);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Error loading V4 personas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonas();
  }, [user]);

  const loadPersona = async (personaId: string): Promise<Persona | null> => {
    try {
      setIsLoading(true);
      
      // First check current list
      const existingPersona = personas.find(p => p.persona_id === personaId);
      if (existingPersona) {
        setActivePersona(existingPersona);
        return existingPersona;
      }
      
      // Fetch directly from V4 service using backward-compatible wrapper
      const persona = await getPersonaByPersonaId(personaId);
      setActivePersona(persona);
      return persona;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loadMultiplePersonas = async (personaIds: string[]): Promise<Persona[]> => {
    try {
      setIsLoading(true);
      // Filter personas from the current list based on the provided IDs
      const foundPersonas = personas.filter(p => personaIds.includes(p.persona_id));
      setActivePersonas(foundPersonas);
      return foundPersonas;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearPersona = () => {
    setActivePersona(null);
  };

  const clearPersonas = () => {
    setActivePersonas([]);
  };

  const value: PersonaContextType = {
    personas,
    setPersonas,
    activePersona,
    activePersonas,
    isLoading,
    error,
    loadPersona,
    loadMultiplePersonas,
    clearPersona,
    clearPersonas
  };

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
};

export const usePersonaContext = () => {
  const context = React.useContext(PersonaContext);
  if (context === undefined) {
    throw new Error("usePersonaContext must be used within a PersonaProvider");
  }
  return context;
};
