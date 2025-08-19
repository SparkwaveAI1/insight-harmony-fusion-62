import { PersonaV2 } from '../../../types/persona-v2';

export interface IdentityBuilderOptions {
  locale: string;
  age_range?: [number, number];
  archetype?: string;
  hard_constraints?: Record<string, string>;
  seed: string;
}

export interface IdentityResult {
  identity: PersonaV2['identity'];
  derivedConstraints: {
    education_level: "some_high_school" | "high_school" | "some_college" | "associates" | "bachelors" | "masters" | "doctorate" | "professional";
    income_bracket: "low" | "medium" | "high" | "very_high";
    urban_rural: "urban" | "suburban" | "rural";
    tech_exposure: "low" | "medium" | "high";
  };
}

// Occupation databases by education level and region
const OCCUPATIONS_BY_EDUCATION = {
  some_high_school: ["retail associate", "food service worker", "warehouse worker", "janitor", "farm worker"],
  high_school: ["administrative assistant", "security guard", "delivery driver", "cashier", "factory worker", "police officer"],
  some_college: ["dental hygienist", "paralegal", "web developer", "real estate agent", "auto mechanic"],
  associates: ["registered nurse", "air traffic controller", "radiation therapist", "dental hygienist", "computer support specialist"],
  bachelors: ["teacher", "accountant", "software engineer", "marketing manager", "social worker", "journalist", "architect"],
  masters: ["therapist", "physician assistant", "urban planner", "librarian", "data scientist", "school principal"],
  doctorate: ["professor", "research scientist", "physician", "clinical psychologist", "veterinarian"],
  professional: ["lawyer", "physician", "pharmacist", "dentist", "engineer", "architect"]
};

const REGIONAL_PATTERNS = {
  "US-South": { 
    cities: ["Atlanta", "Nashville", "Charlotte", "New Orleans", "Birmingham"],
    cultural_markers: ["y'all", "southern hospitality", "church community"],
    occupation_bias: { education: -0.1, rural: 0.2 }
  },
  "US-Northeast": {
    cities: ["Boston", "New York", "Philadelphia", "Portland", "Burlington"],
    cultural_markers: ["wicked", "coffee culture", "liberal values"],
    occupation_bias: { education: 0.1, tech: 0.15 }
  },
  "US-West": {
    cities: ["San Francisco", "Seattle", "Portland", "Los Angeles", "Denver"],
    cultural_markers: ["wellness", "outdoor culture", "tech scene"],
    occupation_bias: { tech: 0.2, creative: 0.1 }
  },
  "US-Midwest": {
    cities: ["Chicago", "Minneapolis", "Milwaukee", "Detroit", "St. Louis"],
    cultural_markers: ["midwest nice", "work ethic", "community values"],
    occupation_bias: { manufacturing: 0.1, agriculture: 0.05 }
  }
};

export function buildIdentity(options: IdentityBuilderOptions): IdentityResult {
  const { locale, age_range = [18, 75], archetype, hard_constraints = {}, seed } = options;
  
  // Use seed to create deterministic randomness
  const seedNum = hashSeed(seed);
  const rng = createSeededRNG(seedNum);
  
  // Sample basic demographics
  const age = sampleAge(age_range, rng);
  const gender = hard_constraints.gender || sampleGender(rng);
  const pronouns = derivePronouns(gender, rng);
  const ethnicity = sampleEthnicity(locale, rng);
  const nationality = deriveNationality(locale, ethnicity);
  
  // Sample location with regional influence
  const location = sampleLocation(locale, rng);
  const regional_pattern = REGIONAL_PATTERNS[`${locale.split('-')[0]}-${getRegion(location)}`];
  
  // Sample education level with age and regional bias
  const education_level = sampleEducationLevel(age, regional_pattern, rng);
  
  // Sample occupation constrained by education and region
  const occupation = hard_constraints.occupation || 
    sampleOccupation(education_level, regional_pattern, age, rng);
  
  // Sample relationship status with age correlation
  const relationship_status = sampleRelationshipStatus(age, rng);
  const dependents = sampleDependents(age, relationship_status, rng);
  
  // Derive economic and social constraints
  const income_bracket = deriveIncomeBracket(occupation, education_level, age);
  const urban_rural = deriveUrbanRural(location, occupation);
  const tech_exposure = deriveTechExposure(education_level, occupation, age);
  
  const name = sampleName(gender, ethnicity, age, rng);
  
  return {
    identity: {
      name,
      age,
      gender,
      pronouns,
      ethnicity,
      nationality,
      location,
      occupation,
      relationship_status: relationship_status as PersonaV2['identity']['relationship_status'],
      dependents
    },
    derivedConstraints: {
      education_level,
      income_bracket,
      urban_rural,
      tech_exposure
    }
  };
}

// Helper functions
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function createSeededRNG(seed: number) {
  let current = seed;
  return () => {
    current = (current * 1664525 + 1013904223) % (2 ** 32);
    return current / (2 ** 32);
  };
}

function sampleAge([min, max]: [number, number], rng: () => number): number {
  // Weighted toward productive age ranges
  const weights = [];
  for (let age = min; age <= max; age++) {
    if (age >= 25 && age <= 45) weights.push(1.5); // Peak productivity
    else if (age >= 18 && age <= 65) weights.push(1.0); // Normal range
    else weights.push(0.3); // Edges
  }
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = rng() * totalWeight;
  
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return min + i;
  }
  return max;
}

function sampleGender(rng: () => number): string {
  const rand = rng();
  if (rand < 0.48) return "male";
  if (rand < 0.96) return "female";
  return rng() < 0.5 ? "non-binary" : "genderfluid";
}

function derivePronouns(gender: string, rng: () => number): string {
  switch (gender) {
    case "male": return "he/him";
    case "female": return "she/her";
    case "non-binary": return rng() < 0.7 ? "they/them" : "xe/xir";
    case "genderfluid": return rng() < 0.6 ? "they/them" : "she/they";
    default: return "they/them";
  }
}

function sampleEthnicity(locale: string, rng: () => number): string {
  const ethnicities = locale.startsWith('en-US') ? 
    ["White", "Hispanic/Latino", "Black/African American", "Asian", "Native American", "Mixed Race"] :
    ["White", "Black", "Asian", "Hispanic", "Mixed Race", "Other"];
    
  const weights = locale.startsWith('en-US') ?
    [0.6, 0.19, 0.13, 0.06, 0.01, 0.01] : // US demographics approximation
    [0.7, 0.1, 0.1, 0.05, 0.03, 0.02]; // Generic Western
    
  return weightedSample(ethnicities, weights, rng);
}

function deriveNationality(locale: string, ethnicity: string): string {
  if (locale.startsWith('en-US')) return "American";
  if (locale.startsWith('en-CA')) return "Canadian";
  if (locale.startsWith('en-GB')) return "British";
  return "American"; // Default
}

function sampleLocation(locale: string, rng: () => number): PersonaV2['identity']['location'] {
  const regions = Object.keys(REGIONAL_PATTERNS).filter(r => r.startsWith(locale.split('-')[0]));
  const region = regions[Math.floor(rng() * regions.length)];
  const pattern = REGIONAL_PATTERNS[region];
  const city = pattern.cities[Math.floor(rng() * pattern.cities.length)];
  
  return {
    city,
    region: region.split('-')[1],
    country: locale.split('-')[0] === 'en' ? 'United States' : 'Canada'
  };
}

function getRegion(location: PersonaV2['identity']['location']): string {
  return location.region;
}

function sampleEducationLevel(age: number, regionalPattern: any, rng: () => number): IdentityResult['derivedConstraints']['education_level'] {
  const educationLevels = Object.keys(OCCUPATIONS_BY_EDUCATION) as IdentityResult['derivedConstraints']['education_level'][];
  
  // Age bias: older = more time for education, but older also = different era
  let bias = 0;
  if (age < 25) bias = -0.1; // Less time for advanced degrees
  if (age > 45) bias = -0.05; // Different educational era
  
  // Regional education bias
  if (regionalPattern?.occupation_bias?.education) {
    bias += regionalPattern.occupation_bias.education;
  }
  
  const weights = [0.05, 0.15, 0.2, 0.15, 0.25, 0.15, 0.04, 0.01]; // Roughly US distribution
  const adjustedWeights = weights.map((w, i) => {
    if (i >= 5) return w * Math.max(0.1, 1 + bias); // Advanced degrees more sensitive
    return w * Math.max(0.3, 1 - bias * 0.5);
  });
  
  return weightedSample(educationLevels, adjustedWeights, rng);
}

function sampleOccupation(educationLevel: IdentityResult['derivedConstraints']['education_level'], regionalPattern: any, age: number, rng: () => number): string {
  const pool = OCCUPATIONS_BY_EDUCATION[educationLevel];
  return pool[Math.floor(rng() * pool.length)];
}

function sampleRelationshipStatus(age: number, rng: () => number): string {
  if (age < 22) {
    return weightedSample(["single", "dating"], [0.7, 0.3], rng);
  } else if (age < 30) {
    return weightedSample(["single", "dating", "committed"], [0.4, 0.3, 0.3], rng);
  } else if (age < 45) {
    return weightedSample(["single", "dating", "committed", "married"], [0.2, 0.15, 0.25, 0.4], rng);
  } else {
    return weightedSample(["single", "married", "divorced", "separated"], [0.15, 0.6, 0.2, 0.05], rng);
  }
}

function sampleDependents(age: number, relationshipStatus: string, rng: () => number): number {
  if (age < 22 || relationshipStatus === "single") return rng() < 0.05 ? 1 : 0;
  if (age < 30) return rng() < 0.3 ? (rng() < 0.8 ? 1 : 2) : 0;
  if (age < 45) return rng() < 0.6 ? Math.floor(rng() * 3 + 1) : 0;
  return rng() < 0.4 ? Math.floor(rng() * 2) : 0; // Older = kids moved out
}

function sampleName(gender: string, ethnicity: string, age: number, rng: () => number): string {
  // Simplified name sampling - in production, use proper name databases
  const maleNames = ["James", "Michael", "Robert", "John", "David", "William", "Richard", "Joseph", "Thomas", "Christopher"];
  const femaleNames = ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"];
  const neutralNames = ["Alex", "Jordan", "Taylor", "Casey", "Morgan", "Riley", "Avery", "Quinn", "Sage", "River"];
  
  let namePool = neutralNames;
  if (gender === "male") namePool = maleNames;
  if (gender === "female") namePool = femaleNames;
  
  return namePool[Math.floor(rng() * namePool.length)];
}

function deriveIncomeBracket(occupation: string, education: IdentityResult['derivedConstraints']['education_level'], age: number): IdentityResult['derivedConstraints']['income_bracket'] {
  const educationMultiplier = {
    some_high_school: 0.6, high_school: 0.8, some_college: 0.9, associates: 1.0,
    bachelors: 1.3, masters: 1.6, doctorate: 2.0, professional: 2.2
  }[education];
  
  const ageMultiplier = age < 25 ? 0.7 : age < 35 ? 1.0 : age < 50 ? 1.2 : 1.1;
  
  const score = educationMultiplier * ageMultiplier;
  if (score < 0.8) return "low";
  if (score < 1.2) return "medium";
  if (score < 1.8) return "high";
  return "very_high";
}

function deriveUrbanRural(location: PersonaV2['identity']['location'], occupation: string): IdentityResult['derivedConstraints']['urban_rural'] {
  const ruralOccupations = ["farm worker", "veterinarian", "forest ranger"];
  if (ruralOccupations.some(occ => occupation.includes(occ))) return "rural";
  if (["New York", "San Francisco", "Boston", "Chicago"].includes(location.city)) return "urban";
  return "suburban";
}

function deriveTechExposure(education: IdentityResult['derivedConstraints']['education_level'], occupation: string, age: number): IdentityResult['derivedConstraints']['tech_exposure'] {
  const techOccupations = ["software engineer", "web developer", "data scientist", "computer support"];
  if (techOccupations.some(occ => occupation.includes(occ))) return "high";
  
  const educationScore = {
    some_high_school: 0, high_school: 1, some_college: 2, associates: 2,
    bachelors: 3, masters: 4, doctorate: 4, professional: 3
  }[education];
  
  const ageScore = age < 30 ? 2 : age < 45 ? 1 : 0;
  const totalScore = educationScore + ageScore;
  
  if (totalScore >= 5) return "high";
  if (totalScore >= 3) return "medium";
  return "low";
}

function weightedSample<T>(items: T[], weights: number[], rng: () => number): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = rng() * totalWeight;
  
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  return items[items.length - 1];
}