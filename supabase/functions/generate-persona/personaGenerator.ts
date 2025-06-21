
import { PersonaTemplate } from "./types.ts";
import { generateBasePersona } from "./stages/coreGeneration.ts";
import { enhancePersonaMetadata } from "./stages/metadataEnhancement.ts";
import { generatePersonaTraitProfile } from "./stages/traitGeneration.ts";
import { generatePersonaBehavioralLinguistic } from "./stages/behavioralGeneration.ts";
import { generatePersonaInterview } from "./stages/interviewGeneration.ts";
import { finalizePersona } from "./stages/personaFinalization.ts";

// Re-export all functions for backward compatibility
export { generateBasePersona };
export { enhancePersonaMetadata };
export { generatePersonaTraitProfile };
export { generatePersonaBehavioralLinguistic };
export { generatePersonaInterview };
export { finalizePersona };
