
import { DbPersona, Persona, PersonaMetadata, InterviewSection } from "./types";
import { Json } from "@/integrations/supabase/types";

export function personaToDbPersona(persona: Persona): DbPersona {
  console.log("Converting persona to DB format:", persona.persona_id);
  
  const dbPersona = {
    ...persona,
    metadata: persona.metadata as unknown as Json,
    trait_profile: persona.trait_profile as unknown as Json,
    behavioral_modulation: persona.behavioral_modulation as unknown as Json,
    linguistic_profile: persona.linguistic_profile as unknown as Json,
    preinterview_tags: persona.preinterview_tags as unknown as Json,
    simulation_directives: persona.simulation_directives as unknown as Json,
    interview_sections: persona.interview_sections as unknown as Json,
    // Ensure emotional_triggers is properly handled
    emotional_triggers: persona.emotional_triggers ? persona.emotional_triggers as unknown as Json : null,
  };
  
  console.log("DB persona ready for insert:", {
    persona_id: dbPersona.persona_id,
    name: dbPersona.name,
    has_emotional_triggers: !!dbPersona.emotional_triggers
  });
  
  return dbPersona;
}

export function dbPersonaToPersona(dbPersona: DbPersona): Persona {
  console.log("Converting DB persona to app format:", dbPersona.persona_id);
  
  return {
    ...dbPersona,
    metadata: dbPersona.metadata as unknown as PersonaMetadata,
    trait_profile: dbPersona.trait_profile as unknown as Record<string, any>,
    behavioral_modulation: dbPersona.behavioral_modulation as unknown as Record<string, any>,
    linguistic_profile: dbPersona.linguistic_profile as unknown as Record<string, any>,
    preinterview_tags: dbPersona.preinterview_tags as unknown as string[],
    simulation_directives: dbPersona.simulation_directives as unknown as Record<string, any>,
    interview_sections: dbPersona.interview_sections as unknown as InterviewSection[] | {
      interview_sections: InterviewSection[];
    },
    // Handle emotional_triggers with fallback
    emotional_triggers: dbPersona.emotional_triggers as unknown as any || {
      positive_triggers: [],
      negative_triggers: []
    },
    persona_context: {}, // Add missing required property
    persona_type: "generated", // Add default value for missing required property
  };
}
