
export interface PersonaMetadata {
  age: string | null;
  gender: string | null;
  race_ethnicity: string | null;
  region: string | null;
  location_history: {
    grew_up_in: string | null;
    current_residence: string | null;
  };
  income_level: string | null;
  education_level: string | null;
  occupation: string | null;
  relationship_status: string | null;
  children_or_caregiver: string | null;
  cultural_background: string | null;
  disabilities_or_conditions: string | null;
  family_medical_history: string | null;
}

export interface InterviewQuestion {
  question: string;
  response?: string;
}

export interface InterviewSection {
  section: string;
  notes: string;
  questions: Array<string | InterviewQuestion>;
  responses?: string[];
}

export interface DbPersona {
  id?: string;
  persona_id: string;
  name: string;
  creation_date: string;
  prompt?: string | null;
  metadata: Json;
  trait_profile: Json;
  behavioral_modulation: Json;
  linguistic_profile: Json;
  preinterview_tags: Json;
  simulation_directives: Json;
  interview_sections: Json;
  created_at?: string | null;
}

export interface Persona {
  id?: string;
  persona_id: string;
  name: string;
  creation_date: string;
  prompt?: string;
  metadata: PersonaMetadata;
  trait_profile: Record<string, any>;
  behavioral_modulation: Record<string, any>;
  linguistic_profile: Record<string, any>;
  preinterview_tags: string[];
  simulation_directives: Record<string, any>;
  interview_sections: InterviewSection[] | {
    interview_sections: InterviewSection[];
  };
  created_at?: string;
}

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

