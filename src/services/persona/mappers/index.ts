import { Persona } from "../types";
import { DbPersona } from "../types/db-models";

export const mapDbPersonaToPersona = (dbPersona: any): Persona => {
  return {
    persona_id: dbPersona.persona_id,
    name: dbPersona.name,
    creation_date: dbPersona.creation_date,
    metadata: dbPersona.metadata || {},
    trait_profile: dbPersona.trait_profile || undefined,
    behavioral_modulation: dbPersona.behavioral_modulation || undefined,
    linguistic_profile: dbPersona.linguistic_profile || undefined,
    emotional_triggers: dbPersona.emotional_triggers || undefined,
    preinterview_tags: dbPersona.preinterview_tags || [],
    simulation_directives: dbPersona.simulation_directives || undefined,
    interview_sections: Array.isArray(dbPersona.interview_sections) 
      ? dbPersona.interview_sections 
      : dbPersona.interview_sections?.interview_sections || [],
    description: dbPersona.description || undefined,
    is_public: dbPersona.is_public || false,
    user_id: dbPersona.user_id || undefined,
    profile_image_url: dbPersona.profile_image_url || undefined,
    enhanced_metadata_version: dbPersona.enhanced_metadata_version || 2,
    prompt: dbPersona.prompt || undefined
  };
};

export const mapPersonaToDbPersona = (persona: Persona): Omit<DbPersona, 'id' | 'created_at'> => {
  return {
    persona_id: persona.persona_id,
    name: persona.name,
    creation_date: persona.creation_date,
    metadata: persona.metadata,
    behavioral_modulation: persona.behavioral_modulation || {},
    interview_sections: persona.interview_sections || [],
    linguistic_profile: persona.linguistic_profile || {},
    preinterview_tags: persona.preinterview_tags || [],
    simulation_directives: persona.simulation_directives || {},
    trait_profile: persona.trait_profile || {},
    emotional_triggers: persona.emotional_triggers || { positive_triggers: [], negative_triggers: [] },
    prompt: persona.prompt,
    user_id: persona.user_id,
    is_public: persona.is_public || false,
    profile_image_url: persona.profile_image_url,
    enhanced_metadata_version: persona.enhanced_metadata_version || 2,
    description: persona.description
  };
};
