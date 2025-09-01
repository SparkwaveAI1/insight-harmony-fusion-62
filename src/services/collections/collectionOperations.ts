
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
 * Fetches all collections for the current user (both public and private)
 */
export const getUserCollections = async (): Promise<Collection[]> => {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user collections:", error);
    toast.error("Failed to fetch collections");
    return [];
  }
};

/**
 * Fetches all public collections (from all users)
 */
export const getPublicCollections = async (): Promise<Collection[]> => {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("is_public", true)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching public collections:", error);
    toast.error("Failed to fetch public collections");
    return [];
  }
};

/**
 * Fetches all collections with persona count for the current user
 */
export const getUserCollectionsWithCount = async (): Promise<CollectionWithPersonaCount[]> => {
  try {
    // Since we removed the view, we'll manually count the personas
    const { data: collections, error } = await supabase
      .from("collections")
      .select("*")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    // Get persona counts for each collection
    const collectionsWithCount = await Promise.all(
      (collections || []).map(async (collection) => {
        const { data: personaData, error: personaError } = await supabase
          .from("collection_personas")
          .select("persona_id")
          .eq("collection_id", collection.id);

        if (personaError) {
          console.error("Error fetching persona count:", personaError);
          return { ...collection, persona_count: 0 };
        }

        // Count only personas that exist using the personas_union view
        let validPersonaCount = 0;
        if (personaData && personaData.length > 0) {
          const { data: existingPersonas } = await supabase
            .from("personas_union")
            .select("id")
            .in("id", personaData.map(p => p.persona_id));
          
          validPersonaCount = existingPersonas?.length || 0;
        }

        return { ...collection, persona_count: validPersonaCount };
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
 * Fetches all public collections with persona count
 */
export const getPublicCollectionsWithCount = async (): Promise<CollectionWithPersonaCount[]> => {
  try {
    const { data: collections, error } = await supabase
      .from("collections")
      .select("*")
      .eq("is_public", true)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    // Get persona counts for each collection
    const collectionsWithCount = await Promise.all(
      (collections || []).map(async (collection) => {
        const { data: personaData, error: personaError } = await supabase
          .from("collection_personas")
          .select("persona_id")
          .eq("collection_id", collection.id);

        if (personaError) {
          console.error("Error fetching persona count:", personaError);
          return { ...collection, persona_count: 0 };
        }

        // Count only personas that exist using the personas_union view
        let validPersonaCount = 0;
        if (personaData && personaData.length > 0) {
          const { data: existingPersonas } = await supabase
            .from("personas_union")
            .select("id")
            .in("id", personaData.map(p => p.persona_id));
          
          validPersonaCount = existingPersonas?.length || 0;
        }

        return { ...collection, persona_count: validPersonaCount };
      })
    );

    return collectionsWithCount;
  } catch (error) {
    console.error("Error fetching public collections with count:", error);
    toast.error("Failed to fetch public collections");
    return [];
  }
};

/**
 * Creates a new collection
 */
export const createCollection = async (name: string, description?: string | null, isPublic: boolean = false): Promise<Collection | null> => {
  try {
    // Get the user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to create a collection");
      return null;
    }
    
    const { data, error } = await supabase
      .from("collections")
      .insert({ name, description, is_public: isPublic, user_id: user.id })
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
  updates: { name?: string; description?: string | null; is_public?: boolean }
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
 * Updates collection visibility
 */
export const updateCollectionVisibility = async (id: string, isPublic: boolean): Promise<Collection | null> => {
  try {
    const { data, error } = await supabase
      .from("collections")
      .update({ is_public: isPublic })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating collection visibility:", error);
    throw error;
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
