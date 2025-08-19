import { supabase } from "@/integrations/supabase/client";
import { DbPersonaV2 } from "../types/persona-v2-db";

export async function getPersonaById(personaId: string): Promise<DbPersonaV2 | null> {
  try {
    const { data, error } = await supabase
      .from('personas_v2')
      .select('*')
      .eq('persona_id', personaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as unknown as DbPersonaV2;
  } catch (error) {
    console.error('Error fetching persona by ID:', error);
    throw error;
  }
}

export async function getAllPersonas(userId?: string): Promise<DbPersonaV2[]> {
  try {
    let query = supabase.from('personas_v2').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('is_public', true);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as DbPersonaV2[];
  } catch (error) {
    console.error('Error fetching personas:', error);
    throw error;
  }
}

export async function getPublicPersonas(): Promise<DbPersonaV2[]> {
  return getAllPersonas();
}

export async function getPersonasForListing(): Promise<Pick<DbPersonaV2, 'id' | 'persona_id' | 'name' | 'description' | 'profile_image_url' | 'is_public' | 'created_at'>[]> {
  try {
    const { data, error } = await supabase
      .from('personas_v2')
      .select('id, persona_id, name, description, profile_image_url, is_public, created_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching personas for listing:', error);
    throw error;
  }
}

export async function checkPersonaVersion(personaId: string): Promise<'v2' | 'not_found'> {
  try {
    const { data, error } = await supabase
      .from('personas_v2')
      .select('persona_id')
      .eq('persona_id', personaId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return 'not_found';
      }
      throw error;
    }

    return 'v2';
  } catch (error) {
    console.error('Error checking persona version:', error);
    return 'not_found';
  }
}