
export interface Persona {
  id: string;
  persona_id: string;
  name: string;
  description?: string;
  user_id?: string;
  created_at?: string;
  is_public?: boolean;
  profile_image_url?: string;
  metadata: any;
  trait_profile: any;
  behavioral_modulation: any;
  simulation_directives: any;
  interview_sections: any;
  preinterview_tags: any;
  linguistic_profile: any;
  emotional_triggers?: any;
  creation_date: string;
  prompt?: string;
  enhanced_metadata_version?: number;
}

export interface InterviewSection {
  id: string;
  title: string;
  questions: InterviewQuestion[];
}

export interface InterviewQuestion {
  id: string;
  text: string;
  type: string;
}
