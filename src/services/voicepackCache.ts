import { VoicepackRuntime } from '../types/voicepack';
import { compilePersonaToVoicepack } from '../compile/compilePersonaToVoicepack';
import { getPersonaV2ById } from './persona';
import { supabase } from '@/integrations/supabase/client';
import crypto from 'crypto';

interface VoicepackCacheEntry {
  voicepack: VoicepackRuntime;
  hash: string;
  compiled_at: string;
}

// In-memory cache for frequently accessed voicepacks
const voicepackCache = new Map<string, VoicepackCacheEntry>();

export async function getOrCompileVoicepack(personaId: string): Promise<VoicepackRuntime> {
  try {
    // Get the persona data
    const persona = await getPersonaV2ById(personaId);
    if (!persona) {
      throw new Error(`Persona not found: ${personaId}`);
    }

    // Generate hash of current persona data
    const personaDataHash = generatePersonaHash(persona);

    // Check if we have a cached voicepack with matching hash
    const cachedEntry = voicepackCache.get(personaId);
    if (cachedEntry && cachedEntry.hash === personaDataHash) {
      return cachedEntry.voicepack;
    }

    // Check database cache
    const { data: dbEntry } = await supabase
      .from('personas_v2')
      .select('voicepack_runtime, voicepack_hash')
      .eq('persona_id', personaId)
      .single();

    if (dbEntry?.voicepack_runtime && dbEntry.voicepack_hash === personaDataHash) {
      // Cache in memory and return
      const voicepack = dbEntry.voicepack_runtime as unknown as VoicepackRuntime;
      const cacheEntry: VoicepackCacheEntry = {
        voicepack,
        hash: personaDataHash,
        compiled_at: new Date().toISOString()
      };
      voicepackCache.set(personaId, cacheEntry);
      return voicepack;
    }

    // Need to compile fresh voicepack
    console.log(`Compiling fresh voicepack for persona ${personaId}`);
    const voicepack = compilePersonaToVoicepack(persona.persona_data);

    // Update database cache
    await supabase
      .from('personas_v2')
      .update({
        voicepack_runtime: voicepack as any,
        voicepack_hash: personaDataHash
      })
      .eq('persona_id', personaId);

    // Update memory cache
    const cacheEntry: VoicepackCacheEntry = {
      voicepack,
      hash: personaDataHash,
      compiled_at: new Date().toISOString()
    };
    voicepackCache.set(personaId, cacheEntry);

    return voicepack;
  } catch (error) {
    console.error('Error getting or compiling voicepack:', error);
    throw error;
  }
}

export function generatePersonaHash(persona: any): string {
  // Create hash based on persona data that affects voicepack compilation
  const relevantData = {
    updated_at: persona.updated_at,
    persona_data: persona.persona_data
  };
  
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(relevantData))
    .digest('hex')
    .substring(0, 16);
}

export function clearVoicepackCache(personaId?: string): void {
  if (personaId) {
    voicepackCache.delete(personaId);
  } else {
    voicepackCache.clear();
  }
}

export function getVoicepackCacheStats(): { size: number; entries: string[] } {
  return {
    size: voicepackCache.size,
    entries: Array.from(voicepackCache.keys())
  };
}