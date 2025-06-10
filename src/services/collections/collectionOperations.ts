
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Collection, CollectionWithPersonaCount } from "./types";

/**
 * Fetches a specific collection by ID
 */
export const getCollectionById = async (id: string): Promise<Collection | null> => {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching collection:", error);
    toast.error("Failed to fetch collection");
    return null;
  }
};

/**
 * Fetches all collections for the current user
 */
export const getUserCollections = async (): Promise<Collection[]> => {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching collections:", error);
    toast.error("Failed to fetch collections");
    return [];
  }
};

/**
 * Fetches all collections with persona count for the current user
 */
export const getUserCollectionsWithCount = async (): Promise<CollectionWithPersonaCount[]> => {
  try {
    // Since we removed the view, we'll manually count the personas
    const { data: collections, error: collectionsError } = await supabase
      .from("collections")
      .select("*")
      .order("updated_at", { ascending: false });

    if (collectionsError) throw collectionsError;

    // Get persona counts for each collection
    const collectionsWithCount = await Promise.all(
      (collections || []).map(async (collection) => {
        const { count, error: countError } = await supabase
          .from("collection_personas")
          .select("*", { count: "exact", head: true })
          .eq("collection_id", collection.id);

        if (countError) {
          console.error("Error counting personas for collection:", countError);
          return {
            ...collection,
            persona_count: 0
          };
        }

        return {
          ...collection,
          persona_count: count || 0
        };
      })
    );
    
    return collectionsWithCount;
  } catch (error) {
    console.error("Error fetching collections with count:", error);
    toast.error("Failed to fetch collections");
    return [];
  }
};

/**
 * Creates a new collection
 */
export const createCollection = async (name: string, description: string | null = null): Promise<Collection | null> => {
  try {
    // Get the user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to create a collection");
      return null;
    }
    
    // Insert with the user_id
    const { data, error } = await supabase
      .from("collections")
      .insert({ name, description, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    toast.success("Collection created");
    return data;
  } catch (error) {
    console.error("Error creating collection:", error);
    toast.error("Failed to create collection");
    return null;
  }
};

/**
 * Updates an existing collection
 */
export const updateCollection = async (
  id: string,
  updates: { name?: string; description?: string | null }
): Promise<Collection | null> => {
  try {
    const { data, error } = await supabase
      .from("collections")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    toast.success("Collection updated");
    return data;
  } catch (error) {
    console.error("Error updating collection:", error);
    toast.error("Failed to update collection");
    return null;
  }
};

/**
 * Deletes a collection
 */
export const deleteCollection = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("collections").delete().eq("id", id);

    if (error) throw error;
    toast.success("Collection deleted");
    return true;
  } catch (error) {
    console.error("Error deleting collection:", error);
    toast.error("Failed to delete collection");
    return false;
  }
};

/**
 * Fetches personas in a specific collection
 */
export const getCollectionPersonas = async (collectionId: string) => {
  try {
    const { data, error } = await supabase
      .from("collection_personas")
      .select(`
        persona_id,
        added_at,
        personas(*)
      `)
      .eq("collection_id", collectionId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching collection personas:", error);
    toast.error("Failed to fetch collection personas");
    return [];
  }
};

/**
 * Adds multiple personas to a collection
 */
export const addPersonasToCollection = async (collectionId: string, personaIds: string[]): Promise<boolean> => {
  try {
    const insertData = personaIds.map(personaId => ({
      collection_id: collectionId,
      persona_id: personaId
    }));

    const { error } = await supabase
      .from("collection_personas")
      .insert(insertData);

    if (error) throw error;
    toast.success("Personas added to collection");
    return true;
  } catch (error) {
    console.error("Error adding personas to collection:", error);
    toast.error("Failed to add personas to collection");
    return false;
  }
};

/**
 * Removes a persona from a collection
 */
export const removePersonaFromCollection = async (collectionId: string, personaId: string): Promise<boolean> => {
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
 * Gets personas not in a specific collection
 */
export const getPersonasNotInCollection = async (collectionId: string) => {
  try {
    // First get all persona IDs in the collection
    const { data: collectionPersonas, error: collectionError } = await supabase
      .from("collection_personas")
      .select("persona_id")
      .eq("collection_id", collectionId);

    if (collectionError) throw collectionError;

    const personaIdsInCollection = collectionPersonas?.map(cp => cp.persona_id) || [];

    // Then get all personas not in that list
    const { data: personas, error: personasError } = await supabase
      .from("personas")
      .select("*")
      .not("persona_id", "in", `(${personaIdsInCollection.map(id => `"${id}"`).join(",")})`);

    if (personasError) throw personasError;
    return personas || [];
  } catch (error) {
    console.error("Error fetching personas not in collection:", error);
    toast.error("Failed to fetch available personas");
    return [];
  }
};

/**
 * Adds a single persona to a collection
 */
export const addPersonaToCollection = async (collectionId: string, personaId: string): Promise<boolean> => {
  return addPersonasToCollection(collectionId, [personaId]);
};

/**
 * Checks if a persona is in a collection
 */
export const isPersonaInCollection = async (collectionId: string, personaId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("collection_personas")
      .select("id")
      .eq("collection_id", collectionId)
      .eq("persona_id", personaId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return !!data;
  } catch (error) {
    console.error("Error checking if persona is in collection:", error);
    return false;
  }
};

/**
 * Gets personas in a collection
 */
export const getPersonasInCollection = async (collectionId: string) => {
  return getCollectionPersonas(collectionId);
};
