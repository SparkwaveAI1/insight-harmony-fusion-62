
import { supabase } from "@/integrations/supabase/client";

/**
 * Deletes a persona permanently
 * Only allows deletion if the current user is the owner
 */
export async function deletePersona(personaId: string): Promise<boolean> {
  try {
    console.log(`Deleting persona with ID ${personaId}`);
    
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No authenticated user found");
      return false;
    }
    
    // Verify ownership before deletion
    const { data: persona, error: fetchError } = await supabase
      .from('personas')
      .select('user_id')
      .eq('persona_id', personaId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching persona:", fetchError);
      return false;
    }
    
    // Check if the current user is the owner
    if (persona.user_id !== user.id) {
      console.error("User is not authorized to delete this persona");
      return false;
    }
    
    // Now proceed with deletion
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
