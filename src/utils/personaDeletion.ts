import { supabase } from '@/integrations/supabase/client';

export async function deleteSpecificPersonas() {
  try {
    console.log('🗑️ Deleting specific personas...');
    
    // Delete Ethan Kaplan from personas table
    const { error: ethanError } = await supabase
      .from('personas')
      .delete()
      .eq('name', 'Ethan Kaplan');
    
    if (ethanError) {
      console.error('Error deleting Ethan Kaplan:', ethanError);
    } else {
      console.log('✅ Deleted Ethan Kaplan');
    }
    
    // Delete Jason Miller personas from v4_personas table
    const { error: jasonError } = await supabase
      .from('v4_personas')
      .delete()
      .eq('name', 'Jason Miller');
    
    if (jasonError) {
      console.error('Error deleting Jason Miller personas:', jasonError);
    } else {
      console.log('✅ Deleted all Jason Miller personas');
    }
    
    console.log('🎉 Persona deletion complete');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Persona deletion failed:', error);
    return { success: false, error };
  }
}

// Auto-run deletion
deleteSpecificPersonas();