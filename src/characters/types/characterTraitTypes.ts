// Character trait and type definitions
import { TraitProfile } from '../../services/persona/types/trait-profile';

// Re-export the persona TraitProfile as CharacterTraitProfile for consistency
export type CharacterTraitProfile = TraitProfile;

export interface Character {
  id?: string;
  character_id: string;
  name: string;
  character_type: string;
  creation_date: string;
  created_at: string;
  metadata: any;
  behavioral_modulation: any;
  interview_sections: any;
  linguistic_profile: any;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: any;
  emotional_triggers?: any;
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
  behavioral_modulation: any;
  interview_sections: any;
  linguistic_profile: any;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: any;
  emotional_triggers?: any;
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

// Trait definitions remain the same
export interface TraitProfile {
  conscientiousness: number;
  openness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface BehavioralModulation {
  formality: number;
  enthusiasm: number;
  assertiveness: number;
  empathy: number;
  patience: number;
}

export interface LinguisticProfile {
  vocabulary_complexity: number;
  sentence_structure: number;
  use_of_metaphors: number;
  emotional_expressiveness: number;
  technical_language: number;
}

export interface EmotionalTriggers {
  positive_triggers: string[];
  negative_triggers: string[];
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
