import { supabase } from '@/integrations/supabase/client';
import { V4Persona } from '../../types/persona-v4';

const ensureV4Persona = (persona: any, strict: boolean = true) => {
  if (!persona) throw new Error('No persona returned from query');
  if (!persona.schema_version || !persona.schema_version.startsWith('v4')) {
    throw new Error(`Non-V4 persona detected (schema_version=${persona.schema_version || 'missing'})`);
  }
  if (strict && (!persona.full_profile || !persona.full_profile.trait_profile)) {
    throw new Error('V4 persona missing trait_profile in full_profile');
  }
  return persona;
};

export async function getV4Personas(user_id: string, options?: { allowIncomplete?: boolean }): Promise<V4Persona[]> {
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
    
    const allowIncomplete = options?.allowIncomplete ?? false;
    
    if (allowIncomplete) {
      // 🔓 Relaxed validation: only require schema_version, allow missing trait_profile
      const validatedPersonas = (data || []).map(persona => ensureV4Persona(persona, false));
      return validatedPersonas as unknown as V4Persona[];
    } else {
      // 🔒 Strict validation: require trait profiles
      const validatedPersonas = (data || []).map(persona => ensureV4Persona(persona, true));
      return validatedPersonas as unknown as V4Persona[];
    }

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