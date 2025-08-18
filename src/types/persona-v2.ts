export interface PersonaV2 {
  id: string;
  version: "2.1";
  created_at: string;
  persona_type: "simulated" | "human_seeded" | "hybrid";
  locale: string;
  profile_image_url?: string;

  identity: {
    name: string;
    age: number;
    gender: string;
    pronouns: string;
    ethnicity: string;
    nationality: string;
    location: { city: string; region: string; country: string };
    occupation: string;
    relationship_status: "single" | "dating" | "committed" | "married" | "separated" | "divorced" | "widowed";
    dependents: number;
  };

  life_context: {
    background_narrative: string;
    current_situation: string;
    daily_routine: string;
    stressors: string[];
    supports: string[];
    life_stage: "emerging_adult" | "early_career" | "midlife" | "late_career" | "retired";
  };

  cognitive_profile: {
    big_five: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    intelligence: {
      level: "low" | "average" | "high" | "gifted";
      type: Array<"analytical" | "creative" | "practical" | "emotional">;
    };
    decision_style: "logical" | "emotional" | "impulsive" | "risk-averse" | "risk-seeking" | "procedural";
    moral_foundations: {
      care_harm: number;
      fairness_cheating: number;
      loyalty_betrayal: number;
      authority_subversion: number;
      sanctity_degradation: number;
      liberty_oppression: number;
    };
    temporal_orientation: "past" | "present" | "future" | "balanced";
    worldview_summary: string;
  };

  social_cognition: {
    empathy: "low" | "medium" | "high";
    theory_of_mind: "low" | "medium" | "high";
    trust_baseline: "low" | "medium" | "high";
    conflict_orientation: "avoidant" | "collaborative" | "confrontational" | "competitive";
    persuasion_style: "story-led" | "evidence-led" | "authority-led" | "reciprocity-led" | "status-led";
    attachment_style: "secure" | "anxious" | "avoidant" | "disorganized";
    ingroup_outgroup_sensitivity: "low" | "medium" | "high";
  };

  health_profile: {
    mental_health: Array<"none" | "anxiety" | "depression" | "adhd" | "ptsd" | "bipolar" | "other">;
    physical_health: Array<"healthy" | "chronic_illness" | "disabled">;
    substance_use: Array<"none" | "alcohol" | "tobacco" | "cannabis" | "stimulants" | "opioids" | "other">;
    energy_baseline: "low" | "medium" | "high";
    circadian_rhythm: "morning" | "evening" | "irregular";
  };

  sexuality_profile: {
    orientation: "heterosexual" | "homosexual" | "bisexual" | "pansexual" | "asexual" | "questioning" | "other";
    identity_labels: string[];
    expression: "private" | "open" | "flamboyant" | "conservative" | "exploratory" | "discreet";
    libido_level: "low" | "medium" | "high";
    relationship_norms: "monogamous" | "polyamorous" | "open" | "casual" | "serial_monogamy" | "transactional" | "codependent";
    flirtatiousness: "low" | "medium" | "high";
    privacy_preference: "private" | "selective" | "public";
    importance_in_identity: number;
    value_alignment: "liberal" | "conservative" | "spiritual" | "pragmatic" | "fluid";
    boundaries: {
      topics_off_limits: string[];
      consent_language_preferences: string[];
    };
    contradictions: Array<{
      belief: string;
      conflicting_behavior: string;
      likely_conditions: Array<"stress" | "alcohol" | "loneliness" | "status_threat" | "opportunity">;
    }>;
    hooks: {
      linguistic_influences: {
        register_bias: "more_direct" | "more_indirect" | "no_change";
        humor_style_bias: "flirtatious" | "deadpan" | "none";
        taboo_navigation: "avoid" | "euphemistic" | "plain";
      };
      reasoning_influences: {
        jealousy_sensitivity: number;
        commitment_weight: number;
        status_mating_bias: number;
      };
      group_behavior_influences: {
        attention_to_attraction_cues: "low" | "medium" | "high";
        self_disclosure_rate: "low" | "medium" | "high";
        boundary_enforcement: "soft" | "firm" | "rigid";
      };
    };
  };

  knowledge_profile: {
    domains_of_expertise: string[];
    general_knowledge_level: "low" | "average" | "high";
    tech_literacy: "low" | "medium" | "high";
    cultural_familiarity: string[];
  };

  emotional_triggers: {
    positive: string[];
    negative: string[];
    explosive: string[];
  };

  contradictions: Array<{
    belief: string;
    conflicting_behavior: string;
    likely_conditions: Array<"stress" | "social_pressure" | "financial_incentive" | "romantic_trigger">;
  }>;

  memory: {
    short_term_slots: number;
    long_term_events: Array<{
      event: string;
      timestamp: string;
      valence: "positive" | "negative" | "neutral";
      impact_on_behavior: string;
      recall_cues: string[];
    }>;
    persistence: { short_term: number; long_term: number };
  };

  state_modifiers: {
    current_state: {
      fatigue: number;
      acute_stress: number;
      mood_valence: number;
      time_pressure: number;
      social_safety: number;
      sexual_tension: number;
    };
    state_to_shift_rules: Array<{
      when: Record<string, any>;
      shift: {
        "linguistic_style.delta"?: Record<string, any>;
        "reasoning_modifiers.delta"?: Record<string, any>;
        "runtime_controls.override"?: Record<string, any>;
        "group_behavior.delta"?: Record<string, any>;
      };
    }>;
  };

  linguistic_style: {
    base_voice: {
      formality: "formal" | "neutral" | "casual" | "slangy";
      directness: "indirect" | "balanced" | "direct";
      politeness: "low" | "medium" | "high";
      verbosity: "terse" | "moderate" | "verbose";
      code_switching: "none" | "mild" | "frequent";
      register_examples: string[];
    };
    lexical_preferences: {
      affect_words: { positive_bias: number; negative_bias: number };
      intensifiers: string[];
      hedges: string[];
      modal_verbs: string[];
      domain_jargon: string[];
      taboo_language: "avoid" | "euphemize" | "plain";
      flirt_markers: string[];
    };
    syntax_and_rhythm: {
      avg_sentence_tokens: { baseline_min: number; baseline_max: number };
      complexity: "simple" | "compound" | "complex" | "narrative";
      lists_frequency_per_200_tokens: number;
      disfluencies: string[];
      signature_phrases: string[];
    };
    response_shapes_by_intent: {
      opinion: string[];
      critique: string[];
      advice: string[];
      story: string[];
    };
    anti_mode_collapse: {
      forbidden_frames: string[];
      must_include_one_of: Record<string, string[]>;
      signature_phrase_frequency_max: number;
    };
  };

  trait_to_language_map: {
    rules: Array<{
      trait: string;
      ranges: Array<{
        min: number;
        max: number;
        linguistic_effects?: Record<string, any>;
        reasoning_effects?: Record<string, any>;
      }>;
    }>;
    moral_and_values_rules: Array<{
      dimension: string;
      high_threshold: number;
      linguistic_effects?: Record<string, any>;
      reasoning_effects?: Record<string, any>;
    }>;
    sexuality_rules: Array<{
      when: Record<string, any>;
      linguistic_effects?: Record<string, any>;
      group_effects?: Record<string, any>;
      reasoning_effects?: Record<string, any>;
      response_shapes?: Record<string, any>;
    }>;
  };

  group_behavior: {
    focus_group_modifiers: {
      assertiveness: "low" | "medium" | "high";
      interruption_tolerance: "low" | "medium" | "high";
      deference_to_authority: "low" | "medium" | "high";
      speak_first_probability: number;
      self_disclosure_rate: "low" | "medium" | "high";
      boundary_enforcement: "soft" | "firm" | "rigid";
      accommodation_rules: Array<{
        audience: string;
        shift: Record<string, any>;
      }>;
    };
  };

  reasoning_modifiers: {
    baseline: {
      structure_level: number;
      verification_depth: number;
      analogy_usage: number;
      risk_tolerance: number;
      confidence_calibration: "under" | "well" | "over";
      exploration_vs_exploitation: "explore" | "balanced" | "exploit";
      hallucination_aversion: number;
    };
    domain_biases: Array<{
      domain: string;
      [key: string]: any;
    }>;
  };

  runtime_controls: {
    style_weights: { cognition: number; linguistics: number; knowledge: number; memory_contradiction: number };
    variability_profile: { turn_to_turn: number; session_to_session: number; mood_shift_probability: number };
    brevity_policy: {
      default_max_paragraphs: number;
      intent_overrides: Record<string, { max_tokens: number }>;
    };
    token_budgets: { min: number; max: number };
    postprocessors: string[];
  };

  ethics_and_safety: {
    refusals: string[];
    escalation_phrases: string[];
    sensitive_topics_style: string;
  };

  telemetry: {
    log_fields: string[];
    target_fidelity: { min_signature_usage_rate: number; max_generic_frame_rate: number };
  };
}