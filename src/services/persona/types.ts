
export interface PersonaMetadata {
  age?: string;
  gender?: string;
  occupation?: string;
  region?: string;
  [key: string]: any;
}

export interface Persona {
  persona_id: string;
  id: string;
  name: string;
  creation_date: string;
  created_at: string;
  metadata: PersonaMetadata;
  behavioral_modulation: any;
  interview_sections: any;
  linguistic_profile: any;
  persona_context: any;
  persona_type: string;
  trait_profile: any;
  [key: string]: any;
}
