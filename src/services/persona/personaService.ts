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

/**
 * Updates the visibility (public/private) status of a persona
 */
export async function updatePersonaVisibility(personaId: string, isPublic: boolean): Promise<boolean> {
  try {
    console.log(`Setting persona ${personaId} visibility to ${isPublic ? 'public' : 'private'}`);
    
    const { error } = await supabase
      .from('personas')
      .update({ is_public: isPublic })
      .eq('persona_id', personaId);

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating persona visibility:", error);
    return false;
  }
}

/**
 * Deletes a persona permanently
 */
export async function deletePersona(personaId: string): Promise<boolean> {
  try {
    console.log(`Deleting persona with ID ${personaId}`);
    
    // First, remove all collection references
    const { error: collectionError } = await supabase
      .from('collection_personas')
      .delete()
      .eq('persona_id', personaId);
    
    if (collectionError) {
      console.error("Error removing persona from collections:", collectionError);
      // Continue with deletion anyway
    }
    
    // Delete the persona
    const { error } = await supabase
      .from('personas')
      .delete()
      .eq('persona_id', personaId);

    if (error) {
      console.error("Error in final persona deletion:", error);
      throw error;
    }
    
    console.log("Persona successfully deleted");
    return true;
  } catch (error) {
    console.error("Error deleting persona:", error);
    return false;
  }
}

export async function clonePersona(personaData: Persona): Promise<Persona | null> {
  try {
    console.log("Cloning persona with customizations");
    
    // Generate a new persona_id
    personaData.persona_id = crypto.randomUUID().substring(0, 8);
    // Update creation date
    personaData.creation_date = new Date().toISOString().split('T')[0];
    
    // Convert to the format expected by the database
    const dbPersona = personaToDbPersona(personaData);
    
    const { data, error } = await supabase
      .from('personas')
      .insert(dbPersona)
      .select()
      .single();

    if (error) {
      console.error("Error cloning persona:", error);
      throw error;
    }
    
    console.log("Persona successfully cloned:", data);
    return dbPersonaToPersona(data);
  } catch (error) {
    console.error("Error in clonePersona:", error);
    return null;
  }
}

export { generatePersona } from './personaGenerator';
export type { Persona, InterviewSection, InterviewQuestion } from './types';
