
import { DbPersona, Persona, PersonaMetadata, InterviewSection } from "./types";
import { Json } from "@/integrations/supabase/types";

export function personaToDbPersona(persona: Persona): DbPersona {
  console.log("Converting persona to DB format:", persona.persona_id);
  
  // Only include fields that exist as columns in the database
  const dbPersona: DbPersona = {
    persona_id: persona.persona_id,
    name: persona.name,
    creation_date: persona.creation_date,
    prompt: persona.prompt || null,
    metadata: persona.metadata as unknown as Json,
    trait_profile: persona.trait_profile as unknown as Json,
    behavioral_modulation: persona.behavioral_modulation as unknown as Json,
    linguistic_profile: persona.linguistic_profile as unknown as Json,
    preinterview_tags: persona.preinterview_tags as unknown as Json,
    simulation_directives: persona.simulation_directives as unknown as Json,
    interview_sections: persona.interview_sections as unknown as Json,
    emotional_triggers: persona.emotional_triggers ? persona.emotional_triggers as unknown as Json : null,
    is_public: persona.is_public || false,
    user_id: persona.user_id,
    profile_image_url: persona.profile_image_url || null,
    enhanced_metadata_version: persona.enhanced_metadata_version || 2,
  };
  
  console.log("DB persona ready for insert:", {
    persona_id: dbPersona.persona_id,
    name: dbPersona.name,
    has_emotional_triggers: !!dbPersona.emotional_triggers,
    enhanced_metadata_version: dbPersona.enhanced_metadata_version
  });
  
  return dbPersona;
}

export function dbPersonaToPersona(dbPersona: DbPersona): Persona {
  console.log("Converting DB persona to app format:", dbPersona.persona_id);
  
  return {
    id: dbPersona.id,
    persona_id: dbPersona.persona_id,
    name: dbPersona.name,
    creation_date: dbPersona.creation_date,
    prompt: dbPersona.prompt || "",
    metadata: dbPersona.metadata as unknown as PersonaMetadata,
    trait_profile: dbPersona.trait_profile as unknown as Record<string, any>,
    behavioral_modulation: dbPersona.behavioral_modulation as unknown as Record<string, any>,
    linguistic_profile: dbPersona.linguistic_profile as unknown as Record<string, any>,
    preinterview_tags: dbPersona.preinterview_tags as unknown as string[],
    simulation_directives: dbPersona.simulation_directives as unknown as Record<string, any>,
    interview_sections: dbPersona.interview_sections as unknown as InterviewSection[] | {
      interview_sections: InterviewSection[];
    },
    emotional_triggers: dbPersona.emotional_triggers as unknown as any || {
      positive_triggers: [],
      negative_triggers: []
    },
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
