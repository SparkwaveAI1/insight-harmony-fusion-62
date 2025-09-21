import { deletePersonasBeforeSept19, previewPersonasBeforeSept19, type BulkDeleteResult } from '@/services/v4-persona/bulkDeletePersonas';

// Utility to execute the persona deletion with proper safeguards
export async function executePersonaDeletionSafely(): Promise<BulkDeleteResult> {
  console.log('🔒 Safe persona deletion utility');
  
  // Get current user to ensure they're authenticated
  const { data: { user } } = await import('@/integrations/supabase/client').then(m => m.supabase.auth.getUser());
  
  if (!user) {
    console.error('❌ User not authenticated. Cannot proceed with deletion.');
    return { 
      success: false, 
      error: 'Not authenticated',
      deletedCount: 0,
      cleanedCollectionReferences: 0,
      cleanedMemories: 0
    };
  }
  
  console.log(`👤 Authenticated user: ${user.email}`);
  
  try {
    // Execute the deletion
    console.log('⚠️  Executing bulk deletion of personas created before September 19, 2025...');
    const result = await deletePersonasBeforeSept19();
    
    if (result.success) {
      console.log('🎉 Bulk deletion completed successfully!');
      console.log(`📊 Summary:`);
      console.log(`  - Deleted personas: ${result.deletedCount}`);
      console.log(`  - Cleaned collection references: ${result.cleanedCollectionReferences}`);
      console.log(`  - Cleaned memories: ${result.cleanedMemories}`);
      
      // Log deleted personas for audit trail
      if (result.deletedPersonas && result.deletedPersonas.length > 0) {
        console.log('📝 Deleted personas:');
        result.deletedPersonas.forEach(p => {
          console.log(`  - ${p.name} (${p.persona_id}) - ${p.created_at}`);
        });
      }
    } else {
      console.error('❌ Deletion failed:', result.error);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Safe deletion execution failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      deletedCount: 0,
      cleanedCollectionReferences: 0,
      cleanedMemories: 0
    };
  }
}

// Export preview function as well
export { previewPersonasBeforeSept19 };