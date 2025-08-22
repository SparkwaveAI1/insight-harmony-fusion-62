
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";
import { personaToDbPersona, dbPersonaToPersona } from "../mappers";

export async function savePersona(persona: Persona): Promise<Persona | null> {
  try {
    // Legacy savePersona is deprecated - V4 personas use different creation flow
    console.warn('savePersona is deprecated - use V4 persona creation instead');
    throw new Error('Legacy persona saving is no longer supported. Please use V4 persona creation.');
  } catch (error) {
    console.error("Error in savePersona:", error);
    throw error;
  }
}
