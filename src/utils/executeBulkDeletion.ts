import { supabase } from '@/integrations/supabase/client';

interface BulkDeleteResult {
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

export async function executeBulkDeletion(preview: boolean = false): Promise<BulkDeleteResult> {
  try {
    console.log(`🚀 ${preview ? 'Previewing' : 'Executing'} bulk deletion of old personas...`);
    
    const { data, error } = await supabase.functions.invoke('bulk-delete-old-personas', {
      body: { 
        preview,
        cutoffDate: '2025-09-19T00:00:00.000Z'
      }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      return {
        success: false,
        deletedCount: 0,
        cleanedCollectionReferences: 0,
        cleanedMemories: 0,
        error: error.message
      };
    }

    console.log('✅ Edge function completed:', data);
    return data as BulkDeleteResult;
    
  } catch (error) {
    console.error('❌ Failed to call bulk deletion function:', error);
    return {
      success: false,
      deletedCount: 0,
      cleanedCollectionReferences: 0,
      cleanedMemories: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function previewBulkDeletion(): Promise<BulkDeleteResult> {
  return executeBulkDeletion(true);
}

export async function executeActualDeletion(): Promise<BulkDeleteResult> {
  return executeBulkDeletion(false);
}