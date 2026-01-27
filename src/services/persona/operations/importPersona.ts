import { supabase } from "@/integrations/supabase/client";
import { savePersona } from "./savePersona";
import { Persona } from "../types";
import { v4 as uuidv4 } from "uuid";

export async function importPersonaFromJSON(jsonData: any): Promise<Persona | null> {
  try {
    console.log("=== STARTING PERSONA IMPORT ===");
    console.log("📋 Raw JSON data received:", {
      keys: Object.keys(jsonData),
      name: jsonData.name,
      hasPersonaData: !!jsonData.persona_data,
      hasFullProfile: !!jsonData.full_profile,
      hasIdentity: !!jsonData.identity,
      hasCognitiveProfile: !!jsonData.cognitive_profile,
      hasMetadata: !!jsonData.metadata,
      hasTraitProfile: !!jsonData.trait_profile,
      schemaVersion: jsonData.schema_version,
      personaId: jsonData.persona_id
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("❌ Authentication error:", userError);
      throw new Error("User must be authenticated to import personas");
    }

    console.log("✅ User authenticated:", user.id);

    // Validate required fields
    if (!jsonData.name) {
      console.error("❌ Missing required field: name");
      throw new Error("Persona name is required");
    }

    // Detect V4 vs V3 vs Legacy JSON structure
    const isV4Structure = jsonData.schema_version?.startsWith('v4') || jsonData.full_profile;
    const isV3Structure = !isV4Structure && (jsonData.identity || jsonData.cognitive_profile || jsonData.persona_data);

    console.log("📊 Detected structure:", {
      isV4: isV4Structure,
      isV3: isV3Structure,
      isLegacy: !isV4Structure && !isV3Structure
    });

    // Check if this is a V4 persona - if so, we need different handling
    if (isV4Structure) {
      console.error("❌ V4 persona import not yet supported through this function");
      throw new Error("V4 persona import is not yet supported. This function currently only supports V3 and Legacy personas. Please use the V4 import endpoint or contact support.");
    }

    // Generate new IDs for the imported persona
    const newPersonaId = `persona-${Math.random().toString(36).substr(2, 6)}`;
    const newId = uuidv4();
    const currentDate = new Date().toISOString();

    console.log("🆔 Generated new IDs:", { persona_id: newPersonaId, uuid: newId });

    let persona: Persona;

    if (isV3Structure) {
      // V3 JSON Import - preserve structure exactly
      persona = {
        // New generated IDs
        persona_id: newPersonaId,
        
        // Core persona data from import
        name: jsonData.name,
        description: jsonData.description || "",
        
        // Timestamps - use current time for import
        created_at: currentDate,
        updated_at: currentDate,
        
        // User assignment
        user_id: user.id,
        is_public: false,
        
        // V3 structure - preserve persona_data exactly
        persona_data: jsonData.persona_data || jsonData, // If whole object is V3 structure
        version: "V3",
        
        // Optional fields
        prompt: jsonData.prompt || "",
        profile_image_url: jsonData.profile_image_url || null,
        persona_type: "imported"
      };
    } else {
      // Legacy JSON Import - use existing conversion logic
      persona = {
        // New generated IDs
        persona_id: newPersonaId,
        
        // Core persona data from import
        name: jsonData.name,
        description: jsonData.description || "",
        
        // Timestamps - use current time for import
        created_at: currentDate,
        updated_at: currentDate,
        
        // User assignment
        user_id: user.id,
        is_public: false,
        
        // Import all the structured data (legacy format)
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
    }

    console.log("✅ Persona import data structured:", {
      persona_id: persona.persona_id,
      name: persona.name,
      user_id: persona.user_id,
      version: persona.version,
      hasMetadata: !!persona.metadata,
      hasTraitProfile: !!persona.trait_profile,
      hasPersonaData: !!persona.persona_data,
      hasInterviewSections: Array.isArray(persona.interview_sections) ? persona.interview_sections.length > 0 : !!persona.interview_sections
    });

    // Save the imported persona to database
    console.log("💾 Attempting to save persona to database...");
    try {
      const savedPersona = await savePersona(persona);

      if (!savedPersona) {
        console.error("❌ savePersona returned null");
        throw new Error("Failed to save imported persona to database - savePersona returned null");
      }

      console.log("✅ Persona imported and saved successfully:", {
        persona_id: savedPersona.persona_id,
        name: savedPersona.name,
        saved: true
      });
      return savedPersona;
    } catch (saveError: any) {
      console.error("❌ Error in savePersona:", {
        message: saveError.message,
        code: saveError.code,
        details: saveError.details,
        hint: saveError.hint,
        stack: saveError.stack
      });
      throw new Error(`Failed to save persona: ${saveError.message || "Unknown database error"}`);
    }

  } catch (error: any) {
    console.error("❌ Error importing persona from JSON:", {
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack,
      fullError: error
    });
    throw new Error(`Import failed: ${error.message || "Unknown error"}`);
  }
}