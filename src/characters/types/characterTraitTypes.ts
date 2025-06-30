
// Character trait and type definitions - completely separate from persona system
import { CharacterLinguisticProfile, CharacterEmotionalSystem, CharacterBehavioralModulation } from './characterLinguisticTypes';
import { NonHumanoidTraitProfile } from './nonHumanoidTypes';

// Character-specific trait profile for humanoid characters
export interface HumanoidCharacterTraitProfile {
  // Basic demographics
  age?: number;
  gender?: string;
  social_class?: string;
  occupation?: string;
  education_level?: string;
  
  // Physical traits
  physical_appearance?: {
    height?: string;
    build_body_type?: string;
    hair_color?: string;
    hair_style?: string;
    eye_color?: string;
    skin_tone?: string;
    [key: string]: any;
  };
  
  physical_health?: {
    disabilities?: string[];
    health_conditions?: string[];
    mobility?: string;
    [key: string]: any;
  };
  
  // Character-specific personality traits
  personality_traits?: string[];
  character_background?: string;
  motivations?: string[];
  fears?: string[];
  goals?: string[];
  
  [key: string]: any; // Add index signature for JSON compatibility
}

// Union type for trait profiles
export type CharacterTraitProfile = HumanoidCharacterTraitProfile | NonHumanoidTraitProfile;

// Creative Character Dialog Data Interface
export interface CreativeCharacterData {
  name: string;
  entityType: string;
  narrativeDomain: string;
  functionalRole: string;
  description: string;
  environment: string;
  physicalForm: string;
  physicalAppearanceDescription: string;
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
  creation_date: string;
  created_at: string;
  appearance_prompt?: string;
  metadata: any;
  behavioral_modulation: CharacterBehavioralModulation;
  interview_sections: any;
  linguistic_profile: CharacterLinguisticProfile;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: CharacterTraitProfile;
  emotional_system?: CharacterEmotionalSystem; // Character-specific emotional system
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
  creation_date: string;
  created_at?: string;
  appearance_prompt?: string;
  metadata: any;
  behavioral_modulation: CharacterBehavioralModulation;
  interview_sections: any;
  linguistic_profile: CharacterLinguisticProfile;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: CharacterTraitProfile;
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
