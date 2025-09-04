/**
 * @deprecated V4-only stack - Legacy artifact cleanup markers
 * 
 * This file tracks deprecated patterns from pre-V4 persona system.
 * All new code should use V4 persona format exclusively.
 */

// @deprecated V4-only stack - Old persona format mapping helpers
export const DEPRECATED_PATTERNS = {
  // Zero field mappings like trait_profile: {} 
  // Should be avoided in V4 system where all fields are populated
  ZERO_FIELD_MAPPING: '@deprecated // V4-only stack',
  
  // UUID-based persona IDs instead of v4_ prefixed IDs
  UUID_PERSONA_IDS: '@deprecated // V4-only stack - use v4_ prefixed IDs',
  
  // Manual persona field construction instead of schema-driven creation
  MANUAL_PERSONA_FIELDS: '@deprecated // V4-only stack - use schema validation',
  
  // Old queue status tracking without stage progression
  LEGACY_QUEUE_STATUS: '@deprecated // V4-only stack - use stage-based status'
};

/**
 * @deprecated V4-only stack
 * Helper to identify legacy persona format patterns that should be migrated
 */
export function isLegacyPersonaPattern(personaData: any): boolean {
  return (
    // Has UUID format ID instead of v4_ prefix
    !personaData.persona_id?.startsWith('v4_') ||
    // Missing core V4 schema fields
    !personaData.full_profile?.trait_profile ||
    // Using old creation patterns
    personaData.metadata === undefined
  );
}

/**
 * @deprecated V4-only stack
 * These field mappings should not be used in new V4 persona creation
 */
export const DEPRECATED_FIELD_MAPPINGS = {
  // Don't zero out required fields
  trait_profile: {}, // @deprecated V4-only stack
  communication_style: {}, // @deprecated V4-only stack
  motivation_profile: {}, // @deprecated V4-only stack
};

console.warn('legacy-cleanup.ts: All patterns marked here are deprecated in V4-only stack');