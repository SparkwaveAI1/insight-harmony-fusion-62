import { supabase } from "@/integrations/supabase/client";
import { V4Persona } from "@/types/persona-v4";

export interface GetPublicV4PersonasOptions {
  allowIncomplete?: boolean;
}

/**
 * Fetches public V4 personas with configurable validation
 * @param opts Options including allowIncomplete for relaxed validation
 */
export async function getPublicV4Personas(opts?: GetPublicV4PersonasOptions): Promise<V4Persona[]> {
  // Fetch only essential columns for list views (not full_profile JSONB)
  const { data, error } = await supabase
    .from('v4_personas_public_safe')
    .select('persona_id, name, profile_image_url, profile_thumbnail_url, created_at, updated_at, user_id, is_public, schema_version, conversation_summary')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as V4Persona[];
}

/**
 * Fetches ALL public personas from v4_personas table without any validation filtering
 * Used for library views to show everything that's public
 */
export async function getPublicV4PersonasShowAll(): Promise<V4Persona[]> {
  // Fetch only essential columns for list views (not full_profile JSONB)
  const { data, error } = await supabase
    .from('v4_personas_public_safe')
    .select('persona_id, name, profile_image_url, profile_thumbnail_url, created_at, updated_at, user_id, is_public, schema_version, conversation_summary')
    .order('created_at', { ascending: false })
    .limit(10000);

  if (error) throw error;
  return (data ?? []) as unknown as V4Persona[];
}

/**
 * Fetches public personas by their IDs from v4_personas_public_safe
 * Used to get full persona data after filtered search returns IDs
 */
export async function getPublicPersonasByIds(personaIds: string[]): Promise<V4Persona[]> {
  if (!personaIds.length) return [];

  // Fetch only essential columns for list views (not full_profile JSONB)
  const { data, error } = await supabase
    .from('v4_personas_public_safe')
    .select('persona_id, name, profile_image_url, profile_thumbnail_url, created_at, updated_at, user_id, is_public, schema_version, conversation_summary')
    .in('persona_id', personaIds);

  if (error) throw error;
  return (data ?? []) as unknown as V4Persona[];
}

/**
 * Fetches user's personas by their IDs from v4_personas
 * Used to get full persona data after filtered search returns IDs
 */
export async function getMyPersonasByIds(personaIds: string[], userId: string): Promise<V4Persona[]> {
  if (!personaIds.length) return [];
  if (!userId) throw new Error('Missing userId');

  // Fetch only essential columns for list views (not full_profile JSONB)
  const { data, error } = await supabase
    .from('v4_personas')
    .select('persona_id, name, profile_image_url, profile_thumbnail_url, created_at, updated_at, user_id, is_public, schema_version, conversation_summary')
    .in('persona_id', personaIds)
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []) as unknown as V4Persona[];
}

/**
 * Fetches ALL personas owned by a user from v4_personas (no validation filtering)
 * Used for "My Personas" view to show everything the user owns
 */
export async function getMyV4PersonasShowAll(userId: string): Promise<V4Persona[]> {
  if (!userId) throw new Error('Missing userId');
  
  console.log("=== PERSONA SERVICE DEBUG ===");
  console.log("Input userId:", userId);
  
  // Check current session
  const { data: { session } } = await supabase.auth.getSession();
  console.log("Current session:", session?.user?.id);
  console.log("Session access token present:", !!session?.access_token);
  
  // Fetch lightweight columns only - full_profile fetched on-demand for single persona views
  const { data, error } = await supabase
    .from('v4_personas')
    .select('persona_id, name, schema_version, created_at, is_public, user_id, profile_image_url, profile_thumbnail_url, conversation_summary, age_computed, gender_computed, occupation_computed, city_computed, state_region_computed, country_computed')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  console.log("Query result:", { data: data?.length, error });
  if (error) console.error("Query error details:", error);
  
  if (error) throw error;
  return (data ?? []) as unknown as V4Persona[];
}