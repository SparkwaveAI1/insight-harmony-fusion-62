
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '../types';

export const getAllPersonas = async (): Promise<Persona[]> => {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching personas:', error);
    throw error;
  }

  return data || [];
};

export const getPersonaById = async (id: string): Promise<Persona | null> => {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching persona:', error);
    throw error;
  }

  return data;
};

export const getPersonaByPersonaId = async (personaId: string): Promise<Persona | null> => {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('persona_id', personaId)
    .single();

  if (error) {
    console.error('Error fetching persona:', error);
    throw error;
  }

  return data;
};

// Hook for React Query integration
export const usePersonas = () => {
  // This would typically use React Query, but for now just return the function
  return {
    data: [],
    isLoading: false,
    error: null,
    refetch: getAllPersonas
  };
};
