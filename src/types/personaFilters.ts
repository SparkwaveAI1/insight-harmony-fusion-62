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

// Filter options for dropdowns
// Note: These use lowercase values for case-insensitive matching in the database
export const GENDER_OPTIONS = ['male', 'female', 'non-binary'];

// Ethnicity options - case-insensitive matching in RPC
export const ETHNICITY_OPTIONS = [
  'white', 'black', 'african-american', 'latino', 'latina', 'hispanic',
  'asian', 'indian-american', 'chinese-american', 'korean-american', 'vietnamese-american',
  'mexican-american', 'japanese-american', 'pakistani-american', 'puerto rican',
  'native american', 'pacific islander', 'mixed', 'caucasian'
];

export const US_STATE_OPTIONS = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
];

// Marital status - lowercase for case-insensitive matching
export const MARITAL_STATUS_OPTIONS = [
  'single', 'married', 'divorced', 'widowed', 'separated', 'partnered', 'engaged'
];

// Education options - uses partial LIKE matching, so "bachelor" matches "bachelor's degree", "Bachelor's in Nursing", etc.
export const EDUCATION_OPTIONS = [
  'high school', 'some college', 'associate', 'bachelor', 'master', 'doctorate', 'phd', 'mba', 'jd'
];

// Income brackets - match actual database values
export const INCOME_BRACKET_OPTIONS = [
  '0-25000', '25000-35000', '35000-50000', '50000-75000', '75000-100000',
  '100000-150000', '150000-200000', '200000-250000', '250000+'
];

export const INTEREST_TAG_OPTIONS = [
  'cooking', 'fitness', 'gaming', 'crypto', 'travel', 'music', 'art',
  'reading', 'gardening', 'pets', 'fashion', 'technology', 'investing',
  'politics', 'spirituality', 'sports', 'outdoors', 'photography',
  'diy', 'beverages', 'entertainment', 'automotive', 'real_estate',
  'parenting', 'volunteering'
];

export const HEALTH_TAG_OPTIONS = [
  'anxiety', 'depression', 'diabetes', 'obesity', 'chronic_pain',
  'heart_condition', 'cancer', 'autoimmune', 'allergies', 'sleep_issues',
  'respiratory', 'arthritis', 'migraines', 'adhd', 'thyroid', 'ptsd',
  'eating_disorder', 'addiction', 'pregnancy', 'menopause'
];

export const WORK_ROLE_TAG_OPTIONS = [
  'executive', 'manager', 'developer', 'designer', 'healthcare',
  'educator', 'sales', 'marketing', 'finance', 'legal', 'entrepreneur',
  'freelancer', 'retail', 'trades', 'writer', 'analyst', 'hr',
  'administrative', 'student', 'retired', 'homemaker'
];

export const POLITICAL_LEAN_OPTIONS = [
  'conservative', 'liberal', 'moderate', 'unclassified'
];
