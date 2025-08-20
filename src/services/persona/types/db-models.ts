
import { InterviewSection } from './interview';

export interface DbPersona {
  id: string;
  persona_id: string;
  name: string;
  description: string | null;
  user_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  profile_image_url?: string;
  prompt?: string;
  enhanced_metadata_version?: number;
  
  // V3 structure - primary data storage
  persona_data: any;
  voicepack_runtime?: any;
  voicepack_hash?: string;
  
  // Legacy fields for backwards compatibility
  creation_date?: string;
  metadata?: any;
  behavioral_modulation?: any;
  interview_sections?: any;
  linguistic_profile?: any;
  preinterview_tags?: any;
  simulation_directives?: any;
  trait_profile?: any;
  emotional_triggers?: any;
}
