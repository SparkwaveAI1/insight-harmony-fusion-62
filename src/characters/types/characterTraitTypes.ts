
// Character trait and type definitions
import { 
  TraitProfile,
  EmotionalTriggersProfile 
} from '../../services/persona/types/trait-profile';
import { 
  LinguisticProfile 
} from '../../services/persona/types/linguistic-profile';

// Character-specific behavioral modulation (separate from persona behavioral modulation)
export interface CharacterBehavioralModulation {
  formality?: number;
  enthusiasm?: number;
  assertiveness?: number;
  empathy?: number;
  patience?: number;
}

// Unified flexible trait profile that can accommodate all character types
export interface UnifiedCharacterTraitProfile {
  // Core identity
  entity_type?: string;
  narrative_domain?: string;
  functional_role?: string;
  description?: string;
  
  // Creative character traits
  personality_summary?: string;
  core_drives?: string[];
  surface_triggers?: string[];
  change_response_style?: string;
  
  // Physical characteristics
  physical_form?: string;
  environment?: string;
  communication_method?: string;
  
  // Enhanced creative details
  background_story?: string;
  unique_abilities?: string[];
  cultural_background?: string;
  
  // Creative entity-specific traits (for non-standard entities)
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

// Use the unified trait profile as the main type
export type CharacterTraitProfile = UnifiedCharacterTraitProfile;

// Creative Character Dialog Data Interface
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

export interface Character {
  id?: string;
  character_id: string;
  name: string;
  character_type: 'historical' | 'fictional' | 'multi_species';
  creation_source: 'historical' | 'creative'; // New field for unified architecture
  creation_date: string;
  created_at: string;
  metadata: any;
  behavioral_modulation: CharacterBehavioralModulation;
  interview_sections: any;
  linguistic_profile: LinguisticProfile;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: CharacterTraitProfile;
  emotional_triggers?: EmotionalTriggersProfile;
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

// Database representation of a character (matches Supabase schema)
export interface DbCharacter {
  id?: string;
  character_id: string;
  name: string;
  character_type: 'historical' | 'fictional' | 'multi_species';
  creation_source?: 'historical' | 'creative'; // Optional for backwards compatibility
  creation_date: string;
  created_at?: string;
  metadata: any;
  behavioral_modulation: CharacterBehavioralModulation;
  interview_sections: any;
  linguistic_profile: LinguisticProfile;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: CharacterTraitProfile;
  emotional_triggers?: EmotionalTriggersProfile;
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

export interface CharacterFilters {
  search?: string;
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'character';
  content: string;
  timestamp: Date;
}

export interface CharacterChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}
