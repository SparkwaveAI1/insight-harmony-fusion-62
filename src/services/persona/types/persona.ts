
import { PersonaMetadata } from './metadata';
import { TraitProfile } from './trait-profile';
import { LinguisticProfile, SimulationDirectives } from './linguistic-profile';
import { InterviewSection } from './interview';
import { VoicepackRuntime } from '../../../types/voicepack';

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
  enhanced_metadata_version?: number;
  
  // Core persona data structure for V3
  persona_data: {
    metadata: PersonaMetadata;
    trait_profile: TraitProfile;
    behavioral_modulation: any;
    linguistic_profile: LinguisticProfile;
    interview_sections: InterviewSection[];
    emotional_triggers?: any;
    preinterview_tags?: string[];
    simulation_directives?: SimulationDirectives;
    persona_context?: any;
    persona_type?: string;
    creation_date?: string;
  };
  
  // Voicepack runtime cache
  voicepack_runtime?: VoicepackRuntime;
  voicepack_hash?: string;
  
  // Legacy support - these will be computed from persona_data
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
}
