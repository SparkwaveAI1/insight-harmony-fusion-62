import { Persona } from '../types/persona';
import { DbPersona } from '../types/db-models';

export function personaToDbPersona(persona: Persona): Omit<DbPersona, 'id' | 'created_at'> {
  return {
    persona_id: persona.persona_id,
    name: persona.name,
    description: persona.description || null,
    user_id: persona.user_id,
    is_public: persona.is_public || false,
    profile_image_url: persona.profile_image_url || null,
    prompt: persona.prompt || null,
    enhanced_metadata_version: persona.enhanced_metadata_version || 3,
    
    // Store all persona data in the persona_data JSONB field
    persona_data: persona.persona_data,
    
    // Voicepack cache
    voicepack_runtime: persona.voicepack_runtime || null,
    voicepack_hash: persona.voicepack_hash || null,
    
    // Legacy fields - map from persona_data for backwards compatibility
    creation_date: persona.persona_data?.creation_date || new Date().toISOString(),
    metadata: persona.persona_data?.metadata || {},
    behavioral_modulation: persona.persona_data?.behavioral_modulation || {},
    interview_sections: persona.persona_data?.interview_sections || [],
    linguistic_profile: persona.persona_data?.linguistic_profile || {},
    preinterview_tags: persona.persona_data?.preinterview_tags || [],
    simulation_directives: persona.persona_data?.simulation_directives || {},
    trait_profile: persona.persona_data?.trait_profile || {},
    emotional_triggers: persona.persona_data?.emotional_triggers || {}
  };
}

export function dbPersonaToPersona(dbPersona: any): Persona {
  // Support both V3 (persona_data) and legacy formats
  const hasPersonaData = dbPersona.persona_data && Object.keys(dbPersona.persona_data).length > 0;
  
  return {
    id: dbPersona.id,
    persona_id: dbPersona.persona_id,
    name: dbPersona.name,
    description: dbPersona.description,
    created_at: dbPersona.created_at,
    updated_at: dbPersona.updated_at,
    user_id: dbPersona.user_id,
    is_public: dbPersona.is_public,
    profile_image_url: dbPersona.profile_image_url,
    prompt: dbPersona.prompt,
    enhanced_metadata_version: dbPersona.enhanced_metadata_version,
    
    // Primary V3 structure
    persona_data: hasPersonaData ? dbPersona.persona_data : {
      metadata: dbPersona.metadata || {},
      trait_profile: dbPersona.trait_profile || {},
      behavioral_modulation: dbPersona.behavioral_modulation || {},
      linguistic_profile: dbPersona.linguistic_profile || {},
      interview_sections: dbPersona.interview_sections || [],
      emotional_triggers: dbPersona.emotional_triggers || {},
      preinterview_tags: dbPersona.preinterview_tags || [],
      simulation_directives: dbPersona.simulation_directives || {},
      persona_context: dbPersona.persona_context || {},
      persona_type: dbPersona.persona_type || 'humanoid',
      creation_date: dbPersona.creation_date || dbPersona.created_at
    },
    
    // Voicepack cache
    voicepack_runtime: dbPersona.voicepack_runtime,
    voicepack_hash: dbPersona.voicepack_hash,
    
    // Legacy support - expose persona_data fields at root level for backwards compatibility
    metadata: hasPersonaData ? dbPersona.persona_data.metadata : dbPersona.metadata,
    trait_profile: hasPersonaData ? dbPersona.persona_data.trait_profile : dbPersona.trait_profile,
    behavioral_modulation: hasPersonaData ? dbPersona.persona_data.behavioral_modulation : dbPersona.behavioral_modulation,
    linguistic_profile: hasPersonaData ? dbPersona.persona_data.linguistic_profile : dbPersona.linguistic_profile,
    interview_sections: hasPersonaData ? dbPersona.persona_data.interview_sections : dbPersona.interview_sections,
    emotional_triggers: hasPersonaData ? dbPersona.persona_data.emotional_triggers : dbPersona.emotional_triggers,
    preinterview_tags: hasPersonaData ? dbPersona.persona_data.preinterview_tags : dbPersona.preinterview_tags,
    simulation_directives: hasPersonaData ? dbPersona.persona_data.simulation_directives : dbPersona.simulation_directives,
    persona_context: hasPersonaData ? dbPersona.persona_data.persona_context : dbPersona.persona_context,
    persona_type: hasPersonaData ? dbPersona.persona_data.persona_type : dbPersona.persona_type,
    creation_date: hasPersonaData ? dbPersona.persona_data.creation_date : dbPersona.creation_date
  };
}