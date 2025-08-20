import { supabase } from '@/integrations/supabase/client';
import { PersonaV3 } from '@/types/persona-v3';
import { VoicepackRuntime } from '@/types/voicepack';

// Database row type
interface DbPersonaRow {
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
  persona_version: string;
  created_at: string;
  updated_at: string;
}

// Application type
export interface DbPersona {
  id: string;
  persona_id: string;
  user_id: string;
  name: string;
  description: string | null;
  persona_data: PersonaV3;
  persona_type: string;
  is_public: boolean;
  profile_image_url: string | null;
  voicepack_runtime: VoicepackRuntime | null;
  voicepack_hash: string | null;
  persona_version: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePersonaRequest {
  persona_id: string;
  name: string;
  description?: string;
  persona_data: PersonaV3;
  persona_type?: string;
  is_public?: boolean;
  profile_image_url?: string;
}

export interface UpdatePersonaRequest {
  name?: string;
  description?: string;
  persona_data?: PersonaV3;
  is_public?: boolean;
  profile_image_url?: string;
  voicepack_runtime?: VoicepackRuntime;
  voicepack_hash?: string;
}

function convertDbRowToPersona(row: DbPersonaRow): DbPersona {
  return {
    ...row,
    persona_data: row.persona_data as PersonaV3,
    voicepack_runtime: row.voicepack_runtime as VoicepackRuntime | null
  };
}

export async function getPersonaById(personaId: string): Promise<DbPersona | null> {
  const { data, error } = await supabase
    .from('personas_v2')
    .select('*')
    .eq('persona_id', personaId)
    .eq('persona_version', '3.0')
    .maybeSingle();

  if (error) {
    console.error('Error fetching persona:', error);
    throw new Error(`Failed to fetch persona: ${error.message}`);
  }

  if (!data) return null;

  return convertDbRowToPersona(data as DbPersonaRow);
}

export async function getAllPersonas(userId?: string): Promise<DbPersona[]> {
  let query = supabase
    .from('personas_v2')
    .select('*')
    .eq('persona_version', '3.0');
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching personas:', error);
    throw new Error(`Failed to fetch personas: ${error.message}`);
  }

  return (data || []).map(row => convertDbRowToPersona(row as DbPersonaRow));
}

export async function getPublicPersonas(): Promise<DbPersona[]> {
  const { data, error } = await supabase
    .from('personas_v2')
    .select('*')
    .eq('is_public', true)
    .eq('persona_version', '3.0')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public personas:', error);
    throw new Error(`Failed to fetch public personas: ${error.message}`);
  }

  return (data || []).map(row => convertDbRowToPersona(row as DbPersonaRow));
}

export async function savePersona(request: CreatePersonaRequest): Promise<DbPersona> {
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
    profile_image_url: request.profile_image_url || null,
    persona_version: '3.0'
  };

  const { data, error } = await supabase
    .from('personas_v2')
    .insert(personaRecord)
    .select()
    .single();

  if (error) {
    console.error('Error saving persona:', error);
    throw new Error(`Failed to save persona: ${error.message}`);
  }

  return convertDbRowToPersona(data as DbPersonaRow);
}

export async function updatePersona(personaId: string, updates: UpdatePersonaRequest): Promise<DbPersona> {
  const dbUpdates = {
    ...updates,
    persona_data: updates.persona_data ? updates.persona_data as any : undefined,
    voicepack_runtime: updates.voicepack_runtime ? updates.voicepack_runtime as any : undefined
  };

  const { data, error } = await supabase
    .from('personas_v2')
    .update(dbUpdates)
    .eq('persona_id', personaId)
    .eq('persona_version', '3.0')
    .select()
    .single();

  if (error) {
    console.error('Error updating persona:', error);
    throw new Error(`Failed to update persona: ${error.message}`);
  }

  return convertDbRowToPersona(data as DbPersonaRow);
}

export async function deletePersona(personaId: string): Promise<void> {
  const { error } = await supabase
    .from('personas_v2')
    .delete()
    .eq('persona_id', personaId)
    .eq('persona_version', '3.0');

  if (error) {
    console.error('Error deleting persona:', error);
    throw new Error(`Failed to delete persona: ${error.message}`);
  }
}

export async function updatePersonaVoicepack(
  personaId: string, 
  voicepack: VoicepackRuntime, 
  hash: string
): Promise<void> {
  const { error } = await supabase
    .from('personas_v2')
    .update({
      voicepack_runtime: voicepack as any,
      voicepack_hash: hash,
      updated_at: new Date().toISOString()
    })
    .eq('persona_id', personaId)
    .eq('persona_version', '3.0');

  if (error) {
    console.error('Error updating persona voicepack:', error);
    throw new Error(`Failed to update voicepack: ${error.message}`);
  }
}

export async function updatePersonaVisibility(
  personaId: string, 
  isPublic: boolean
): Promise<void> {
  const { error } = await supabase
    .from('personas_v2')
    .update({
      is_public: isPublic,
      updated_at: new Date().toISOString()
    })
    .eq('persona_id', personaId)
    .eq('persona_version', '3.0');

  if (error) {
    console.error('Error updating persona visibility:', error);
    throw new Error(`Failed to update visibility: ${error.message}`);
  }
}

export async function updatePersonaName(
  personaId: string, 
  name: string
): Promise<void> {
  const { error } = await supabase
    .from('personas_v2')
    .update({
      name: name,
      updated_at: new Date().toISOString()
    })
    .eq('persona_id', personaId)
    .eq('persona_version', '3.0');

  if (error) {
    console.error('Error updating persona name:', error);
    throw new Error(`Failed to update name: ${error.message}`);
  }
}

export async function updatePersonaDescription(
  personaId: string, 
  description: string
): Promise<void> {
  const { error } = await supabase
    .from('personas_v2')
    .update({
      description: description,
      updated_at: new Date().toISOString()
    })
    .eq('persona_id', personaId)
    .eq('persona_version', '3.0');

  if (error) {
    console.error('Error updating persona description:', error);
    throw new Error(`Failed to update description: ${error.message}`);
  }
}

export async function updatePersonaProfileImageUrl(
  personaId: string, 
  imageUrl: string
): Promise<void> {
  const { error } = await supabase
    .from('personas_v2')
    .update({
      profile_image_url: imageUrl,
      updated_at: new Date().toISOString()
    })
    .eq('persona_id', personaId)
    .eq('persona_version', '3.0');

  if (error) {
    console.error('Error updating persona profile image:', error);
    throw new Error(`Failed to update profile image: ${error.message}`);
  }
}

// Legacy function aliases for backwards compatibility
export const getPersonasForListing = getAllPersonas;
export function checkPersonaVersion(): string {
  return '3.0';
}