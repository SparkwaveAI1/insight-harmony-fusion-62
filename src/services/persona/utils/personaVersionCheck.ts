import { Persona } from '../types/persona';
import { PersonaV2 } from '../../../types/persona-v2';

export function isPersonaV2(persona: any): persona is PersonaV2 {
  // Check for PersonaV2 specific structure
  return (
    persona && 
    typeof persona === 'object' &&
    'identity' in persona &&
    'life_context' in persona &&
    'cognitive_profile' in persona
  );
}

export function isPersonaV1(persona: any): persona is Persona {
  // Check for V1 specific structure
  return (
    persona &&
    typeof persona === 'object' &&
    'persona_id' in persona &&
    'metadata' in persona &&
    'trait_profile' in persona &&
    !isPersonaV2(persona)
  );
}

export function getPersonaVersion(persona: any): 'v1' | 'v2' | 'unknown' {
  if (isPersonaV2(persona)) return 'v2';
  if (isPersonaV1(persona)) return 'v1';
  return 'unknown';
}

export function needsMigration(persona: any): boolean {
  return getPersonaVersion(persona) === 'v1';
}