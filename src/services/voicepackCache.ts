import { VoicepackRuntime } from "../types/voicepack";
import { compilePersonaToVoicepack, PersonaForCompilation } from "../compile/compilePersonaToVoicepack";
import { supabase } from "@/integrations/supabase/client";

interface VoicepackCacheEntry {
  voicepack: VoicepackRuntime;
  persona_hash: string;
  compiled_at: string;
}

// In-memory cache for compiled voicepacks
const voicepackCache = new Map<string, VoicepackCacheEntry>();

export async function getOrCompileVoicepack(personaId: string): Promise<VoicepackRuntime> {
  console.log(`Getting voicepack for persona: ${personaId}`);
  
  try {
    // Fetch persona data
    const { data: persona, error } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('persona_id', personaId)
      .single();

    if (error || !persona) {
      throw new Error(`Failed to fetch persona: ${error?.message || 'Not found'}`);
    }

    // Create a hash of the persona data to check for changes
    const personaHash = createPersonaHash(persona);
    
    // Check cache first
    const cached = voicepackCache.get(personaId);
    if (cached && cached.persona_hash === personaHash) {
      console.log(`Using cached voicepack for ${personaId}`);
      return cached.voicepack;
    }

    // Check database cache
    const { data: dbCache } = await supabase
      .from('v4_personas')
      .select('voicepack_runtime, updated_at')
      .eq('persona_id', personaId)
      .single();

    if (dbCache?.voicepack_runtime && 
        dbCache.updated_at && 
        new Date(dbCache.updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) { // 24 hours
      console.log(`Using database cached voicepack for ${personaId}`);
      const voicepack = dbCache.voicepack_runtime as VoicepackRuntime;
      
      // Update memory cache
      voicepackCache.set(personaId, {
        voicepack,
        persona_hash: personaHash,
        compiled_at: new Date().toISOString()
      });
      
      return voicepack;
    }

    // Compile new voicepack
    console.log(`Compiling new voicepack for ${personaId}`);
    const compilationInput: PersonaForCompilation = {
      id: persona.persona_id,
      full_profile: persona.full_profile,
      conversation_summary: persona.conversation_summary,
      updated_at: persona.updated_at
    };
    
    const voicepack = compilePersonaToVoicepack(compilationInput);
    
    // Cache in database
    await supabase
      .from('v4_personas')
      .update({ voicepack_runtime: voicepack })
      .eq('persona_id', personaId);
    
    // Cache in memory
    voicepackCache.set(personaId, {
      voicepack,
      persona_hash: personaHash,
      compiled_at: new Date().toISOString()
    });
    
    console.log(`Voicepack compiled successfully for ${personaId}`);
    return voicepack;
    
  } catch (error) {
    console.error(`Error getting/compiling voicepack for ${personaId}:`, error);
    throw error;
  }
}

function createPersonaHash(persona: any): string {
  // Create a simple hash of the persona data to detect changes
  const data = JSON.stringify({
    full_profile: persona.full_profile,
    conversation_summary: persona.conversation_summary,
    updated_at: persona.updated_at
  });
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString(36);
}

// Clear cache for a specific persona (useful when persona is updated)
export function clearVoicepackCache(personaId?: string): void {
  if (personaId) {
    voicepackCache.delete(personaId);
  } else {
    voicepackCache.clear();
  }
}