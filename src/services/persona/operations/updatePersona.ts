
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates the visibility (public/private) status of a persona
 */
export async function updatePersonaVisibility(personaId: string, isPublic: boolean): Promise<boolean> {
  try {
    console.log(`Setting persona ${personaId} visibility to ${isPublic ? 'public' : 'private'}`);
    
    const { error } = await supabase
      .from('personas')
      .update({ is_public: isPublic })
      .eq('persona_id', personaId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating persona visibility:", error);
    return false;
  }
}
