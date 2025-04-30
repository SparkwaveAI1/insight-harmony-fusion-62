import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Adds a persona to a collection
 */
export const addPersonaToCollection = async (
  collectionId: string,
  personaId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("collection_personas")
      .insert({ collection_id: collectionId, persona_id: personaId });

    if (error) throw error;
    toast.success("Persona added to collection");
    return true;
  } catch (error) {
    console.error("Error adding persona to collection:", error);
    toast.error("Failed to add persona to collection");
    return false;
  }
};

/**
 * Removes a persona from a collection
 */
export const removePersonaFromCollection = async (
  collectionId: string,
  personaId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("collection_personas")
      .delete()
      .eq("collection_id", collectionId)
      .eq("persona_id", personaId);

    if (error) throw error;
    toast.success("Persona removed from collection");
    return true;
  } catch (error) {
    console.error("Error removing persona from collection:", error);
    toast.error("Failed to remove persona from collection");
    return false;
  }
};

/**
 * Gets all personas in a collection
 */
export const getPersonasInCollection = async (collectionId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("collection_personas")
      .select("persona_id")
      .eq("collection_id", collectionId);

    if (error) throw error;
    return data.map(item => item.persona_id) || [];
  } catch (error) {
    console.error("Error fetching personas in collection:", error);
    toast.error("Failed to fetch personas in collection");
    return [];
  }
};

/**
 * Checks if a persona is in a collection
 */
export const isPersonaInCollection = async (
  collectionId: string,
  personaId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("collection_personas")
      .select("id")
      .eq("collection_id", collectionId)
      .eq("persona_id", personaId)
      .single();

    if (error && error.code !== 'PGRST116') return false; // Not found error
    return !!data;
  } catch (error) {
    console.error("Error checking if persona is in collection:", error);
    return false;
  }
};

/**
 * Gets all personas that are not in a collection
 */
export const getPersonasNotInCollection = async (collectionId: string): Promise<string[]> => {
  try {
    // First, get all personas that are in the collection
    const { data: collectionPersonas, error: collectionError } = await supabase
      .from("collection_personas")
      .select("persona_id")
      .eq("collection_id", collectionId);

    if (collectionError) throw collectionError;
    
    // Extract persona IDs that are already in the collection
    const personaIdsInCollection = collectionPersonas.map(item => item.persona_id) || [];
    
    if (personaIdsInCollection.length === 0) {
      // If no personas in collection, get all personas
      const { data: allPersonas, error: personaError } = await supabase
        .from("personas")
        .select("persona_id");
      
      if (personaError) throw personaError;
      return allPersonas.map(persona => persona.persona_id);
    } else {
      // Otherwise, get personas not in the collection
      const { data: personasNotInCollection, error: personaError } = await supabase
        .from("personas")
        .select("persona_id")
        .not('persona_id', 'in', `(${personaIdsInCollection.map(id => `'${id}'`).join(',')})`);
      
      if (personaError) throw personaError;
      return personasNotInCollection.map(persona => persona.persona_id);
    }
  } catch (error) {
    console.error("Error fetching personas not in collection:", error);
    toast.error("Failed to fetch personas not in collection");
    return [];
  }
};
