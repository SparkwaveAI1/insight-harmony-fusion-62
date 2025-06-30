
// Persona Module Entry Point
export { default as PersonaDashboard } from './pages/PersonaDashboard';

// Re-export persona types and services for module isolation
export type { Persona, InterviewSection, InterviewQuestion } from '@/services/persona/types';
export { 
  savePersona, 
  getPersonaById, 
  getPersonaByPersonaId, 
  getAllPersonas, 
  getPersonasByCollection,
  updatePersonaVisibility,
  updatePersonaName,
  updatePersonaProfileImageUrl,
  deletePersona,
  clonePersona,
  generatePersona,
  generatePersonaImage
} from '@/services/persona';
