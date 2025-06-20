export interface EmotionalTrigger {
  keywords: string[];
  emotion_type: string;
  intensity_multiplier: number;
  description: string;
}

export interface EmotionalTriggersProfile {
  positive_triggers: EmotionalTrigger[];
  negative_triggers: EmotionalTrigger[];
}

// Enhanced emotional trigger types beyond basic emotions
export type EmotionType = 
  // Basic emotions
  | "anger" | "joy" | "sadness" | "fear" | "disgust" | "surprise"
  // Complex emotions  
  | "contempt" | "pride" | "shame" | "guilt" | "envy" | "nostalgia"
  // Social emotions
  | "embarrassment" | "loyalty" | "protective" | "betrayal" | "validation"
  // Cognitive emotions
  | "curiosity" | "confusion" | "skepticism" | "intellectual_excitement"
  // Values-based emotions
  | "moral_outrage" | "righteousness" | "compassion" | "indignation"
  // Achievement emotions
  | "accomplishment" | "frustration" | "determination" | "overwhelm"
  // Connection emotions
  | "belonging" | "isolation" | "empathy" | "dismissal"
  // Discovery emotions
  | "wonder" | "boredom" | "fascination" | "disappointment";

export interface TraitProfile {
  // 1. Base Traits (Empirically Anchored Models)
  
  // A. Big Five Personality Traits (OCEAN)
  big_five?: {
    openness?: number | null;
    conscientiousness?: number | null;
    extraversion?: number | null;
    agreeableness?: number | null;
    neuroticism?: number | null;
  };
  
  // B. Moral Foundations Theory
  moral_foundations?: {
    care?: number | null;
    fairness?: number | null;
    loyalty?: number | null;
    authority?: number | null;
    sanctity?: number | null;
    liberty?: number | null;
  };
  
  // C. Enhanced World Values Survey
  world_values?: {
    traditional_vs_secular?: number | null;
    survival_vs_self_expression?: number | null;
    materialist_vs_postmaterialist?: number | null;
  };
  
  // D. Enhanced Political Compass with Behavioral Modeling
  political_compass?: {
    economic?: number | null;
    authoritarian_libertarian?: number | null;
    cultural_conservative_progressive?: number | null;
    political_salience?: number | null;
    group_fusion_level?: number | null;
    outgroup_threat_sensitivity?: number | null;
    commons_orientation?: number | null;
    political_motivations?: {
      material_interest?: number | null;
      moral_vision?: number | null;
      cultural_preservation?: number | null;
      status_reordering?: number | null;
    };
  };
  
  // E. Behavioral Economics Traits
  behavioral_economics?: {
    present_bias?: number | null;
    loss_aversion?: number | null;
    overconfidence?: number | null;
    risk_sensitivity?: number | null;
    scarcity_sensitivity?: number | null;
  };

  // F. Cultural Dimensions (Hofstede's Framework)
  cultural_dimensions?: {
    power_distance?: number | null;
    individualism_vs_collectivism?: number | null;
    masculinity_vs_femininity?: number | null;
    uncertainty_avoidance?: number | null;
    long_term_orientation?: number | null;
    indulgence_vs_restraint?: number | null;
  };

  // G. Social Identity and Group Dynamics
  social_identity?: {
    identity_strength?: number | null;
    identity_complexity?: number | null;
    ingroup_bias_tendency?: number | null;
    outgroup_bias_tendency?: number | null;
    social_dominance_orientation?: number | null;
    system_justification?: number | null;
    intergroup_contact_comfort?: number | null;
    cultural_intelligence?: number | null;
  };
  
  // 2. Extended Traits
  extended_traits?: {
    truth_orientation?: number | null;
    moral_consistency?: number | null;
    self_awareness?: number | null;
    empathy?: number | null;
    self_efficacy?: number | null;
    manipulativeness?: number | null;
    impulse_control?: number | null;
    shadow_trait_activation?: number | null;
    attention_pattern?: number | null;
    cognitive_load_resilience?: number | null;
    institutional_trust?: number | null;
    conformity_tendency?: number | null;
    conflict_avoidance?: number | null;
    cognitive_flexibility?: number | null;
    need_for_cognitive_closure?: number | null;
    emotional_intensity?: number | null;
    emotional_regulation?: number | null;
    trigger_sensitivity?: number | null;
  };
  
  // 3. Dynamic State Modifiers
  dynamic_state?: {
    current_stress_level?: number | null;
    emotional_stability_context?: number | null;
    motivation_orientation?: number | null;
    trust_volatility?: number | null;
    trigger_threshold?: number | null;
  };
}
