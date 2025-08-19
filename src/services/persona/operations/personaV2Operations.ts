import { supabase } from '@/integrations/supabase/client';
import { CreatePersonaV2Request, UpdatePersonaV2Request } from '../types/persona-v2-db';
import { PersonaV2 } from '../../../types/persona-v2';
import { VoicepackRuntime } from '../../../types/voicepack';

// Database row type (with JSONB fields as any for flexibility)
interface DbPersonaV2Row {
  id: string;
  persona_id: string;
  user_id: string;
  name: string;
  description: string | null;
  persona_data: any; // JSONB
  persona_type: string;
  is_public: boolean;
  profile_image_url: string | null;
  voicepack_runtime: any | null; // JSONB
  voicepack_hash: string | null;
  created_at: string;
  updated_at: string;
}

// Converted type for application use
interface DbPersonaV2 {
  id: string;
  persona_id: string;
  user_id: string;
  name: string;
  description: string | null;
  persona_data: PersonaV2;
  persona_type: string;
  is_public: boolean;
  profile_image_url: string | null;
  voicepack_runtime: VoicepackRuntime | null;
  voicepack_hash: string | null;
  created_at: string;
  updated_at: string;
}

export async function getPersonaV2ById(personaId: string): Promise<DbPersonaV2 | null> {
  const { data, error } = await supabase
    .from('personas_v2')
    .select('*')
    .eq('persona_id', personaId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching PersonaV2:', error);
    throw new Error(`Failed to fetch persona: ${error.message}`);
  }

  if (!data) return null;

  return convertDbRowToPersonaV2(data as DbPersonaV2Row);
}

function convertDbRowToPersonaV2(row: DbPersonaV2Row): DbPersonaV2 {
  return {
    ...row,
    persona_data: row.persona_data as PersonaV2,
    voicepack_runtime: row.voicepack_runtime as VoicepackRuntime | null
  };
}

export async function getAllPersonasV2(userId?: string): Promise<DbPersonaV2[]> {
  let query = supabase.from('personas_v2').select('*');
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching PersonasV2:', error);
    throw new Error(`Failed to fetch personas: ${error.message}`);
  }

  return (data || []).map(row => convertDbRowToPersonaV2(row as DbPersonaV2Row));
}

export async function getPublicPersonasV2(): Promise<DbPersonaV2[]> {
  const { data, error } = await supabase
    .from('personas_v2')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public PersonasV2:', error);
    throw new Error(`Failed to fetch public personas: ${error.message}`);
  }

  return (data || []).map(row => convertDbRowToPersonaV2(row as DbPersonaV2Row));
}

export async function savePersonaV2(request: CreatePersonaV2Request): Promise<DbPersonaV2> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User must be authenticated to create personas');
  }

  const personaRecord = {
    persona_id: request.persona_id,
    user_id: userData.user.id,
    name: request.name,
    description: request.description || null,
    persona_data: request.persona_data as any, // Cast for JSONB
    persona_type: request.persona_type || 'humanoid',
    is_public: request.is_public || false,
    profile_image_url: request.profile_image_url || null
  };

  const { data, error } = await supabase
    .from('personas_v2')
    .insert(personaRecord)
    .select()
    .single();

  if (error) {
    console.error('Error saving PersonaV2:', error);
    throw new Error(`Failed to save persona: ${error.message}`);
  }

  return convertDbRowToPersonaV2(data as DbPersonaV2Row);
}

export async function updatePersonaV2(personaId: string, updates: UpdatePersonaV2Request): Promise<DbPersonaV2> {
  // Cast PersonaV2 fields to any for JSONB compatibility
  const dbUpdates = {
    ...updates,
    persona_data: updates.persona_data ? updates.persona_data as any : undefined,
    voicepack_runtime: updates.voicepack_runtime ? updates.voicepack_runtime as any : undefined
  };

  const { data, error } = await supabase
    .from('personas_v2')
    .update(dbUpdates)
    .eq('persona_id', personaId)
    .select()
    .single();

  if (error) {
    console.error('Error updating PersonaV2:', error);
    throw new Error(`Failed to update persona: ${error.message}`);
  }

  return convertDbRowToPersonaV2(data as DbPersonaV2Row);
}

export async function deletePersonaV2(personaId: string): Promise<void> {
  const { error } = await supabase
    .from('personas_v2')
    .delete()
    .eq('persona_id', personaId);

  if (error) {
    console.error('Error deleting PersonaV2:', error);
    throw new Error(`Failed to delete persona: ${error.message}`);
  }
}

export async function updatePersonaV2Voicepack(
  personaId: string, 
  voicepack: VoicepackRuntime, 
  hash: string
): Promise<void> {
  const { error } = await supabase
    .from('personas_v2')
    .update({
      voicepack_runtime: voicepack as any, // Cast for JSONB
      voicepack_hash: hash,
      updated_at: new Date().toISOString()
    })
    .eq('persona_id', personaId);

  if (error) {
    console.error('Error updating PersonaV2 voicepack:', error);
    throw new Error(`Failed to update voicepack: ${error.message}`);
  }
}

export async function updatePersonaV2Visibility(
  personaId: string, 
  isPublic: boolean
): Promise<void> {
  const { error } = await supabase
    .from('personas_v2')
    .update({
      is_public: isPublic,
      updated_at: new Date().toISOString()
    })
    .eq('persona_id', personaId);

  if (error) {
    console.error('Error updating PersonaV2 visibility:', error);
    throw new Error(`Failed to update visibility: ${error.message}`);
  }
}

export async function updatePersonaV2Name(
  personaId: string, 
  name: string
): Promise<void> {
  const { error } = await supabase
    .from('personas_v2')
    .update({
      name: name,
      updated_at: new Date().toISOString()
    })
    .eq('persona_id', personaId);

  if (error) {
    console.error('Error updating PersonaV2 name:', error);
    throw new Error(`Failed to update name: ${error.message}`);
  }
}

export async function updatePersonaV2Description(
  personaId: string, 
  description: string
): Promise<void> {
  const { error } = await supabase
    .from('personas_v2')
    .update({
      description: description,
      updated_at: new Date().toISOString()
    })
    .eq('persona_id', personaId);

  if (error) {
    console.error('Error updating PersonaV2 description:', error);
    throw new Error(`Failed to update description: ${error.message}`);
  }
}

export async function updatePersonaV2ProfileImageUrl(
  personaId: string, 
  imageUrl: string
): Promise<void> {
  const { error } = await supabase
    .from('personas_v2')
    .update({
      profile_image_url: imageUrl,
      updated_at: new Date().toISOString()
    })
    .eq('persona_id', personaId);

  if (error) {
    console.error('Error updating PersonaV2 profile image:', error);
    throw new Error(`Failed to update profile image: ${error.message}`);
  }
}