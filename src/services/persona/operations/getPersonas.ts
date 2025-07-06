
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";
import { mapDbPersonaToPersona } from "../mappers";

export const getPersonaById = async (id: string): Promise<Persona | null> => {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch persona: ${error.message}`);
  }

  return data ? mapDbPersonaToPersona(data) : null;
};

export const getPersonaByPersonaId = async (personaId: string): Promise<Persona | null> => {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('persona_id', personaId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch persona: ${error.message}`);
  }

  return data ? mapDbPersonaToPersona(data) : null;
};

export const getAllPersonas = async (): Promise<Persona[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // If not authenticated, only return public personas
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch public personas: ${error.message}`);
    }

    return (data || []).map(mapDbPersonaToPersona);
  }

  // If authenticated, return user's personas and public ones
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch personas: ${error.message}`);
  }

  return (data || []).map(mapDbPersonaToPersona);
};

export const getPersonasByCollection = async (collectionId: string): Promise<Persona[]> => {
  const { data, error } = await supabase
    .from('collection_personas')
    .select(`
      personas (*)
    `)
    .eq('collection_id', collectionId);

  if (error) {
    throw new Error(`Failed to fetch personas for collection: ${error.message}`);
  }

  return (data || [])
    .map(item => item.personas)
    .filter(Boolean)
    .map(mapDbPersonaToPersona);
};
