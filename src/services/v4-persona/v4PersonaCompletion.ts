import { V4Persona } from '@/types/persona-v4';
import { createV4PersonaCall2 } from './createV4Persona';
import { getV4PersonaById } from './getV4Personas';
import { validateV4PersonaCompleteness, needsV4PersonaCompletion } from './v4PersonaValidation';

export interface V4PersonaCompletionResult {
  success: boolean;
  persona?: V4Persona;
  error?: string;
  completionStage: string;
}

/**
 * Completes an incomplete V4 persona by calling the appropriate edge function
 */
export async function completeV4Persona(personaId: string): Promise<V4PersonaCompletionResult> {
  try {
    console.log('🔄 Starting V4 persona completion for:', personaId);
    
    // First, get the current persona state
    const currentPersona = await getV4PersonaById(personaId);
    if (!currentPersona) {
      return {
        success: false,
        error: 'V4 persona not found',
        completionStage: 'error'
      };
    }

    console.log('Current persona state:', {
      stage: currentPersona.creation_stage,
      completed: currentPersona.creation_completed
    });

    // Validate what's missing
    const validation = validateV4PersonaCompleteness(currentPersona);
    
    if (validation.isComplete) {
      return {
        success: true,
        persona: currentPersona,
        completionStage: 'already_complete'
      };
    }

    // Determine what completion step is needed
    if (currentPersona.creation_stage === 'detailed_traits' && 
        validation.completeness.hasFullProfile &&
        !validation.completeness.hasConversationSummary) {
      
      console.log('🔄 Persona needs summary generation (Call 2)');
      
      // Call the summary generation function
      const call2Result = await createV4PersonaCall2(personaId);
      
      if (!call2Result.success) {
        return {
          success: false,
          error: call2Result.error || 'Summary generation failed',
          completionStage: 'summary_generation_failed'
        };
      }

      // Get the updated persona
      const updatedPersona = await getV4PersonaById(personaId);
      
      return {
        success: true,
        persona: updatedPersona || currentPersona,
        completionStage: 'summary_generation_completed'
      };
    }

    // Handle other incomplete states
    if (currentPersona.creation_stage === 'not_started' || !validation.completeness.hasFullProfile) {
      return {
        success: false,
        error: 'Persona needs full regeneration - detailed traits are missing or failed',
        completionStage: 'needs_regeneration'
      };
    }

    if (currentPersona.creation_stage === 'summary_generation') {
      // Try to complete the summary generation that was in progress
      console.log('🔄 Retrying summary generation (Call 2)');
      
      const retryResult = await createV4PersonaCall2(personaId);
      
      if (!retryResult.success) {
        return {
          success: false,
          error: retryResult.error || 'Summary generation retry failed',
          completionStage: 'summary_retry_failed'
        };
      }

      const updatedPersona = await getV4PersonaById(personaId);
      
      return {
        success: true,
        persona: updatedPersona || currentPersona,
        completionStage: 'summary_retry_completed'
      };
    }

    return {
      success: false,
      error: `Unknown completion state: ${currentPersona.creation_stage}`,
      completionStage: 'unknown_state'
    };

  } catch (error) {
    console.error('Error completing V4 persona:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown completion error',
      completionStage: 'error'
    };
  }
}

/**
 * Batch completion for multiple V4 personas
 */
export async function completeMultipleV4Personas(personaIds: string[]): Promise<V4PersonaCompletionResult[]> {
  console.log(`🔄 Starting batch completion for ${personaIds.length} V4 personas`);
  
  const results: V4PersonaCompletionResult[] = [];
  
  // Process sequentially to avoid overwhelming the edge functions
  for (const personaId of personaIds) {
    const result = await completeV4Persona(personaId);
    results.push(result);
    
    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ Batch completion finished: ${successCount}/${personaIds.length} successful`);
  
  return results;
}

/**
 * Finds all incomplete V4 personas for a user
 */
export async function findIncompleteV4Personas(userPersonas: V4Persona[]): Promise<V4Persona[]> {
  const incompletePersonas = userPersonas.filter(persona => needsV4PersonaCompletion(persona));
  
  console.log(`Found ${incompletePersonas.length} incomplete V4 personas out of ${userPersonas.length} total`);
  
  return incompletePersonas;
}

/**
 * Gets completion recommendations for a V4 persona
 */
export function getV4PersonaCompletionRecommendation(persona: V4Persona): {
  canComplete: boolean;
  recommendation: string;
  actionRequired: string;
} {
  const validation = validateV4PersonaCompleteness(persona);
  
  if (validation.isComplete) {
    return {
      canComplete: false,
      recommendation: 'Persona is already complete',
      actionRequired: 'none'
    };
  }
  
  if (validation.stage === 'detailed_traits' && validation.completeness.hasFullProfile) {
    return {
      canComplete: true,
      recommendation: 'Persona has detailed traits but needs conversation summary generation',
      actionRequired: 'call_v4_persona_call2'
    };
  }
  
  if (validation.stage === 'summary_generation') {
    return {
      canComplete: true,
      recommendation: 'Summary generation was interrupted and can be retried',
      actionRequired: 'retry_v4_persona_call2'
    };
  }
  
  if (!validation.completeness.hasFullProfile) {
    return {
      canComplete: false,
      recommendation: 'Persona needs to be regenerated from scratch - detailed traits are missing',
      actionRequired: 'regenerate_persona'
    };
  }
  
  return {
    canComplete: false,
    recommendation: 'Persona is in an unknown state and may need manual intervention',
    actionRequired: 'manual_review'
  };
}