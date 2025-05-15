
import { supabase } from "@/integrations/supabase/client";

/**
 * Deletes a persona permanently
 */
export async function deletePersona(personaId: string): Promise<boolean> {
  try {
    console.log(`Deleting persona with ID ${personaId}`);
    
    // First, remove all collection references
    const { error: collectionError } = await supabase
      .from('collection_personas')
      .delete()
      .eq('persona_id', personaId);
    
    if (collectionError) {
      console.error("Error removing persona from collections:", collectionError);
      // Continue with deletion anyway
    }
    
    // Delete the persona
    const { error } = await supabase
      .from('personas')
      .delete()
      .eq('persona_id', personaId);

    if (error) {
      console.error("Error in final persona deletion:", error);
      throw error;
    }
    
    console.log("Persona successfully deleted");
    return true;
  } catch (error) {
    console.error("Error deleting persona:", error);
    return false;
  }
}
