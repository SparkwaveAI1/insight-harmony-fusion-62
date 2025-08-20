import { supabase } from '@/integrations/supabase/client';
import { PersonaV3 } from '@/types/persona-v3';

export interface DbPersonaV3 {
  id: string;
  persona_id: string;
  user_id: string;
  name: string;
  description?: string;
  persona_data: PersonaV3;
  persona_version: string;
  is_public: boolean;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export async function createPersonaV3(personaData: PersonaV3): Promise<DbPersonaV3> {
  const { data, error } = await supabase
    .from('personas_v2')
    .insert({
      persona_id: personaData.persona_id,
      name: personaData.name,
      description: personaData.description,
      persona_data: personaData as any,
      persona_version: '3.0',
      is_public: false,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating persona V3:', error);
    throw new Error(`Failed to create persona: ${error.message}`);
  }

  return data as unknown as DbPersonaV3;
}

export async function getPersonaV3ById(personaId: string): Promise<DbPersonaV3 | null> {
  const { data, error } = await supabase
    .from('personas_v2')
    .select('*')
    .eq('persona_id', personaId)
    .eq('persona_version', '3.0')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No data found
    }
    console.error('Error fetching persona V3:', error);
    throw new Error(`Failed to fetch persona: ${error.message}`);
  }

  return data as unknown as DbPersonaV3;
}

export async function getAllPersonasV3(): Promise<DbPersonaV3[]> {
  const { data, error } = await supabase
    .from('personas_v2')
    .select('*')
    .eq('persona_version', '3.0')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching personas V3:', error);
    throw new Error(`Failed to fetch personas: ${error.message}`);
  }

  return data as unknown as DbPersonaV3[];
}

export async function updatePersonaV3(personaId: string, updates: Partial<PersonaV3>): Promise<DbPersonaV3> {
  const { data, error } = await supabase
    .from('personas_v2')
    .update({
      persona_data: updates as any,
      updated_at: new Date().toISOString()
    })
    .eq('persona_id', personaId)
    .eq('persona_version', '3.0')
    .select()
    .single();

  if (error) {
    console.error('Error updating persona V3:', error);
    throw new Error(`Failed to update persona: ${error.message}`);
  }

  return data as unknown as DbPersonaV3;
}

export async function deletePersonaV3(personaId: string): Promise<void> {
  const { error } = await supabase
    .from('personas_v2')
    .delete()
    .eq('persona_id', personaId)
    .eq('persona_version', '3.0');

  if (error) {
    console.error('Error deleting persona V3:', error);
    throw new Error(`Failed to delete persona: ${error.message}`);
  }
}

export async function updatePersonaV3Visibility(personaId: string, isPublic: boolean): Promise<void> {
  const { error } = await supabase
    .from('personas_v2')
    .update({ is_public: isPublic })
    .eq('persona_id', personaId)
    .eq('persona_version', '3.0');

  if (error) {
    console.error('Error updating persona V3 visibility:', error);
    throw new Error(`Failed to update persona visibility: ${error.message}`);
  }
}