import { deletePersona } from '@/services/persona/operations/deletePersona';
import { deleteV4Persona } from '@/services/v4-persona/deleteV4Persona';

// Script to delete specific personas
async function deleteTargetPersonas() {
  console.log('Starting persona deletion...');
  console.log('❌ This script contains hardcoded persona IDs and should not be used.');
  console.log('Use the admin interface or fetch persona IDs dynamically instead.');
  
  // Example of proper approach:
  // const personas = await getV4Personas(userId);
  // const targetPersona = personas.find(p => p.name === 'Target Name');
  // if (targetPersona) {
  //   await deleteV4Persona(targetPersona.persona_id);
  // }
  
  console.log('Persona deletion script disabled - use dynamic ID resolution');
}

// Run the deletion
deleteTargetPersonas().catch(console.error);