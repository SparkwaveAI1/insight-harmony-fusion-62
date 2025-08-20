import { Persona } from "../types/persona";
import { DbPersona } from "../types/db-models";
import { dbPersonaToPersona, personaToDbPersona } from "./v3Mapper";

// Export the V3 mappers as the main mappers
export { dbPersonaToPersona, personaToDbPersona };

// Legacy mapper support (will be removed in future versions)
export function legacyPersonaToDbPersona(persona: Persona): Omit<DbPersona, 'id' | 'created_at'> {
  return personaToDbPersona(persona);
}

export function legacyDbPersonaToPersona(dbPersona: any): Persona {
  return dbPersonaToPersona(dbPersona);
}