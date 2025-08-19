import { DbPersonaV2 } from '@/services/persona/types/persona-v2-db';
import { Persona } from '@/services/persona/types';

/**
 * Temporary adapter to convert V2 personas to V1 format for legacy components
 * This should be removed once all components are migrated to V2
 */
export function adaptV2ToV1Persona(v2Persona: DbPersonaV2): Persona {
  return {
    persona_id: v2Persona.persona_id,
    id: v2Persona.id,
    name: v2Persona.name,
    creation_date: v2Persona.created_at,
    created_at: v2Persona.created_at,
    user_id: v2Persona.user_id,
    is_public: v2Persona.is_public,
    profile_image_url: v2Persona.profile_image_url,
    description: v2Persona.description || '',
    persona_type: v2Persona.persona_type,
    persona_context: v2Persona.description || '',
    
    // Empty V1 fields for compatibility
    metadata: {},
    trait_profile: {},
    behavioral_modulation: {},
    linguistic_profile: {},
    emotional_triggers: {},
    interview_sections: [],
    simulation_directives: {},
    preinterview_tags: [],
    prompt: v2Persona.description || '',
    enhanced_metadata_version: null
  };
}

/**
 * Adapter to convert V1 persona back to V2 after updates
 * This maintains V2 structure while preserving V1 updates
 */
export function adaptV1ToV2Persona(v1Persona: Persona, originalV2: DbPersonaV2): DbPersonaV2 {
  return {
    ...originalV2,
    name: v1Persona.name,
    description: v1Persona.description || v1Persona.persona_context,
    is_public: v1Persona.is_public,
    profile_image_url: v1Persona.profile_image_url,
    updated_at: new Date().toISOString()
  };
}