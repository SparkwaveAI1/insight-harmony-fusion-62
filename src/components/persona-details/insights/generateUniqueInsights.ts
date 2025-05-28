
import { customPersonas, PersonaInsights } from './customPersonas';
import { generateDecisions, generateDrivers, generatePersuasion } from './insightGenerators';

export const generateUniqueInsights = (personaId: string, metadata: any): PersonaInsights => {
  // First check if we have a custom persona by ID
  if (personaId && customPersonas[personaId]) {
    console.log(`Using custom insights for persona: ${personaId}`);
    return customPersonas[personaId];
  }

  console.log(`Generating dynamic insights for persona: ${personaId}`);
  
  // Return dynamically generated insights
  return {
    decisions: generateDecisions(metadata),
    drivers: generateDrivers(metadata),
    persuasion: generatePersuasion(metadata)
  };
};
