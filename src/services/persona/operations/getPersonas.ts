
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
      // Handle potential JSON parsing issues with persona_data
      console.log('Persona data structure:', JSON.stringify(data.persona_data, null, 2));
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

// Lightweight version for listing personas (without heavy metadata)
export async function getPersonasForListing(): Promise<Persona[]> {
  try {
    console.log("Fetching personas for listing from Supabase");
    const { data, error } = await supabase
      .from('personas')
      .select('id, persona_id, name, description, user_id, is_public, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching personas for listing:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} personas for listing`);
    return data ? data.map(item => ({
      id: item.id,
      persona_id: item.persona_id,
      name: item.name,
      description: item.description || `Created on ${new Date(item.created_at).toLocaleDateString()}`,
      user_id: item.user_id,
      is_public: item.is_public,
      created_at: item.created_at,
      updated_at: item.created_at,
      // Placeholder values for required fields
      metadata: {},
      trait_profile: {},
      behavioral_modulation: {},
      linguistic_profile: {},
      emotional_triggers: null,
      preinterview_tags: [],
      simulation_directives: {},
      interview_sections: [],
      prompt: null
    } as Persona)) : [];
  } catch (error) {
    console.error("Error getting personas for listing:", error);
    return [];
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

// Lightweight version for collection personas
export async function getPersonasByCollectionForListing(collectionId: string): Promise<Persona[]> {
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
    
    // Then fetch the actual personas (lightweight)
    const { data: personas, error: personasError } = await supabase
      .from('personas')
      .select('id, persona_id, name, description, user_id, is_public, created_at')
      .in('persona_id', personaIds)
      .order('created_at', { ascending: false });
    
    if (personasError) throw personasError;
    
    return personas ? personas.map(item => ({
      id: item.id,
      persona_id: item.persona_id,
      name: item.name,
      description: item.description || `Created on ${new Date(item.created_at).toLocaleDateString()}`,
      user_id: item.user_id,
      is_public: item.is_public,
      created_at: item.created_at,
      updated_at: item.created_at,
      // Placeholder values for required fields
      metadata: {},
      trait_profile: {},
      behavioral_modulation: {},
      linguistic_profile: {},
      emotional_triggers: null,
      preinterview_tags: [],
      simulation_directives: {},
      interview_sections: [],
      prompt: null
    } as Persona)) : [];
  } catch (error) {
    console.error("Error getting personas by collection for listing:", error);
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
