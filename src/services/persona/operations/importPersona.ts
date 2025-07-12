import { supabase } from "@/integrations/supabase/client";
import { savePersona } from "./savePersona";
import { Persona } from "../types";
import { v4 as uuidv4 } from "uuid";

export async function importPersonaFromJSON(jsonData: any): Promise<Persona | null> {
  try {
    console.log("=== STARTING PERSONA IMPORT ===");
    console.log("Raw JSON data received:", jsonData);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User must be authenticated to import personas");
    }

    // Validate required fields
    if (!jsonData.name) {
      throw new Error("Persona name is required");
    }

    // Generate new IDs for the imported persona
    const newPersonaId = `persona-${Math.random().toString(36).substr(2, 6)}`;
    const newId = uuidv4();
    const currentDate = new Date().toISOString();
    const currentDateOnly = new Date().toISOString().split('T')[0];

    // Create persona object with imported data but new IDs and user info
    const persona: Persona = {
      // New generated IDs
      persona_id: newPersonaId,
      id: newId,
      
      // Core persona data from import
      name: jsonData.name,
      description: jsonData.description || "",
      
      // Timestamps - use current time for import
      creation_date: currentDateOnly,
      created_at: currentDate,
      
      // User assignment
      user_id: user.id,
      is_public: false, // Default to private for imported personas
      
      // Import all the structured data
      metadata: jsonData.metadata || {},
      trait_profile: jsonData.trait_profile || {},
      behavioral_modulation: jsonData.behavioral_modulation || {},
      linguistic_profile: jsonData.linguistic_profile || {},
      emotional_triggers: jsonData.emotional_triggers || { positive_triggers: [], negative_triggers: [] },
      interview_sections: Array.isArray(jsonData.interview_sections) ? jsonData.interview_sections : (jsonData.interview_sections?.interview_sections || []),
      simulation_directives: jsonData.simulation_directives || {},
      preinterview_tags: jsonData.preinterview_tags || [],
      
      // Optional fields
      prompt: jsonData.prompt || "",
      profile_image_url: jsonData.profile_image_url || null,
      enhanced_metadata_version: jsonData.enhanced_metadata_version || 2,
      persona_type: "imported",
      persona_context: jsonData.persona_context || {}
    };

    console.log("✅ Persona import data structured:", {
      persona_id: persona.persona_id,
      name: persona.name,
      user_id: persona.user_id,
      hasMetadata: !!persona.metadata,
      hasTraitProfile: !!persona.trait_profile,
      hasInterviewSections: Array.isArray(persona.interview_sections) ? persona.interview_sections.length > 0 : !!persona.interview_sections
    });

    // Save the imported persona to database
    const savedPersona = await savePersona(persona);
    
    if (!savedPersona) {
      throw new Error("Failed to save imported persona to database");
    }

    console.log("✅ Persona imported and saved successfully:", savedPersona.persona_id);
    return savedPersona;

  } catch (error: any) {
    console.error("❌ Error importing persona from JSON:", error);
    throw new Error(`Import failed: ${error.message || "Unknown error"}`);
  }
}