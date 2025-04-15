
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "./types";
import { personaToDbPersona, dbPersonaToPersona } from "./mappers";

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

export async function getPersonaById(id: string): Promise<Persona | null> {
  try {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? dbPersonaToPersona(data) : null;
  } catch (error) {
    console.error("Error getting persona by ID:", error);
    return null;
  }
}

export async function getPersonaByPersonaId(personaId: string): Promise<Persona | null> {
  try {
    console.log(`Fetching persona with ID ${personaId} from Supabase`);
    
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('persona_id', personaId)
      .single();

    if (error) {
      console.error(`Error fetching persona with ID ${personaId}:`, error);
      return null;
    }

    console.log('Persona found:', data);
    
    if (data) {
      console.log('Interview sections structure:', JSON.stringify(data.interview_sections, null, 2));
      return dbPersonaToPersona(data);
    }
    
    return null;
  } catch (error) {
    console.error("Error getting persona by persona_id:", error);
    return null;
  }
}

export async function getAllPersonas(): Promise<Persona[]> {
  try {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ? data.map(dbPersonaToPersona) : [];
  } catch (error) {
    console.error("Error getting all personas:", error);
    return [];
  }
}

export { generatePersona } from './personaGenerator';
