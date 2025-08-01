
import { ValidationScores } from './types.ts';

export function calculateOverallScore(scores: ValidationScores): number {
  // UPDATED: Rebalanced weights to prioritize personality expression over consensus
  // Less strict demographic requirement to allow personality-driven interpretations
  if (scores.demographicAccuracy < 0.3) {
    return 0.1; // Only force regeneration for major demographic misalignment
  }
  
  return (
    scores.traitAlignment * 0.35 +             // INCREASED: Most important for diversity
    scores.conversationalAuthenticity * 0.25 + // INCREASED: Personality expression
    scores.emotionalTriggerCompliance * 0.20 + // INCREASED: Emotional diversity
    scores.demographicAccuracy * 0.10 +        // REDUCED: Less critical than personality
    scores.factualConsistency * 0.05 +         // REDUCED: Allow personality-driven interpretation
    scores.knowledgeDomainAccuracy * 0.05      // REDUCED: Personality over pure accuracy
  );
}

export function createDefaultValidationResult(): any {
  return {
    scores: {
      demographicAccuracy: 0.1,
      traitAlignment: 0.1,
      emotionalTriggerCompliance: 0.1,
      knowledgeDomainAccuracy: 0.1,
      conversationalAuthenticity: 0.1,
      factualConsistency: 0.1,
      overall: 0.1
    },
    feedback: 'Validation parsing failed - response likely contains factual errors or trait mismatches',
    specificErrors: ['Failed to parse validation response'],
    shouldRegenerate: true
  };
}

export function parseValidationResponse(rawResponse: string): any {
  try {
    const cleanedResponse = rawResponse.replace(/```json\n?|\n?```/g, '').trim();
    const validationResult = JSON.parse(cleanedResponse);
    
    // Calculate overall score with proper weighting and demographic accuracy check
    validationResult.scores.overall = calculateOverallScore(validationResult.scores);
    
    // UPDATED: Less strict regeneration criteria to allow personality-driven responses
    validationResult.shouldRegenerate = validationResult.scores.demographicAccuracy < 0.3 || 
                                       validationResult.scores.traitAlignment < 0.4 ||
                                       validationResult.scores.conversationalAuthenticity < 0.4;
    
    if (validationResult.shouldRegenerate) {
      if (!validationResult.specificErrors) {
        validationResult.specificErrors = [];
      }
      if (validationResult.scores.demographicAccuracy < 0.3) {
        validationResult.specificErrors.push('Major demographic accuracy failure');
      }
      if (validationResult.scores.traitAlignment < 0.4) {
        validationResult.specificErrors.push('Poor trait alignment - personality not expressed');
      }
      if (validationResult.scores.conversationalAuthenticity < 0.4) {
        validationResult.specificErrors.push('Response lacks authentic personality expression');
      }
    }
    
    // Ensure we have specificErrors array
    if (!validationResult.specificErrors) {
      validationResult.specificErrors = [];
    }
    
    return validationResult;
  } catch (parseError) {
    console.error('Failed to parse validation JSON:', parseError);
    return createDefaultValidationResult();
  }
}
