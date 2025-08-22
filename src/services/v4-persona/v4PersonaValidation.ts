import { V4Persona, V4FullProfile, V4ConversationSummary } from '@/types/persona-v4';

export interface V4PersonaValidationResult {
  isValid: boolean;
  isComplete: boolean;
  errors: string[];
  warnings: string[];
  completeness: {
    hasFullProfile: boolean;
    hasConversationSummary: boolean;
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
  const stage = persona.creation_stage || 'not_started';
  const isCreationCompleted = persona.creation_completed === true;

  // Validate full_profile structure
  const hasFullProfile = validateFullProfile(persona.full_profile, missingTraits);
  
  // Validate conversation_summary structure
  const hasConversationSummary = validateConversationSummary(persona.conversation_summary);
  
  // Check if all required traits are present
  const hasAllRequiredTraits = missingTraits.length === 0;

  // Determine validation status
  if (stage === 'not_started') {
    errors.push('V4 persona creation has not been started');
  } else if (stage === 'detailed_traits' && !hasFullProfile) {
    errors.push('V4 persona stuck at detailed_traits stage - full_profile generation failed');
  } else if (stage === 'summary_generation' && !hasConversationSummary) {
    errors.push('V4 persona stuck at summary_generation stage - conversation_summary generation failed');
  } else if (stage === 'completed' && !isCreationCompleted) {
    warnings.push('V4 persona marked as completed but creation_completed flag is false');
  }

  if (!hasFullProfile) {
    errors.push('V4 persona missing or incomplete full_profile data');
  }

  if (!hasConversationSummary) {
    if (stage === 'detailed_traits') {
      warnings.push('V4 persona missing conversation_summary (expected at detailed_traits stage)');
    } else {
      errors.push('V4 persona missing conversation_summary data');
    }
  }

  if (missingTraits.length > 0) {
    warnings.push(`V4 persona missing ${missingTraits.length} trait categories: ${missingTraits.join(', ')}`);
  }

  const isComplete = isCreationCompleted && hasFullProfile && hasConversationSummary && hasAllRequiredTraits;
  const isValid = errors.length === 0;

  console.log('V4 validation result:', {
    isValid,
    isComplete,
    errorCount: errors.length,
    warningCount: warnings.length,
    stage,
    missingTraitsCount: missingTraits.length
  });

  return {
    isValid,
    isComplete,
    errors,
    warnings,
    completeness: {
      hasFullProfile,
      hasConversationSummary,
      isCreationCompleted,
      hasAllRequiredTraits,
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
    'inhibitor_profile',
    'truth_honesty_profile',
    'identity_salience',
    'knowledge_profile',
    'daily_life',
    'communication_style',
    'emotional_profile',
    'contradictions',
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
  return validTraitCount >= 8; // Require at least 8 out of 11 traits to be present
}

/**
 * Validates the conversation_summary structure
 */
function validateConversationSummary(conversationSummary: V4ConversationSummary): boolean {
  if (!conversationSummary || typeof conversationSummary !== 'object') {
    return false;
  }

  const requiredFields = [
    'demographics',
    'motivation_summary',
    'voice_summary',
    'communication_style'
  ];

  const validFields = requiredFields.filter(field => {
    const value = conversationSummary[field as keyof V4ConversationSummary];
    return value && typeof value === 'object' || typeof value === 'string';
  });

  console.log(`V4 conversation_summary validation: ${validFields.length}/${requiredFields.length} fields valid`);
  return validFields.length >= 3; // Require at least 3 out of 4 core fields
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
         (validation.stage === 'detailed_traits' || validation.stage === 'summary_generation') &&
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
    } else if (!validation.completeness.hasConversationSummary) {
      return 'Ready for summary generation';
    }
  }
  
  if (validation.stage === 'summary_generation') {
    return 'Summary generation in progress';
  }
  
  if (validation.errors.length > 0) {
    return `Incomplete: ${validation.errors[0]}`;
  }
  
  return 'Incomplete';
}