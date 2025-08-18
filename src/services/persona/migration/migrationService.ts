import { supabase } from '@/integrations/supabase/client';
import { samplePersonaTraits, generatePersonaV2Prompt } from './traitSampler';

export interface MigrationResult {
  persona_id: string;
  name: string;
  status: 'success' | 'error';
  message: string;
}

export interface MigrationOptions {
  mode: 'single' | 'batch';
  personaId?: string;
  preserveImages?: boolean;
  preserveVisibility?: boolean;
}

export class PersonaMigrationService {
  async migratePersona(personaId: string): Promise<MigrationResult> {
    try {
      const { data, error } = await supabase.functions.invoke('migrate-persona-to-v2', {
        body: { personaId, mode: 'single' }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.results[0] || {
        persona_id: personaId,
        name: 'Unknown',
        status: 'error',
        message: 'No result returned'
      };
    } catch (error) {
      return {
        persona_id: personaId,
        name: 'Unknown',
        status: 'error',
        message: error instanceof Error ? error.message : 'Migration failed'
      };
    }
  }

  async migrateBatch(userPersonas?: boolean): Promise<MigrationResult[]> {
    try {
      const { data, error } = await supabase.functions.invoke('migrate-persona-to-v2', {
        body: { mode: 'batch' }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data.results || [];
    } catch (error) {
      console.error('Batch migration failed:', error);
      return [];
    }
  }

  async checkMigrationStatus(personaId: string): Promise<'v1' | 'v2' | 'not_found'> {
    // Check if persona exists in PersonaV2 table
    const { data: v2Data } = await supabase
      .from('personas_v2')
      .select('persona_id')
      .eq('persona_id', personaId)
      .maybeSingle();

    if (v2Data) return 'v2';

    // Check if persona exists in V1 table
    const { data: v1Data } = await supabase
      .from('personas')
      .select('persona_id')
      .eq('persona_id', personaId)
      .maybeSingle();

    if (v1Data) return 'v1';

    return 'not_found';
  }

  async getMigrationCandidates(): Promise<any[]> {
    // Get V1 personas that haven't been migrated yet
    const { data: v1Personas } = await supabase
      .from('personas')
      .select('persona_id, name, created_at')
      .order('created_at', { ascending: false });

    if (!v1Personas) return [];

    // Filter out those that already exist in V2
    const { data: v2PersonaIds } = await supabase
      .from('personas_v2')
      .select('persona_id');

    const migratedIds = new Set(v2PersonaIds?.map(p => p.persona_id) || []);
    
    return v1Personas.filter(persona => !migratedIds.has(persona.persona_id));
  }
}

export const migrationService = new PersonaMigrationService();