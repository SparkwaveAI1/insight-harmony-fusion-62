import { supabase } from '@/integrations/supabase/client';
import { Persona } from '../types/persona';
import { toast } from 'sonner';

export const generatePersonaDescription = async (persona: Persona): Promise<string | null> => {
  try {
    console.log('Generating description for persona:', persona.name);

    const { data, error } = await supabase.functions.invoke('generate-persona-description', {
      body: { persona }
    });

    if (error) {
      console.error('Error generating persona description:', error);
      toast.error('Failed to generate description');
      return null;
    }

    if (!data.success || !data.description) {
      console.error('Description generation failed:', data.error);
      toast.error('Failed to generate description');
      return null;
    }

    console.log('Generated description:', data.description);
    return data.description;

  } catch (error) {
    console.error('Error in generatePersonaDescription:', error);
    toast.error('Failed to generate description');
    return null;
  }
};

export const updatePersonaDescription = async (personaId: string, description: string): Promise<boolean> => {
  try {
    // V4 personas don't have a separate description field - this functionality is deprecated
    console.warn('updatePersonaDescription is deprecated for V4 personas');
    return false;
  } catch (error) {
    console.error('Error in updatePersonaDescription:', error);
    toast.error('Failed to update description');
    return false;
  }
};