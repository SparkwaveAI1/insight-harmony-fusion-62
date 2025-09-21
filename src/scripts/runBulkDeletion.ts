import { executeActualDeletion, previewBulkDeletion } from '@/utils/executeBulkDeletion';

// Script to execute the bulk deletion of personas created before September 19, 2025
async function runDeletion() {
  console.log('🚀 Starting bulk persona deletion process...');
  console.log('⚠️ This will delete all personas created before September 19, 2025');
  
  try {
    // First show preview
    console.log('\n📋 Preview of personas to be deleted:');
    const preview = await previewBulkDeletion();
    
    if (!preview.success) {
      console.error('❌ Preview failed:', preview.error);
      return;
    }
    
    console.log(`📊 Preview results:`);
    console.log(`  - Personas to delete: ${preview.deletedCount}`);
    
    if (preview.deletedCount === 0) {
      console.log('✅ No personas found to delete. Process complete.');
      return;
    }
    
    // Show first few personas as sample
    if (preview.deletedPersonas && preview.deletedPersonas.length > 0) {
      console.log('\n📝 Sample personas to be deleted:');
      preview.deletedPersonas.slice(0, 5).forEach(p => {
        console.log(`  - ${p.name} (${p.persona_id}) - ${p.created_at}`);
      });
      if (preview.deletedPersonas.length > 5) {
        console.log(`  ... and ${preview.deletedPersonas.length - 5} more`);
      }
    }
    
    console.log('\n🗑️ Proceeding with actual deletion...');
    const result = await executeActualDeletion();
    
    if (result.success) {
      console.log('🎉 Bulk deletion completed successfully!');
      console.log(`📊 Final results:`);
      console.log(`  - Deleted personas: ${result.deletedCount}`);
      console.log(`  - Cleaned collection references: ${result.cleanedCollectionReferences}`);
      console.log(`  - Cleaned persona memories: ${result.cleanedMemories}`);
    } else {
      console.error('❌ Deletion failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error);
  }
}

// Export for external use
export { runDeletion };

// Auto-execute when script is run directly
if (typeof window !== 'undefined') {
  console.log('🔧 Bulk deletion script loaded. Call runDeletion() to execute.');
  
  // Make runDeletion available globally for easy execution
  (window as any).runBulkDeletion = runDeletion;
  console.log('💡 You can also call window.runBulkDeletion() to execute');
}