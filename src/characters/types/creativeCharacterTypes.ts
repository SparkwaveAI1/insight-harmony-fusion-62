// Pure Character Lab types - completely independent from other modules
// NO emotional triggers for non-humanoid entities, enhanced entity classification

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

// Character Lab trait architecture components - matching your specification
export interface CoreMotive {
  name: string;
  intensity: number;
  narrative_description: string;
  failure_response: string;
  evolution_path: string;
}

export interface LatentValue {
  name: string;
  intensity: number;
  narrative_description: string;
  failure_response: string;
  evolution_path: string;
}

export interface SymbolicTrait {
  name: string;
  type: string;
  narrative_description: string;
  activation_context: string;
  behavioral_effect: string;
  evolution_path: string;
}

export interface CognitiveFilter {
  name: string;
  type: string;
  narrative_description: string;
  activation_context: string;
  behavioral_effect: string;
  evolution_path: string;
}

// Enhanced communication method structure - matching your specification
export interface CommunicationMethodStructure {
  modality: string;
  grammar: string;
  expression_register: string;
}

// Enhanced physical appearance structure - matching your specification exactly
export interface PhysicalAppearanceStructure {
  structure: string;
  material: string;
  movement_style: string;
  emissions: string[];
  visual_effects: string[];
  sensory_effects: string[];
  size_estimate: {
    length_meters: number;
    diameter_meters: number;
  };
  narrative_description: string;
}

// Character Lab's trait architecture - matching your specification
export interface CreativeCharacterTraitProfile {
  // Core Identity
  entity_type?: string;
  narrative_domain?: string;
  functional_role?: string;
  description?: string;
  
  // New Character Lab trait architecture - matching your specification exactly
  core_motives?: CoreMotive[];
  latent_values?: LatentValue[];
  symbolic_traits?: SymbolicTrait[];
  cognitive_filters?: CognitiveFilter[];
  
  // Character Lab behavioral triggers (cleaned up)
  surface_triggers?: string[];
  change_response_style?: string;
  
  // Physical characteristics
  physical_form?: string;
  environment?: string;
  communication_method?: CommunicationMethodStructure;
  
  // Creative details
  background_story?: string;
  unique_abilities?: string[];
  cultural_background?: string;
  
  // Creative entity-specific traits
  manifestation_type?: string;
  primary_form?: string;
  narrative_universe?: string;
  
  // Enhanced physical appearance structure - matching your specification
  physical_appearance?: PhysicalAppearanceStructure;
  
  // ... keep existing code (other legacy fields for backward compatibility)
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
  
  decision_approach?: {
    conflict_style?: string;
    adaptability?: number;
    change_threshold?: number;
  };
  
  experience_processing?: {
    type?: string;
    key_themes?: string[];
  };
  
  creative_evolution?: {
    adaptation_style?: string;
    growth_rate?: number;
    transformation_trigger?: number;
  };
  
  creative_personality?: {
    imagination_level?: number;
    expressiveness?: number;
    social_comfort?: number;
    collaborative_nature?: number;
    emotional_depth?: number;
  };
  
  physical_description?: {
    height_category?: string;
    build_type?: string;
    hair_description?: string;
    eye_description?: string;
    skin_description?: string;
    overall_appearance?: string;
  };
  
  [key: string]: any;
}

// Pure Creative Character interface - NO emotional_triggers for Character Lab
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
  // Character Lab uses the new trait architecture, not legacy emotional_triggers
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
  // Conditional emotional_triggers
  emotional_triggers?: {
    positive_triggers: string[];
    negative_triggers: string[];
  };
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
  // REMOVED: coreDrives - was causing confusion
  surfaceTriggers: string[];
  changeResponseStyle: string;
}
