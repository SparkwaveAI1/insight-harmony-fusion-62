import { V4Persona } from '@/types/persona-v4';

/**
 * Utility functions for detecting and working with different persona versions
 */

export interface PersonaVersionInfo {
  isV4: boolean;
  isV3: boolean;
  isLegacy: boolean;
  version?: string;
  source: 'v4_table' | 'personas_table' | 'unknown';
}

/**
 * Determines the version and type of a persona object
 */
export function detectPersonaVersion(persona: any): PersonaVersionInfo {
  // Check if this is a V4 persona from the v4_personas table
  if (persona.schema_version && persona.full_profile && persona.conversation_summary) {
    return {
      isV4: true,
      isV3: false,
      isLegacy: false,
      version: persona.schema_version,
      source: 'v4_table'
    };
  }
  
  // Check if version field indicates V4
  if (persona.version === 'v4.0' || persona.version?.startsWith('v4')) {
    return {
      isV4: true,
      isV3: false,
      isLegacy: false,
      version: persona.version,
      source: 'personas_table'
    };
  }
  
  // Check if this has V3 structure (persona_data with cognitive_profile)
  if (persona.persona_data?.cognitive_profile) {
    return {
      isV4: false,
      isV3: true,
      isLegacy: false,
      version: persona.version || 'v3.0',
      source: 'personas_table'
    };
  }
  
  // Check if this has legacy structure
  if (persona.trait_profile || persona.metadata) {
    return {
      isV4: false,
      isV3: false,
      isLegacy: true,
      version: persona.version || 'legacy',
      source: 'personas_table'
    };
  }
  
  return {
    isV4: false,
    isV3: false,
    isLegacy: false,
    source: 'unknown'
  };
}

/**
 * Type guard to check if a persona is a V4 persona
 */
export function isV4Persona(persona: any): persona is V4Persona {
  const versionInfo = detectPersonaVersion(persona);
  return versionInfo.isV4;
}

/**
 * Extracts the appropriate data structure for display based on persona version
 */
export function extractPersonaDisplayData(persona: any) {
  const versionInfo = detectPersonaVersion(persona);
  
  if (versionInfo.isV4) {
    return {
      version: versionInfo,
      name: persona.name,
      personaId: persona.persona_id,
      createdAt: persona.created_at,
      fullProfile: persona.full_profile,
      conversationSummary: persona.conversation_summary,
      physicalDescription: persona.conversation_summary?.physical_description
    };
  }
  
  if (versionInfo.isV3) {
    return {
      version: versionInfo,
      name: persona.name,
      personaId: persona.persona_id,
      createdAt: persona.created_at,
      cognitiveProfile: persona.persona_data?.cognitive_profile,
      identity: persona.persona_data?.identity,
      emotionalTriggers: persona.persona_data?.emotional_triggers,
      interviewSections: persona.persona_data?.interview_sections
    };
  }
  
  // Legacy format
  return {
    version: versionInfo,
    name: persona.name,
    personaId: persona.persona_id,
    createdAt: persona.created_at,
    traitProfile: persona.trait_profile,
    metadata: persona.metadata,
    emotionalTriggers: persona.emotional_triggers,
    interviewSections: persona.interview_sections
  };
}

/**
 * Gets the appropriate download data based on persona version
 */
export function getPersonaDownloadData(persona: any) {
  const versionInfo = detectPersonaVersion(persona);
  
  if (versionInfo.isV4) {
    return {
      persona_id: persona.persona_id,
      id: persona.id,
      name: persona.name,
      schema_version: persona.schema_version,
      created_at: persona.created_at,
      updated_at: persona.updated_at,
      user_id: persona.user_id,
      full_profile: persona.full_profile,
      conversation_summary: persona.conversation_summary,
      creation_stage: persona.creation_stage,
      creation_completed: persona.creation_completed
    };
  }
  
  if (versionInfo.isV3) {
    return {
      persona_id: persona.persona_id,
      id: persona.id,
      name: persona.name,
      version: persona.version,
      created_at: persona.created_at,
      updated_at: persona.updated_at,
      user_id: persona.user_id,
      is_public: persona.is_public,
      profile_image_url: persona.profile_image_url,
      description: persona.description,
      persona_data: persona.persona_data
    };
  }
  
  // Legacy format (existing downloadUtils logic)
  return {
    persona_id: persona.persona_id,
    id: persona.id,
    name: persona.name,
    creation_date: persona.creation_date,
    created_at: persona.created_at,
    metadata: persona.metadata,
    trait_profile: persona.trait_profile,
    behavioral_modulation: persona.behavioral_modulation,
    linguistic_profile: persona.linguistic_profile,
    emotional_triggers: persona.emotional_triggers,
    interview_sections: persona.interview_sections,
    simulation_directives: persona.simulation_directives,
    preinterview_tags: persona.preinterview_tags,
    prompt: persona.prompt,
    user_id: persona.user_id,
    is_public: persona.is_public,
    profile_image_url: persona.profile_image_url,
    enhanced_metadata_version: persona.enhanced_metadata_version,
    persona_type: persona.persona_type,
    persona_context: persona.persona_context
  };
}