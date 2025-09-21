// Immediate execution of persona deletion - auto-runs when imported
import { executeActualDeletion } from '@/utils/executeBulkDeletion';

console.log('🚀 AUTO-EXECUTING PERSONA DELETION...');
console.log('⚠️ Deleting all personas created before September 19, 2025');

// Execute immediately
(async () => {
  try {
    const result = await executeActualDeletion();
    
    if (result.success) {
      console.log('🎉 BULK DELETION COMPLETED SUCCESSFULLY!');
      console.log(`📊 Final Results:`);
      console.log(`  ✅ Deleted personas: ${result.deletedCount}`);
      console.log(`  ✅ Cleaned collection references: ${result.cleanedCollectionReferences}`);
      console.log(`  ✅ Cleaned persona memories: ${result.cleanedMemories}`);
      
      if (result.deletedPersonas && result.deletedPersonas.length > 0) {
        console.log('\n📝 Successfully deleted personas:');
        result.deletedPersonas.forEach((p, index) => {
          console.log(`  ${index + 1}. ${p.name} (${p.persona_id}) - Created: ${p.created_at}`);
        });
      }
      
      console.log('\n🎯 DELETION PROCESS COMPLETE!');
    } else {
      console.error('❌ DELETION FAILED:', result.error);
    }
  } catch (error) {
    console.error('❌ EXECUTION FAILED:', error);
  }
})();