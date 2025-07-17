
import { supabase } from '@/integrations/supabase/client';
import { PersonaCreateData } from '../types';

export const savePersona = async (persona: PersonaCreateData): Promise<string> => {
  const personaId = `persona_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const { data, error } = await supabase
    .from('personas')
    .insert({
      persona_id: personaId,
      creation_date: new Date().toISOString(),
      ...persona
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving persona:', error);
    throw error;
  }

  return data.persona_id;
};
