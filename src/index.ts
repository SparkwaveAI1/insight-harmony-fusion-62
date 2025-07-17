
// Main application exports - character module has been removed
// as it's now a separate application

// Re-export persona functionality
export { getAllPersonas, getPersonaById } from './services/persona';
export { usePersonas } from './services/persona/operations/getPersonas';

// Re-export types that are still needed
export type { Persona } from './services/persona/types';

// Main app export
export { default } from './App';
