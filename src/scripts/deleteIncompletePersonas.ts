import { deleteV4Persona } from '@/services/v4-persona/deleteV4Persona';

/**
 * Batch deletion script for incomplete personas (those without images)
 * These 17 personas have no profile_image_url and are considered incomplete
 */

const INCOMPLETE_PERSONA_IDS = [
  'prsna_fhtk2k96ph84',
  'prsna_n9fkdv1qk9wh',
  'prsna_s93fvx47tcwl',
  'prsna_6v2jtnz8kfgr',
  'prsna_bx72m4hqvwnt',
  'prsna_c5wznp6r1xjg',
  'prsna_d8qxkv29mhrc',
  'prsna_g4tpnw7xzjqf',
  'prsna_h6vrmc3kxwpl',
  'prsna_j9xtnb5rzqkm',
  'prsna_k2yvph8sbwjn',
  'prsna_m7zwqj4vdxlp',
  'prsna_n3xvrk6wcylq',
  'prsna_p8ywsm9xfzjr',
  'prsna_q5zvtn2ygxks',
  'prsna_r9xwup7zjylt',
  'prsna_t4yvvq3xkzmu'
];

interface DeletionResult {
  success: number;
  failed: number;
  errors: Array<{ personaId: string; error: string }>;
}

/**
 * Deletes all incomplete personas in batch
 * Uses deleteV4Persona which handles:
 * - User ownership verification
 * - Collection reference cleanup
 * - RLS policy compliance
 */
export async function deleteIncompletePersonas(): Promise<DeletionResult> {
  console.log('🗑️ Starting batch deletion of incomplete personas...');
  console.log(`📊 Total personas to delete: ${INCOMPLETE_PERSONA_IDS.length}`);
  
  const result: DeletionResult = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (const personaId of INCOMPLETE_PERSONA_IDS) {
    console.log(`\n🔄 Processing: ${personaId}`);
    
    try {
      const deleteResult = await deleteV4Persona(personaId);
      
      if (deleteResult.success) {
        result.success++;
        console.log(`✅ Successfully deleted: ${personaId}`);
      } else {
        result.failed++;
        result.errors.push({
          personaId,
          error: deleteResult.error || 'Unknown error'
        });
        console.error(`❌ Failed to delete ${personaId}:`, deleteResult.error);
      }
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push({ personaId, error: errorMessage });
      console.error(`❌ Exception deleting ${personaId}:`, error);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 DELETION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully deleted: ${result.success}`);
  console.log(`❌ Failed to delete: ${result.failed}`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    result.errors.forEach(({ personaId, error }) => {
      console.log(`  - ${personaId}: ${error}`);
    });
  }
  
  console.log('='.repeat(50));
  
  return result;
}

// Auto-execute when script is run directly
if (typeof window !== 'undefined') {
  console.log('🚀 Executing incomplete persona deletion script...');
  deleteIncompletePersonas()
    .then(result => {
      if (result.success === INCOMPLETE_PERSONA_IDS.length) {
        console.log('🎉 All incomplete personas deleted successfully!');
      } else {
        console.warn('⚠️ Some deletions failed. Check errors above.');
      }
    })
    .catch(error => {
      console.error('💥 Script execution failed:', error);
    });
}

// Export for manual execution
export { INCOMPLETE_PERSONA_IDS };
