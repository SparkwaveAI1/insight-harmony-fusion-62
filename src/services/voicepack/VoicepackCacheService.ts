import { supabase } from '../../integrations/supabase/client';
import { PersonaV2 } from '../../types/persona-v2';
import { VoicepackRuntime } from '../../types/voicepack';
import { PersonaV2Compiler } from './PersonaV2Compiler';

export class VoicepackCacheService {
  private compiler: PersonaV2Compiler;
  private cache: Map<string, { voicepack: VoicepackRuntime; timestamp: number }>;

  constructor() {
    this.compiler = new PersonaV2Compiler();
    this.cache = new Map();
  }

  /**
   * Get or compile voicepack for a persona
   */
  async getOrCompileVoicepack(personaId: string): Promise<VoicepackRuntime> {
    try {
      // Check memory cache first
      const cached = this.cache.get(personaId);
      if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
        return cached.voicepack;
      }

      // Check database for cached voicepack
      const { data: persona, error } = await supabase
        .from('personas')
        .select('*')
        .eq('id', personaId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch persona: ${error.message}`);
      }

      if (!persona) {
        throw new Error(`Persona not found: ${personaId}`);
      }

      // If voicepack exists and persona hasn't been updated, return cached version
      if (persona.voicepack_runtime) {
        const voicepack = persona.voicepack_runtime as VoicepackRuntime;
        this.cache.set(personaId, { voicepack, timestamp: Date.now() });
        return voicepack;
      }

      // Compile new voicepack
      console.log(`Compiling voicepack for persona ${personaId}`);
      const voicepack = await this.compileAndCache(persona, personaId);
      
      return voicepack;
    } catch (error) {
      console.error('VoicepackCacheService error:', error);
      throw error;
    }
  }

  /**
   * Force recompilation of voicepack
   */
  async recompileVoicepack(personaId: string): Promise<VoicepackRuntime> {
    try {
      // Clear cache
      this.cache.delete(personaId);

      // Fetch fresh persona data
      const { data: persona, error } = await supabase
        .from('personas')
        .select('*')
        .eq('id', personaId)
        .single();

      if (error || !persona) {
        throw new Error(`Failed to fetch persona for recompilation: ${error?.message}`);
      }

      return await this.compileAndCache(persona, personaId);
    } catch (error) {
      console.error('Recompilation failed:', error);
      throw error;
    }
  }

  /**
   * Compile voicepack and save to database
   */
  private async compileAndCache(persona: any, personaId: string): Promise<VoicepackRuntime> {
    try {
      // Convert database persona to PersonaV2 format if needed
      const personaV2 = this.convertToPersonaV2(persona);
      
      // Compile voicepack
      const voicepack = await this.compiler.compile(personaV2);
      
      // Save to database
      const { error: updateError } = await supabase
        .from('personas')
        .update({ voicepack_runtime: voicepack as any })
        .eq('id', personaId);

      if (updateError) {
        console.warn(`Failed to cache voicepack: ${updateError.message}`);
        // Continue anyway - we can still return the compiled voicepack
      }

      // Cache in memory
      this.cache.set(personaId, { voicepack, timestamp: Date.now() });
      
      console.log(`Voicepack compiled and cached for persona ${personaId}`);
      return voicepack;
    } catch (error) {
      console.error('Compilation failed:', error);
      throw new Error(`Voicepack compilation failed: ${error.message}`);
    }
  }

  /**
   * Convert database persona format to PersonaV2
   */
  private convertToPersonaV2(persona: any): PersonaV2 {
    // For now, assume the database already contains PersonaV2-compatible data
    // In practice, you might need to map between different schema versions
    return persona as PersonaV2;
  }

  /**
   * Clear cache for a specific persona
   */
  invalidateCache(personaId: string): void {
    this.cache.delete(personaId);
  }

  /**
   * Clear entire cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}