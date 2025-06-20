export interface PersonaMetadata {
  // Core Demographics
  age?: string;
  gender?: string;
  race_ethnicity?: string;
  sexual_orientation?: string;
  education_level?: string;
  occupation?: string;
  employment_type?: string;
  income_level?: string;
  social_class_identity?: string;
  marital_status?: string;
  parenting_role?: string;
  relationship_history?: string;
  military_service?: string;
  
  // Location, Environment & Migration
  region?: string;
  urban_rural_context?: string;
  location_history?: {
    grew_up_in?: string;
    current_residence?: string;
    places_lived?: string[];
  };
  migration_history?: string;
  climate_risk_zone?: string;
  
  // Relationships & Family Dynamics
  relationships_family?: {
    has_children?: boolean;
    number_of_children?: number;
    children_ages?: number[];
    stepchildren?: boolean;
    custody_arrangement?: string;
    living_situation?: string;
    household_composition?: string[];
    primary_caregiver_responsibilities?: string;
    eldercare_responsibilities?: string;
    partner_spouse_relationship?: string;
    partner_health_status?: string;
    children_health_issues?: string;
    family_relationship_quality?: string;
    family_stressors?: string[];
    support_system_strength?: string;
    extended_family_involvement?: string;
    relationship_priorities?: string;
    co_parenting_dynamics?: string;
    family_financial_responsibilities?: string;
    family_medical_history_impact?: string;
  };
  
  // Cognitive, Psychological, and Cultural
  language_proficiency?: string[];
  religious_affiliation?: string;
  religious_practice_level?: string;
  cultural_background?: string;
  cultural_affiliation?: string[];
  political_affiliation?: string;
  political_sophistication?: string;
  tech_familiarity?: string;
  learning_modality?: string;
  trust_in_institutions?: string;
  trauma_exposure?: string;
  
  // Financial and Time Resource Profile
  financial_pressure?: string;
  credit_access?: string;
  debt_load?: string;
  time_abundance?: string;
  
  // Digital Ecosystem & Signaling Behavior
  media_ecosystem?: string[];
  aesthetic_subculture?: string;
  
  // Health-Related Attributes - Enhanced
  physical_health_status?: string;
  mental_health_status?: string;
  health_prioritization?: string;
  healthcare_access?: string;
  chronic_conditions?: string[];
  medications?: string[];
  mental_health_history?: string;
  therapy_counseling_experience?: string;
  health_insurance_status?: string;
  fitness_activity_level?: string;
  dietary_restrictions?: string[];
  sleep_patterns?: string;
  stress_management?: string;
  substance_use?: string;
  health_family_history?: string;
  disability_accommodations?: string;
  
  // Physical Description
  height?: string;
  build_body_type?: string;
  hair_color?: string;
  hair_style?: string;
  eye_color?: string;
  skin_tone?: string;
  distinctive_features?: string[];
  style_fashion_sense?: string;
  grooming_habits?: string;
  physical_mannerisms?: string[];
  posture_bearing?: string;
  voice_speech_patterns?: string;
  
  // Knowledge Domains - Expanded
  knowledge_domains?: {
    // 1-5 ratings for each domain (1=minimal, 5=expert)
    finance_basics?: number;
    crypto_blockchain?: number;
    world_politics?: number;
    national_politics?: number;
    pop_culture?: number;
    basic_technology?: number;
    deep_technology?: number;
    health_medicine?: number;
    advanced_medical?: number;
    science_concepts?: number;
    sports?: number;
    news_literacy?: number;
    environmental_issues?: number;
    cultural_history?: number;
    law_legal?: number;
    religion_spirituality?: number;
    art_literature?: number;
    gaming?: number;
    food_cooking?: number;
    travel_geography?: number;
    parenting_childcare?: number;
    home_improvement?: number;
    business_entrepreneurship?: number;
    psychology_social_science?: number;
    economics?: number;
  };
  
  // Legacy fields for backward compatibility
  relationship_status?: string;
  children_or_caregiver?: string;
  disabilities_or_conditions?: string;
  family_medical_history?: string;
  
  [key: string]: any;
}

export interface TraitProfile {
  // A. Big Five Personality Traits (OCEAN)
  big_five: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  
  // B. Moral Foundations Theory
  moral_foundations: {
    care: number;
    fairness: number;
    loyalty: number;
    authority: number;
    sanctity: number;
    liberty: number;
  };
  
  // C. Enhanced World Values Survey
  world_values: {
    traditional_vs_secular: number;
    survival_vs_self_expression: number;
    materialist_vs_postmaterialist: number;
  };
  
  // D. Enhanced Political Compass with Behavioral Modeling
  political_compass: {
    economic: number;
    authoritarian_libertarian: number;
    cultural_conservative_progressive: number;
    political_salience: number;
    group_fusion_level: number;
    outgroup_threat_sensitivity: number;
    commons_orientation: number;
    political_motivations: {
      material_interest: number;
      moral_vision: number;
      cultural_preservation: number;
      status_reordering: number;
    };
  };
  
  // E. Behavioral Economics Traits
  behavioral_economics: {
    present_bias: number;
    loss_aversion: number;
    overconfidence: number;
    risk_sensitivity: number;
    scarcity_sensitivity: number;
  };

  // F. Cultural Dimensions (Hofstede's Framework)
  cultural_dimensions: {
    power_distance: number;
    individualism_vs_collectivism: number;
    masculinity_vs_femininity: number;
    uncertainty_avoidance: number;
    long_term_orientation: number;
    indulgence_vs_restraint: number;
  };

  // G. Social Identity and Group Dynamics
  social_identity: {
    identity_strength: number;
    identity_complexity: number;
    ingroup_bias_tendency: number;
    outgroup_bias_tendency: number;
    social_dominance_orientation: number;
    system_justification: number;
    intergroup_contact_comfort: number;
    cultural_intelligence: number;
  };
  
  // Extended Traits
  extended_traits: {
    truth_orientation: number;
    moral_consistency: number;
    self_awareness: number;
    empathy: number;
    self_efficacy: number;
    manipulativeness: number;
    impulse_control: number;
    shadow_trait_activation: number;
    attention_pattern: number;
    cognitive_load_resilience: number;
    institutional_trust: number;
    conformity_tendency: number;
    conflict_avoidance: number;
    cognitive_flexibility: number;
    need_for_cognitive_closure: number;
    // Enhanced emotional traits
    emotional_intensity: number;
    emotional_regulation: number;
    trigger_sensitivity: number;
  };
  
  // Dynamic State Modifiers
  dynamic_state: {
    current_stress_level: number;
    emotional_stability_context: number;
    motivation_orientation: number;
    trust_volatility: number;
    trigger_threshold: number;
  };
}

export interface BehavioralModulation {
  communication_style: {
    formality_level: number;
    emotional_expressiveness: number;
    directness: number;
    humor_usage: number;
  };
  response_patterns: {
    elaboration_tendency: number;
    example_usage: number;
    personal_anecdote_frequency: number;
    technical_depth_preference: number;
  };
  contextual_adaptability: {
    topic_sensitivity: number;
    audience_awareness: number;
    emotional_responsiveness: number;
  };
}

export interface LinguisticProfile {
  vocabulary_complexity: number;
  sentence_structure_preference: number;
  cultural_linguistic_markers: string[];
  communication_pace: number;
  filler_word_usage: number;
  interruption_tendency: number;
  question_asking_frequency: number;
  storytelling_inclination: number;
}

export interface EmotionalTriggers {
  positive_triggers: Array<{
    keywords: string[];
    emotion_type: string;
    intensity_multiplier: number;
    description: string;
  }>;
  negative_triggers: Array<{
    keywords: string[];
    emotion_type: string;
    intensity_multiplier: number;
    description: string;
  }>;
}

export interface SimulationDirectives {
  authenticity_level: number;
  consistency_enforcement: number;
  emotional_range_limit: number;
  response_variability: number;
  knowledge_boundary_respect: number;
  personality_drift_prevention: number;
}

export interface InterviewSection {
  section_title: string;
  responses: {
    question: string;
    answer: string;
  }[];
}

// Updated PersonaTemplate to match database constraints
export interface PersonaTemplate {
  persona_id: string;
  name: string;
  creation_date: string;
  metadata: PersonaMetadata;
  trait_profile: TraitProfile;
  behavioral_modulation: BehavioralModulation;
  linguistic_profile: LinguisticProfile;
  emotional_triggers: EmotionalTriggers;
  preinterview_tags: string[];
  simulation_directives: SimulationDirectives;
  interview_sections: InterviewSection[];
  prompt?: string;
  user_id?: string;
  enhanced_metadata_version?: number;
}

export interface RequestData {
  prompt: string;
  userId?: string;
}

export interface PersonaResponse {
  success: boolean;
  persona?: PersonaTemplate;
  error?: string;
}
