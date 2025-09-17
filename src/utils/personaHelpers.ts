/**
 * Persona ID validation and utility helpers
 * Single source of truth for persona ID operations
 */

import { getV4PersonaById } from '@/services/v4-persona/getV4Personas';

/**
 * Validates if a string is a properly formatted V4 persona ID
 */
export function isV4PersonaId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  
  // V4 persona IDs follow pattern: v4_{timestamp}_{random}
  const v4Pattern = /^v4_\d{13}_[a-z0-9]{9}$/;
  return v4Pattern.test(id);
}

/**
 * Ensures persona ID is valid format - throws if not
 */
export function ensureValidPersonaId(id: string): void {
  if (!isV4PersonaId(id)) {
    throw new Error(`Invalid persona ID format: ${id}. Expected v4_{timestamp}_{random}`);
  }
}

/**
 * Gets display name for a persona ID, with fallback
 * Returns "Unknown Persona" if persona doesn't exist or ID is invalid
 */
export async function getPersonaDisplayName(id: string): Promise<string> {
  try {
    if (!isV4PersonaId(id)) {
      return `Invalid ID: ${id}`;
    }
    
    const persona = await getV4PersonaById(id);
    return persona?.name || "Unknown Persona";
  } catch (error) {
    console.error('Error getting persona display name:', error);
    return "Unknown Persona";
  }
}

/**
 * Safe persona ID extraction from various sources
 */
export function extractPersonaId(input: any): string | null {
  if (!input) return null;
  
  // Handle different input types
  if (typeof input === 'string') {
    return isV4PersonaId(input) ? input : null;
  }
  
  if (typeof input === 'object') {
    const id = input.persona_id || input.id || input.personaId;
    return typeof id === 'string' && isV4PersonaId(id) ? id : null;
  }
  
  return null;
}