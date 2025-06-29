// Character trait and type definitions
import { 
  TraitProfile,
  EmotionalTriggersProfile 
} from '../../services/persona/types/trait-profile';
import { 
  LinguisticProfile 
} from '../../services/persona/types/linguistic-profile';
import { 
  NonHumanoidTraitProfile 
} from './nonHumanoidTypes';

// Character-specific behavioral modulation (separate from persona behavioral modulation)
export interface CharacterBehavioralModulation {
  formality?: number;
  enthusiasm?: number;
  assertiveness?: number;
  empathy?: number;
  patience?: number;
}

// Extend the persona TraitProfile to include character-specific physical traits for humanoid characters
export interface HumanoidCharacterTraitProfile extends TraitProfile {
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
}

// Discriminated union for trait profiles based on character type
export type CharacterTraitProfile = 
  | { character_type: 'historical' | 'fictional'; profile: HumanoidCharacterTraitProfile }
  | { character_type: 'multi_species'; profile: NonHumanoidTraitProfile };

export interface Character {
  id?: string;
  character_id: string;
  name: string;
  character_type: 'historical' | 'fictional' | 'multi_species';
  creation_date: string;
  created_at: string;
  metadata: any;
  behavioral_modulation: CharacterBehavioralModulation;
  interview_sections: any;
  linguistic_profile: LinguisticProfile;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: HumanoidCharacterTraitProfile | NonHumanoidTraitProfile;
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
  creation_date: string;
  created_at?: string;
  metadata: any;
  behavioral_modulation: CharacterBehavioralModulation;
  interview_sections: any;
  linguistic_profile: LinguisticProfile;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: HumanoidCharacterTraitProfile | NonHumanoidTraitProfile;
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
