
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
    openness: number | null;
    conscientiousness: number | null;
    extraversion: number | null;
    agreeableness: number | null;
    neuroticism: number | null;
  };
  
  // B. Moral Foundations Theory
  moral_foundations: {
    care: number | null;
    fairness: number | null;
    loyalty: number | null;
    authority: number | null;
    sanctity: number | null;
    liberty: number | null;
  };
  
  // C. Enhanced World Values Survey
  world_values: {
    traditional_vs_secular: number | null;
    survival_vs_self_expression: number | null;
    materialist_vs_postmaterialist: number | null;
  };
  
  // D. Enhanced Political Compass with Behavioral Modeling
  political_compass: {
    economic: number | null;
    authoritarian_libertarian: number | null;
    cultural_conservative_progressive: number | null;
    political_salience: number | null;
    group_fusion_level: number | null;
    outgroup_threat_sensitivity: number | null;
    commons_orientation: number | null;
    political_motivations: {
      material_interest: number | null;
      moral_vision: number | null;
      cultural_preservation: number | null;
      status_reordering: number | null;
    };
  };
  
  // E. Behavioral Economics Traits
  behavioral_economics: {
    present_bias: number | null;
    loss_aversion: number | null;
    overconfidence: number | null;
    risk_sensitivity: number | null;
    scarcity_sensitivity: number | null;
  };

  // F. Cultural Dimensions (Hofstede's Framework)
  cultural_dimensions: {
    power_distance: number | null;
    individualism_vs_collectivism: number | null;
    masculinity_vs_femininity: number | null;
    uncertainty_avoidance: number | null;
    long_term_orientation: number | null;
    indulgence_vs_restraint: number | null;
  };

  // G. Social Identity and Group Dynamics
  social_identity: {
    identity_strength: number | null;
    identity_complexity: number | null;
    ingroup_bias_tendency: number | null;
    outgroup_bias_tendency: number | null;
    social_dominance_orientation: number | null;
    system_justification: number | null;
    intergroup_contact_comfort: number | null;
    cultural_intelligence: number | null;
  };
  
  // Extended Traits
  extended_traits: {
    truth_orientation: number | null;
    moral_consistency: number | null;
    self_awareness: number | null;
    empathy: number | null;
    self_efficacy: number | null;
    manipulativeness: number | null;
    impulse_control: number | null;
    shadow_trait_activation: number | null;
    attention_pattern: number | null;
    cognitive_load_resilience: number | null;
    institutional_trust: number | null;
    conformity_tendency: number | null;
    conflict_avoidance: number | null;
    cognitive_flexibility: number | null;
    need_for_cognitive_closure: number | null;
    // Enhanced emotional traits
    emotional_intensity: number | null;
    emotional_regulation: number | null;
    trigger_sensitivity: number | null;
  };
  
  // Dynamic State Modifiers
  dynamic_state: {
    current_stress_level: number | null;
    emotional_stability_context: number | null;
    motivation_orientation: number | null;
    trust_volatility: number | null;
    trigger_threshold: number | null;
  };
}

export interface InterviewSection {
  section_title: string;
  questions: {
    question: string;
    response: string;
  }[];
}

export interface PersonaTemplate {
  persona_id: string;
  name: string;
  creation_date: string;
  metadata: PersonaMetadata;
  trait_profile: TraitProfile;
  behavioral_modulation: any;
  linguistic_profile: any;
  emotional_triggers: {
    positive_triggers: string[];
    negative_triggers: string[];
  };
  preinterview_tags: string[];
  simulation_directives: any;
  interview_sections: InterviewSection[];
  prompt?: string;
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
