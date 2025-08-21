import { supabase } from "@/integrations/supabase/client";
import { PersonaV3 } from "@/types/persona-v3";

export async function saveV3Persona(personaData: PersonaV3): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('💾 V3-Clean: Saving persona to database...');
    
    const { data, error } = await supabase
      .from('personas')
      .insert({
        persona_id: personaData.persona_id,
        name: personaData.name,
        description: personaData.description,
        user_id: personaData.user_id,
        is_public: personaData.is_public,
        profile_image_url: personaData.profile_image_url,
        prompt: personaData.prompt,
        version: "3.0-clean",
        persona_data: personaData as any, // Store complete V3 structure in JSONB
        created_at: personaData.created_at,
        updated_at: personaData.updated_at
      })
      .select()
      .single();

    if (error) {
      console.error('❌ V3-Clean: Database save error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ V3-Clean: Persona saved successfully:', data.name);
    return { success: true };

  } catch (error) {
    console.error('❌ V3-Clean: Save operation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown save error' 
    };
  }
}