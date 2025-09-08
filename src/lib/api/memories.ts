import { getBearerAndBase, retryFetch } from "@/utils/supabase-helpers";
import type { SupabaseClient } from '@supabase/supabase-js';

export interface PersonaMemory {
  id: string;
  persona_id: string;
  type: 'conversation' | 'fact' | 'note' | 'global';
  title?: string;
  content: { text: string; [key: string]: any };
  source?: string;
  tags: string[];
  created_at: string;
}

export interface PersonaCollection {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface MemoriesResponse {
  data: PersonaMemory[];
  next_cursor?: string;
  has_more: boolean;
}

export interface CollectionsResponse {
  data: PersonaCollection[];
}

export async function listPersonaMemories(
  supabase: SupabaseClient, 
  personaId: string, 
  opts?: {
    limit?: number;
    cursor?: string;
    type?: string;
    tag?: string;
    includeGlobal?: boolean;
  }
): Promise<MemoriesResponse> {
  const { token, base } = await getBearerAndBase(supabase);
  const q = new URLSearchParams({
    persona_id: personaId,
    limit: String(opts?.limit ?? 20),
    ...(opts?.cursor ? { cursor: opts.cursor } : {}),
    ...(opts?.type ? { type: opts.type } : {}),
    ...(opts?.tag ? { tag: opts.tag } : {}),
    ...(opts?.includeGlobal ?? true ? { include_global: 'true' } : { include_global: 'false' }),
  }).toString();

  const res = await retryFetch(`${base}/functions/v1/persona-list-memories?${q}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) {
    throw new Error(`MEMORIES_${res.status}`);
  }
  
  return res.json();
}

export async function listPersonaCollections(
  supabase: SupabaseClient, 
  personaId: string
): Promise<{ data: Array<{ id: string; name: string; description?: string | null; created_at: string }> }> {
  const { token, base } = await getBearerAndBase(supabase);
  const q = new URLSearchParams({ persona_id: personaId }).toString();
  
  const res = await retryFetch(`${base}/functions/v1/persona-list-collections?${q}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) {
    throw new Error(`COLLECTIONS_${res.status}`);
  }
  
  return res.json();
}