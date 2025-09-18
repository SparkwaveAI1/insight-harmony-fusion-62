import { V4Persona, V4FullProfile } from '@/types/persona-v4';

export interface V4PersonaValidationResult {
  isValid: boolean;
  isComplete: boolean;
  errors: string[];
  warnings: string[];
  completeness: {
    hasFullProfile: boolean;
    hasRequiredTraits: boolean;
    isCreationCompleted: boolean;
    hasAllRequiredTraits: boolean;
    missingTraits: string[];
  };
  stage: 'not_started' | 'detailed_traits' | 'summary_generation' | 'completed' | 'error';
}

/**
 * Validates V4 persona completeness and identifies missing components
 */
export function validateV4PersonaCompleteness(persona: V4Persona): V4PersonaValidationResult {
  console.log('=== V4 PERSONA VALIDATION ===');
  console.log('Persona:', persona.name, '(', persona.persona_id, ')');
  console.log('Creation stage:', persona.creation_stage);
  console.log('Creation completed:', persona.creation_completed);

  const errors: string[] = [];
  const warnings: string[] = [];
  const missingTraits: string[] = [];

  // Check creation stage and completion status
  const stage = persona.creation_stage || 'completed'; // Default to completed if not set
  const isCreationCompleted = persona.creation_completed !== false; // Default to true if not explicitly false

  // Check if basic data exists
  const hasFullProfile = !!(persona.full_profile && typeof persona.full_profile === 'object');
  const hasRequiredTraits = hasFullProfile ? validateFullProfile(persona.full_profile, missingTraits) : false;
  
  // Only flag as incomplete if clearly missing core data or explicitly marked as incomplete
  if (stage === 'not_started') {
    errors.push('V4 persona creation has not been started');
  } else if (stage === 'detailed_traits' && !hasFullProfile) {
    errors.push('V4 persona stuck at detailed_traits stage - full_profile generation failed');
  } else if (persona.creation_completed === false && stage === 'detailed_traits') {
    warnings.push(`V4 persona creation marked as incomplete at stage: ${stage}`);
  }

  if (!hasFullProfile && stage !== 'not_started') {
    errors.push('V4 persona missing full_profile data');
  }

  if (hasFullProfile && !hasRequiredTraits) {
    warnings.push('V4 persona missing required trait categories');
  }

  // A persona is complete if:
  // 1. It has full_profile data AND
  // 2. Has required traits AND
  // 3. Either creation_completed is true OR stage is 'completed' OR creation_completed is not explicitly false
  const isComplete = hasFullProfile && hasRequiredTraits && (isCreationCompleted || stage === 'completed');
  const isValid = errors.length === 0;

  console.log('V4 validation result:', {
    isValid,
    isComplete,
    errorCount: errors.length,
    warningCount: warnings.length,
    stage,
    hasFullProfile,
    hasRequiredTraits,
    isCreationCompleted
  });

  return {
    isValid,
    isComplete,
    errors,
    warnings,
    completeness: {
      hasFullProfile,
      hasRequiredTraits,
      isCreationCompleted,
      hasAllRequiredTraits: hasRequiredTraits,
      missingTraits
    },
    stage: stage as any
  };
}

/**
 * Validates the full_profile structure and identifies missing traits
 */
function validateFullProfile(fullProfile: V4FullProfile, missingTraits: string[]): boolean {
  if (!fullProfile || typeof fullProfile !== 'object') {
    missingTraits.push('full_profile');
    return false;
  }

  const requiredTraits = [
    'identity',
    'motivation_profile',
    'humor_profile',
    'truth_honesty_profile',
    'bias_profile',
    'cognitive_profile',
    'daily_life',
    'communication_style',
    'emotional_profile',
    'sexuality_profile'
  ];

  let validTraitCount = 0;
  
  for (const trait of requiredTraits) {
    if (!fullProfile[trait as keyof V4FullProfile] || 
        typeof fullProfile[trait as keyof V4FullProfile] !== 'object') {
      missingTraits.push(trait);
    } else {
      // Basic validation for key fields within each trait
      if (trait === 'identity' && validateIdentity(fullProfile.identity)) {
        validTraitCount++;
      } else if (trait === 'motivation_profile' && validateMotivationProfile(fullProfile.motivation_profile)) {
        validTraitCount++;
      } else if (trait === 'communication_style' && validateCommunicationStyle(fullProfile.communication_style)) {
        validTraitCount++;
      } else if (trait !== 'identity' && trait !== 'motivation_profile' && trait !== 'communication_style') {
        validTraitCount++;
      }
    }
  }

  console.log(`V4 full_profile validation: ${validTraitCount}/${requiredTraits.length} traits valid`);
  return validTraitCount >= 7; // Require at least 7 out of 10 traits to be present
}


/**
 * Helper validation functions for specific trait categories
 */
function validateIdentity(identity: any): boolean {
  if (!identity) return false;
  const required = ['name', 'age', 'gender', 'occupation'];
  return required.every(field => identity[field] && identity[field] !== '');
}

function validateMotivationProfile(motivation: any): boolean {
  if (!motivation) return false;
  return motivation.primary_drivers && 
         motivation.goal_orientation && 
         motivation.want_vs_should_tension;
}

function validateCommunicationStyle(communication: any): boolean {
  if (!communication) return false;
  return communication.voice_foundation && 
         communication.linguistic_signature && 
         communication.response_architecture;
}

/**
 * Checks if a V4 persona needs completion (stuck at intermediate stage)
 */
export function needsV4PersonaCompletion(persona: V4Persona): boolean {
  const validation = validateV4PersonaCompleteness(persona);
  
  // Needs completion if:
  // 1. Not completed but has some progress (stuck at intermediate stage)
  // 2. Has errors but isn't completely failed
  return !validation.isComplete && 
         validation.stage === 'detailed_traits' &&
         validation.completeness.hasFullProfile; // Has some progress
}

/**
 * Gets user-friendly description of what's missing from a V4 persona
 */
export function getV4PersonaCompletionStatus(persona: V4Persona): string {
  const validation = validateV4PersonaCompleteness(persona);
  
  if (validation.isComplete) {
    return 'Complete';
  }
  
  if (validation.stage === 'not_started') {
    return 'Not started';
  }
  
  if (validation.stage === 'detailed_traits') {
    if (!validation.completeness.hasFullProfile) {
      return 'Detailed traits generation failed';
    } else if (!validation.completeness.hasRequiredTraits) {
      return 'Missing required trait categories';
    }
  }
  
  if (validation.errors.length > 0) {
    return `Incomplete: ${validation.errors[0]}`;
  }
  
  return 'Incomplete';
}