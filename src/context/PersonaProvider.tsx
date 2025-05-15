import React, { createContext, useState, useEffect } from "react";
import { Persona } from "@/services/persona/types";
import { useAuth } from "./AuthContext";
import { PersonaContextType } from "./PersonaContext.types";
import { getAllPersonas } from "@/services/persona"; // Updated import path

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

interface PersonaProviderProps {
  children: React.ReactNode;
}

export const PersonaProvider: React.FC<PersonaProviderProps> = ({ children }) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError(String(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonas();
  }, [user]);

  const value: PersonaContextType = {
    personas,
    setPersonas,
    isLoading,
    error,
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
