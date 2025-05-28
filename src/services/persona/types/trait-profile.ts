
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
    openness?: string | null;
    conscientiousness?: string | null;
    extraversion?: string | null;
    agreeableness?: string | null;
    neuroticism?: string | null;
  };
  
  // B. Moral Foundations Theory
  moral_foundations?: {
    care?: string | null;
    fairness?: string | null;
    loyalty?: string | null;
    authority?: string | null;
    sanctity?: string | null;
    liberty?: string | null;
  };
  
  // C. Enhanced World Values Survey
  world_values?: {
    traditional_vs_secular?: string | null;
    survival_vs_self_expression?: string | null;
    materialist_vs_postmaterialist?: string | null; // NEW: Third dimension
  };
  
  // D. Enhanced Political Compass with Behavioral Modeling
  political_compass?: {
    economic?: string | null;
    authoritarian_libertarian?: string | null;
    cultural_conservative_progressive?: string | null; // NEW: Separate cultural axis
    // Political Behavior Architecture
    political_salience?: string | null; // NEW: How central politics is to identity (0-100)
    group_fusion_level?: string | null; // NEW: Identity fusion with political group
    outgroup_threat_sensitivity?: string | null; // NEW: Threat perception from opposing views
    commons_orientation?: string | null; // NEW: Views on shared responsibility/public goods
    // Political Motivations
    political_motivations?: {
      material_interest?: string | null; // Economic benefit/harm focus
      moral_vision?: string | null; // Justice/fairness focus
      cultural_preservation?: string | null; // Heritage/tradition focus
      status_reordering?: string | null; // Hierarchy change desires
    };
  };
  
  // E. Behavioral Economics Traits
  behavioral_economics?: {
    present_bias?: string | null;
    loss_aversion?: string | null;
    overconfidence?: string | null;
    risk_sensitivity?: string | null;
    scarcity_sensitivity?: string | null;
  };
  
  // 2. Extended Traits
  extended_traits?: {
    truth_orientation?: string | null;
    moral_consistency?: string | null;
    self_awareness?: string | null;
    empathy?: string | null;
    self_efficacy?: string | null;
    manipulativeness?: string | null;
    impulse_control?: string | null;
    shadow_trait_activation?: string | null;
    attention_pattern?: string | null;
    cognitive_load_resilience?: string | null;
    institutional_trust?: string | null;
    conformity_tendency?: string | null;
    conflict_avoidance?: string | null;
    cognitive_flexibility?: string | null;
    need_for_cognitive_closure?: string | null;
    // Enhanced emotional traits
    emotional_intensity?: string | null;
    emotional_regulation?: string | null;
    trigger_sensitivity?: string | null;
  };
  
  // 3. Dynamic State Modifiers
  dynamic_state?: {
    current_stress_level?: string | null;
    emotional_stability_context?: string | null;
    motivation_orientation?: string | null;
    trust_volatility?: string | null;
    trigger_threshold?: string | null;
  };
}
