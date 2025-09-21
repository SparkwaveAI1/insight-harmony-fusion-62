import { previewPersonasBeforeSept19, deletePersonasBeforeSept19 } from '@/services/v4-persona/bulkDeletePersonas';

// Script to safely delete personas created before September 19, 2025
async function executeBulkDeletion() {
  console.log('🚀 Starting bulk persona deletion process...');
  console.log('⚠️  This will delete all personas created before September 19, 2025');
  
  try {
    // First, show preview
    console.log('\n📋 PREVIEW - Personas to be deleted:');
    const preview = await previewPersonasBeforeSept19();
    
    if (!preview.success) {
      console.error('❌ Preview failed:', preview.error);
      return;
    }
    
    if (preview.deletedCount === 0) {
      console.log('✅ No personas found to delete. Process complete.');
      return;
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Personas to delete: ${preview.deletedCount}`);
    console.log(`  - Oldest: ${preview.deletedPersonas?.[0]?.created_at}`);
    console.log(`  - Newest: ${preview.deletedPersonas?.[preview.deletedPersonas.length - 1]?.created_at}`);
    
    // Ask for confirmation (in a real implementation, you'd want user input)
    console.log('\n⚠️  WARNING: This action cannot be undone!');
    console.log('💡 To proceed with deletion, call deletePersonasBeforeSept19() directly');
    console.log('🛑 Script stopping at preview stage for safety');
    
    // Uncomment the lines below to actually perform the deletion:
    // console.log('\n🗑️  Proceeding with deletion...');
    // const result = await deletePersonasBeforeSept19();
    // 
    // if (result.success) {
    //   console.log(`✅ Successfully deleted ${result.deletedCount} personas`);
    //   console.log(`✅ Cleaned ${result.cleanedCollectionReferences} collection references`);
    //   console.log(`✅ Cleaned ${result.cleanedMemories} persona memories`);
    // } else {
    //   console.error('❌ Deletion failed:', result.error);
    // }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error);
  }
}

// Export for manual execution
export { executeBulkDeletion, previewPersonasBeforeSept19, deletePersonasBeforeSept19 };

// Auto-run preview when script is imported
if (typeof window !== 'undefined') {
  console.log('🔍 Bulk deletion script loaded. Call executeBulkDeletion() to preview.');
} else {
  // Run preview in Node.js environment
  executeBulkDeletion().catch(console.error);
}