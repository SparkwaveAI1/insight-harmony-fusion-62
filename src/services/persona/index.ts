
// V2-Only Persona Operations
export { 
  getPersonaById,
  getAllPersonas,
  getPublicPersonas,
  getPersonasForListing,
  checkPersonaVersion
} from './operations/personaOperations';

// V1 operations removed - use V2 operations instead
export { clonePersona } from './operations/clonePersona';
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
  updatePersonaV2Voicepack,
  updatePersonaV2Visibility,
  updatePersonaV2Name,
  updatePersonaV2Description,
  updatePersonaV2ProfileImageUrl
} from './operations/personaV2Operations';

// Voicepack runtime system
export { 
  getOrCompileVoicepack,
  clearVoicepackCache,
  getVoicepackCacheStats 
} from '../voicepackCache';
export { compilePersonaToVoicepack } from '../../compile/compilePersonaToVoicepack';
export { 
  classifyTurn, 
  planTurn, 
  updateStateFromText 
} from '../../conversation/controller';
export { postProcess, generateTelemetry } from '../../conversation/postProcess';

// Migration utilities
export { samplePersonaTraits, generatePersonaV2Prompt } from './migration/traitSampler';

// Re-export types
export type { Persona, InterviewSection, InterviewQuestion } from './types';
export type { CreatePersonaV2Request, UpdatePersonaV2Request } from './types/persona-v2-db';
