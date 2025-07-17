
// Main application exports - character module has been removed
// as it's now a separate application

// Re-export types that are still needed
export type { Message } from './characters/types/chatTypes';

// Re-export persona functionality
export { usePersonas } from './services/persona/operations/getPersonas';
export { usePersonaDetails } from './services/persona/operations/getPersonaDetails';

// Main app export
export { default } from './App';
