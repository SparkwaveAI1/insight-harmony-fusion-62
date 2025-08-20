// V3 Persona Type Definitions
export interface PersonaV3 {
  persona_id: string;
  id: string;
  name: string;
  description?: string;
  version: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_public: boolean;
  profile_image_url?: string;
  prompt?: string;

  // Core V3 structure
  identity: {
    age: number;
    gender: string;
    pronouns: string;
    ethnicity: string;
    nationality: string;
    occupation: string;
    relationship_status: string;
    dependents: number;
    location: {
      city: string;
      region: string;
      country: string;
    };
    socioeconomic_context: {
      income_level: string;
      education_level: string;
      social_class_identity: string;
      political_affiliation: string;
      religious_affiliation: string;
      religious_practice_level: "low" | "medium" | "high";
      cultural_background: string;
      cultural_dimensions: {
        power_distance: number;
        individualism_vs_collectivism: number;
        masculinity_vs_femininity: number;
        uncertainty_avoidance: number;
        long_term_orientation: number;
        indulgence_vs_restraint: number;
      };
    };
  };

  life_context: {
    supports: string[];
    stressors: string[];
    daily_routine: string;
    current_situation: string;
    background_narrative: string;
    lifestyle: string;
  };

  knowledge_profile: {
    general_knowledge_level: "low" | "medium" | "high";
    tech_literacy: "low" | "medium" | "high";
    domains_of_expertise: string[];
    knowledge_domains: {
      arts: number;
      health: number;
      sports: number;
      finance: number;
      history: number;
      science: number;
      business: number;
      politics: number;
      technology: number;
      entertainment: number;
    };
  };

  cognitive_profile: {
    big_five: {
      openness: number;
      neuroticism: number;
      extraversion: number;
      agreeableness: number;
      conscientiousness: number;
    };
    extended_traits: {
      empathy: number;
      self_efficacy: number;
      cognitive_flexibility: number;
      impulse_control: number;
      attention_pattern: number;
      manipulativeness: number;
      need_for_cognitive_closure: number;
      institutional_trust: number;
    };
    intelligence: {
      type: string[];
      level: "low" | "medium" | "high";
    };
    decision_style: "logical" | "intuitive" | "mixed";
    behavioral_economics: {
      present_bias: number;
      loss_aversion: number;
      overconfidence: number;
      risk_sensitivity: number;
      scarcity_sensitivity: number;
    };
    moral_foundations: {
      care_harm: number;
      fairness_cheating: number;
      loyalty_betrayal: number;
      authority_subversion: number;
      sanctity_degradation: number;
      liberty_oppression: number;
    };
    social_identity: {
      identity_strength: number;
      ingroup_bias_tendency: number;
      outgroup_bias_tendency: number;
      cultural_intelligence: number;
      system_justification: number;
    };
    political_orientation: {
      authoritarian_libertarian: number;
      economic: number;
      cultural_progressive_conservative: number;
    };
    worldview_summary: string;
  };

  memory: {
    persistence: {
      long_term: number;
      short_term: number;
    };
    long_term_events: Array<{
      event: string;
      valence: "positive" | "negative";
      timestamp: string;
      recall_cues: string[];
      impact_on_behavior: string;
    }>;
    short_term_slots: number;
  };

  state_modifiers: {
    current_state: {
      fatigue: number;
      acute_stress: number;
      mood_valence: number;
      social_safety: number;
      time_pressure: number;
    };
    state_to_shift_rules: Array<{
      when: Record<string, string>;
      shift: Record<string, any>;
    }>;
  };

  linguistic_style: {
    base_voice: {
      formality: string;
      verbosity: string;
      directness: string;
      politeness: string;
    };
    syntax_and_rhythm: {
      complexity: string;
      disfluencies: string[];
      signature_phrases: string[];
      avg_sentence_tokens: {
        baseline_max: number;
        baseline_min: number;
      };
    };
    anti_mode_collapse: {
      forbidden_frames: string[];
      must_include_one_of: Record<string, string[]>;
    };
    lexical_preferences: {
      hedges: string[];
      modal_verbs: string[];
      affect_words: {
        negative_bias: number;
        positive_bias: number;
      };
    };
    response_shapes_by_intent: Record<string, string[]>;
  };

  group_behavior: {
    assertiveness: "high" | "medium" | "low";
    interruption_tolerance: string;
    self_disclosure_rate: string;
  };

  social_cognition: {
    empathy: "high" | "medium" | "low";
    theory_of_mind: string;
    conflict_orientation: string;
  };

  sexuality_profile: {
    orientation: string;
    expression: "private" | "open";
    flirtatiousness: "low" | "medium" | "high";
    libido_level: "low" | "medium" | "high";
    relationship_norms: string;
  };

  emotional_triggers: {
    positive: string[];
    negative: string[];
    explosive: string[];
  };

  runtime_controls: {
    style_weights: {
      cognition: number;
      knowledge: number;
      linguistics: number;
    };
    token_budgets: {
      max: number;
      min: number;
    };
    variability_profile: {
      turn_to_turn: number;
      session_to_session: number;
    };
  };

  interview_sections: Array<{
    section_title: string;
    responses: Array<{
      question: string;
      answer: string;
    }>;
  }>;
}

// Database representation
export interface DbPersonaV3 {
  id: string;
  persona_id: string;
  name: string;
  description?: string;
  user_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  profile_image_url?: string;
  prompt?: string;
  version?: string;
  persona_data: any; // JSONB field containing the V3 structure
}