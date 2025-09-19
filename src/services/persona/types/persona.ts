
import { PersonaMetadata } from './metadata';
import { TraitProfile } from './trait-profile';
import { LinguisticProfile, SimulationDirectives } from './linguistic-profile';
import { InterviewSection } from './interview';

export interface Persona {
  persona_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_public: boolean;
  profile_image_url?: string;
  prompt?: string;
  version?: string;
  
  // V4 persona data structure (stored in JSONB)
  conversation_summary?: {
    demographics?: {
      age?: number | string;
      location?: string;
      occupation?: string;
      name?: string;
      background_description?: string;
    };
    [key: string]: any;
  };
  
  // V3 persona data structure (stored in JSONB) - legacy
  persona_data?: any;
  
  // Legacy support - these will be computed from persona_data or used directly
  metadata?: PersonaMetadata;
  trait_profile?: TraitProfile;
  behavioral_modulation?: any;
  linguistic_profile?: LinguisticProfile;
  interview_sections?: InterviewSection[];
  emotional_triggers?: any;
  preinterview_tags?: string[];
  simulation_directives?: SimulationDirectives;
  persona_context?: any;
  persona_type?: string;
  creation_date?: string;
  enhanced_metadata_version?: number;
  
  // V4 fields for detection (preserved during conversion)
  schema_version?: string;
  full_profile?: any;
  
  // V4 completion tracking fields
  creation_completed?: boolean;
  creation_stage?: string;
}
