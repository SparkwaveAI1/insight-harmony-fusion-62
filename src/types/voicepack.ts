// VOICEPACK RUNTIME TYPES FOR V4 PERSONAS

export interface VoicepackRuntime {
  stance_biases: Array<{ topic: string; w: number }>;               // softmax weights
  response_shapes: Record<string, string[]>;                         // e.g. opinion/critique/advice templates
  lexicon: {
    signature_tokens: string[];
    discourse_markers: Array<{ term: string; p: number }>;
    interjections: Array<{ term: string; p: number }>;
  };
  syntax_policy: {
    sentence_length_dist: { short: number; medium: number; long: number };
    complexity: "simple" | "compound" | "complex";
    lists_per_200toks_max: number;
  };
  style_probs: {
    hedge_rate: number; modal_rate: number; definitive_rate: number;
    rhetorical_q_rate: number; profanity_rate: number;
  };
  register_rules: Array<{ when: Record<string,string>; shift: Record<string,string|number> }>;
  state_hooks: Record<string, Record<string, number | string>>;     // e.g., "stress>0.6": {"hedge_rate":"+0.1"}
  sexuality_hooks_summary: { privacy: "private"|"selective"|"open"; disclosure: "low"|"medium"|"high"; humor_style_bias: string };
  anti_mode_collapse: { forbidden_frames: string[]; must_include_one_of: Record<string,string[]> };
  topic_salience?: Array<{ topic: string; w: number }>;             // optional alias of stance_biases
  memory_keys: string[];
}

// TRAIT RELEVANCE ANALYSIS TYPES
export interface TurnClassification {
  intent: "opinion"|"critique"|"advice"|"story"|"compare"|"clarify";
  topics: string[];                   // ["website-ux","pricing","safety"]
  audience: "peer"|"authority"|"stranger"|"in-group"|"brand";
  sensitivity: "low"|"medium"|"high";
}

export interface Plan {
  response_shape: string;             // one of voicepack.response_shapes keys
  stance_hint: string[];              // 1–2 biases concretized to current topic
  must_include: string[];             // 1–2 concrete details to force specificity
  banned_frames: string[];            // from voicepack.anti_mode_collapse
  style_deltas: Record<string, number | string>; // from state hooks + sexuality/privacy
  brevity: "short"|"medium"|"long";
  memory_snippets?: string[];         // 0–2 short lines
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
    typical_openers: string[];
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