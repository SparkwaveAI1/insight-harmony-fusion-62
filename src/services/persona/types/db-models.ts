
import { InterviewSection } from './interview';

export interface DbPersona {
  id: string;
  persona_id: string;
  name: string;
  creation_date: string;
  created_at: string;
  metadata: any;
  behavioral_modulation: any;
  interview_sections: any;
  linguistic_profile: any;
  preinterview_tags: any;
  simulation_directives: any;
  trait_profile: any;
  emotional_triggers: any;
  prompt?: string;
  user_id?: string;
  is_public?: boolean;
  profile_image_url?: string;
  enhanced_metadata_version?: number;
  description?: string; // Add description field
}
