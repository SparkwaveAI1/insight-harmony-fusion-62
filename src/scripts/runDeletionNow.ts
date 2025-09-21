import { executeActualDeletion } from '@/utils/executeBulkDeletion';

// Execute the bulk deletion immediately
console.log('🚀 EXECUTING BULK DELETION NOW...');
console.log('⚠️ Deleting all personas created before September 19, 2025');

executeActualDeletion()
  .then(result => {
    if (result.success) {
      console.log('🎉 DELETION COMPLETED SUCCESSFULLY!');
      console.log(`📊 Results:`);
      console.log(`  ✅ Deleted personas: ${result.deletedCount}`);
      console.log(`  ✅ Cleaned collection references: ${result.cleanedCollectionReferences}`);
      console.log(`  ✅ Cleaned persona memories: ${result.cleanedMemories}`);
      
      if (result.deletedPersonas && result.deletedPersonas.length > 0) {
        console.log('\n📝 Deleted personas:');
        result.deletedPersonas.forEach(p => {
          console.log(`  - ${p.name} (${p.persona_id}) - ${p.created_at}`);
        });
      }
    } else {
      console.error('❌ DELETION FAILED:', result.error);
    }
  })
  .catch(error => {
    console.error('❌ SCRIPT EXECUTION FAILED:', error);
  });