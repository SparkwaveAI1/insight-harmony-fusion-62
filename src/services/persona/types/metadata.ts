
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
  
  // Health-Related Attributes
  physical_health_status?: string;
  mental_health_status?: string;
  health_prioritization?: string;
  healthcare_access?: string;
  
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
    // New knowledge domains can be added here
  };
  
  // Legacy fields for backward compatibility
  relationship_status?: string;
  children_or_caregiver?: string;
  disabilities_or_conditions?: string;
  family_medical_history?: string;
  
  [key: string]: any;
}
