
import { useState, useCallback } from 'react';
import { PersonaCreationProgress, CREATION_STEPS, createProgressUpdate } from '@/services/persona/progressService';
import { createV4PersonaCall1, createV4PersonaCall2, createV4PersonaCall3 } from '@/services/v4-persona/createV4Persona';
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
      // Step 1: Generate detailed traits (V4 Call 1)
      setProgress(createProgressUpdate(CREATION_STEPS.DEMOGRAPHICS, false, "Generating detailed personality traits..."));
      
      const call1Response = await createV4PersonaCall1({
        user_description: prompt,
        user_id: user.id,
      });

      if (!call1Response.success) {
        throw new Error(call1Response.error || 'Failed to generate persona traits');
      }

      // Step 2: Generate summaries (V4 Call 2)
      setProgress(createProgressUpdate(CREATION_STEPS.TRAITS, false, "Creating conversation summaries..."));
      
      const call2Response = await createV4PersonaCall2(call1Response.persona_id!);

      if (!call2Response.success) {
        throw new Error(call2Response.error || 'Failed to generate conversation summaries');
      }

      // Step 3: Generate image (V4 Call 3) - optional
      setProgress(createProgressUpdate(CREATION_STEPS.INTERVIEW, false, "Generating profile image..."));
      
      const call3Response = await createV4PersonaCall3(call2Response.persona_id!, true);
      
      // Image generation failure is non-fatal
      if (!call3Response.success && call3Response.error) {
        console.warn('Image generation failed:', call3Response.error);
      }

      // Step 4: Complete
      setProgress(createProgressUpdate(CREATION_STEPS.COMPLETE, false, "Persona created successfully!"));

      // Return a minimal persona object for navigation - the full data will be fetched later
      const v4Persona = {
        id: call2Response.persona_id!,
        persona_id: call2Response.persona_id!,
        name: call2Response.persona_name || 'New Persona',
        user_id: user.id,
        creation_stage: 'completed' as const,
        creation_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_url: call3Response.image_url
      };

      setCreatedPersona(v4Persona);
      return v4Persona;
    } catch (error: any) {
      console.error('❌ Error in V4 persona creation:', error);
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
