import { supabase } from '@/integrations/supabase/client';

export interface BulkDeleteResult {
  success: boolean;
  deletedCount: number;
  cleanedCollectionReferences: number;
  cleanedMemories: number;
  error?: string;
  deletedPersonas?: Array<{
    persona_id: string;
    name: string;
    created_at: string;
  }>;
}

export async function bulkDeletePersonasBeforeDate(
  cutoffDate: string,
  preview: boolean = true
): Promise<BulkDeleteResult> {
  try {
    console.log(`🗑️ Bulk delete personas created before ${cutoffDate} (preview: ${preview})`);
    
    // First, get all personas to be deleted
    const { data: personasToDelete, error: fetchError } = await supabase
      .from('v4_personas')
      .select('persona_id, name, created_at')
      .lt('created_at', cutoffDate)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching personas to delete:', fetchError);
      return { 
        success: false, 
        deletedCount: 0, 
        cleanedCollectionReferences: 0,
        cleanedMemories: 0,
        error: fetchError.message 
      };
    }

    if (!personasToDelete || personasToDelete.length === 0) {
      console.log('✅ No personas found to delete');
      return { 
        success: true, 
        deletedCount: 0, 
        cleanedCollectionReferences: 0,
        cleanedMemories: 0,
        deletedPersonas: [] 
      };
    }

    console.log(`📊 Found ${personasToDelete.length} personas to delete`);
    personasToDelete.forEach(p => {
      console.log(`  - ${p.name} (${p.persona_id}) created: ${p.created_at}`);
    });

    if (preview) {
      console.log('👀 Preview mode - no actual deletion performed');
      return {
        success: true,
        deletedCount: personasToDelete.length,
        cleanedCollectionReferences: 0,
        cleanedMemories: 0,
        deletedPersonas: personasToDelete
      };
    }

    const personaIds = personasToDelete.map(p => p.persona_id);

    // Step 1: Clean up collection references
    console.log('🧹 Cleaning up collection references...');
    const { error: collectionError, count: collectionCount } = await supabase
      .from('collection_personas')
      .delete({ count: 'exact' })
      .in('persona_id', personaIds);

    if (collectionError) {
      console.error('❌ Error cleaning collection references:', collectionError);
      // Continue anyway, as this might not be critical
    } else {
      console.log(`✅ Cleaned ${collectionCount || 0} collection references`);
    }

    // Step 2: Clean up persona memories
    console.log('🧠 Cleaning up persona memories...');
    const { error: memoriesError, count: memoriesCount } = await supabase
      .from('persona_memories')
      .delete({ count: 'exact' })
      .in('persona_id', personaIds);

    if (memoriesError) {
      console.error('❌ Error cleaning persona memories:', memoriesError);
      // Continue anyway
    } else {
      console.log(`✅ Cleaned ${memoriesCount || 0} persona memories`);
    }

    // Step 3: Delete personas
    console.log('🗑️ Deleting personas...');
    const { error: deleteError, count: deleteCount } = await supabase
      .from('v4_personas')
      .delete({ count: 'exact' })
      .in('persona_id', personaIds);

    if (deleteError) {
      console.error('❌ Error deleting personas:', deleteError);
      return { 
        success: false, 
        deletedCount: 0,
        cleanedCollectionReferences: collectionCount || 0,
        cleanedMemories: memoriesCount || 0,
        error: deleteError.message 
      };
    }

    console.log(`✅ Successfully deleted ${deleteCount} personas`);
    console.log('🎉 Bulk deletion complete!');

    return {
      success: true,
      deletedCount: deleteCount || 0,
      cleanedCollectionReferences: collectionCount || 0,
      cleanedMemories: memoriesCount || 0,
      deletedPersonas: personasToDelete
    };

  } catch (error) {
    console.error('❌ Bulk deletion failed:', error);
    return { 
      success: false, 
      deletedCount: 0,
      cleanedCollectionReferences: 0,
      cleanedMemories: 0,
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function deletePersonasBeforeSept19(): Promise<BulkDeleteResult> {
  return bulkDeletePersonasBeforeDate('2025-09-19T00:00:00.000Z', false);
}

export async function previewPersonasBeforeSept19(): Promise<BulkDeleteResult> {
  return bulkDeletePersonasBeforeDate('2025-09-19T00:00:00.000Z', true);
}