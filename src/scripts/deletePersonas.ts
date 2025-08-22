import { deletePersona } from '@/services/persona/operations/deletePersona';
import { deleteV4Persona } from '@/services/v4-persona/deleteV4Persona';

// Script to delete specific personas
async function deleteTargetPersonas() {
  console.log('Starting persona deletion...');
  
  // Delete Ethan Kaplan (V3 persona)
  const ethanResult = await deletePersona(''); // We don't have the ID, need to find it
  console.log('Ethan Kaplan deletion result:', ethanResult);
  
  // Delete Jason Miller V4 personas
  const jasonResults = await Promise.all([
    deleteV4Persona('v4_1755817699963_bmdjk22vv'),
    deleteV4Persona('v4_1755817780523_pibiy44qi')
  ]);
  
  console.log('Jason Miller deletion results:', jasonResults);
  
  console.log('Persona deletion complete');
}

// Run the deletion
deleteTargetPersonas().catch(console.error);