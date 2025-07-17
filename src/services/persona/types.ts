
export interface Persona {
  id: string;
  persona_id: string;
  user_id: string | null;
  name: string;
  description?: string;
  prompt?: string;
  is_public?: boolean;
  created_at?: string;
  creation_date: string;
  profile_image_url?: string;
  image_url?: string; // Add this for backward compatibility
  trait_profile: TraitProfile;
  metadata: PersonaMetadata;
  interview_sections: any[];
  preinterview_tags: string[];
  behavioral_modulation: any;
  simulation_directives: any;
  linguistic_profile: any;
  emotional_triggers?: EmotionalTriggersProfile;
  enhanced_metadata_version?: number;
}

export interface TraitProfile {
  big_five?: {
    openness?: number;
    conscientiousness?: number;
    extraversion?: number;
    agreeableness?: number;
    neuroticism?: number;
  };
  moral_foundations?: {
    care?: number;
    fairness?: number;
    loyalty?: number;
    authority?: number;
    sanctity?: number;
    liberty?: number;
  };
  world_values?: any;
  behavioral_economics?: any;
}

export interface PersonaMetadata {
  age?: string;
  gender?: string;
  occupation?: string;
  education_level?: string;
  income_level?: string;
  region?: string;
  race_ethnicity?: string;
  location_history?: {
    current_residence?: string;
    previous_locations?: string[];
  };
  demographics?: {
    age_range?: string;
    region?: string;
    income_level?: string;
  };
  tags?: string[];
  source_type?: string;
}

export interface EmotionalTriggersProfile {
  positive_triggers?: string[];
  negative_triggers?: string[];
}

export interface DbPersona {
  id: string;
  persona_id: string;
  user_id: string | null;
  name: string;
  description?: string;
  prompt?: string;
  is_public?: boolean;
  created_at?: string;
  creation_date: string;
  profile_image_url?: string;
  trait_profile: any;
  metadata: any;
  interview_sections: any;
  preinterview_tags: any;
  behavioral_modulation: any;
  simulation_directives: any;
  linguistic_profile: any;
  emotional_triggers?: any;
  enhanced_metadata_version?: number;
}

export interface PersonaCreateData {
  name: string;
  description?: string;
  prompt?: string;
  is_public?: boolean;
  trait_profile: TraitProfile;
  metadata: PersonaMetadata;
  interview_sections: any[];
  preinterview_tags: string[];
  behavioral_modulation: any;
  simulation_directives: any;
  linguistic_profile: any;
  emotional_triggers?: EmotionalTriggersProfile;
}

export interface PersonaUpdateData {
  name?: string;
  description?: string;
  prompt?: string;
  is_public?: boolean;
  trait_profile?: TraitProfile;
  metadata?: PersonaMetadata;
  interview_sections?: any[];
  preinterview_tags?: string[];
  behavioral_modulation?: any;
  simulation_directives?: any;
  linguistic_profile?: any;
  emotional_triggers?: EmotionalTriggersProfile;
}
