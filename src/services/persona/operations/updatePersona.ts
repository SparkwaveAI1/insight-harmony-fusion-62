
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

/**
 * Updates the name of a persona
 */
export async function updatePersonaName(personaId: string, name: string): Promise<boolean> {
  try {
    console.log(`Updating persona ${personaId} name to "${name}"`);
    
    const { error } = await supabase
      .from('personas')
      .update({ name: name })
      .eq('persona_id', personaId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating persona name:", error);
    return false;
  }
}

/**
 * Updates the description of a persona
 */
export async function updatePersonaDescription(personaId: string, description: string): Promise<boolean> {
  try {
    console.log(`Updating persona ${personaId} description`);
    
    const { error } = await supabase
      .from('personas')
      .update({ description: description })
      .eq('persona_id', personaId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating persona description:", error);
    return false;
  }
}

/**
 * Updates the profile image URL of a persona
 */
export async function updatePersonaProfileImageUrl(personaId: string, imageUrl: string): Promise<boolean> {
  try {
    console.log(`Updating persona ${personaId} with profile image URL: ${imageUrl}`);
    
    const { error } = await supabase
      .from('personas')
      .update({ profile_image_url: imageUrl })
      .eq('persona_id', personaId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating persona profile image URL:", error);
    return false;
  }
}
