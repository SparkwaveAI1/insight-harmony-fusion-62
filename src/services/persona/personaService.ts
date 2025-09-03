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
  const { data, error } = await supabase
    .from('v4_personas')
    .select('id, persona_id, name, schema_version, full_profile, conversation_summary, created_at, is_public')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  const rows = data ?? [];

  // Always require schema_version v4*
  const v4Only = rows.filter(p => p?.schema_version?.startsWith('v4'));

  // Library view: allow personas even if trait_profile is missing
  if (opts?.allowIncomplete) {
    return v4Only as unknown as V4Persona[];
  }

  // Strict mode (kept for other views)
  return v4Only.filter(p => (p?.full_profile as any)?.trait_profile) as unknown as V4Persona[];
}

/**
 * Fetches ALL public personas from v4_personas table without any validation filtering
 * Used for library views to show everything that's public
 */
export async function getPublicV4PersonasShowAll(): Promise<V4Persona[]> {
  const { data, error } = await supabase
    .from('v4_personas')
    .select('id, persona_id, name, schema_version, full_profile, conversation_summary, created_at, is_public')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as V4Persona[];
}