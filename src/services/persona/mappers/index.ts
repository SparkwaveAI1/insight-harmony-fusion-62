
import { DbPersona, Persona, PersonaMetadata, InterviewSection } from "../types";
import { Json } from "@/integrations/supabase/types";
import { createDefaultTraitProfile } from './defaultTraitProfile';
import { validateAndPreserveTraitProfile } from './traitProfileValidator';
import { handleEmotionalTriggers, prepareEmotionalTriggersForDb } from './emotionalTriggersHandler';

export function personaToDbPersona(persona: Persona): Omit<DbPersona, 'id' | 'created_at'> {
  console.log("=== CONVERTING PERSONA TO DB FORMAT ===");
  console.log("Converting persona to DB format:", persona.persona_id);
  console.log("Persona name:", persona.name);
  console.log("Persona description:", persona.description);
  
  // Log trait profile before conversion
  if (persona.trait_profile) {
    console.log("Trait profile categories:", Object.keys(persona.trait_profile));
    
    // Sample some values to check for defaults
    const bigFive = persona.trait_profile.big_five;
    if (bigFive) {
      console.log("Big Five sample values:", {
        openness: bigFive.openness,
        conscientiousness: bigFive.conscientiousness,
        extraversion: bigFive.extraversion
      });
    }
    
    const worldValues = persona.trait_profile.world_values;
    if (worldValues) {
      console.log("World Values sample:", worldValues);
    }
  } else {
    console.error("❌ PERSONA HAS NO TRAIT PROFILE");
  }
  
  // Prepare emotional triggers for database storage
  const emotionalTriggers = prepareEmotionalTriggersForDb(persona.emotional_triggers);
  
  const dbPersona: Omit<DbPersona, 'id' | 'created_at'> = {
    persona_id: persona.persona_id,
    name: persona.name,
    description: persona.description || null, // Include description field
    creation_date: persona.creation_date,
    prompt: persona.prompt || null,
    metadata: persona.metadata as unknown as Json,
    trait_profile: persona.trait_profile as unknown as Json,
    behavioral_modulation: persona.behavioral_modulation as unknown as Json,
    linguistic_profile: persona.linguistic_profile as unknown as Json,
    preinterview_tags: persona.preinterview_tags as unknown as Json,
    simulation_directives: persona.simulation_directives as unknown as Json,
    interview_sections: persona.interview_sections as unknown as Json,
    emotional_triggers: emotionalTriggers as unknown as Json,
    is_public: persona.is_public || false,
    user_id: persona.user_id,
    profile_image_url: persona.profile_image_url || null,
    enhanced_metadata_version: persona.enhanced_metadata_version || 2,
  };
  
  console.log("DB persona ready for insert:", {
    persona_id: dbPersona.persona_id,
    name: dbPersona.name,
    description: dbPersona.description,
    has_emotional_triggers: !!dbPersona.emotional_triggers,
    emotional_triggers_structure: emotionalTriggers,
    enhanced_metadata_version: dbPersona.enhanced_metadata_version,
    trait_profile_keys: dbPersona.trait_profile ? Object.keys(dbPersona.trait_profile as any) : []
  });
  
  console.log("=== END PERSONA TO DB CONVERSION ===");
  
  return dbPersona;
}

export function dbPersonaToPersona(dbPersona: DbPersona): Persona {
  console.log("=== CONVERTING DB PERSONA TO APP FORMAT ===");
  console.log("Converting DB persona to app format:", dbPersona.persona_id);
  console.log("DB persona name:", dbPersona.name);
  console.log("DB persona description:", dbPersona.description);
  
  // Handle emotional triggers with proper fallback structure
  const emotionalTriggers = handleEmotionalTriggers(dbPersona.emotional_triggers as unknown as any);
  
  // Handle trait profile data more carefully with comprehensive validation
  let traitProfile = dbPersona.trait_profile as unknown as Record<string, any>;
  
  console.log("=== ANALYZING DB TRAIT PROFILE ===");
  console.log("Raw trait profile type:", typeof traitProfile);
  console.log("Raw trait profile keys:", traitProfile ? Object.keys(traitProfile) : "none");
  
  // Check for various forms of malformed trait data - FIXED VALIDATION LOGIC
  if (!traitProfile || 
      typeof traitProfile !== 'object' || 
      traitProfile._type === "undefined" || 
      traitProfile.value === "undefined" ||
      Object.keys(traitProfile).length === 0) {
    
    console.warn("❌ TRAIT PROFILE DATA IS MALFORMED OR EMPTY");
    console.warn("Creating comprehensive default structure");
    traitProfile = createDefaultTraitProfile();
  } else {
    console.log("✅ Trait profile exists with valid structure, preserving original data");
    
    // Log some sample values to verify we're preserving actual data
    if (traitProfile.big_five) {
      console.log("DB Big Five sample:", {
        openness: traitProfile.big_five.openness,
        conscientiousness: traitProfile.big_five.conscientiousness
      });
    }
    
    // Don't validate - just use the existing data as-is
    // The validator was replacing real data with defaults
  }
  
  console.log("=== FINAL TRAIT PROFILE CHECK ===");
  if (traitProfile.big_five) {
    console.log("Final Big Five values:", {
      openness: traitProfile.big_five.openness,
      conscientiousness: traitProfile.big_five.conscientiousness,
      extraversion: traitProfile.big_five.extraversion
    });
  }
  
  console.log("=== END DB TO PERSONA CONVERSION ===");
  console.log("Final converted description:", dbPersona.description);
  
  return {
    id: dbPersona.id,
    persona_id: dbPersona.persona_id,
    name: dbPersona.name,
    description: dbPersona.description || "", // Include description field with fallback
    creation_date: dbPersona.creation_date,
    prompt: dbPersona.prompt || "",
    metadata: dbPersona.metadata as unknown as PersonaMetadata,
    trait_profile: traitProfile,
    behavioral_modulation: dbPersona.behavioral_modulation as unknown as Record<string, any>,
    linguistic_profile: dbPersona.linguistic_profile as unknown as Record<string, any>,
    preinterview_tags: dbPersona.preinterview_tags as unknown as string[],
    simulation_directives: dbPersona.simulation_directives as unknown as Record<string, any>,
    interview_sections: dbPersona.interview_sections as unknown as InterviewSection[] | {
      interview_sections: InterviewSection[];
    },
    emotional_triggers: emotionalTriggers,
    is_public: dbPersona.is_public || false,
    user_id: dbPersona.user_id,
    profile_image_url: dbPersona.profile_image_url || null,
    enhanced_metadata_version: dbPersona.enhanced_metadata_version || 2,
    created_at: dbPersona.created_at,
    // Add missing required properties with defaults
    persona_context: {},
    persona_type: "generated",
  };
}
