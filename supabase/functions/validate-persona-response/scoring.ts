
import { ValidationScores } from './types.ts';

export function calculateOverallScore(scores: ValidationScores): number {
  return (
    scores.humanSpeechPatterns * 0.35 +
    scores.personalityAlignment * 0.25 +
    scores.conversationalAuthenticity * 0.20 +
    scores.uniquePerspective * 0.15 +
    scores.responseLengthVariation * 0.03 +
    scores.backgroundRelevance * 0.02
  );
}

export function createDefaultValidationResult(): any {
  return {
    scores: {
      humanSpeechPatterns: 0.2,
      responseLengthVariation: 0.3,
      personalityAlignment: 0.2,
      uniquePerspective: 0.2,
      conversationalAuthenticity: 0.2,
      backgroundRelevance: 0.3,
      overall: 0.22
    },
    feedback: 'Validation parsing failed - likely overly polished response that lacks natural human speech patterns',
    shouldRegenerate: true
  };
}

export function parseValidationResponse(rawResponse: string): any {
  try {
    const cleanedResponse = rawResponse.replace(/```json\n?|\n?```/g, '').trim();
    const validationResult = JSON.parse(cleanedResponse);
    
    // Calculate overall score with proper weighting
    validationResult.scores.overall = calculateOverallScore(validationResult.scores);
    
    return validationResult;
  } catch (parseError) {
    console.error('Failed to parse validation JSON:', parseError);
    return createDefaultValidationResult();
  }
}
