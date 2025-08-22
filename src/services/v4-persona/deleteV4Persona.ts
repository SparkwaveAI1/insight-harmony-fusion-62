import { supabase } from '@/integrations/supabase/client';

export async function deleteV4Persona(personaId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ V4: Deleting persona:', personaId);
    
    const { error } = await supabase
      .from('v4_personas')
      .delete()
      .eq('persona_id', personaId);

    if (error) {
      console.error('❌ V4: Database delete error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ V4: Persona deleted successfully:', personaId);
    return { success: true };

  } catch (error) {
    console.error('❌ V4: Delete operation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown delete error' 
    };
  }
}