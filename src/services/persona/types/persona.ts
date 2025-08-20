
import { PersonaMetadata } from './metadata';
import { TraitProfile } from './trait-profile';
import { LinguisticProfile, SimulationDirectives } from './linguistic-profile';
import { InterviewSection } from './interview';

export interface Persona {
  persona_id: string;
  id: string;
  name: string;
  description?: string; // Ensure description is included in the type
  creation_date: string;
  created_at: string;
  metadata: PersonaMetadata;
  behavioral_modulation: any;
  interview_sections: InterviewSection[] | { interview_sections: InterviewSection[] };
  linguistic_profile: LinguisticProfile;
  persona_context: any;
  persona_type: string;
  trait_profile: TraitProfile;
  preinterview_tags?: string[];
  simulation_directives?: SimulationDirectives;
  prompt?: string;
  user_id?: string;
  is_public?: boolean;
  profile_image_url?: string; // Ensure this field is explicitly defined
  emotional_triggers?: any;
  enhanced_metadata_version?: number;
  [key: string]: any;
}
