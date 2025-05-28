
import { PersonaTemplate } from "./types.ts";

// Define persona template structure
export const personaTemplate: PersonaTemplate = {
  persona_id: '',
  name: '',
  creation_date: '',
  metadata: {
    // Core Demographics
    age: null,
    gender: null,
    race_ethnicity: null,
    sexual_orientation: null,
    education_level: null,
    occupation: null,
    employment_type: null,
    income_level: null,
    social_class_identity: null,
    marital_status: null,
    parenting_role: null,
    relationship_history: null,
    military_service: null,
    
    // Location, Environment & Migration
    region: null,
    urban_rural_context: null,
    location_history: {
      grew_up_in: null,
      current_residence: null,
      places_lived: [],
    },
    migration_history: null,
    climate_risk_zone: null,
    
    // Cognitive, Psychological, and Cultural
    language_proficiency: [],
    religious_affiliation: null,
    religious_practice_level: null,
    cultural_background: null,
    cultural_affiliation: [],
    political_affiliation: null,
    political_sophistication: null,
    tech_familiarity: null,
    learning_modality: null,
    trust_in_institutions: null,
    trauma_exposure: null,
    
    // Financial and Time Resource Profile
    financial_pressure: null,
    credit_access: null,
    debt_load: null,
    time_abundance: null,
    
    // Digital Ecosystem & Signaling Behavior
    media_ecosystem: [],
    aesthetic_subculture: null,
    
    // Health-Related Attributes
    physical_health_status: null,
    mental_health_status: null,
    health_prioritization: null,
    healthcare_access: null,
    
    // Knowledge Domains - Added
    knowledge_domains: {
      finance_basics: null,
      crypto_blockchain: null,
      world_politics: null,
      national_politics: null,
      pop_culture: null,
      basic_technology: null,
      deep_technology: null,
      health_medicine: null,
      advanced_medical: null,
      science_concepts: null,
      sports: null,
      news_literacy: null,
      environmental_issues: null,
      cultural_history: null,
      law_legal: null,
      religion_spirituality: null,
      art_literature: null,
      gaming: null,
      food_cooking: null,
      travel_geography: null,
      parenting_childcare: null,
      home_improvement: null,
      business_entrepreneurship: null,
      psychology_social_science: null,
      economics: null,
    },
  },
  trait_profile: {
    // A. Big Five Personality Traits (OCEAN)
    big_five: {
      openness: null,
      conscientiousness: null,
      extraversion: null,
      agreeableness: null,
      neuroticism: null,
    },
    
    // B. Moral Foundations Theory
    moral_foundations: {
      care: null,
      fairness: null,
      loyalty: null,
      authority: null,
      sanctity: null,
      liberty: null,
    },
    
    // C. Enhanced World Values Survey
    world_values: {
      traditional_vs_secular: null,
      survival_vs_self_expression: null,
      materialist_vs_postmaterialist: null,
    },
    
    // D. Enhanced Political Compass with Behavioral Modeling
    political_compass: {
      economic: null,
      authoritarian_libertarian: null,
      cultural_conservative_progressive: null,
      political_salience: null,
      group_fusion_level: null,
      outgroup_threat_sensitivity: null,
      commons_orientation: null,
      political_motivations: {
        material_interest: null,
        moral_vision: null,
        cultural_preservation: null,
        status_reordering: null,
      },
    },
    
    // E. Behavioral Economics Traits
    behavioral_economics: {
      present_bias: null,
      loss_aversion: null,
      overconfidence: null,
      risk_sensitivity: null,
      scarcity_sensitivity: null,
    },
    
    // Extended Traits
    extended_traits: {
      truth_orientation: null,
      moral_consistency: null,
      self_awareness: null,
      empathy: null,
      self_efficacy: null,
      manipulativeness: null,
      impulse_control: null,
      shadow_trait_activation: null,
      attention_pattern: null,
      cognitive_load_resilience: null,
      institutional_trust: null,
      conformity_tendency: null,
      conflict_avoidance: null,
      cognitive_flexibility: null,
      need_for_cognitive_closure: null,
      // Enhanced emotional traits
      emotional_intensity: null,
      emotional_regulation: null,
      trigger_sensitivity: null,
    },
    
    // Dynamic State Modifiers
    dynamic_state: {
      current_stress_level: null,
      emotional_stability_context: null,
      motivation_orientation: null,
      trust_volatility: null,
      trigger_threshold: null,
    },
  },
  behavioral_modulation: {
    cognitive_load_pattern: null,
    attention_regulation: null,
    emotional_reactivity: null,
    stress_behavior: null,
    fatigue_pattern: null,
    physical_health_consideration: null,
    trust_behavior_under_strain: null,
    coping_mechanisms: null,
  },
  linguistic_profile: {
    default_output_length: "moderate",
    speech_register: "hybrid",
    regional_influence: null,
    professional_or_educational_influence: null,
    cultural_speech_patterns: null,
    generational_or_peer_influence: null,
    speaking_style: {
      uses_neutral_fillers: true,
      sentence_revisions: true,
      topic_length_variability: true,
      contradiction_tolerance: true,
      trust_modulated_tone: true,
      mirroring_tendency: true,
    },
    sample_phrasing: [],
  },
  emotional_triggers: {
    positive_triggers: [],
    negative_triggers: []
  },
  preinterview_tags: [],
  simulation_directives: {
    encourage_contradiction: true,
    emotional_asymmetry: true,
    stress_behavior_expected: true,
    inconsistency_is_valid: true,
    response_length_variability: true,
  },
};
