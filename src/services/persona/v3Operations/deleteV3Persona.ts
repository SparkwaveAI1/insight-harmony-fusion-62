import { supabase } from "@/integrations/supabase/client";

export async function deleteV3Persona(personaId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ V3-Clean: Deleting persona:', personaId);
    
    const { error } = await supabase
      .from('personas')
      .delete()
      .eq('persona_id', personaId)
      .eq('version', '3.0-clean');

    if (error) {
      console.error('❌ V3-Clean: Database delete error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ V3-Clean: Persona deleted successfully:', personaId);
    return { success: true };

  } catch (error) {
    console.error('❌ V3-Clean: Delete operation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown delete error' 
    };
  }
}