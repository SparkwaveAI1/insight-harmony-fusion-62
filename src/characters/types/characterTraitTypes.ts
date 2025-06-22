
// Character trait types - replicated from persona trait architecture
export interface CharacterTraitProfile {
  // Big Five Personality Traits (5 traits)
  big_five: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  
  // Moral Foundations Theory (6 traits)
  moral_foundations: {
    care: number;
    fairness: number;
    loyalty: number;
    authority: number;
    sanctity: number;
    liberty: number;
  };
  
  // World Values Survey (3 traits)
  world_values: {
    traditional_vs_secular: number;
    survival_vs_self_expression: number;
    materialist_vs_postmaterialist: number;
  };
  
  // Political Compass with Behavioral Modeling (7+ traits)
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
  
  // Behavioral Economics Traits (5 traits)
  behavioral_economics: {
    present_bias: number;
    loss_aversion: number;
    overconfidence: number;
    risk_sensitivity: number;
    scarcity_sensitivity: number;
  };

  // Cultural Dimensions (6 traits)
  cultural_dimensions: {
    power_distance: number;
    individualism_vs_collectivism: number;
    masculinity_vs_femininity: number;
    uncertainty_avoidance: number;
    long_term_orientation: number;
    indulgence_vs_restraint: number;
  };

  // Social Identity and Group Dynamics (8 traits)
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
  
  // Extended Traits (18 traits)
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
    emotional_intensity: number;
    emotional_regulation: number;
    trigger_sensitivity: number;
  };
  
  // Dynamic State Modifiers (5 traits)
  dynamic_state: {
    current_stress_level: number;
    emotional_stability_context: number;
    motivation_orientation: number;
    trust_volatility: number;
    trigger_threshold: number;
  };
}

export interface CharacterEmotionalTriggers {
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

export interface CharacterMetadata {
  // Enhanced metadata version marker
  enhanced_metadata_version?: number;
  
  // Core Demographics
  age: string;
  gender: string;
  race_ethnicity?: string;
  sexual_orientation?: string;
  education_level: string;
  occupation: string;
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
  
  // Enhanced Health-Related Attributes
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
  
  // Knowledge Domains
  knowledge_domains?: {
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
  
  [key: string]: any;
}

export interface CharacterBehavioralModulation {
  cognitive_load_pattern?: string;
  attention_regulation?: string;
  emotional_reactivity?: string;
  stress_behavior?: string;
  fatigue_pattern?: string;
  physical_health_consideration?: string;
  trust_behavior_under_strain?: string;
  coping_mechanisms?: string;
}

export interface CharacterLinguisticProfile {
  default_output_length?: string;
  speech_register?: string;
  regional_influence?: string;
  professional_or_educational_influence?: string;
  cultural_speech_patterns?: string;
  generational_or_peer_influence?: string;
  speaking_style?: {
    uses_neutral_fillers?: boolean;
    sentence_revisions?: boolean;
    topic_length_variability?: boolean;
    contradiction_tolerance?: boolean;
    trust_modulated_tone?: boolean;
    mirroring_tendency?: boolean;
  };
  sample_phrasing?: string[];
}

export interface CharacterSimulationDirectives {
  encourage_contradiction?: boolean;
  emotional_asymmetry?: boolean;
  stress_behavior_expected?: boolean;
  inconsistency_is_valid?: boolean;
  response_length_variability?: boolean;
}

export interface CharacterInterviewSection {
  section_title: string;
  responses: {
    question: string;
    answer: string;
  }[];
}

export interface Character {
  id: string;
  character_id: string;
  name: string;
  character_type: string;
  creation_date: string;
  created_at: string;
  metadata: CharacterMetadata;
  trait_profile: CharacterTraitProfile;
  behavioral_modulation: CharacterBehavioralModulation;
  linguistic_profile: CharacterLinguisticProfile;
  emotional_triggers: CharacterEmotionalTriggers;
  preinterview_tags: string[];
  simulation_directives: CharacterSimulationDirectives;
  interview_sections: CharacterInterviewSection[];
  prompt?: string;
  user_id?: string;
  is_public?: boolean;
  profile_image_url?: string;
  enhanced_metadata_version?: number;
}

export interface DbCharacter {
  id: string;
  character_id: string;
  name: string;
  character_type: string;
  creation_date: string;
  created_at: string;
  metadata: any;
  trait_profile: any;
  behavioral_modulation: any;
  linguistic_profile: any;
  emotional_triggers: any;
  preinterview_tags: any;
  simulation_directives: any;
  interview_sections: any;
  prompt?: string;
  user_id?: string;
  is_public?: boolean;
  profile_image_url?: string;
  enhanced_metadata_version?: number;
}
