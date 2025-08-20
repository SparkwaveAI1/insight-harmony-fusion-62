
import { PersonaMetadata } from './metadata';
import { TraitProfile } from './trait-profile';
import { LinguisticProfile, SimulationDirectives } from './linguistic-profile';
import { InterviewSection } from './interview';

export interface Persona {
  persona_id: string;
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_public: boolean;
  profile_image_url?: string;
  prompt?: string;
  version?: string;
  
  // V3 persona data structure (stored in JSONB)
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
}
