
import { useState, useCallback } from 'react';
import { PersonaCreationProgress, CREATION_STEPS, createProgressUpdate } from '@/services/persona/progressService';
import { generatePersonaWithProgress } from '@/services/persona/enhancedPersonaGenerator';
import { Persona } from '@/services/persona/types';

export const usePersonaCreationProgress = () => {
  const [progress, setProgress] = useState<PersonaCreationProgress>(
    createProgressUpdate(CREATION_STEPS.VALIDATION, false)
  );
  const [isCreating, setIsCreating] = useState(false);
  const [createdPersona, setCreatedPersona] = useState<Persona | null>(null);

  const createPersona = useCallback(async (prompt: string): Promise<Persona | null> => {
    setIsCreating(true);
    setCreatedPersona(null);
    
    try {
      const persona = await generatePersonaWithProgress(prompt, setProgress);
      setCreatedPersona(persona);
      return persona;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(createProgressUpdate(CREATION_STEPS.VALIDATION, false));
    setCreatedPersona(null);
  }, []);

  return {
    progress,
    isCreating,
    createdPersona,
    createPersona,
    resetProgress
  };
};
