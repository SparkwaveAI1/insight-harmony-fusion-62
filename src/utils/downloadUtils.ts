
import { getPersonaDownloadData } from './personaDetection';

export const downloadPersonaAsJSON = (persona: any) => {
  // Use version-aware download data extraction
  const personaData = getPersonaDownloadData(persona);

  // Convert to formatted JSON
  const jsonString = JSON.stringify(personaData, null, 2);
  
  // Create blob and download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `persona-${persona.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${persona.persona_id}.json`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
