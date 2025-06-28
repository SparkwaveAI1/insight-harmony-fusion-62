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

// Extend the persona TraitProfile to include character-specific physical traits
export interface CharacterTraitProfile extends TraitProfile {
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

export interface Character {
  id?: string;
  character_id: string;
  name: string;
  character_type: string;
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
  // New demographic fields
  age?: number;
  gender?: string;
  historical_period?: string;
  social_class?: string;
  region?: string;
  physical_appearance?: any;
}

// Database representation of a character (matches Supabase schema)
export interface DbCharacter {
  id?: string;
  character_id: string;
  name: string;
  character_type: string;
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
  // New demographic fields
  age?: number;
  gender?: string;
  historical_period?: string;
  social_class?: string;
  region?: string;
  physical_appearance?: any;
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
