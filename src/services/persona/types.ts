
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
  
  // Legacy fields for backward compatibility
  relationship_status?: string;
  children_or_caregiver?: string;
  disabilities_or_conditions?: string;
  family_medical_history?: string;
  
  [key: string]: any;
}

export interface InterviewQuestion {
  question: string;
  response?: string;
}

export interface InterviewSection {
  section: string;
  notes: string;
  questions: (string | InterviewQuestion)[];
  responses?: string[];
}

export interface DbPersona {
  id: string;
  persona_id: string;
  name: string;
  creation_date: string;
  created_at: string;
  metadata: any;
  behavioral_modulation: any;
  interview_sections: any;
  linguistic_profile: any;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: any;
  prompt?: string;
  created_by?: string;
  is_public?: boolean;
}

export interface Persona {
  persona_id: string;
  id: string;
  name: string;
  creation_date: string;
  created_at: string;
  metadata: PersonaMetadata;
  behavioral_modulation: any;
  interview_sections: InterviewSection[] | { interview_sections: InterviewSection[] };
  linguistic_profile: any;
  persona_context: any;
  persona_type: string;
  trait_profile: any;
  preinterview_tags?: string[];
  simulation_directives?: any;
  prompt?: string;
  created_by?: string;
  is_public?: boolean;
  [key: string]: any;
}
