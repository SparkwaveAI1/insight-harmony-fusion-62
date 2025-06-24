
import { ValidationScores } from './types.ts';

export function calculateOverallScore(scores: ValidationScores): number {
  return (
    scores.demographicAccuracy * 0.30 +        // Most important - factual accuracy
    scores.traitAlignment * 0.25 +             // Personality trait compliance
    scores.factualConsistency * 0.20 +         // Internal consistency
    scores.conversationalAuthenticity * 0.15 + // Natural conversation
    scores.knowledgeDomainAccuracy * 0.05 +    // Knowledge boundaries
    scores.emotionalTriggerCompliance * 0.05   // Emotional reactions
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
    
    // Calculate overall score with proper weighting
    validationResult.scores.overall = calculateOverallScore(validationResult.scores);
    
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
