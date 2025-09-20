
import { useState, useCallback } from 'react';
import { PersonaCreationProgress, CREATION_STEPS, createProgressUpdate } from '@/services/persona/progressService';
import { createV4PersonaUnified } from '@/services/v4-persona/createV4PersonaUnified';
import { useAuth } from '@/context/AuthContext';
import { V4Persona } from '@/types/persona-v4';

export const usePersonaCreationProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<PersonaCreationProgress>(
    createProgressUpdate(CREATION_STEPS.VALIDATION, false)
  );
  const [isCreating, setIsCreating] = useState(false);
  const [createdPersona, setCreatedPersona] = useState<any>(null);

  const createPersona = useCallback(async (prompt: string): Promise<any> => {
    if (!user) {
      setProgress(createProgressUpdate(CREATION_STEPS.VALIDATION, true, "You must be logged in to create personas"));
      return null;
    }

    setIsCreating(true);
    setCreatedPersona(null);
    
    try {
      // Single unified persona generation call
      setProgress(createProgressUpdate(CREATION_STEPS.DEMOGRAPHICS, false, "Generating comprehensive persona profile..."));
      
      const response = await createV4PersonaUnified({
        user_description: prompt,
        user_id: user.id,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate persona');
      }

      // Complete
      setProgress(createProgressUpdate(CREATION_STEPS.COMPLETE, false, "Persona created successfully!"));

      // Return a minimal persona object for navigation
      const v4Persona = {
        id: response.persona_id!,
        persona_id: response.persona_id!,
        name: response.persona_name || 'New Persona',
        user_id: user.id,
        creation_stage: 'completed' as const,
        creation_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setCreatedPersona(v4Persona);
      return v4Persona;
    } catch (error: any) {
      console.error('❌ Error in V4 unified persona creation:', error);
      setProgress(createProgressUpdate(
        CREATION_STEPS.VALIDATION, 
        true, 
        `Failed to create persona: ${error.message || 'Unknown error'}`
      ));
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user]);

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
