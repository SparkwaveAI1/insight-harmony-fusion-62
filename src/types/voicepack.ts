export interface VoicepackRuntime {
  stance_biases: Array<{ topic: string; w: number }>;
  response_shapes: Record<string, string[]>;
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
    hedge_rate: number;
    modal_rate: number;
    definitive_rate: number;
    rhetorical_q_rate: number;
    profanity_rate: number;
  };
  register_rules: Array<{ 
    when: Record<string, string>; 
    shift: Record<string, string | number> 
  }>;
  state_hooks: Record<string, Record<string, number | string>>;
  sexuality_hooks_summary: {
    privacy: "private" | "selective" | "open";
    disclosure: "low" | "medium" | "high";
    humor_style_bias: string;
  };
  anti_mode_collapse: {
    forbidden_frames: string[];
    must_include_one_of: Record<string, string[]>;
  };
  topic_salience?: Array<{ topic: string; w: number }>;
  memory_keys: string[];
}

export interface TurnClassification {
  intent: "opinion" | "critique" | "advice" | "story" | "compare" | "clarify";
  topics: string[];
  audience: "peer" | "authority" | "stranger" | "in-group" | "brand";
  sensitivity: "low" | "medium" | "high";
}

export interface Plan {
  response_shape: string;
  stance_hint: string[];
  must_include: string[];
  banned_frames: string[];
  style_deltas: Record<string, number | string>;
  brevity: "short" | "medium" | "long";
  memory_snippets?: string[];
}