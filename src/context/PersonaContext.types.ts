
import { Persona } from "@/services/persona/types";

export interface PersonaContextType {
  // All personas
  personas: Persona[];
  
  // Update personas
  setPersonas: (personas: Persona[]) => void;
  
  // Current active persona
  activePersona: Persona | null;
  
  // Loading state
  isLoading: boolean;
  
  // Error state
  error: Error | null;
  
  // Multiple personas for group scenarios
  activePersonas: Persona[];
  
  // Methods
  loadPersona: (personaId: string) => Promise<Persona | null>;
  loadMultiplePersonas: (personaIds: string[]) => Promise<Persona[]>;
  clearPersona: () => void;
  clearPersonas: () => void;
}
