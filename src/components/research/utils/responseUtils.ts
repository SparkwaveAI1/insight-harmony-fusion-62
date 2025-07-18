
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
 * Enhanced response parsing with multiple strategies
 */
export const parsePersonaResponse = (
  fullResponse: string,
  questions: string[]
): string[] => {
  console.log('Parsing response:', fullResponse.substring(0, 200) + '...');
  
  const answers: string[] = [];
  const cleanResponse = fullResponse.trim();
  
  // Strategy 1: Look for "Answer X:" format
  const answerPattern = /Answer\s+(\d+):\s*(.*?)(?=Answer\s+\d+:|$)/gis;
  const answerMatches = [...cleanResponse.matchAll(answerPattern)];
  
  if (answerMatches.length >= questions.length) {
    console.log('Using Answer X: format parsing');
    answerMatches.forEach((match, index) => {
      if (index < questions.length) {
        answers[index] = cleanAnswerText(match[2]);
      }
    });
    return fillMissingAnswers(answers, questions.length);
  }
  
  // Strategy 2: Look for numbered format "1.", "2.", etc.
  const numberedPattern = /^(\d+)\.\s*(.*?)(?=^\d+\.|$)/gims;
  const numberedMatches = [...cleanResponse.matchAll(numberedPattern)];
  
  if (numberedMatches.length >= questions.length) {
    console.log('Using numbered format parsing');
    numberedMatches.forEach((match, index) => {
      const questionNum = parseInt(match[1]) - 1;
      if (questionNum >= 0 && questionNum < questions.length) {
        answers[questionNum] = cleanAnswerText(match[2]);
      }
    });
    return fillMissingAnswers(answers, questions.length);
  }
  
  // Strategy 3: Look for "Q1:", "Question 1:", etc.
  const questionPattern = /(?:Q|Question)\s*(\d+):\s*(.*?)(?=(?:Q|Question)\s*\d+:|$)/gis;
  const questionMatches = [...cleanResponse.matchAll(questionPattern)];
  
  if (questionMatches.length >= questions.length) {
    console.log('Using Q/Question format parsing');
    questionMatches.forEach((match, index) => {
      const questionNum = parseInt(match[1]) - 1;
      if (questionNum >= 0 && questionNum < questions.length) {
        answers[questionNum] = cleanAnswerText(match[2]);
      }
    });
    return fillMissingAnswers(answers, questions.length);
  }
  
  // Strategy 4: Split by double line breaks and match by count
  const paragraphs = cleanResponse.split(/\n\s*\n/).filter(p => p.trim().length > 10);
  if (paragraphs.length >= questions.length) {
    console.log('Using paragraph-based parsing');
    for (let i = 0; i < questions.length && i < paragraphs.length; i++) {
      answers[i] = cleanAnswerText(paragraphs[i]);
    }
    return fillMissingAnswers(answers, questions.length);
  }
  
  // Strategy 5: Intelligent question matching
  const matchedAnswers = matchAnswersToQuestions(cleanResponse, questions);
  if (matchedAnswers.some(a => a.trim().length > 0)) {
    console.log('Using intelligent question matching');
    return matchedAnswers;
  }
  
  // Fallback: Single response for all questions
  console.log('Using fallback parsing - single response');
  const fallbackAnswer = cleanAnswerText(cleanResponse);
  return questions.map((_, index) => 
    index === 0 ? fallbackAnswer : `[Answer extracted from full response: ${fallbackAnswer.substring(0, 100)}...]`
  );
};

/**
 * Clean and format answer text
 */
const cleanAnswerText = (text: string): string => {
  return text
    .trim()
    .replace(/^\d+\.\s*/, '') // Remove leading numbers
    .replace(/^Answer\s*\d*:\s*/i, '') // Remove "Answer X:" prefix
    .replace(/^Q\d*:\s*/i, '') // Remove "Q1:" prefix
    .replace(/^Question\s*\d*:\s*/i, '') // Remove "Question 1:" prefix
    .replace(/\n\s*\n/g, '\n') // Clean up extra line breaks
    .trim();
};

/**
 * Fill missing answers with placeholder text
 */
const fillMissingAnswers = (answers: string[], totalQuestions: number): string[] => {
  const result = [...answers];
  for (let i = 0; i < totalQuestions; i++) {
    if (!result[i] || result[i].trim().length === 0) {
      result[i] = `[No clear answer found for question ${i + 1}]`;
    }
  }
  return result.slice(0, totalQuestions);
};

/**
 * Intelligent matching of responses to questions
 */
const matchAnswersToQuestions = (response: string, questions: string[]): string[] => {
  const answers: string[] = [];
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i].toLowerCase();
    const keywords = extractKeywords(question);
    
    // Look for sections that might contain the answer
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 20);
    let bestMatch = '';
    let bestScore = 0;
    
    for (const sentence of sentences) {
      const score = calculateMatchScore(sentence.toLowerCase(), keywords);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = sentence.trim();
      }
    }
    
    answers[i] = bestMatch || `[Could not identify answer for question ${i + 1}]`;
  }
  
  return answers;
};

/**
 * Extract key words from a question
 */
const extractKeywords = (question: string): string[] => {
  const stopWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'would', 'could', 'should', 'do', 'does', 'did', 'is', 'are', 'was', 'were', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'you', 'your'];
  
  return question
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 5); // Top 5 keywords
};

/**
 * Calculate how well a sentence matches the question keywords
 */
const calculateMatchScore = (sentence: string, keywords: string[]): number => {
  let score = 0;
  for (const keyword of keywords) {
    if (sentence.includes(keyword)) {
      score += 1;
    }
  }
  return score / keywords.length;
};

/**
 * Format survey results for export with enhanced structure
 */
export const formatSurveyResultsForExport = (
  surveyName: string,
  questions: string[],
  personaStatuses: PersonaSurveyStatus[]
) => {
  const completedPersonas = personaStatuses.filter(p => p.status === 'completed');
  const errorPersonas = personaStatuses.filter(p => p.status === 'error');
  
  // Group responses by question for analysis
  const responsesByQuestion = questions.map((question, index) => {
    const responses = completedPersonas.map(persona => {
      const response = persona.responses.find(r => r.questionIndex === index);
      return {
        personaName: persona.personaName,
        personaId: persona.personaId,
        response: response?.responseText || '[No response]'
      };
    });
    
    return {
      questionIndex: index + 1,
      questionText: question,
      responseCount: responses.filter(r => r.response !== '[No response]').length,
      responses
    };
  });
  
  const results = {
    surveyMetadata: {
      surveyName,
      timestamp: new Date().toISOString(),
      totalQuestions: questions.length,
      totalPersonas: personaStatuses.length,
      completedPersonas: completedPersonas.length,
      errorPersonas: errorPersonas.length,
      completionRate: `${Math.round((completedPersonas.length / personaStatuses.length) * 100)}%`
    },
    questions,
    responsesByQuestion,
    personaResponses: completedPersonas.map(persona => ({
      personaName: persona.personaName,
      personaId: persona.personaId,
      status: persona.status,
      responses: persona.responses.map(r => ({
        questionIndex: r.questionIndex + 1,
        question: r.questionText,
        response: r.responseText,
        timestamp: r.timestamp
      }))
    })),
    errors: errorPersonas.map(persona => ({
      personaName: persona.personaName,
      personaId: persona.personaId,
      error: persona.error
    }))
  };
  
  return results;
};

/**
 * Extract key insights from survey responses
 */
export const extractSurveyInsights = (
  questions: string[],
  personaStatuses: PersonaSurveyStatus[]
): { themes: string[], quotes: string[], summary: string } => {
  const completedPersonas = personaStatuses.filter(p => p.status === 'completed');
  const allResponses = completedPersonas.flatMap(p => p.responses);
  
  // Extract notable quotes (responses longer than 50 chars)
  const quotes = allResponses
    .filter(r => r.responseText.length > 50 && !r.responseText.includes('[No'))
    .slice(0, 10)
    .map(r => ({
      text: r.responseText.substring(0, 200) + (r.responseText.length > 200 ? '...' : ''),
      persona: r.personaName,
      question: `Q${r.questionIndex + 1}`
    }));
  
  // Identify common themes (simplified)
  const themes = identifyCommonThemes(allResponses);
  
  const summary = `Survey completed with ${completedPersonas.length} personas responding to ${questions.length} questions. Key themes identified: ${themes.join(', ')}.`;
  
  return {
    themes: themes.slice(0, 5),
    quotes: quotes.map(q => `"${q.text}" - ${q.persona} (${q.question})`),
    summary
  };
};

/**
 * Simple theme identification based on word frequency
 */
const identifyCommonThemes = (responses: SurveyResponse[]): string[] => {
  const wordCounts = new Map<string, number>();
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'is', 'are', 'was', 'were', 'would', 'could', 'should', 'will', 'can', 'do', 'does', 'did', 'have', 'has', 'had', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);
  
  responses.forEach(response => {
    const words = response.responseText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
  });
  
  return Array.from(wordCounts.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};
