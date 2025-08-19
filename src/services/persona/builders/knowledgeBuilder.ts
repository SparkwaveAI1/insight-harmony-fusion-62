import { PersonaV2 } from '../../../types/persona-v2';
import { IdentityResult } from './identityBuilder';

export interface KnowledgeBuilderOptions {
  identity: PersonaV2['identity'];
  derivedConstraints: IdentityResult['derivedConstraints'];
  cognitive_profile: PersonaV2['cognitive_profile'];
  seed: string;
}

export interface KnowledgeResult {
  knowledge_profile: PersonaV2['knowledge_profile'];
  knowledge_budget: {
    depth_per_domain: Record<string, 0 | 1 | 2 | 3>; // 0=none, 1=basic, 2=intermediate, 3=expert
    max_unknown_calls: number; // per conversation
    unknowns_policy: "redirect" | "admit_ignorance" | "qualified_guess";
    domain_confidence: Record<string, number>; // 0-1 confidence in answers
  };
}

// Comprehensive domain lattice
const DOMAIN_LATTICE = {
  // Core academic domains
  "mathematics": { prerequisites: [], related: ["statistics", "physics", "computer_science"] },
  "statistics": { prerequisites: ["mathematics"], related: ["data_science", "psychology", "economics"] },
  "physics": { prerequisites: ["mathematics"], related: ["engineering", "chemistry"] },
  "chemistry": { prerequisites: ["mathematics"], related: ["biology", "medicine", "materials_science"] },
  "biology": { prerequisites: [], related: ["medicine", "psychology", "environmental_science"] },
  "computer_science": { prerequisites: ["mathematics"], related: ["programming", "data_science", "cybersecurity"] },
  "psychology": { prerequisites: [], related: ["neuroscience", "sociology", "education"] },
  "sociology": { prerequisites: [], related: ["psychology", "anthropology", "political_science"] },
  "economics": { prerequisites: ["mathematics"], related: ["finance", "business", "political_science"] },
  "history": { prerequisites: [], related: ["political_science", "anthropology", "literature"] },
  "literature": { prerequisites: [], related: ["writing", "philosophy", "cultural_studies"] },
  "philosophy": { prerequisites: [], related: ["ethics", "logic", "religion"] },
  "art": { prerequisites: [], related: ["design", "art_history", "photography"] },
  "music": { prerequisites: [], related: ["audio_engineering", "performance", "music_theory"] },
  
  // Professional/Technical domains
  "medicine": { prerequisites: ["biology", "chemistry"], related: ["pharmacology", "anatomy", "pathology"] },
  "law": { prerequisites: [], related: ["ethics", "political_science", "criminal_justice"] },
  "engineering": { prerequisites: ["mathematics", "physics"], related: ["materials_science", "computer_science"] },
  "education": { prerequisites: [], related: ["psychology", "child_development", "curriculum"] },
  "business": { prerequisites: [], related: ["economics", "finance", "marketing", "management"] },
  "finance": { prerequisites: ["mathematics"], related: ["economics", "accounting", "investing"] },
  "marketing": { prerequisites: [], related: ["psychology", "business", "design", "communications"] },
  "journalism": { prerequisites: [], related: ["writing", "media", "political_science", "ethics"] },
  "programming": { prerequisites: ["computer_science"], related: ["web_development", "mobile_development", "databases"] },
  "data_science": { prerequisites: ["statistics", "programming"], related: ["machine_learning", "visualization"] },
  "cybersecurity": { prerequisites: ["computer_science"], related: ["networking", "cryptography"] },
  
  // Applied/Practical domains
  "cooking": { prerequisites: [], related: ["nutrition", "chemistry", "cultural_studies"] },
  "nutrition": { prerequisites: [], related: ["biology", "medicine", "cooking"] },
  "fitness": { prerequisites: [], related: ["anatomy", "nutrition", "sports_science"] },
  "automotive": { prerequisites: [], related: ["engineering", "mechanics", "electronics"] },
  "home_improvement": { prerequisites: [], related: ["tools", "electrical", "plumbing"] },
  "gardening": { prerequisites: [], related: ["biology", "environmental_science", "chemistry"] },
  "parenting": { prerequisites: [], related: ["psychology", "child_development", "education"] },
  "personal_finance": { prerequisites: [], related: ["mathematics", "economics", "investing"] },
  
  // Cultural/Social domains
  "sports": { prerequisites: [], related: ["fitness", "statistics", "team_dynamics"] },
  "travel": { prerequisites: [], related: ["geography", "cultural_studies", "languages"] },
  "fashion": { prerequisites: [], related: ["design", "business", "cultural_studies"] },
  "photography": { prerequisites: [], related: ["art", "technology", "visual_design"] },
  "gaming": { prerequisites: [], related: ["technology", "design", "storytelling"] },
  "social_media": { prerequisites: [], related: ["marketing", "psychology", "technology"] },
  "politics": { prerequisites: [], related: ["political_science", "economics", "history"] },
  "religion": { prerequisites: [], related: ["philosophy", "history", "cultural_studies"] },
  "environmental_issues": { prerequisites: [], related: ["environmental_science", "politics", "economics"] },
  
  // Entertainment/Media
  "movies": { prerequisites: [], related: ["storytelling", "art", "cultural_studies"] },
  "television": { prerequisites: [], related: ["movies", "media", "cultural_studies"] },
  "books": { prerequisites: [], related: ["literature", "writing", "cultural_studies"] },
  "music_genres": { prerequisites: [], related: ["music", "cultural_studies", "history"] },
  "celebrity_culture": { prerequisites: [], related: ["media", "psychology", "sociology"] }
};

// Education level to domain access mapping
const EDUCATION_DOMAIN_ACCESS = {
  some_high_school: {
    accessible: ["cooking", "sports", "gaming", "social_media", "movies", "television", "music_genres", "celebrity_culture", "automotive", "home_improvement"],
    limited: ["personal_finance", "fitness", "travel", "parenting"],
    restricted: [] // Most academic domains restricted
  },
  high_school: {
    accessible: ["cooking", "sports", "gaming", "social_media", "movies", "television", "music_genres", "celebrity_culture", "automotive", "home_improvement", "personal_finance", "fitness", "travel"],
    limited: ["mathematics", "history", "literature", "art", "music", "politics", "parenting", "nutrition"],
    restricted: ["advanced_mathematics", "sciences", "professional_domains"]
  },
  some_college: {
    accessible: ["basic_academics", "practical_domains", "cultural_domains"],
    limited: ["intermediate_academics", "professional_domains"],
    restricted: ["advanced_academics", "specialized_professional"]
  },
  associates: {
    accessible: ["basic_academics", "practical_domains", "cultural_domains", "basic_professional"],
    limited: ["intermediate_academics", "intermediate_professional"],
    restricted: ["advanced_academics", "expert_professional"]
  },
  bachelors: {
    accessible: ["basic_academics", "intermediate_academics", "practical_domains", "cultural_domains", "basic_professional"],
    limited: ["advanced_academics", "intermediate_professional"],
    restricted: ["expert_professional", "research_level"]
  },
  masters: {
    accessible: ["basic_academics", "intermediate_academics", "advanced_academics", "all_practical", "all_cultural", "basic_professional", "intermediate_professional"],
    limited: ["expert_professional", "research_level"],
    restricted: ["cutting_edge_research"]
  },
  doctorate: {
    accessible: ["all_domains"],
    limited: ["cutting_edge_research_outside_specialty"],
    restricted: []
  },
  professional: {
    accessible: ["all_domains_related_to_profession", "practical_domains", "cultural_domains"],
    limited: ["academic_domains_outside_profession"],
    restricted: ["research_domains_outside_profession"]
  }
};

export function buildKnowledgeProfile(options: KnowledgeBuilderOptions): KnowledgeResult {
  const { identity, derivedConstraints, cognitive_profile, seed } = options;
  const rng = createSeededRNG(hashSeed(seed + '_knowledge'));
  
  // Build domains of expertise from occupation and education
  const occupation_domains = getOccupationDomains(identity.occupation);
  const education_domains = getEducationDomains(derivedConstraints.education_level, rng);
  const personal_domains = getPersonalDomains(identity, cognitive_profile, rng);
  
  // Combine and deduplicate
  const all_domains = [...new Set([...occupation_domains, ...education_domains, ...personal_domains])];
  
  // Build knowledge budget with realistic constraints
  const knowledge_budget = buildKnowledgeBudget(
    all_domains,
    derivedConstraints,
    cognitive_profile,
    identity.age,
    rng
  );
  
  // Set unknowns policy based on personality
  const unknowns_policy = determineUnknownsPolicy(cognitive_profile, derivedConstraints);
  
  return {
    knowledge_profile: {
      domains_of_expertise: all_domains.slice(0, 8), // Limit to prevent unrealistic breadth
      general_knowledge_level: deriveGeneralKnowledgeLevel(derivedConstraints, cognitive_profile),
      tech_literacy: derivedConstraints.tech_exposure,
      cultural_familiarity: getCulturalFamiliarity(identity, rng)
    },
    knowledge_budget: {
      depth_per_domain: knowledge_budget.depth_per_domain,
      max_unknown_calls: knowledge_budget.max_unknown_calls,
      unknowns_policy,
      domain_confidence: knowledge_budget.domain_confidence
    }
  };
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
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

function getOccupationDomains(occupation: string): string[] {
  const occupationMap: Record<string, string[]> = {
    // Healthcare
    "nurse": ["medicine", "anatomy", "pharmacology", "patient_care", "medical_procedures"],
    "physician": ["medicine", "anatomy", "pharmacology", "pathology", "diagnosis", "treatment"],
    "therapist": ["psychology", "mental_health", "counseling", "human_behavior"],
    "dental_hygienist": ["dentistry", "oral_health", "medical_procedures"],
    
    // Education
    "teacher": ["education", "child_development", "curriculum", "classroom_management"],
    "professor": ["research", "academia", "teaching", "subject_specialty"],
    "librarian": ["information_science", "research", "literature", "organization"],
    
    // Technology
    "software_engineer": ["programming", "computer_science", "software_design", "algorithms"],
    "web_developer": ["programming", "web_technologies", "design", "user_experience"],
    "data_scientist": ["statistics", "programming", "data_analysis", "machine_learning"],
    "computer_support": ["troubleshooting", "hardware", "software", "networking"],
    
    // Business/Finance
    "accountant": ["accounting", "finance", "tax_law", "auditing"],
    "marketing_manager": ["marketing", "advertising", "consumer_psychology", "brand_management"],
    "real_estate_agent": ["real_estate", "sales", "market_analysis", "negotiation"],
    "business_analyst": ["business_analysis", "process_improvement", "data_analysis"],
    
    // Trades/Manual
    "electrician": ["electrical_systems", "wiring", "safety_codes", "troubleshooting"],
    "mechanic": ["automotive", "engines", "diagnostics", "repair"],
    "plumber": ["plumbing_systems", "water_systems", "pipe_fitting", "codes"],
    
    // Service
    "retail_associate": ["customer_service", "sales", "inventory", "point_of_sale"],
    "food_service": ["food_preparation", "customer_service", "food_safety"],
    "security_guard": ["security_procedures", "surveillance", "emergency_response"],
    
    // Creative
    "artist": ["art", "design", "color_theory", "composition"],
    "writer": ["writing", "literature", "storytelling", "editing"],
    "photographer": ["photography", "composition", "lighting", "editing"],
    "musician": ["music", "performance", "music_theory", "instruments"],
    
    // Legal/Government
    "lawyer": ["law", "legal_research", "litigation", "contracts"],
    "police_officer": ["law_enforcement", "criminal_law", "investigation", "public_safety"],
    "paralegal": ["legal_procedures", "research", "documentation"],
    
    // Science/Research
    "research_scientist": ["research_methods", "scientific_method", "data_analysis", "specialty_field"],
    "lab_technician": ["laboratory_procedures", "testing", "equipment", "safety"]
  };
  
  // Fuzzy matching for occupation
  const lowerOccupation = occupation.toLowerCase();
  for (const [key, domains] of Object.entries(occupationMap)) {
    if (lowerOccupation.includes(key) || key.includes(lowerOccupation)) {
      return domains;
    }
  }
  
  // Default based on education level implied by occupation
  if (lowerOccupation.includes("manager") || lowerOccupation.includes("director")) {
    return ["management", "business", "leadership"];
  }
  if (lowerOccupation.includes("technician")) {
    return ["technical_procedures", "equipment", "troubleshooting"];
  }
  if (lowerOccupation.includes("assistant")) {
    return ["administrative", "organization", "communication"];
  }
  
  return ["general_work_skills"]; // Fallback
}

function getEducationDomains(education_level: IdentityResult['derivedConstraints']['education_level'], rng: () => number): string[] {
  const educationDomains: Record<string, string[]> = {
    some_high_school: ["basic_literacy", "basic_math"],
    high_school: ["literature", "mathematics", "history", "science", "social_studies"],
    some_college: ["intro_psychology", "intro_sociology", "college_math", "composition"],
    associates: ["applied_studies", "practical_skills", "basic_research"],
    bachelors: ["critical_thinking", "research_methods", "major_field", "liberal_arts"],
    masters: ["advanced_research", "specialized_knowledge", "thesis_area"],
    doctorate: ["research_methodology", "advanced_theory", "dissertation_area", "academic_writing"],
    professional: ["professional_standards", "ethics", "specialized_practice"]
  };
  
  const baseDomains = educationDomains[education_level] || [];
  
  // Add 1-3 additional academic interests based on education level
  if (["bachelors", "masters", "doctorate"].includes(education_level)) {
    const academicInterests = ["philosophy", "economics", "political_science", "anthropology", "linguistics"];
    const numInterests = education_level === "doctorate" ? 3 : education_level === "masters" ? 2 : 1;
    
    for (let i = 0; i < numInterests; i++) {
      const interest = academicInterests[Math.floor(rng() * academicInterests.length)];
      if (!baseDomains.includes(interest)) {
        baseDomains.push(interest);
      }
    }
  }
  
  return baseDomains;
}

function getPersonalDomains(identity: PersonaV2['identity'], cognitive_profile: PersonaV2['cognitive_profile'], rng: () => number): string[] {
  const domains: string[] = [];
  
  // Age-based interests
  if (identity.age < 30) {
    domains.push(...sampleFromArray(["gaming", "social_media", "music_genres", "travel"], 2, rng));
  } else if (identity.age < 50) {
    domains.push(...sampleFromArray(["parenting", "home_improvement", "personal_finance", "fitness"], 2, rng));
  } else {
    domains.push(...sampleFromArray(["gardening", "cooking", "health", "history"], 2, rng));
  }
  
  // Personality-based interests
  if (cognitive_profile.big_five.openness > 0.6) {
    domains.push(...sampleFromArray(["art", "philosophy", "travel", "cultural_studies"], 1, rng));
  }
  if (cognitive_profile.big_five.conscientiousness > 0.6) {
    domains.push(...sampleFromArray(["personal_finance", "organization", "productivity"], 1, rng));
  }
  if (cognitive_profile.big_five.extraversion > 0.6) {
    domains.push(...sampleFromArray(["social_media", "networking", "public_speaking"], 1, rng));
  }
  
  // Relationship status interests
  if (identity.dependents > 0) {
    domains.push("parenting", "child_development");
  }
  if (["married", "committed"].includes(identity.relationship_status)) {
    domains.push("relationships", "communication");
  }
  
  return [...new Set(domains)]; // Deduplicate
}

function buildKnowledgeBudget(
  domains: string[],
  constraints: IdentityResult['derivedConstraints'],
  cognitive_profile: PersonaV2['cognitive_profile'],
  age: number,
  rng: () => number
) {
  const depth_per_domain: Record<string, 0 | 1 | 2 | 3> = {};
  const domain_confidence: Record<string, number> = {};
  
  // Determine max expertise level based on education and intelligence
  const maxExpertiseLevel = getMaxExpertiseLevel(constraints.education_level, cognitive_profile.intelligence.level);
  
  domains.forEach(domain => {
    // Assign depth based on domain type and personal factors
    let depth: 0 | 1 | 2 | 3;
    
    if (isOccupationDomain(domain)) {
      // Occupation domains get higher depth
      depth = Math.min(maxExpertiseLevel, 2 + Math.floor(rng() * 2)) as 0 | 1 | 2 | 3;
    } else if (isEducationDomain(domain, constraints.education_level)) {
      // Education domains get moderate depth
      depth = Math.min(maxExpertiseLevel, 1 + Math.floor(rng() * 2)) as 0 | 1 | 2 | 3;
    } else {
      // Personal interests get lower depth
      depth = Math.min(maxExpertiseLevel, Math.floor(rng() * 2 + 1)) as 0 | 1 | 2 | 3;
    }
    
    depth_per_domain[domain] = depth;
    
    // Confidence correlates with depth but includes uncertainty
    const baseConfidence = depth * 0.25; // 0, 0.25, 0.5, 0.75
    const personalityAdjustment = 
      (cognitive_profile.big_five.conscientiousness - 0.5) * 0.1 + 
      (cognitive_profile.big_five.neuroticism - 0.5) * -0.1;
    
    domain_confidence[domain] = Math.max(0.1, Math.min(0.95, baseConfidence + personalityAdjustment + (rng() - 0.5) * 0.2));
  });
  
  // Max unknown calls based on personality and education
  const baseUnknowns = constraints.education_level === "some_high_school" ? 8 :
                      constraints.education_level === "high_school" ? 6 :
                      ["some_college", "associates"].includes(constraints.education_level) ? 5 :
                      ["bachelors", "masters"].includes(constraints.education_level) ? 3 :
                      2; // doctorate/professional
  
  const personalityAdjustment = cognitive_profile.big_five.conscientiousness > 0.6 ? -1 : 
                               cognitive_profile.big_five.openness > 0.6 ? 1 : 0;
  
  const max_unknown_calls = Math.max(2, baseUnknowns + personalityAdjustment);
  
  return {
    depth_per_domain,
    domain_confidence,
    max_unknown_calls
  };
}

function getMaxExpertiseLevel(education_level: IdentityResult['derivedConstraints']['education_level'], intelligence_level: PersonaV2['cognitive_profile']['intelligence']['level']): 0 | 1 | 2 | 3 {
  const educationLevel = {
    some_high_school: 1, high_school: 1, some_college: 2, associates: 2,
    bachelors: 2, masters: 3, doctorate: 3, professional: 3
  }[education_level];
  
  const intelligenceBonus = intelligence_level === "gifted" ? 1 : intelligence_level === "high" ? 0 : -1;
  
  return Math.max(1, Math.min(3, educationLevel + intelligenceBonus)) as 0 | 1 | 2 | 3;
}

function deriveGeneralKnowledgeLevel(constraints: IdentityResult['derivedConstraints'], cognitive_profile: PersonaV2['cognitive_profile']): PersonaV2['knowledge_profile']['general_knowledge_level'] {
  const educationScore = {
    some_high_school: 0, high_school: 1, some_college: 1, associates: 1,
    bachelors: 2, masters: 2, doctorate: 3, professional: 2
  }[constraints.education_level];
  
  const intelligenceScore = {
    low: 0, average: 1, high: 2, gifted: 3
  }[cognitive_profile.intelligence.level];
  
  const opennessBias = cognitive_profile.big_five.openness > 0.6 ? 1 : 0;
  
  const totalScore = educationScore + intelligenceScore + opennessBias;
  
  if (totalScore <= 2) return "low";
  if (totalScore <= 4) return "average";
  return "high";
}

function determineUnknownsPolicy(cognitive_profile: PersonaV2['cognitive_profile'], constraints: IdentityResult['derivedConstraints']): KnowledgeResult['knowledge_budget']['unknowns_policy'] {
  if (cognitive_profile.big_five.conscientiousness > 0.7 && cognitive_profile.big_five.neuroticism < 0.4) {
    return "admit_ignorance"; // Honest and confident enough to admit limits
  }
  if (cognitive_profile.big_five.extraversion > 0.6 && constraints.education_level !== "some_high_school") {
    return "qualified_guess"; // Social and educated enough to attempt informed speculation
  }
  return "redirect"; // Default to redirecting to avoid mistakes
}

function getCulturalFamiliarity(identity: PersonaV2['identity'], rng: () => number): string[] {
  const baseCultures = [identity.nationality.toLowerCase()];
  
  // Add regional culture
  if (identity.location.region) {
    baseCultures.push(`${identity.location.country}_${identity.location.region}`.toLowerCase());
  }
  
  // Add ethnic culture if different from nationality
  if (identity.ethnicity !== "White" && identity.ethnicity !== identity.nationality) {
    baseCultures.push(identity.ethnicity.toLowerCase().replace(/[^a-z]/g, '_'));
  }
  
  // Add 1-2 additional cultural interests based on openness
  const additionalCultures = ["global_pop_culture", "internet_culture", "academic_culture", "professional_culture"];
  const numAdditional = Math.floor(rng() * 2 + 1);
  
  for (let i = 0; i < numAdditional; i++) {
    const culture = additionalCultures[Math.floor(rng() * additionalCultures.length)];
    if (!baseCultures.includes(culture)) {
      baseCultures.push(culture);
    }
  }
  
  return baseCultures;
}

function isOccupationDomain(domain: string): boolean {
  const occupationDomains = ["medicine", "programming", "business", "education", "law", "engineering"];
  return occupationDomains.some(od => domain.includes(od) || od.includes(domain));
}

function isEducationDomain(domain: string, education_level: string): boolean {
  const educationDomains = ["mathematics", "literature", "history", "science", "philosophy", "research_methods"];
  return educationDomains.includes(domain) && ["bachelors", "masters", "doctorate"].includes(education_level);
}

function sampleFromArray<T>(array: T[], n: number, rng: () => number): T[] {
  const shuffled = [...array].sort(() => rng() - 0.5);
  return shuffled.slice(0, n);
}