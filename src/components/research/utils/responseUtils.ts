
import { Persona } from '@/services/persona/types';

export interface SurveyResponse {
  personaId: string;
  personaName: string;
  questionIndex: number;
  questionText: string;
  responseText: string;
  timestamp: Date;
}

export interface PersonaSurveyStatus {
  personaId: string;
  personaName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  responses: SurveyResponse[];
  error?: string;
}

/**
 * Parse a full response from a persona to extract answers to specific questions
 */
export const parsePersonaResponse = (
  fullResponse: string,
  questions: string[]
): string[] => {
  // Basic parsing of answers based on "Answer X:" format
  const answers: string[] = [];
  
  // Try to find answers in format "Answer X:" or just look for numbered responses
  for (let i = 0; i < questions.length; i++) {
    const answerMarker = `Answer ${i + 1}:`;
    let answerText = '';
    
    if (fullResponse.includes(answerMarker)) {
      // Extract text between this answer marker and the next one (or end of text)
      const startIdx = fullResponse.indexOf(answerMarker) + answerMarker.length;
      const nextMarker = `Answer ${i + 2}:`;
      const endIdx = fullResponse.includes(nextMarker) 
        ? fullResponse.indexOf(nextMarker)
        : fullResponse.length;
      
      answerText = fullResponse.substring(startIdx, endIdx).trim();
    } else {
      // Fallback - try to find patterns like "1.", "2.", etc.
      const numberMarker = `${i + 1}.`;
      if (fullResponse.includes(numberMarker)) {
        const startIdx = fullResponse.indexOf(numberMarker) + numberMarker.length;
        const nextMarker = `${i + 2}.`;
        const endIdx = fullResponse.includes(nextMarker) 
          ? fullResponse.indexOf(nextMarker)
          : fullResponse.length;
        
        answerText = fullResponse.substring(startIdx, endIdx).trim();
      }
    }
    
    // If no structured format is found, just return the whole response for this question
    if (!answerText && i === 0) {
      answerText = fullResponse;
    }
    
    answers.push(answerText || `[No clear answer found for question ${i + 1}]`);
  }
  
  return answers;
}

/**
 * Format survey results for export
 */
export const formatSurveyResultsForExport = (
  surveyName: string,
  questions: string[],
  personaStatuses: PersonaSurveyStatus[]
) => {
  const results = {
    surveyName,
    timestamp: new Date().toISOString(),
    questions,
    personaResponses: personaStatuses.map(persona => {
      // Group responses by question
      const responsesByQuestion = questions.map((question, index) => {
        const response = persona.responses.find(r => r.questionIndex === index);
        return {
          question,
          response: response?.responseText || '',
        };
      });
      
      return {
        personaName: persona.personaName,
        personaId: persona.personaId,
        status: persona.status,
        responses: responsesByQuestion
      };
    })
  };
  
  return results;
}
