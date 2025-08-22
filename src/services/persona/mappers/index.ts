import { Persona } from "../types/persona";
import { DbPersona } from "../types/db-models";

// Legacy mappers - V3 mappers removed
// V4 personas use different data structure and don't need these mappers
export function personaToDbPersona(persona: Persona): Omit<DbPersona, 'id' | 'created_at'> {
  console.warn("Legacy mapper used - V4 personas should use direct database operations");
  return {
    persona_id: persona.persona_id,
    name: persona.name,
    description: persona.description || "",
    user_id: persona.user_id,
    is_public: persona.is_public || false,
    profile_image_url: persona.profile_image_url,
    prompt: persona.prompt || "",
    version: persona.version || "legacy",
    persona_data: persona as any,
    updated_at: persona.updated_at || new Date().toISOString()
  };
}

export function dbPersonaToPersona(dbPersona: any): Persona {
  console.warn("Legacy mapper used - V4 personas should use direct database operations");
  return {
    id: dbPersona.id,
    persona_id: dbPersona.persona_id,
    name: dbPersona.name,
    description: dbPersona.description,
    user_id: dbPersona.user_id,
    is_public: dbPersona.is_public,
    profile_image_url: dbPersona.profile_image_url,
    prompt: dbPersona.prompt,
    version: dbPersona.version,
    created_at: dbPersona.created_at,
    updated_at: dbPersona.updated_at,
    ...dbPersona.persona_data
  };
}