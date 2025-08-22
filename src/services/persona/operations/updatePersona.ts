
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates the visibility (public/private) status of a persona
 */
export async function updatePersonaVisibility(personaId: string, isPublic: boolean): Promise<boolean> {
  try {
    console.log(`Setting persona ${personaId} visibility to ${isPublic ? 'public' : 'private'}`);
    
    // Check if this is a V4 persona
    if (personaId.startsWith('v4_')) {
      console.log('Updating V4 persona visibility in v4_personas table');
      const { error } = await supabase
        .from('v4_personas')
        .update({ is_public: isPublic })
        .eq('persona_id', personaId);

      if (error) {
        console.error("Database error updating V4 persona visibility:", error);
        throw error;
      }
      
      console.log('Successfully updated V4 persona visibility');
      return true;
    } else {
      // Legacy personas no longer exist
      console.warn('Legacy persona visibility update attempted but personas table no longer exists');
      return false;
    }
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
    
    // Legacy personas no longer exist
    console.warn('updatePersonaName is deprecated - personas table no longer exists');
    return false;
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
    console.log("=== UPDATE PERSONA DESCRIPTION SERVICE ===");
    console.log(`Updating persona ${personaId} description to: "${description}"`);
    
    // Legacy personas no longer exist
    console.warn('updatePersonaDescription is deprecated - personas table no longer exists');
    return false;
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
    
    // First try to update in v4_personas table (for V4 personas)
    if (personaId.startsWith('v4_')) {
      console.log('Detected V4 persona, updating v4_personas table');
      const { error: v4Error } = await supabase
        .from('v4_personas')
        .update({ profile_image_url: imageUrl })
        .eq('persona_id', personaId);

      if (v4Error) {
        console.error("Error updating V4 persona profile image URL:", v4Error);
        return false;
      }
      
      console.log('Successfully updated V4 persona profile image URL');
      return true;
    } else {
      // Legacy personas no longer exist
      console.warn('Legacy persona profile image update attempted but personas table no longer exists');
      return false;
    }
  } catch (error) {
    console.error("Error updating persona profile image URL:", error);
    return false;
  }
}
