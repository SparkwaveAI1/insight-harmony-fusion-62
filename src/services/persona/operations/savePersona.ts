
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";
import { mapPersonaToDbPersona, mapDbPersonaToPersona } from "../mappers";

export const savePersona = async (persona: Persona): Promise<Persona> => {
  try {
    // Convert to database format
    const dbPersona = mapPersonaToDbPersona(persona);
    
    // Insert the persona
    const { data, error } = await supabase
      .from('personas')
      .insert(dbPersona)
      .select()
      .single();

    if (error) {
      console.error('Database error when saving persona:', error);
      throw new Error(`Failed to save persona: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned after saving persona');
    }

    // Convert back to application format
    return mapDbPersonaToPersona(data);

  } catch (error) {
    console.error('Error in savePersona:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while saving persona');
  }
};
