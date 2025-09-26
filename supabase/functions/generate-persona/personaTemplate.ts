import { PersonaTemplate } from "./types.ts";

// Define persona template structure
export const personaTemplate: PersonaTemplate = {
  persona_id: '',
  name: '',
  creation_date: '',
  metadata: {
    // Enhanced metadata version marker
    enhanced_metadata_version: 2,
    
    // Core Demographics
    age: "",
    gender: "",
    race_ethnicity: undefined,
    sexual_orientation: undefined,
    education_level: "",
    occupation: "",
    employment_type: "",
    income_level: "",
    social_class_identity: undefined,
    marital_status: "",
    parenting_role: undefined,
    relationship_history: undefined,
    military_service: undefined,
    
    // Location, Environment & Migration
    region: "",
    urban_rural_context: "",
    location_history: {
      grew_up_in: "",
      current_residence: "",
      places_lived: [],
    },
    migration_history: undefined,
    climate_risk_zone: undefined,
    
    // Relationships & Family Dynamics
    relationships_family: {
      has_children: false,
      number_of_children: 0,
      children_ages: [],
      stepchildren: undefined,
      custody_arrangement: undefined,
      living_situation: "",
      household_composition: [],
      primary_caregiver_responsibilities: undefined,
      eldercare_responsibilities: undefined,
      partner_spouse_relationship: undefined,
      partner_health_status: undefined,
      children_health_issues: undefined,
      family_relationship_quality: "",
      family_stressors: [],
      support_system_strength: "",
      extended_family_involvement: "",
      relationship_priorities: "",
      co_parenting_dynamics: "",
      family_financial_responsibilities: "",
      family_medical_history_impact: undefined,
    },
    
    // Cognitive, Psychological, and Cultural
    language_proficiency: [],
    religious_affiliation: undefined,
    religious_practice_level: undefined,
    cultural_background: undefined,
    cultural_affiliation: [],
    political_affiliation: "",
    political_sophistication: "",
    tech_familiarity: "",
    learning_modality: "",
    trust_in_institutions: "",
    trauma_exposure: "",
    
    // Financial and Time Resource Profile
    financial_pressure: "",
    credit_access: "",
    debt_load: "",
    time_abundance: "",
    
    // Digital Ecosystem & Signaling Behavior
    media_ecosystem: [],
    aesthetic_subculture: "",
    
    // Enhanced Health-Related Attributes
    physical_health_status: "",
    mental_health_status: "",
    health_prioritization: "",
    healthcare_access: "",
    chronic_conditions: [],
    medications: [],
    mental_health_history: undefined,
    therapy_counseling_experience: undefined,
    health_insurance_status: undefined,
    fitness_activity_level: "",
    dietary_restrictions: [],
    sleep_patterns: undefined,
    stress_management: undefined,
    substance_use: undefined,
    health_family_history: undefined,
    disability_accommodations: undefined,
    
    // Physical Description
    height: "",
    build_body_type: "",
    hair_color: "",
    hair_style: "",
    eye_color: "",
    skin_tone: "",
    distinctive_features: [],
    style_fashion_sense: "",
    grooming_habits: "",
    physical_mannerisms: [],
    posture_bearing: "",
    voice_speech_patterns: "",
    
    // Knowledge Domains - Added
    knowledge_domains: {
      finance_basics: 0,
      crypto_blockchain: 0,
      world_politics: 0,
      national_politics: 0,
      pop_culture: 0,
      basic_technology: 0,
      deep_technology: 0,
      health_medicine: 0,
      advanced_medical: 0,
      science_concepts: 0,
      sports: 0,
      news_literacy: 0,
      environmental_issues: 0,
      cultural_history: 0,
      law_legal: 0,
      religion_spirituality: 0,
      art_literature: 0,
      gaming: 0,
      food_cooking: 0,
      travel_geography: 0,
      parenting_childcare: 0,
      home_improvement: 0,
      business_entrepreneurship: 0,
      psychology_social_science: 0,
      economics: 0,
    },
  },
  trait_profile: {
    // A. Big Five Personality Traits (OCEAN)
    big_five: {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0,
    },
    
    // B. Moral Foundations Theory
    moral_foundations: {
      care: 0,
      fairness: 0,
      loyalty: 0,
      authority: 0,
      sanctity: 0,
      liberty: 0,
    },
    
    // C. Enhanced World Values Survey
    world_values: {
      traditional_vs_secular: 0,
      survival_vs_self_expression: 0,
      materialist_vs_postmaterialist: 0,
    },
    
    // D. Enhanced Political Compass with Behavioral Modeling
    political_compass: {
      economic: 0,
      authoritarian_libertarian: 0,
      cultural_conservative_progressive: 0,
      political_salience: 0,
      group_fusion_level: 0,
      outgroup_threat_sensitivity: 0,
      commons_orientation: 0,
      political_motivations: {
        material_interest: 0,
        moral_vision: 0,
        cultural_preservation: 0,
        status_reordering: 0,
      },
    },
    
    // E. Behavioral Economics Traits
    behavioral_economics: {
      present_bias: 0,
      loss_aversion: 0,
      overconfidence: 0,
      risk_sensitivity: 0,
      scarcity_sensitivity: 0,
    },

    // F. Cultural Dimensions (Hofstede's Framework)
    cultural_dimensions: {
      power_distance: 0,
      individualism_vs_collectivism: 0,
      masculinity_vs_femininity: 0,
      uncertainty_avoidance: 0,
      long_term_orientation: 0,
      indulgence_vs_restraint: 0,
    },

    // G. Social Identity and Group Dynamics
    social_identity: {
      identity_strength: 0,
      identity_complexity: 0,
      ingroup_bias_tendency: 0,
      outgroup_bias_tendency: 0,
      social_dominance_orientation: 0,
      system_justification: 0,
      intergroup_contact_comfort: 0,
      cultural_intelligence: 0,
    },
    
    // Extended Traits
    extended_traits: {
      truth_orientation: 0,
      moral_consistency: 0,
      self_awareness: 0,
      empathy: 0,
      self_efficacy: 0,
      manipulativeness: 0,
      impulse_control: 0,
      shadow_trait_activation: 0,
      attention_pattern: 0,
      cognitive_load_resilience: 0,
      institutional_trust: 0,
      conformity_tendency: 0,
      conflict_avoidance: 0,
      cognitive_flexibility: 0,
      need_for_cognitive_closure: 0,
      // Enhanced emotional traits
      emotional_intensity: 0,
      emotional_regulation: 0,
      trigger_sensitivity: 0,
    },
    
    // Dynamic State Modifiers
    dynamic_state: {
      current_stress_level: 0,
      emotional_stability_context: 0,
      motivation_orientation: 0,
      trust_volatility: 0,
      trigger_threshold: 0,
    },
  },
  behavioral_modulation: {
    communication_style: {
      formality_level: 0,
      emotional_expressiveness: 0,
      directness: 0,
      humor_usage: 0
    },
    response_patterns: {
      elaboration_tendency: 0,
      example_usage: 0,
      personal_anecdote_frequency: 0,
      technical_depth_preference: 0
    },
    contextual_adaptability: {
      topic_sensitivity: 0,
      audience_awareness: 0,
      emotional_responsiveness: 0
    }
  },
  linguistic_profile: {
    vocabulary_complexity: 0,
    sentence_structure_preference: 0,
    cultural_linguistic_markers: [],
    communication_pace: 0,
    humor_integration: 0
  },
  emotional_triggers: {
    positive_triggers: [],
    negative_triggers: []
  },
  preinterview_tags: [],
  simulation_directives: {
    authenticity_level: 0,
    consistency_enforcement: 0,
    emotional_range_limit: 0,
    response_variability: 0,
    knowledge_boundary_respect: 0,
    personality_drift_prevention: 0
  },
  interview_sections: []
};