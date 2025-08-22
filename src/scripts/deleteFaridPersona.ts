import { deleteV4Persona } from '@/services/v4-persona/deleteV4Persona';

// Script to delete Farid persona
async function deleteFaridPersona() {
  console.log('Deleting Farid persona...');
  
  const result = await deleteV4Persona('v4_1755845163561_ibrtpiilg');
  console.log('Deletion result:', result);
  
  if (result.success) {
    console.log('✅ Farid persona deleted successfully');
  } else {
    console.error('❌ Failed to delete Farid persona:', result.error);
  }
}

// Run the deletion
deleteFaridPersona().catch(console.error);