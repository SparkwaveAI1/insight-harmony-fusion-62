import { supabase } from '@/integrations/supabase/client';
import { V4Persona } from '../../types/persona-v4';

const ensureV4PersonaCore = (persona: any, strict: boolean = true) => {
  if (!persona) throw new Error('No persona returned from query');
  if (!persona.schema_version || !persona.schema_version.startsWith('v4')) {
    throw new Error(`Non-V4 persona detected (schema_version=${persona.schema_version || 'missing'})`);
  }
  
  if (strict) {
    const fp = persona.full_profile;
    if (!fp) throw new Error('V4 persona missing full_profile');
    if (!fp.identity) throw new Error('V4 persona missing full_profile.identity');
    if (!fp.communication_style) throw new Error('V4 persona missing full_profile.communication_style');
    if (!fp.motivation_profile) throw new Error('V4 persona missing full_profile.motivation_profile');
    
    // conversation_summary is strongly recommended for engine:
    if (!persona.conversation_summary) {
      console.warn('V4 persona missing conversation_summary (will degrade UX but not blocked)');
    }
  }
  
  // DO NOT require legacy `trait_profile` for V4
  return persona;
};

export async function getV4Personas(user_id: string, options?: { allowIncomplete?: boolean }): Promise<V4Persona[]> {
  try {
    console.log('Fetching V4 personas for user:', user_id);

    // Fetch only essential columns for list views (not full_profile JSONB)
    // full_profile is ~15KB per persona - only fetch it on detail pages
    const { data, error } = await supabase
      .from('v4_personas')
      .select('persona_id, name, profile_image_url, profile_thumbnail_url, created_at, updated_at, user_id, is_public, schema_version, conversation_summary')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching V4 personas:', error);
      throw error;
    }

    console.log('Retrieved V4 personas:', data?.length || 0);
    
    const allowIncomplete = options?.allowIncomplete ?? false;
    
    if (allowIncomplete) {
      // 🔓 Relaxed validation: only require schema_version, allow missing V4 core fields
      const validatedPersonas = (data || []).map(persona => ensureV4PersonaCore(persona, false));
      return validatedPersonas as unknown as V4Persona[];
    } else {
      // 🔒 Strict validation: require V4 core fields
      const validatedPersonas = (data || []).map(persona => ensureV4PersonaCore(persona, true));
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

    // Extract name from nested structure for V4 personas
    let personaName = 'Unknown Persona';
    try {
      if (data?.conversation_summary && typeof data.conversation_summary === 'object') {
        const summary = data.conversation_summary as any;
        personaName = summary?.demographics?.name || data?.name || 'Unknown Persona';
      } else {
        personaName = data?.name || 'Unknown Persona';
      }
    } catch (e) {
      console.warn('Error extracting persona name:', e);
      personaName = data?.name || 'Unknown Persona';
    }
    console.log('Retrieved V4 persona:', personaName);
    
    // 🔒 Validate persona is V4 with core fields
    const validatedPersona = ensureV4PersonaCore(data);
    
    // Set the extracted name on the persona object for easy access
    try {
      if (validatedPersona && validatedPersona.conversation_summary && typeof validatedPersona.conversation_summary === 'object') {
        const summary = validatedPersona.conversation_summary as any;
        if (summary?.demographics?.name) {
          validatedPersona.name = summary.demographics.name;
        }
      }
    } catch (e) {
      console.warn('Error setting persona name:', e);
    }
    
    return validatedPersona as unknown as V4Persona;

  } catch (error) {
    console.error('Error in getV4PersonaById:', error);
    return null;
  }
}