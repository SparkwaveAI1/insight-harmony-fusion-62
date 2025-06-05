
import { toast } from 'sonner';
import { Persona } from '@/services/persona/types';

export interface ValidationScore {
  overall: number;
  humanness: number;
  personalityAlignment: number;
  speechPatternAuthenticity: number;
  uniquePerspective: number;
  emotionalTone: number;
  backgroundRelevance: number;
}

export interface ValidationResult {
  scores: ValidationScore;
  feedback: string;
  improvedResponse?: string;
  shouldRegenerate: boolean;
}

export const validatePersonaResponse = async (
  response: string,
  persona: Persona,
  conversationContext: string,
  userMessage: string
): Promise<ValidationResult> => {
  console.log('Validating persona response for authenticity:', persona.name);
  
  try {
    // Call validation edge function
    const validationResponse = await fetch('https://wgerdrdsuusnrdnwwelt.functions.supabase.co/validate-persona-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZXJkcmRzdXVzbnJkbnd3ZWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxODkxMjAsImV4cCI6MjA1Nzc2NTEyMH0.yAoqtSbNo7gabNOSyDrNGNjIUaMIPwyhevV2F-IQHbY`
      },
      body: JSON.stringify({
        response,
        persona,
        conversation_context: conversationContext,
        user_message: userMessage
      }),
    });

    if (!validationResponse.ok) {
      console.error('Validation service error:', validationResponse.status);
      // Return default passing scores if validator fails
      return {
        scores: {
          overall: 0.7,
          humanness: 0.7,
          personalityAlignment: 0.7,
          speechPatternAuthenticity: 0.7,
          uniquePerspective: 0.7,
          emotionalTone: 0.7,
          backgroundRelevance: 0.7
        },
        feedback: 'Validation service unavailable - using original response',
        shouldRegenerate: false
      };
    }

    const result = await validationResponse.json();
    console.log('Validation scores:', result.scores);
    console.log('Validation feedback:', result.feedback);
    
    return result;
  } catch (error) {
    console.error('Error validating persona response:', error);
    
    // Return default passing scores on error
    return {
      scores: {
        overall: 0.7,
        humanness: 0.7,
        personalityAlignment: 0.7,
        speechPatternAuthenticity: 0.7,
        uniquePerspective: 0.7,
        emotionalTone: 0.7,
        backgroundRelevance: 0.7
      },
      feedback: 'Validation failed - using original response',
      shouldRegenerate: false
    };
  }
};

export const calculateOverallScore = (scores: ValidationScore): number => {
  const weights = {
    humanness: 0.25,
    personalityAlignment: 0.20,
    speechPatternAuthenticity: 0.20,
    uniquePerspective: 0.15,
    emotionalTone: 0.10,
    backgroundRelevance: 0.10
  };
  
  return (
    scores.humanness * weights.humanness +
    scores.personalityAlignment * weights.personalityAlignment +
    scores.speechPatternAuthenticity * weights.speechPatternAuthenticity +
    scores.uniquePerspective * weights.uniquePerspective +
    scores.emotionalTone * weights.emotionalTone +
    scores.backgroundRelevance * weights.backgroundRelevance
  );
};
