import { supabase } from '@/integrations/supabase/client';

/**
 * Find orphaned persona references across all collections
 */
export const findOrphanedPersonaReferences = async () => {
  try {
    const { data, error } = await supabase.rpc('find_orphaned_persona_references');
    
    if (error) {
      console.error('Error finding orphaned persona references:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error finding orphaned persona references:', error);
    return [];
  }
};

/**
 * Clean up all orphaned persona references
 */
export const cleanupOrphanedPersonaReferences = async (): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('cleanup_orphaned_persona_references');
    
    if (error) {
      console.error('Error cleaning up orphaned persona references:', error);
      return 0;
    }
    
    return data?.[0]?.cleaned_count || 0;
  } catch (error) {
    console.error('Error cleaning up orphaned persona references:', error);
    return 0;
  }
};

/**
 * Remove specific orphaned persona references from a collection
 */
export const removeOrphanedReferencesFromCollection = async (
  collectionId: string,
  orphanedPersonaIds: string[]
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('collection_personas')
      .delete()
      .eq('collection_id', collectionId)
      .in('persona_id', orphanedPersonaIds);

    if (error) {
      console.error('Error removing orphaned references from collection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing orphaned references from collection:', error);
    return false;
  }
};