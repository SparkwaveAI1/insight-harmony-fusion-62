
export interface ValidationRequest {
  response: string;
  persona: any;
  conversation_context: string;
  user_message: string;
}

export interface ValidationScores {
  humanSpeechPatterns: number;
  responseLengthVariation: number;
  personalityAlignment: number;
  uniquePerspective: number;
  conversationalAuthenticity: number;
  backgroundRelevance: number;
  overall: number;
}

export interface ValidationResult {
  scores: ValidationScores;
  feedback: string;
  improvedResponse?: string;
  shouldRegenerate: boolean;
}

export interface PersonaTraits {
  bigFive: Record<string, number>;
  moralFoundations: Record<string, number>;
  extendedTraits: Record<string, number>;
}
