
// Character-specific linguistic profile - completely separate from persona linguistic profile
export interface CharacterLinguisticProfile {
  communication_style: string; // e.g., "formal", "casual", "archaic"
  vocabulary_complexity: string; // e.g., "simple", "moderate", "complex"
  speech_patterns: string[]; // e.g., ["descriptive", "analytical", "emotional"]
  formality_level: number; // 0-1 scale
  expressiveness: number; // 0-1 scale
  cultural_speech_markers: string[];
  [key: string]: any; // Add index signature for JSON compatibility
}

export interface CharacterEmotionalSystem {
  core_drives: string[]; // From creative character data
  surface_triggers: string[]; // From creative character data
  emotional_responses: {
    change_response_style: string;
    [key: string]: any;
  };
  [key: string]: any; // Add index signature for JSON compatibility
}

// Character-specific behavioral modulation (separate from persona behavioral modulation)
export interface CharacterBehavioralModulation {
  formality?: number;
  enthusiasm?: number;
  assertiveness?: number;
  empathy?: number;
  patience?: number;
  [key: string]: any; // Add index signature for JSON compatibility
}
