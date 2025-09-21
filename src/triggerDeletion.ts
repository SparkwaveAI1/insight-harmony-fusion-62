import { supabase } from '@/integrations/supabase/client';

// Direct execution via Supabase function call
async function triggerBulkDeletion() {
  console.log('🚀 Triggering bulk deletion via direct function call...');
  
  try {
    const { data, error } = await supabase.functions.invoke('bulk-delete-old-personas', {
      body: { 
        preview: false,
        cutoffDate: '2025-09-19T00:00:00.000Z'
      }
    });

    if (error) {
      console.error('❌ Function invocation error:', error);
      return;
    }

    console.log('✅ Bulk deletion response:', data);
    
    if (data.success) {
      console.log('🎉 DELETION COMPLETED SUCCESSFULLY!');
      console.log(`📊 Results:`);
      console.log(`  ✅ Deleted personas: ${data.deletedCount}`);
      console.log(`  ✅ Cleaned collection references: ${data.cleanedCollectionReferences}`);
      console.log(`  ✅ Cleaned persona memories: ${data.cleanedMemories}`);
    } else {
      console.error('❌ Deletion failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Failed to trigger deletion:', error);
  }
}

// Execute immediately
triggerBulkDeletion();

// Also make it available globally
if (typeof window !== 'undefined') {
  (window as any).triggerBulkDeletion = triggerBulkDeletion;
}