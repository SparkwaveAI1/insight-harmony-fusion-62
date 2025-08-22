
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates the visibility (public/private) status of a persona
 */
export async function updatePersonaVisibility(personaId: string, isPublic: boolean): Promise<boolean> {
  try {
    console.log(`Setting persona ${personaId} visibility to ${isPublic ? 'public' : 'private'}`);
    
    // Check if this is a V4 persona
    if (personaId.startsWith('v4_')) {
      console.log('V4 personas do not support visibility toggle - they are always private');
      // Return false to indicate the operation is not supported
      return false;
    } else {
      // Update legacy personas table
      console.log('Updating legacy persona visibility in personas table');
      const { error } = await supabase
        .from('personas')
        .update({ is_public: isPublic })
        .eq('persona_id', personaId);

      if (error) {
        console.error("Database error updating persona visibility:", error);
        throw error;
      }
      
      console.log('Successfully updated legacy persona visibility');
      return true;
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
    console.log("=== UPDATE PERSONA DESCRIPTION SERVICE ===");
    console.log(`Updating persona ${personaId} description to: "${description}"`);
    
    const { data, error } = await supabase
      .from('personas')
      .update({ description: description })
      .eq('persona_id', personaId)
      .select('description, persona_id, name');

    if (error) {
      console.error("Supabase error updating persona description:", error);
      throw error;
    }
    
    console.log("Successfully updated persona description in database:");
    console.log("Updated data:", data);
    
    // Verify the update by checking the returned data
    if (data && data.length > 0) {
      const updatedRecord = data[0];
      console.log("Verification - Description in DB:", updatedRecord.description);
      if (updatedRecord.description === description) {
        console.log("✅ Description successfully saved to database");
      } else {
        console.error("❌ Description mismatch in database!");
        console.error("Expected:", description);
        console.error("Actual:", updatedRecord.description);
      }
    }
    
    console.log("=== END UPDATE PERSONA DESCRIPTION SERVICE ===");
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
      // Update legacy personas table
      console.log('Detected legacy persona, updating personas table');
      const { error } = await supabase
        .from('personas')
        .update({ profile_image_url: imageUrl })
        .eq('persona_id', personaId);

      if (error) {
        console.error("Error updating legacy persona profile image URL:", error);
        return false;
      }
      
      console.log('Successfully updated legacy persona profile image URL');
      return true;
    }
  } catch (error) {
    console.error("Error updating persona profile image URL:", error);
    return false;
  }
}
