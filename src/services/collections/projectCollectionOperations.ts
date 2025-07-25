
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Add a collection to a project
 */
export const addCollectionToProject = async (
  projectId: string,
  collectionId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('project_collections')
      .insert({ project_id: projectId, collection_id: collectionId });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        toast.error('Collection is already added to this project');
        return false;
      }
      console.error('Error adding collection to project:', error);
      toast.error('Failed to add collection to project');
      return false;
    }

    toast.success('Collection added to project');
    return true;
  } catch (error) {
    console.error('Error adding collection to project:', error);
    toast.error('Failed to add collection to project');
    return false;
  }
};

/**
 * Remove a collection from a project
 */
export const removeCollectionFromProject = async (
  projectId: string,
  collectionId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('project_collections')
      .delete()
      .match({ project_id: projectId, collection_id: collectionId });

    if (error) {
      console.error('Error removing collection from project:', error);
      toast.error('Failed to remove collection from project');
      return false;
    }

    toast.success('Collection removed from project');
    return true;
  } catch (error) {
    console.error('Error removing collection from project:', error);
    toast.error('Failed to remove collection from project');
    return false;
  }
};

/**
 * Get all collections linked to a project
 */
export const getProjectCollections = async (projectId: string) => {
  try {
    console.log('getProjectCollections: Fetching collections for projectId:', projectId);
    
    const { data, error } = await supabase
      .from('project_collections')
      .select(`
        collection_id,
        collections!inner(*)
      `)
      .eq('project_id', projectId);

    if (error) {
      console.error('getProjectCollections: Database error:', error);
      throw new Error(`Failed to fetch project collections: ${error.message}`);
    }

    const collections = data?.map(item => item.collections) || [];
    console.log('getProjectCollections: Found collections:', collections);
    return collections;
  } catch (error) {
    console.error('getProjectCollections: Exception:', error);
    throw error; // Re-throw instead of returning empty array
  }
};

/**
 * Check if a collection is linked to a project
 */
export const isCollectionInProject = async (
  projectId: string,
  collectionId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('project_collections')
      .select('*')
      .eq('project_id', projectId)
      .eq('collection_id', collectionId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking if collection is in project:', error);
    return false;
  }
};
