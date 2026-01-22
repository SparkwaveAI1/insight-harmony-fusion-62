// src/types/personaFilters.ts

export interface PersonaFilters {
  // Demographics
  ageMin: number | null;
  ageMax: number | null;
  genders: string[];
  ethnicities: string[];
  states: string[];

  // Household
  hasChildren: boolean | null;
  maritalStatuses: string[];

  // Occupation/Education
  occupationContains: string;
  incomeBrackets: string[];
  educationLevels: string[];

  // Tags
  interestTagsAny: string[];
  healthTagsAny: string[];
  workRoleTagsAny: string[];

  // Political
  politicalLeans: string[];

  // Text search
  textContains: string;
  textExcludes: string;

  // Name search
  nameContains: string;
}

export const DEFAULT_FILTERS: PersonaFilters = {
  ageMin: null,
  ageMax: null,
  genders: [],
  ethnicities: [],
  states: [],
  hasChildren: null,
  maritalStatuses: [],
  occupationContains: '',
  incomeBrackets: [],
  educationLevels: [],
  interestTagsAny: [],
  healthTagsAny: [],
  workRoleTagsAny: [],
  politicalLeans: [],
  textContains: '',
  textExcludes: '',
  nameContains: '',
};

// Note: Filter options are now loaded dynamically from the database
// using the get_persona_filter_options RPC function.
// See src/hooks/usePersonaFilterOptions.ts for the hook that fetches these.
