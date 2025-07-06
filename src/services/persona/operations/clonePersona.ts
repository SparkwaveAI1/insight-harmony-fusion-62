
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";
import { mapPersonaToDbPersona, mapDbPersonaToPersona } from "../mappers";
import { v4 as uuidv4 } from 'uuid';

export const clonePersona = async (originalPersona: Persona, newName: string): Promise<Persona> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to clone a persona');
  }

  // Create a new persona with updated fields
  const clonedPersona: Persona = {
    ...originalPersona,
    persona_id: `persona-${uuidv4().substring(0, 6)}`,
    name: newName,
    user_id: user.id,
    creation_date: new Date().toISOString().split('T')[0],
    is_public: false, // Clones are private by default
  };

  // Convert to database format (excluding auto-generated fields)
  const dbPersona = mapPersonaToDbPersona(clonedPersona);

  const { data, error } = await supabase
    .from('personas')
    .insert(dbPersona)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to clone persona: ${error.message}`);
  }

  return mapDbPersonaToPersona(data);
};
