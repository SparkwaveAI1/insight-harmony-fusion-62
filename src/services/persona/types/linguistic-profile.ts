
export interface LinguisticProfile {
  default_output_length?: string;
  speech_register?: string;
  regional_influence?: string | null;
  professional_or_educational_influence?: string | null;
  cultural_speech_patterns?: string | null;
  generational_or_peer_influence?: string | null;
  speaking_style?: Record<string, boolean>;
  sample_phrasing?: string[];
}

export interface SimulationDirectives {
  encourage_contradiction?: boolean;
  emotional_asymmetry?: boolean;
  stress_behavior_expected?: boolean;
  inconsistency_is_valid?: boolean;
  response_length_variability?: boolean;
}
