import { supabase } from '@/integrations/supabase/client';
import { V4Persona } from '../../types/persona-v4';

const ensureV4Persona = (persona: any) => {
  if (!persona) throw new Error('No persona returned from query');
  if (!persona.schema_version || !persona.schema_version.startsWith('v4')) {
    throw new Error(`Non-V4 persona detected (schema_version=${persona.schema_version || 'missing'})`);
  }
  if (!persona.full_profile || !persona.full_profile.trait_profile) {
    throw new Error('V4 persona missing trait_profile in full_profile');
  }
  return persona;
};

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
    
    // 🔒 Validate all personas are V4 with trait profiles
    const validatedPersonas = (data || []).map(persona => ensureV4Persona(persona));
    
    return validatedPersonas as unknown as V4Persona[];

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
      .eq('persona_id', persona_id)
      .single();

    if (error) {
      console.error('Error fetching V4 persona by ID:', error);
      throw error;
    }

    console.log('Retrieved V4 persona:', data?.name);
    
    // 🔒 Validate persona is V4 with trait profile
    const validatedPersona = ensureV4Persona(data);
    
    return validatedPersona as unknown as V4Persona;

  } catch (error) {
    console.error('Error in getV4PersonaById:', error);
    return null;
  }
}