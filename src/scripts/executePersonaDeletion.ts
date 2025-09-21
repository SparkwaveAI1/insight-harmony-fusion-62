import { executePersonaDeletionSafely } from '@/utils/executePersonaDeletion';

// Final execution script for persona deletion
console.log('🚀 Executing persona deletion for personas created before September 19, 2025...');

executePersonaDeletionSafely()
  .then(result => {
    if (result.success) {
      console.log('✅ Persona deletion completed successfully');
      console.log(`Final count: ${result.deletedCount} personas deleted`);
    } else {
      console.error('❌ Persona deletion failed:', result.error);
    }
  })
  .catch(error => {
    console.error('❌ Script execution failed:', error);
  });