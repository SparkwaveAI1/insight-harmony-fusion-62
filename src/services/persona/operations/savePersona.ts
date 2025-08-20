
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";
import { personaToDbPersona, dbPersonaToPersona } from "../mappers/v3Mapper";

export async function savePersona(persona: Persona): Promise<Persona | null> {
  try {
    console.log("Saving persona to Supabase:", persona.persona_id);
    console.log("Full persona data being saved:", JSON.stringify(persona, null, 2));
    
    const dbPersona = personaToDbPersona(persona);
    
    const { data, error } = await supabase
      .from('personas')
      .insert(dbPersona)
      .select()
      .single();

    if (error) {
      console.error("Error saving persona to Supabase:", error);
      throw error;
    }
    
    console.log("Persona successfully saved:", data);
    return dbPersonaToPersona(data);
  } catch (error) {
    console.error("Error in savePersona:", error);
    throw error;
  }
}
