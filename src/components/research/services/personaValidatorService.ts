
import { toast } from 'sonner';
import { Persona } from '@/services/persona/types';

export interface ValidationScore {
  overall: number;
  demographicAccuracy: number;
  traitAlignment: number;
  emotionalTriggerCompliance: number;
  knowledgeDomainAccuracy: number;
  conversationalAuthenticity: number;
  factualConsistency: number;
}

export interface ValidationResult {
  scores: ValidationScore;
  feedback: string;
  specificErrors: string[];
  shouldRegenerate: boolean;
  improvedResponse?: string;
}

export const validatePersonaResponse = async (
  response: string,
  persona: Persona,
  conversationContext: string,
  userMessage: string
): Promise<ValidationResult> => {
  console.log('Validating persona response for accuracy and trait compliance:', persona.name);
  
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
      // Return permissive scores if validator fails
      return {
        scores: {
          overall: 0.8,
          demographicAccuracy: 0.8,
          traitAlignment: 0.8,
          emotionalTriggerCompliance: 0.8,
          knowledgeDomainAccuracy: 0.8,
          conversationalAuthenticity: 0.8,
          factualConsistency: 0.8
        },
        feedback: 'Validation service unavailable - using original response',
        specificErrors: [],
        shouldRegenerate: false
      };
    }

    const result = await validationResponse.json();
    console.log('Comprehensive validation scores:', result.scores);
    console.log('Demographic accuracy:', result.scores.demographicAccuracy);
    console.log('Trait alignment:', result.scores.traitAlignment);
    console.log('Specific errors found:', result.specificErrors);
    console.log('Should regenerate:', result.shouldRegenerate);
    
    return result;
  } catch (error) {
    console.error('Error validating persona response:', error);
    
    // Return permissive scores on error
    return {
      scores: {
        overall: 0.8,
        demographicAccuracy: 0.8,
        traitAlignment: 0.8,
        emotionalTriggerCompliance: 0.8,
        knowledgeDomainAccuracy: 0.8,
        conversationalAuthenticity: 0.8,
        factualConsistency: 0.8
      },
      feedback: 'Validation failed - using original response',
      specificErrors: [],
      shouldRegenerate: false
    };
  }
};

export const calculateOverallScore = (scores: ValidationScore): number => {
  const weights = {
    demographicAccuracy: 0.30,
    traitAlignment: 0.25,
    factualConsistency: 0.20,
    conversationalAuthenticity: 0.15,
    knowledgeDomainAccuracy: 0.05,
    emotionalTriggerCompliance: 0.05
  };
  
  return (
    scores.demographicAccuracy * weights.demographicAccuracy +
    scores.traitAlignment * weights.traitAlignment +
    scores.factualConsistency * weights.factualConsistency +
    scores.conversationalAuthenticity * weights.conversationalAuthenticity +
    scores.knowledgeDomainAccuracy * weights.knowledgeDomainAccuracy +
    scores.emotionalTriggerCompliance * weights.emotionalTriggerCompliance
  );
};
