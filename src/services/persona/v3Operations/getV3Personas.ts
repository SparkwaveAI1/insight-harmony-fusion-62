import { supabase } from "@/integrations/supabase/client";
import { PersonaV3 } from "@/types/persona-v3";

export async function getV3Personas(): Promise<PersonaV3[]> {
  try {
    console.log('📖 V3-Clean: Fetching V3 personas...');
    
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('version', '3.0-clean')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ V3-Clean: Database fetch error:', error);
      throw new Error(`Failed to fetch V3 personas: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('📭 V3-Clean: No V3 personas found');
      return [];
    }

    // Map database records to PersonaV3 format
    const personas: PersonaV3[] = data.map(record => {
      // If persona_data exists, use it; otherwise construct from individual fields
      if (record.persona_data && typeof record.persona_data === 'object') {
        return {
          ...record.persona_data,
          // Ensure database fields override persona_data
          id: record.id,
          persona_id: record.persona_id,
          name: record.name,
          description: record.description,
          user_id: record.user_id,
          is_public: record.is_public,
          profile_image_url: record.profile_image_url,
          prompt: record.prompt,
          version: record.version,
          created_at: record.created_at,
          updated_at: record.updated_at
        } as PersonaV3;
      } else {
        // Fallback for records without persona_data
        console.warn('⚠️ V3-Clean: Record missing persona_data:', record.persona_id);
        return record as unknown as PersonaV3;
      }
    });

    console.log(`✅ V3-Clean: Fetched ${personas.length} personas`);
    return personas;

  } catch (error) {
    console.error('❌ V3-Clean: Fetch operation failed:', error);
    throw error;
  }
}

export async function getV3PersonaById(personaId: string): Promise<PersonaV3 | null> {
  try {
    console.log('📖 V3-Clean: Fetching persona by ID:', personaId);
    
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('persona_id', personaId)
      .eq('version', '3.0-clean')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('📭 V3-Clean: Persona not found:', personaId);
        return null;
      }
      console.error('❌ V3-Clean: Database fetch error:', error);
      throw new Error(`Failed to fetch persona: ${error.message}`);
    }

    if (data.persona_data && typeof data.persona_data === 'object') {
      const persona = {
        ...data.persona_data,
        id: data.id,
        persona_id: data.persona_id,
        name: data.name,
        description: data.description,
        user_id: data.user_id,
        is_public: data.is_public,
        profile_image_url: data.profile_image_url,
        prompt: data.prompt,
        version: data.version,
        created_at: data.created_at,
        updated_at: data.updated_at
      } as PersonaV3;

      console.log('✅ V3-Clean: Fetched persona:', persona.name);
      return persona;
    } else {
      console.warn('⚠️ V3-Clean: Record missing persona_data:', personaId);
      return data as unknown as PersonaV3;
    }

  } catch (error) {
    console.error('❌ V3-Clean: Fetch by ID failed:', error);
    throw error;
  }
}