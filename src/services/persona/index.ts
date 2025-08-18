
// Re-export all functions from the operations
export { savePersona } from './operations/savePersona';
export { 
  getPersonaById, 
  getPersonaByPersonaId, 
  getAllPersonas, 
  getPersonasByCollection 
} from './operations/getPersonas';
export { 
  updatePersonaVisibility, 
  updatePersonaName,
  updatePersonaProfileImageUrl 
} from './operations/updatePersona';
export { deletePersona } from './operations/deletePersona';
export { clonePersona } from './operations/clonePersona';
export { generatePersona } from './personaGenerator';
export { generatePersonaImage } from './operations/generatePersonaImage';
export { generatePersonaDescription, updatePersonaDescription } from './operations/generatePersonaDescription';
export { enhancePersona } from './enhancePersona';
export { bulkEnhancePersonas } from './bulkEnhancePersonas';

// PersonaV2 operations
export { 
  getPersonaV2ById,
  getAllPersonasV2,
  getPublicPersonasV2,
  savePersonaV2,
  updatePersonaV2,
  deletePersonaV2,
  updatePersonaV2Voicepack
} from './operations/personaV2Operations';

// Migration utilities
export { samplePersonaTraits, generatePersonaV2Prompt } from './migration/traitSampler';

// Re-export types
export type { Persona, InterviewSection, InterviewQuestion } from './types';
export type { CreatePersonaV2Request, UpdatePersonaV2Request } from './types/persona-v2-db';
