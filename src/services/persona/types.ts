
export interface PersonaMetadata {
  age?: string;
  gender?: string;
  occupation?: string;
  region?: string;
  [key: string]: any;
}

export interface InterviewQuestion {
  question: string;
  response?: string;
}

export interface InterviewSection {
  section: string;
  notes: string;
  questions: (string | InterviewQuestion)[];
  responses?: string[];
}

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
  prompt?: string;
}

export interface Persona {
  persona_id: string;
  id: string;
  name: string;
  creation_date: string;
  created_at: string;
  metadata: PersonaMetadata;
  behavioral_modulation: any;
  interview_sections: InterviewSection[] | { interview_sections: InterviewSection[] };
  linguistic_profile: any;
  persona_context: any;
  persona_type: string;
  trait_profile: any;
  preinterview_tags?: string[];
  simulation_directives?: any;
  prompt?: string;
  [key: string]: any;
}
