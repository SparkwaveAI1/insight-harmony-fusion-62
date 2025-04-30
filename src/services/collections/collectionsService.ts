
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollectionWithPersonaCount extends Collection {
  persona_count: number;
}

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
    const { data, error } = await supabase
      .from("collections")
      .select(`
        *,
        persona_count: collection_personas(count)
      `)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    
    // Transform the data to match the CollectionWithPersonaCount interface
    const transformedData = data?.map(collection => ({
      ...collection,
      persona_count: collection.persona_count?.[0]?.count || 0
    })) as CollectionWithPersonaCount[];
    
    return transformedData || [];
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
