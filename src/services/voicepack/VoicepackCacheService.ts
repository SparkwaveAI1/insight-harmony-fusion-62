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

      // Try PersonaV2 first, fallback to V1
      let persona: any = null;
      let isV2 = false;

      // Check PersonaV2 table first
      const { data: personaV2, error: v2Error } = await supabase
        .from('personas_v2')
        .select('persona_data, voicepack_runtime, voicepack_hash, updated_at')
        .eq('persona_id', personaId)
        .maybeSingle();

      if (!v2Error && personaV2) {
        console.log('VoicepackCacheService: Found PersonaV2');
        isV2 = true;
        
        // Check if we have cached voicepack
        if (personaV2.voicepack_runtime) {
          console.log('VoicepackCacheService: Found voicepack in PersonaV2 cache');
          const voicepack = personaV2.voicepack_runtime as unknown as VoicepackRuntime;
          this.cache.set(personaId, { voicepack, timestamp: Date.now() });
          return voicepack;
        }
        
        persona = personaV2.persona_data;
      } else {
        throw new Error(`Persona not found: ${personaId}`);
      }

      return this.compileAndCache(persona, personaId, isV2);
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
        .from('personas_v2')
        .select('*')
        .eq('persona_id', personaId)
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
  private async compileAndCache(persona: any, personaId: string, isV2: boolean = false): Promise<VoicepackRuntime> {
    try {
      // Convert to PersonaV2 format if needed
      const personaV2 = isV2 ? persona : this.convertToPersonaV2(persona);
      
      // Compile voicepack
      const voicepack = await this.compiler.compile(personaV2);
      const voicepackHash = this.generateVoicepackHash(voicepack);
      
      // Cache in memory
      this.cache.set(personaId, { voicepack, timestamp: Date.now() });
      
      // Save to appropriate database table
      if (isV2) {
        const { error } = await supabase
          .from('personas_v2')
          .update({ 
            voicepack_runtime: voicepack as any,
            voicepack_hash: voicepackHash 
          })
          .eq('persona_id', personaId);
        
        if (error) {
          console.error('VoicepackCacheService: Error saving voicepack to PersonaV2:', error);
        } else {
          console.log('VoicepackCacheService: Saved voicepack to PersonaV2 cache');
        }
      }
      
      return voicepack;
    } catch (error) {
      console.error('Compilation failed:', error);
      throw new Error(`Voicepack compilation failed: ${error.message}`);
    }
  }

  private generateVoicepackHash(voicepack: VoicepackRuntime): string {
    // Simple hash of voicepack content for cache invalidation
    return btoa(JSON.stringify(voicepack)).slice(0, 16);
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