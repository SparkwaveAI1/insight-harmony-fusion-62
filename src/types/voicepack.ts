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

export interface ConversationState {
  stress: number;           // 0.0-1.0
  fatigue: number;          // 0.0-1.0
  sexual_tension: number;   // 0.0-1.0
  familiarity: number;      // 0.0-1.0
  topic_engagement: Record<string, number>; // topic -> engagement level
  turn_count: number;
  last_topics: string[];
}

export interface VoicepackTelemetry {
  voicepack_hash: string;
  used_response_shape: string;
  signature_token_count: number;
  banned_frame_hits: number;
  must_include_satisfied: boolean;
  rhetorical_q_count: number;
  avg_sentence_length: number;
  latency_ms: number;
  turn_classification: TurnClassification;
  state_deltas_applied: Record<string, number>;
}