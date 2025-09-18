// V4 TRAIT ANALYSIS TYPES
export interface TurnClassification {
  intent: "opinion"|"critique"|"advice"|"story"|"compare"|"clarify";
  topics: string[];                   // ["website-ux","pricing","safety"]
  audience: "peer"|"authority"|"stranger"|"in-group"|"brand";
  sensitivity: "low"|"medium"|"high";
}


// V4 TRAIT RELEVANCE ANALYZER TYPES
export interface V4TraitPath {
  path: string;
  weight: number;
  contexts: string[];
}

export interface V4TraitScore {
  trait: string;
  score: number;
  relevance_reason: string;
  data_value: any;
}

export interface KnowledgeBoundary {
  user_topics: string[];
  expertise_domains: string[];
  overlap_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  guidance: string;
}

export interface V4TraitAnalysisResult {
  selected_traits: V4TraitScore[];
  context_classification: TurnClassification;
  linguistic_signature: {
    signature_phrases: string[];
    forbidden_expressions: string[];
    conversation_enders: string[];
    sentence_patterns: string[];
  };
  behavioral_modifiers: {
    confidence_adjustment: number;
    directness_level: string;
    emotional_state: string;
    formality_shift: string;
  };
  knowledge_boundary: KnowledgeBoundary;
}