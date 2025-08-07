
import { ValidationScores } from './types.ts';

export function calculateOverallScore(scores: ValidationScores): number {
  // If demographic accuracy is critically low (wrong facts), fail regardless of other scores
  if (scores.demographicAccuracy < 0.5) {
    return 0.1; // Force regeneration
  }
  
  return (
    scores.demographicAccuracy * 0.40 +        // Increased weight - most critical
    scores.traitAlignment * 0.25 +             // Personality trait compliance
    scores.factualConsistency * 0.20 +         // Internal consistency
    scores.conversationalAuthenticity * 0.10 + // Natural conversation
    scores.knowledgeDomainAccuracy * 0.03 +    // Knowledge boundaries
    scores.emotionalTriggerCompliance * 0.02   // Emotional reactions
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
    // Clean up the response to extract JSON
    const jsonMatch = rawResponse.match(/\{.*\}/s);
    if (!jsonMatch) {
      console.warn('No JSON found in response, using default');
      return createDefaultValidationResult();
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Ensure required fields exist with new structure
    return {
      final_response: parsed.final_response || 'No enhanced response provided',
      style_score: parsed.style_score || 0.8,
      adjustments_made: parsed.adjustments_made || [],
      violations_found: parsed.violations_found || [],
      // Legacy compatibility for old validation calls
      scores: {
        overall: parsed.style_score || 0.8,
        consistency: parsed.style_score || 0.8,
        authenticity: parsed.style_score || 0.8,
        demographicAccuracy: parsed.style_score || 0.8,
        traitAlignment: parsed.style_score || 0.8,
        emotionalTriggerCompliance: parsed.style_score || 0.8,
        knowledgeDomainAccuracy: parsed.style_score || 0.8,
        conversationalAuthenticity: parsed.style_score || 0.8,
        factualConsistency: parsed.style_score || 0.8
      },
      feedback: (parsed.adjustments_made || []).join(', ') || 'No adjustments needed',
      specificErrors: parsed.violations_found || [],
      shouldRegenerate: false
    };
  } catch (error) {
    console.error('Failed to parse validation response:', error);
    return createDefaultValidationResult();
  }
}
