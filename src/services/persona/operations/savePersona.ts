
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '../types';

export const savePersona = async (persona: Omit<Persona, 'id' | 'created_at'>): Promise<Persona> => {
  const { data, error } = await supabase
    .from('personas')
    .insert([persona])
    .select()
    .single();

  if (error) {
    console.error('Error saving persona:', error);
    throw error;
  }

  return data;
};
