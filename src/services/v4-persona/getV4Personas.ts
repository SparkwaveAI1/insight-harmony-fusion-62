import { supabase } from '@/integrations/supabase/client';
import { V4Persona } from '../../types/persona-v4';

export async function getV4Personas(user_id: string): Promise<V4Persona[]> {
  try {
    console.log('Fetching V4 personas for user:', user_id);

    const { data, error } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching V4 personas:', error);
      throw error;
    }

    console.log('Retrieved V4 personas:', data?.length || 0);
    return (data || []) as unknown as V4Persona[];

  } catch (error) {
    console.error('Error in getV4Personas:', error);
    return [];
  }
}

export async function getV4PersonaById(persona_id: string): Promise<V4Persona | null> {
  try {
    console.log('Fetching V4 persona by ID:', persona_id);

    const { data, error } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('id', persona_id)
      .single();

    if (error) {
      console.error('Error fetching V4 persona by ID:', error);
      throw error;
    }

    console.log('Retrieved V4 persona:', data?.name);
    return data as unknown as V4Persona;

  } catch (error) {
    console.error('Error in getV4PersonaById:', error);
    return null;
  }
}