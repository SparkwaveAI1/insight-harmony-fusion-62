// Question Type Definitions with Backward Compatibility

// New Question format (object with text and optional image)
export interface Question {
  text: string;
  image?: {
    data?: string;      // base64: "data:image/png;base64,..."
    url?: string;       // OR storage URL: "https://..."
    fileName?: string;  // For display
  };
}

// Legacy question type (string only)
export type LegacyQuestion = string;

// Union type that supports both formats
export type FlexibleQuestion = Question | LegacyQuestion;

// Array types
export type QuestionArray = Question[];
export type LegacyQuestionArray = string[];
export type FlexibleQuestionArray = FlexibleQuestion[];

// Helper functions for type checking and conversion
export const isLegacyQuestion = (question: FlexibleQuestion): question is string => {
  return typeof question === 'string';
};

export const isNewQuestion = (question: FlexibleQuestion): question is Question => {
  return typeof question === 'object' && question !== null && 'text' in question;
};

// Convert legacy question to new format
export const normalizeQuestion = (question: FlexibleQuestion): Question => {
  if (isLegacyQuestion(question)) {
    return { text: question };
  }
  return question;
};

// Convert array of questions to new format
export const normalizeQuestions = (questions: FlexibleQuestionArray): QuestionArray => {
  return questions.map(normalizeQuestion);
};

// Extract text from any question format
export const getQuestionText = (question: FlexibleQuestion): string => {
  if (isLegacyQuestion(question)) {
    return question;
  }
  return question.text;
};

// Extract image from question (returns null if no image)
export const getQuestionImage = (question: FlexibleQuestion): Question['image'] | null => {
  if (isLegacyQuestion(question)) {
    return null;
  }
  return question.image || null;
};

// Convert questions array to legacy format (text only)
export const toLegacyQuestions = (questions: FlexibleQuestionArray): string[] => {
  return questions.map(getQuestionText);
};