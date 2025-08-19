import { PersonaV2 } from '../../../types/persona-v2';
import { LinguisticProfile } from '../types/linguistic-profile';

export interface LinguisticBuilderOptions {
  identity: PersonaV2['identity'];
  cognitive: PersonaV2['cognitive_profile'];
  social: PersonaV2['social_cognition'];
  health: PersonaV2['health_profile'];
  seed: string;
}

export interface LinguisticResult {
  linguistic_profile: LinguisticProfile;
  discourse_markers: Array<{ term: string; p: number }>;
  signature_tokens: string[];
  interjections: Array<{ term: string; p: number }>;
  syntax_preferences: {
    sentence_length_dist: { short: number; medium: number; long: number };
    complexity: "simple" | "compound" | "complex";
    lists_per_200toks_max: number;
  };
}

export function buildLinguisticProfile(options: LinguisticBuilderOptions): LinguisticResult {
  const { identity, cognitive, social, health, seed } = options;
  const rng = createSeededRNG(hashSeed(seed));

  // Build base linguistic profile
  const linguistic_profile = buildBaseLinguistic(identity, cognitive, rng);
  
  // Generate discourse markers based on traits
  const discourse_markers = generateDiscourseMarkers(cognitive, social, rng);
  
  // Create signature tokens from cultural/regional markers
  const signature_tokens = generateSignatureTokens(identity, cognitive, rng);
  
  // Generate interjections based on personality
  const interjections = generateInterjections(cognitive, health, rng);
  
  // Build syntax preferences
  const syntax_preferences = buildSyntaxPreferences(cognitive, health, rng);

  return {
    linguistic_profile,
    discourse_markers,
    signature_tokens,
    interjections,
    syntax_preferences
  };
}

function buildBaseLinguistic(
  identity: PersonaV2['identity'], 
  cognitive: PersonaV2['cognitive_profile'], 
  rng: () => number
): LinguisticProfile {
  
  // Determine output length based on extraversion and conscientiousness
  const lengthScore = cognitive.big_five.extraversion * 0.6 + cognitive.big_five.conscientiousness * 0.4;
  const default_output_length = lengthScore > 0.65 ? "long" : lengthScore > 0.35 ? "medium" : "short";
  
  // Speech register based on education and occupation
  const isHighEducation = identity.occupation.includes("Doctor") || identity.occupation.includes("Professor") || identity.occupation.includes("Engineer");
  const speech_register = isHighEducation && cognitive.big_five.conscientiousness > 0.6 ? "formal" : 
                         cognitive.big_five.agreeableness > 0.7 ? "casual-friendly" : "casual";
  
  // Regional influence from location
  const regional_influence = `${identity.location.region}_${identity.location.country}`.toLowerCase();
  
  // Professional influence
  const professional_or_educational_influence = isHighEducation ? identity.occupation : null;
  
  // Cultural patterns based on ethnicity
  const cultural_speech_patterns = identity.ethnicity !== "Prefer not to say" ? identity.ethnicity : null;
  
  // Generational influence
  const generational_or_peer_influence = identity.age < 25 ? "gen_z" : 
                                        identity.age < 40 ? "millennial" : 
                                        identity.age < 55 ? "gen_x" : "boomer";
  
  // Speaking style flags
  const speaking_style = {
    uses_slang: cognitive.big_five.openness > 0.6 && identity.age < 35,
    formal_structure: cognitive.big_five.conscientiousness > 0.65,
    emotional_language: cognitive.big_five.neuroticism > 0.6 || cognitive.big_five.extraversion > 0.7,
    technical_terms: isHighEducation && cognitive.big_five.openness > 0.5,
    casual_contractions: cognitive.big_five.agreeableness > 0.6 && speech_register === "casual"
  };
  
  // Sample phrasing based on personality
  const sample_phrasing = generateSamplePhrasing(cognitive, speaking_style, rng);

  return {
    default_output_length,
    speech_register,
    regional_influence,
    professional_or_educational_influence,
    cultural_speech_patterns,
    generational_or_peer_influence,
    speaking_style,
    sample_phrasing
  };
}

function generateDiscourseMarkers(
  cognitive: PersonaV2['cognitive_profile'], 
  social: PersonaV2['social_cognition'], 
  rng: () => number
): Array<{ term: string; p: number }> {
  
  const markers = [];
  
  // Hedge markers for uncertainty/agreeableness
  if (cognitive.big_five.agreeableness > 0.6 || cognitive.big_five.neuroticism > 0.5) {
    markers.push(
      { term: "I think", p: 0.15 },
      { term: "maybe", p: 0.12 },
      { term: "perhaps", p: 0.08 }
    );
  }
  
  // Confidence markers for extraversion/low neuroticism
  if (cognitive.big_five.extraversion > 0.6 && cognitive.big_five.neuroticism < 0.4) {
    markers.push(
      { term: "definitely", p: 0.10 },
      { term: "absolutely", p: 0.08 },
      { term: "clearly", p: 0.06 }
    );
  }
  
  // Discourse connectors for conscientiousness
  if (cognitive.big_five.conscientiousness > 0.6) {
    markers.push(
      { term: "however", p: 0.09 },
      { term: "therefore", p: 0.07 },
      { term: "furthermore", p: 0.05 }
    );
  }
  
  // Casual connectors for openness
  if (cognitive.big_five.openness > 0.6) {
    markers.push(
      { term: "honestly", p: 0.08 },
      { term: "actually", p: 0.12 },
      { term: "basically", p: 0.10 }
    );
  }

  return markers.slice(0, 8); // Limit to 8 markers
}

function generateSignatureTokens(
  identity: PersonaV2['identity'], 
  cognitive: PersonaV2['cognitive_profile'], 
  rng: () => number
): string[] {
  
  const tokens = [];
  
  // Regional tokens
  if (identity.location.region === "South") {
    tokens.push("y'all", "might could", "fixin' to");
  } else if (identity.location.region === "Northeast") {
    tokens.push("wicked", "dunno", "whatnot");
  } else if (identity.location.region === "Midwest") {
    tokens.push("you betcha", "ope", "different than");
  }
  
  // Generational tokens
  if (identity.age < 30) {
    tokens.push("lowkey", "no cap", "it's giving", "periodt");
  } else if (identity.age < 45) {
    tokens.push("legit", "my bad", "for real");
  }
  
  // Professional tokens
  if (identity.occupation.includes("Tech") || identity.occupation.includes("Engineer")) {
    tokens.push("optimize", "scalable", "iterate");
  } else if (identity.occupation.includes("Teacher") || identity.occupation.includes("Professor")) {
    tokens.push("scaffolding", "differentiate", "assessment");
  }
  
  // Personality-based tokens
  if (cognitive.big_five.openness > 0.7) {
    tokens.push("fascinating", "intriguing", "paradigm");
  }
  
  if (cognitive.big_five.conscientiousness > 0.7) {
    tokens.push("systematically", "thoroughly", "precisely");
  }

  // Return 6-12 unique tokens
  const shuffled = tokens.sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.floor(6 + rng() * 7));
}

function generateInterjections(
  cognitive: PersonaV2['cognitive_profile'], 
  health: PersonaV2['health_profile'], 
  rng: () => number
): Array<{ term: string; p: number }> {
  
  const interjections = [];
  
  // Enthusiasm for extraversion
  if (cognitive.big_five.extraversion > 0.6) {
    interjections.push(
      { term: "Oh!", p: 0.08 },
      { term: "Wow!", p: 0.06 },
      { term: "Nice!", p: 0.05 }
    );
  }
  
  // Thoughtful pauses for conscientiousness
  if (cognitive.big_five.conscientiousness > 0.6) {
    interjections.push(
      { term: "Hmm,", p: 0.12 },
      { term: "Well,", p: 0.10 },
      { term: "Let me think...", p: 0.04 }
    );
  }
  
  // Anxiety markers for neuroticism
  if (cognitive.big_five.neuroticism > 0.6) {
    interjections.push(
      { term: "Um,", p: 0.15 },
      { term: "Uh,", p: 0.12 },
      { term: "Like,", p: 0.10 }
    );
  }
  
  // Energy level adjustments
  if (health.energy_baseline === "high") {
    interjections.forEach(int => int.p *= 1.2);
  } else if (health.energy_baseline === "low") {
    interjections.forEach(int => int.p *= 0.8);
  }

  return interjections.slice(0, 6);
}

function buildSyntaxPreferences(
  cognitive: PersonaV2['cognitive_profile'], 
  health: PersonaV2['health_profile'], 
  rng: () => number
): LinguisticResult['syntax_preferences'] {
  
  // Sentence length based on conscientiousness and energy
  const energyMultiplier = health.energy_baseline === "high" ? 1.2 : 
                          health.energy_baseline === "low" ? 0.8 : 1.0;
  
  const conscientiousnessBonus = cognitive.big_five.conscientiousness * 0.3;
  
  let short = 0.4 - conscientiousnessBonus;
  let medium = 0.4;
  let long = 0.2 + conscientiousnessBonus;
  
  // Apply energy multiplier to long sentences
  long *= energyMultiplier;
  
  // Normalize
  const total = short + medium + long;
  const sentence_length_dist = {
    short: short / total,
    medium: medium / total,
    long: long / total
  };
  
  // Complexity based on openness and education
  const complexity: "simple" | "compound" | "complex" = 
    cognitive.big_five.openness > 0.65 && cognitive.big_five.conscientiousness > 0.6 ? "complex" :
    cognitive.big_five.openness > 0.4 ? "compound" : "simple";
  
  // Lists based on conscientiousness (structured thinking)
  const lists_per_200toks_max = Math.floor(cognitive.big_five.conscientiousness * 3) + 1;

  return {
    sentence_length_dist,
    complexity,
    lists_per_200toks_max
  };
}

function generateSamplePhrasing(
  cognitive: PersonaV2['cognitive_profile'], 
  speaking_style: Record<string, boolean>, 
  rng: () => number
): string[] {
  
  const phrases = [];
  
  if (speaking_style.formal_structure) {
    phrases.push("In my opinion,", "I would argue that", "It is worth noting that");
  }
  
  if (speaking_style.casual_contractions) {
    phrases.push("I'd say", "can't really", "wouldn't you think");
  }
  
  if (speaking_style.emotional_language) {
    phrases.push("I feel strongly that", "it really bothers me when", "I'm so excited about");
  }
  
  if (speaking_style.uses_slang) {
    phrases.push("that's fire", "no shot", "bet");
  }
  
  if (speaking_style.technical_terms) {
    phrases.push("optimize the process", "systematic approach", "data-driven decision");
  }
  
  // Add personality-specific phrases
  if (cognitive.big_five.agreeableness > 0.7) {
    phrases.push("I see your point", "that makes sense", "I appreciate that perspective");
  }
  
  if (cognitive.big_five.neuroticism > 0.6) {
    phrases.push("I'm worried that", "what if", "hopefully everything works out");
  }

  return phrases.slice(0, 8);
}

// Utility functions
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function createSeededRNG(seed: number): () => number {
  let state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) % Math.pow(2, 32);
    return state / Math.pow(2, 32);
  };
}