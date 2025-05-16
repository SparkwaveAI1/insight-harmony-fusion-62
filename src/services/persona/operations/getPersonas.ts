
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "../types";
import { dbPersonaToPersona } from "../mappers";

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
    
    if (!personaId) {
      console.error('Invalid persona ID: empty string');
      return null;
    }
    
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('persona_id', personaId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no rows are returned

    if (error) {
      console.error(`Error fetching persona with ID ${personaId}:`, error);
      return null;
    }

    if (!data) {
      console.log(`No persona found with ID ${personaId}`);
      return null;
    }
    
    console.log('Persona found:', data);
    
    try {
      // Handle potential JSON parsing issues with interview_sections
      console.log('Interview sections structure:', JSON.stringify(data.interview_sections, null, 2));
      return dbPersonaToPersona(data);
    } catch (parseError) {
      console.error('Error parsing persona data:', parseError);
      return null;
    }
  } catch (error) {
    console.error("Error getting persona by persona_id:", error);
    return null;
  }
}

export async function getAllPersonas(): Promise<Persona[]> {
  try {
    console.log("Fetching all personas from Supabase");
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching all personas:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} personas from database`);
    return data ? data.map(dbPersonaToPersona) : [];
  } catch (error) {
    console.error("Error getting all personas:", error);
    return [];
  }
}

export async function getPersonasByCollection(collectionId: string): Promise<Persona[]> {
  try {
    // First get the persona_ids from the collection_personas table
    const { data: collectionPersonas, error: collectionError } = await supabase
      .from('collection_personas')
      .select('persona_id')
      .eq('collection_id', collectionId);

    if (collectionError) throw collectionError;
    
    if (!collectionPersonas || collectionPersonas.length === 0) {
      return [];
    }
    
    // Extract the persona_ids
    const personaIds = collectionPersonas.map(cp => cp.persona_id);
    
    // Then fetch the actual personas
    const { data: personas, error: personasError } = await supabase
      .from('personas')
      .select('*')
      .in('persona_id', personaIds)
      .order('created_at', { ascending: false });
    
    if (personasError) throw personasError;
    
    return personas ? personas.map(dbPersonaToPersona) : [];
  } catch (error) {
    console.error("Error getting personas by collection:", error);
    return [];
  }
}
