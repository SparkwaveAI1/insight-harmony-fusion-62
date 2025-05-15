
// Types for persona generation

export interface PersonaTemplate {
  persona_id: string;
  name: string;
  creation_date: string;
  metadata: {
    age: number | null;
    gender: string | null;
    race_ethnicity: string | null;
    sexual_orientation: string | null;
    education_level: string | null;
    occupation: string | null;
    employment_type: string | null;
    income_level: string | null;
    social_class_identity: string | null;
    marital_status: string | null;
    parenting_role: string | null;
    relationship_history: string | null;
    military_service: string | null;
    region: string | null;
    urban_rural_context: string | null;
    location_history: {
      grew_up_in: string | null;
      current_residence: string | null;
      places_lived: string[];
    };
    migration_history: string | null;
    climate_risk_zone: string | null;
    language_proficiency: string[];
    religious_affiliation: string | null;
    religious_practice_level: string | null;
    cultural_background: string | null;
    cultural_affiliation: string[];
    political_affiliation: string | null;
    political_sophistication: string | null;
    tech_familiarity: string | null;
    learning_modality: string | null;
    trust_in_institutions: string | null;
    trauma_exposure: string | null;
    financial_pressure: string | null;
    credit_access: string | null;
    debt_load: string | null;
    time_abundance: string | null;
    media_ecosystem: string[];
    aesthetic_subculture: string | null;
    physical_health_status: string | null;
    mental_health_status: string | null;
    health_prioritization: string | null;
    healthcare_access: string | null;
    knowledge_domains: {
      finance_basics: number | null;
      crypto_blockchain: number | null;
      world_politics: number | null;
      national_politics: number | null;
      pop_culture: number | null;
      basic_technology: number | null;
      deep_technology: number | null;
      health_medicine: number | null;
      advanced_medical: number | null;
      science_concepts: number | null;
      sports: number | null;
      news_literacy: number | null;
      environmental_issues: number | null;
      cultural_history: number | null;
      law_legal: number | null;
      religion_spirituality: number | null;
      art_literature: number | null;
      gaming: number | null;
      food_cooking: number | null;
      travel_geography: number | null;
      parenting_childcare: number | null;
      home_improvement: number | null;
      business_entrepreneurship: number | null;
      psychology_social_science: number | null;
      economics: number | null;
    };
  };
  trait_profile: {
    big_five: {
      openness: number | null;
      conscientiousness: number | null;
      extraversion: number | null;
      agreeableness: number | null;
      neuroticism: number | null;
    };
    moral_foundations: {
      care: number | null;
      fairness: number | null;
      loyalty: number | null;
      authority: number | null;
      sanctity: number | null;
      liberty: number | null;
    };
    world_values: {
      traditional_vs_secular: number | null;
      survival_vs_self_expression: number | null;
    };
    political_compass: {
      economic: number | null;
      authoritarian_libertarian: number | null;
    };
    behavioral_economics: {
      present_bias: number | null;
      loss_aversion: number | null;
      overconfidence: number | null;
      risk_sensitivity: number | null;
      scarcity_sensitivity: number | null;
    };
    extended_traits: {
      truth_orientation: number | null;
      moral_consistency: number | null;
      self_awareness: number | null;
      empathy: number | null;
      self_efficacy: number | null;
      manipulativeness: number | null;
      impulse_control: number | null;
      shadow_trait_activation: number | null;
      attention_pattern: string | null;
      cognitive_load_resilience: number | null;
      institutional_trust: number | null;
      conformity_tendency: number | null;
      conflict_avoidance: number | null;
      cognitive_flexibility: number | null;
      need_for_cognitive_closure: number | null;
    };
    dynamic_state: {
      current_stress_level: number | null;
      emotional_stability_context: string | null;
      motivation_orientation: string | null;
      trust_volatility: number | null;
    };
  };
  behavioral_modulation: {
    cognitive_load_pattern: string | null;
    attention_regulation: string | null;
    emotional_reactivity: string | null;
    stress_behavior: string | null;
    fatigue_pattern: string | null;
    physical_health_consideration: string | null;
    trust_behavior_under_strain: string | null;
    coping_mechanisms: string | null;
  };
  linguistic_profile: {
    default_output_length: string;
    speech_register: string;
    regional_influence: string | null;
    professional_or_educational_influence: string | null;
    cultural_speech_patterns: string | null;
    generational_or_peer_influence: string | null;
    speaking_style: {
      uses_neutral_fillers: boolean;
      sentence_revisions: boolean;
      topic_length_variability: boolean;
      contradiction_tolerance: boolean;
      trust_modulated_tone: boolean;
      mirroring_tendency: boolean;
    };
    sample_phrasing: string[];
  };
  preinterview_tags: string[];
  simulation_directives: {
    encourage_contradiction: boolean;
    emotional_asymmetry: boolean;
    stress_behavior_expected: boolean;
    inconsistency_is_valid: boolean;
    response_length_variability: boolean;
  };
}

export interface InterviewQuestion {
  question: string;
  response?: string;
}

export interface InterviewSection {
  section: string;
  notes: string;
  questions: (string | InterviewQuestion)[];
}

export interface RequestData {
  prompt: string;
  userId?: string;
}

export interface PersonaResponse {
  success: boolean;
  persona?: any;
  error?: string;
}
