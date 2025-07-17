
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const clonePersona = async (originalPersonaId: string): Promise<Persona> => {
  // First, fetch the original persona
  const { data: originalPersona, error: fetchError } = await supabase
    .from('personas')
    .select('*')
    .eq('persona_id', originalPersonaId)
    .single();

  if (fetchError) {
    console.error('Error fetching original persona:', fetchError);
    throw fetchError;
  }

  // Create a new persona with cloned data
  const clonedPersona = {
    ...originalPersona,
    id: undefined, // Remove the original ID
    persona_id: uuidv4(),
    name: `${originalPersona.name} (Copy)`,
    created_at: undefined, // Will be set automatically
    is_public: false // Clones are private by default
  };

  const { data, error } = await supabase
    .from('personas')
    .insert([clonedPersona])
    .select()
    .single();

  if (error) {
    console.error('Error cloning persona:', error);
    throw error;
  }

  return data;
};
