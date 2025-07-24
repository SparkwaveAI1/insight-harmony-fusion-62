
import React, { createContext, useState, useEffect } from "react";
import { Persona } from "@/services/persona/types";
import { useAuth } from "./AuthContext";
import { PersonaContextType } from "./PersonaContext.types";
import { getAllPersonas } from "@/services/persona"; // Updated import path
import { personaCache } from '@/components/persona-chat/utils/personaCache';

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
      setIsLoading(true);
      setError(null);
      try {
        const allPersonas = await getAllPersonas();
        if (user) {
          // Filter personas by user_id
          const userPersonas = allPersonas.filter(persona => persona.user_id === user.id);
          setPersonas(userPersonas);
        } else {
          setPersonas(allPersonas);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonas();
  }, [user]);

  const loadPersona = async (personaId: string): Promise<Persona | null> => {
    try {
      setIsLoading(true);
      
      // Check cache first for faster loading
      const cachedPersona = personaCache.get(personaId);
      if (cachedPersona) {
        setActivePersona(cachedPersona);
        setIsLoading(false);
        return cachedPersona;
      }
      
      // Find the persona in the current list or fetch it
      const persona = personas.find(p => p.persona_id === personaId) || null;
      
      if (persona) {
        // Cache for future use
        personaCache.set(personaId, persona);
      }
      
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
