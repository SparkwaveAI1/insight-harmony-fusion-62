import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const AutoDeletePersonas = () => {
  const [status, setStatus] = useState<string>('Initializing...');
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const executeDeletion = async () => {
      try {
        setStatus('🚀 Executing bulk deletion of old personas...');
        console.log('🚀 AutoDeletePersonas component executing deletion directly...');
        
        const cutoffDate = '2025-09-19T00:00:00.000Z';
        
        // Step 1: Get personas to delete
        console.log(`🔍 Fetching personas created before ${cutoffDate}...`);
        const { data: personasToDelete, error: fetchError } = await supabase
          .from('v4_personas')
          .select('persona_id, name, created_at')
          .lt('created_at', cutoffDate)
          .order('created_at', { ascending: true });

        if (fetchError) {
          console.error('❌ Error fetching personas:', fetchError);
          setStatus(`❌ Fetch Error: ${fetchError.message}`);
          return;
        }

        if (!personasToDelete || personasToDelete.length === 0) {
          console.log('✅ No personas found to delete');
          setStatus('✅ No personas found to delete');
          setResults({ deletedCount: 0, cleanedCollectionReferences: 0, cleanedMemories: 0 });
          return;
        }

        console.log(`📊 Found ${personasToDelete.length} personas to delete`);
        setStatus(`🗑️ Deleting ${personasToDelete.length} personas...`);

        const personaIds = personasToDelete.map(p => p.persona_id);

        // Step 2: Clean up collection references
        console.log('🧹 Cleaning up collection references...');
        const { error: collectionError, count: collectionCount } = await supabase
          .from('collection_personas')
          .delete({ count: 'exact' })
          .in('persona_id', personaIds);

        if (collectionError) {
          console.error('⚠️ Error cleaning collection references:', collectionError);
        } else {
          console.log(`✅ Cleaned ${collectionCount || 0} collection references`);
        }

        // Step 3: Clean up persona memories
        console.log('🧠 Cleaning up persona memories...');
        const { error: memoriesError, count: memoriesCount } = await supabase
          .from('persona_memories')
          .delete({ count: 'exact' })
          .in('persona_id', personaIds);

        if (memoriesError) {
          console.error('⚠️ Error cleaning persona memories:', memoriesError);
        } else {
          console.log(`✅ Cleaned ${memoriesCount || 0} persona memories`);
        }

        // Step 4: Delete personas
        console.log('🗑️ Deleting personas from v4_personas table...');
        const { error: deleteError, count: deleteCount } = await supabase
          .from('v4_personas')
          .delete({ count: 'exact' })
          .in('persona_id', personaIds);

        if (deleteError) {
          console.error('❌ Error deleting personas:', deleteError);
          setStatus(`❌ Delete Error: ${deleteError.message}`);
          return;
        }

        console.log(`✅ Successfully deleted ${deleteCount || 0} personas`);
        console.log('🎉 BULK DELETION COMPLETED!');

        const finalResults = {
          success: true,
          deletedCount: deleteCount || 0,
          cleanedCollectionReferences: collectionCount || 0,
          cleanedMemories: memoriesCount || 0,
          deletedPersonas: personasToDelete
        };

        setResults(finalResults);
        setStatus(`✅ Successfully deleted ${finalResults.deletedCount} personas!`);

        // Log deleted personas for audit trail
        console.log('📝 Deleted personas:');
        personasToDelete.forEach((p, index) => {
          console.log(`  ${index + 1}. ${p.name} (${p.persona_id}) - Created: ${p.created_at}`);
        });

        console.log('🎯 DELETION PROCESS COMPLETE!');
        
      } catch (error) {
        console.error('❌ Component execution failed:', error);
        setStatus(`❌ Failed to execute: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    executeDeletion();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <strong>Bulk Deletion Status:</strong>
      <div>{status}</div>
      {results && results.success && (
        <div style={{ marginTop: '5px', fontSize: '11px' }}>
          <div>Deleted: {results.deletedCount}</div>
          <div>Collections cleaned: {results.cleanedCollectionReferences}</div>
          <div>Memories cleaned: {results.cleanedMemories}</div>
        </div>
      )}
    </div>
  );
};