
export interface ValidationRequest {
  response: string;
  persona: any;
  conversation_context: string;
  user_message: string;
}

export interface ValidationScores {
  overall: number;
  demographicAccuracy: number;
  traitAlignment: number;
  emotionalTriggerCompliance: number;
  knowledgeDomainAccuracy: number;
  conversationalAuthenticity: number;
  factualConsistency: number;
}

export interface ValidationResult {
  scores: ValidationScores;
  feedback: string;
  specificErrors: string[];
  shouldRegenerate: boolean;
  improvedResponse?: string;
}

export interface PersonaTraits {
  big_five: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  moral_foundations: {
    care: number;
    fairness: number;
    loyalty: number;
    authority: number;
    sanctity: number;
    liberty: number;
  };
  demographics: {
    age: number;
    occupation: string;
    education: string;
    region: string;
    marital_status: string;
    children_count: number;
  };
  emotional_triggers: {
    positive_triggers: Array<{
      keywords: string[];
      emotion_type: string;
      intensity_multiplier: number;
    }>;
    negative_triggers: Array<{
      keywords: string[];
      emotion_type: string;
      intensity_multiplier: number;
    }>;
  };
  knowledge_domains: Record<string, number>;
}
