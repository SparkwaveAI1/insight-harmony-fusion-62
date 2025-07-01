
// Pure Character Lab types - completely independent from other modules
// NO emotional triggers, NO persona service imports

export interface CreativeCharacterBehavioralModulation {
  formality?: number;
  enthusiasm?: number;
  assertiveness?: number;
  empathy?: number;
  patience?: number;
}

export interface CreativeCharacterLinguisticProfile {
  default_output_length?: string;
  speech_register?: string;
  cultural_speech_patterns?: string;
}

// Character Lab's own trait architecture
export interface CreativeCharacterTraitProfile {
  // Core Identity
  entity_type?: string;
  narrative_domain?: string;
  functional_role?: string;
  description?: string;
  
  // Character Lab Core Drives (NOT emotional triggers)
  core_drives?: string[];
  surface_triggers?: string[];
  change_response_style?: string;
  
  // Physical characteristics
  physical_form?: string;
  environment?: string;
  communication_method?: string;
  
  // Creative details
  background_story?: string;
  unique_abilities?: string[];
  cultural_background?: string;
  
  // Creative entity-specific traits
  manifestation_type?: string;
  primary_form?: string;
  narrative_universe?: string;
  
  // Creative physical traits
  creative_manifestation?: {
    primary_appearance?: string;
    scale_reference?: string;
    material_nature?: string;
    dimensional_type?: string;
    visual_effects?: string;
    texture_description?: string;
    movement_style?: string;
    environmental_relationship?: string;
    presence_aura?: string;
    complexity_level?: string;
  };
  
  // Creative decision patterns
  decision_approach?: {
    conflict_style?: string;
    adaptability?: number;
    change_threshold?: number;
  };
  
  // Memory and growth
  experience_processing?: {
    type?: string;
    key_themes?: string[];
  };
  
  creative_evolution?: {
    adaptation_style?: string;
    growth_rate?: number;
    transformation_trigger?: number;
  };
  
  // Creative personality (not psychological models)
  creative_personality?: {
    imagination_level?: number;
    expressiveness?: number;
    social_comfort?: number;
    collaborative_nature?: number;
    emotional_depth?: number;
  };
  
  // Physical appearance for humanoid creatives
  physical_description?: {
    height_category?: string;
    build_type?: string;
    hair_description?: string;
    eye_description?: string;
    skin_description?: string;
    overall_appearance?: string;
  };
  
  // Fallback for any additional properties
  [key: string]: any;
}

// Pure Creative Character interface - NO emotional_triggers field
export interface CreativeCharacter {
  id?: string;
  character_id: string;
  name: string;
  character_type: 'fictional' | 'multi_species';
  creation_source: 'creative';
  creation_date: string;
  created_at: string;
  metadata: any;
  behavioral_modulation: CreativeCharacterBehavioralModulation;
  interview_sections: any;
  linguistic_profile: CreativeCharacterLinguisticProfile;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: CreativeCharacterTraitProfile;
  // NO emotional_triggers field - Character Lab doesn't use them
  prompt?: string;
  user_id?: string;
  is_public?: boolean;
  profile_image_url?: string;
  enhanced_metadata_version?: number;
  // Demographic fields (for humanoid characters)
  age?: number;
  gender?: string;
  historical_period?: string;
  social_class?: string;
  region?: string;
  physical_appearance?: any;
  // Non-humanoid specific fields
  origin_universe?: string;
  species_type?: string;
  form_factor?: string;
}

// Database representation for Creative Characters
export interface DbCreativeCharacter {
  id?: string;
  character_id: string;
  name: string;
  character_type: 'fictional' | 'multi_species';
  creation_source: 'creative';
  creation_date: string;
  created_at?: string;
  metadata: any;
  behavioral_modulation: CreativeCharacterBehavioralModulation;
  interview_sections: any;
  linguistic_profile: CreativeCharacterLinguisticProfile;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: CreativeCharacterTraitProfile;
  // NO emotional_triggers field
  prompt?: string;
  user_id?: string;
  is_public?: boolean;
  profile_image_url?: string;
  enhanced_metadata_version?: number;
  age?: number;
  gender?: string;
  historical_period?: string;
  social_class?: string;
  region?: string;
  physical_appearance?: any;
  origin_universe?: string;
  species_type?: string;
  form_factor?: string;
}

// Character Lab specific data interface
export interface CreativeCharacterData {
  name: string;
  entityType: string;
  narrativeDomain: string;
  functionalRole: string;
  description: string;
  environment: string;
  physicalForm: string;
  communication: string;
  coreDrives: string[];
  surfaceTriggers: string[];
  changeResponseStyle: string;
}
