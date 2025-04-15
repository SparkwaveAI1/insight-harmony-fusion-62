
import { DbPersona, Persona, PersonaMetadata } from "./types";
import { Json } from "@/integrations/supabase/types";

export function personaToDbPersona(persona: Persona): DbPersona {
  return {
    ...persona,
    metadata: persona.metadata as unknown as Json,
    trait_profile: persona.trait_profile as unknown as Json,
    behavioral_modulation: persona.behavioral_modulation as unknown as Json,
    linguistic_profile: persona.linguistic_profile as unknown as Json,
    preinterview_tags: persona.preinterview_tags as unknown as Json,
    simulation_directives: persona.simulation_directives as unknown as Json,
    interview_sections: persona.interview_sections as unknown as Json,
  };
}

export function dbPersonaToPersona(dbPersona: DbPersona): Persona {
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
  };
}
