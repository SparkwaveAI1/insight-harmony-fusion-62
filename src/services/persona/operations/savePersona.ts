import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";

export async function savePersona(persona: Persona): Promise<Persona | null> {
  try {
    const { data, error } = await supabase
      .from('v4_personas')
      .insert({
        persona_id: persona.persona_id,
        name: persona.name,
        profile_data: persona,
        user_id: persona.user_id,
        creation_completed: true,
        is_public: persona.is_public || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving persona:', error);
      return null;
    }

    return data ? persona : null;
  } catch (error) {
    console.error('Error in savePersona:', error);
    return null;
  }
}