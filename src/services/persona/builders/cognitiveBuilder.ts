import { PersonaV2 } from '../../../types/persona-v2';
import { IdentityResult } from './identityBuilder';

export interface CognitiveBuilderOptions {
  identity: PersonaV2['identity'];
  derivedConstraints: IdentityResult['derivedConstraints'];
  seed: string;
}

export interface CognitiveResult {
  cognitive_profile: PersonaV2['cognitive_profile'];
  social_cognition: PersonaV2['social_cognition'];
  health_profile: PersonaV2['health_profile'];
  sexuality_profile: PersonaV2['sexuality_profile'];
  behavioral_traits: {
    impulsivity: number;
    patience: number;
    risk_tolerance: number;
    honesty: number;
    moral_rigidity: number;
    digression_tendency: number;
  };
}

export function buildCognitiveProfile(options: CognitiveBuilderOptions): CognitiveResult {
  const { identity, derivedConstraints, seed } = options;
  const rng = createSeededRNG(hashSeed(seed + '_cognitive'));
  
  // Sample Big Five with anti-midline enforcement
  const big_five = sampleBigFive(rng);
  
  // Sample behavioral traits that interact with Big Five
  const behavioral_traits = sampleBehavioralTraits(big_five, rng);
  
  // Enforce contrast requirement: at least 3 dimensions outside midrange
  enforceContrast(big_five, behavioral_traits, rng);
  
  // Build intelligence from education and occupation
  const intelligence = buildIntelligence(derivedConstraints, identity.occupation, rng);
  
  // Build decision style from traits
  const decision_style = buildDecisionStyle(big_five, behavioral_traits, rng);
  
  // Sample moral foundations with realistic correlations
  const moral_foundations = sampleMoralFoundations(big_five, derivedConstraints, rng);
  
  // Build temporal orientation
  const temporal_orientation = buildTemporalOrientation(big_five, identity.age, rng);
  
  // Generate worldview summary
  const worldview_summary = generateWorldviewSummary(big_five, moral_foundations, identity, behavioral_traits);
  
  // Build social cognition from Big Five and traits
  const social_cognition = buildSocialCognition(big_five, behavioral_traits, rng);
  
  // Build health profile with realistic correlations
  const health_profile = buildHealthProfile(big_five, identity, behavioral_traits, rng);
  
  // Build sexuality profile
  const sexuality_profile = buildSexualityProfile(big_five, identity, health_profile, rng);
  
  return {
    cognitive_profile: {
      big_five,
      intelligence,
      decision_style,
      moral_foundations,
      temporal_orientation,
      worldview_summary
    },
    social_cognition,
    health_profile,
    sexuality_profile,
    behavioral_traits
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

// Anti-midline sampling: 30% low (0.05-0.30), 40% mid (0.35-0.65), 30% high (0.70-0.95)
function sampleTrimodal(rng: () => number): number {
  const mode = rng();
  if (mode < 0.3) {
    // Low mode: Beta(2,6) approximation
    return 0.05 + rng() * 0.25 * Math.pow(rng(), 2);
  } else if (mode < 0.7) {
    // Mid mode: more uniform
    return 0.35 + rng() * 0.30;
  } else {
    // High mode: Beta(6,2) approximation  
    return 0.70 + 0.25 * (1 - Math.pow(rng(), 2));
  }
}

function sampleBigFive(rng: () => number): PersonaV2['cognitive_profile']['big_five'] {
  return {
    openness: sampleTrimodal(rng),
    conscientiousness: sampleTrimodal(rng),
    extraversion: sampleTrimodal(rng),
    agreeableness: sampleTrimodal(rng),
    neuroticism: sampleTrimodal(rng)
  };
}

function sampleBehavioralTraits(bigFive: PersonaV2['cognitive_profile']['big_five'], rng: () => number) {
  return {
    impulsivity: Math.max(0.05, Math.min(0.95, 
      sampleTrimodal(rng) + (1 - bigFive.conscientiousness) * 0.2 - 0.1
    )),
    patience: Math.max(0.05, Math.min(0.95,
      sampleTrimodal(rng) + bigFive.conscientiousness * 0.15 - (bigFive.neuroticism * 0.1)
    )),
    risk_tolerance: Math.max(0.05, Math.min(0.95,
      sampleTrimodal(rng) + bigFive.openness * 0.1 - bigFive.neuroticism * 0.15
    )),
    honesty: Math.max(0.05, Math.min(0.95,
      sampleTrimodal(rng) + bigFive.conscientiousness * 0.1 + bigFive.agreeableness * 0.05
    )),
    moral_rigidity: Math.max(0.05, Math.min(0.95,
      sampleTrimodal(rng) + bigFive.conscientiousness * 0.15 - bigFive.openness * 0.1
    )),
    digression_tendency: Math.max(0.05, Math.min(0.95,
      sampleTrimodal(rng) + (1 - bigFive.conscientiousness) * 0.1 + bigFive.openness * 0.05
    ))
  };
}

function enforceContrast(bigFive: PersonaV2['cognitive_profile']['big_five'], behavioral: any, rng: () => number): void {
  const allTraits = { ...bigFive, ...behavioral };
  const midrange = Object.values(allTraits).filter(val => val >= 0.35 && val <= 0.65).length;
  const totalTraits = Object.keys(allTraits).length;
  const outsideMidrange = totalTraits - midrange;
  
  // Require at least 6 traits outside midrange (approximately 55%)
  if (outsideMidrange < 6) {
    const traitsToAdjust = 6 - outsideMidrange;
    const traitKeys = Object.keys(allTraits);
    
    for (let i = 0; i < traitsToAdjust; i++) {
      const traitKey = traitKeys[Math.floor(rng() * traitKeys.length)];
      const currentValue = allTraits[traitKey];
      
      if (currentValue >= 0.35 && currentValue <= 0.65) {
        // Push to extreme
        const newValue = rng() < 0.5 ? 
          0.05 + rng() * 0.25 : // Low
          0.70 + rng() * 0.25;  // High
          
        if (traitKey in bigFive) {
          (bigFive as any)[traitKey] = newValue;
        } else {
          (behavioral as any)[traitKey] = newValue;
        }
        allTraits[traitKey] = newValue;
      }
    }
  }
}

function buildIntelligence(constraints: IdentityResult['derivedConstraints'], occupation: string, rng: () => number): PersonaV2['cognitive_profile']['intelligence'] {
  // Map education to intelligence level with some variance
  const educationToIntelligence = {
    some_high_school: { weights: [0.4, 0.5, 0.1, 0.0], levels: ["low", "average", "high", "gifted"] },
    high_school: { weights: [0.2, 0.6, 0.18, 0.02], levels: ["low", "average", "high", "gifted"] },
    some_college: { weights: [0.1, 0.5, 0.35, 0.05], levels: ["low", "average", "high", "gifted"] },
    associates: { weights: [0.05, 0.4, 0.5, 0.05], levels: ["low", "average", "high", "gifted"] },
    bachelors: { weights: [0.02, 0.3, 0.6, 0.08], levels: ["low", "average", "high", "gifted"] },
    masters: { weights: [0.01, 0.15, 0.7, 0.14], levels: ["low", "average", "high", "gifted"] },
    doctorate: { weights: [0.0, 0.05, 0.7, 0.25], levels: ["low", "average", "high", "gifted"] },
    professional: { weights: [0.0, 0.1, 0.65, 0.25], levels: ["low", "average", "high", "gifted"] }
  };
  
  const mapping = educationToIntelligence[constraints.education_level];
  const level = weightedSample(mapping.levels, mapping.weights, rng) as PersonaV2['cognitive_profile']['intelligence']['level'];
  
  // Intelligence types based on occupation and level
  const types: PersonaV2['cognitive_profile']['intelligence']['type'] = [];
  const creativeOccupations = ["artist", "writer", "designer", "musician", "architect"];
  const analyticalOccupations = ["engineer", "scientist", "accountant", "analyst", "programmer"];
  const practicalOccupations = ["nurse", "mechanic", "electrician", "manager", "teacher"];
  const emotionalOccupations = ["therapist", "social worker", "counselor", "HR", "sales"];
  
  if (creativeOccupations.some(occ => occupation.toLowerCase().includes(occ))) {
    types.push("creative");
  }
  if (analyticalOccupations.some(occ => occupation.toLowerCase().includes(occ))) {
    types.push("analytical");
  }
  if (practicalOccupations.some(occ => occupation.toLowerCase().includes(occ))) {
    types.push("practical");
  }
  if (emotionalOccupations.some(occ => occupation.toLowerCase().includes(occ))) {
    types.push("emotional");
  }
  
  // If no matches, sample based on intelligence level
  if (types.length === 0) {
    if (level === "gifted" || level === "high") {
      types.push(rng() < 0.4 ? "analytical" : rng() < 0.7 ? "creative" : "emotional");
    } else {
      types.push("practical");
    }
  }
  
  return { level, type: types };
}

function buildDecisionStyle(bigFive: PersonaV2['cognitive_profile']['big_five'], behavioral: any, rng: () => number): PersonaV2['cognitive_profile']['decision_style'] {
  const styles = ["logical", "emotional", "impulsive", "risk-averse", "risk-seeking", "procedural"];
  const weights = [
    bigFive.conscientiousness * 0.3 + (1 - bigFive.neuroticism) * 0.2,  // logical
    bigFive.agreeableness * 0.3 + bigFive.neuroticism * 0.2,            // emotional
    behavioral.impulsivity * 0.4,                                        // impulsive
    bigFive.neuroticism * 0.3 + (1 - behavioral.risk_tolerance) * 0.3,  // risk-averse
    behavioral.risk_tolerance * 0.4 + bigFive.openness * 0.2,           // risk-seeking
    bigFive.conscientiousness * 0.4 + (1 - bigFive.openness) * 0.2      // procedural
  ];
  
  return weightedSample(styles, weights, rng) as PersonaV2['cognitive_profile']['decision_style'];
}

function sampleMoralFoundations(bigFive: PersonaV2['cognitive_profile']['big_five'], constraints: IdentityResult['derivedConstraints'], rng: () => number): PersonaV2['cognitive_profile']['moral_foundations'] {
  // Moral foundations correlate with personality and education
  const educationLiberalBias = ["bachelors", "masters", "doctorate"].includes(constraints.education_level) ? 0.1 : -0.05;
  
  return {
    care_harm: Math.max(0.1, Math.min(0.9, sampleTrimodal(rng) + bigFive.agreeableness * 0.2)),
    fairness_cheating: Math.max(0.1, Math.min(0.9, sampleTrimodal(rng) + bigFive.conscientiousness * 0.15 + educationLiberalBias)),
    loyalty_betrayal: Math.max(0.1, Math.min(0.9, sampleTrimodal(rng) + (1 - bigFive.openness) * 0.15 - educationLiberalBias)),
    authority_subversion: Math.max(0.1, Math.min(0.9, sampleTrimodal(rng) + bigFive.conscientiousness * 0.1 - bigFive.openness * 0.2)),
    sanctity_degradation: Math.max(0.1, Math.min(0.9, sampleTrimodal(rng) + (1 - bigFive.openness) * 0.2 - educationLiberalBias * 1.5)),
    liberty_oppression: Math.max(0.1, Math.min(0.9, sampleTrimodal(rng) + bigFive.openness * 0.15 + educationLiberalBias))
  };
}

function buildTemporalOrientation(bigFive: PersonaV2['cognitive_profile']['big_five'], age: number, rng: () => number): PersonaV2['cognitive_profile']['temporal_orientation'] {
  const orientations = ["past", "present", "future", "balanced"];
  
  // Age influences: young = future, old = past, middle = balanced
  const ageWeights = age < 25 ? [0.1, 0.3, 0.5, 0.1] :
                    age < 45 ? [0.15, 0.25, 0.35, 0.25] :
                    age < 65 ? [0.25, 0.25, 0.25, 0.25] :
                              [0.4, 0.3, 0.15, 0.15];
  
  // Personality adjustments
  const weights = ageWeights.map((w, i) => {
    if (i === 0) return w + (1 - bigFive.openness) * 0.1; // past
    if (i === 1) return w + bigFive.extraversion * 0.1;   // present
    if (i === 2) return w + bigFive.conscientiousness * 0.1; // future
    return w + bigFive.agreeableness * 0.05; // balanced
  });
  
  return weightedSample(orientations, weights, rng) as PersonaV2['cognitive_profile']['temporal_orientation'];
}

function generateWorldviewSummary(bigFive: PersonaV2['cognitive_profile']['big_five'], moral: PersonaV2['cognitive_profile']['moral_foundations'], identity: PersonaV2['identity'], behavioral: any): string {
  const traits = [];
  
  if (bigFive.openness > 0.65) traits.push("progressive");
  if (bigFive.conscientiousness > 0.65) traits.push("disciplined");
  if (bigFive.agreeableness > 0.65) traits.push("cooperative");
  if (bigFive.neuroticism > 0.65) traits.push("security-focused");
  if (moral.authority_subversion < 0.35) traits.push("traditional");
  if (moral.care_harm > 0.65) traits.push("compassionate");
  if (behavioral.risk_tolerance > 0.65) traits.push("entrepreneurial");
  
  const dominant = traits.slice(0, 2).join(" and ");
  const occupation_influence = identity.occupation.includes("teacher") ? "education-focused" :
                              identity.occupation.includes("business") ? "market-oriented" :
                              identity.occupation.includes("health") ? "wellness-centered" : "pragmatic";
  
  return `${dominant} worldview with ${occupation_influence} values shaped by ${identity.location.region} culture`;
}

function buildSocialCognition(bigFive: PersonaV2['cognitive_profile']['big_five'], behavioral: any, rng: () => number): PersonaV2['social_cognition'] {
  return {
    empathy: bigFive.agreeableness > 0.65 ? "high" : bigFive.agreeableness < 0.35 ? "low" : "medium",
    theory_of_mind: bigFive.openness > 0.6 && bigFive.agreeableness > 0.5 ? "high" : 
                   bigFive.openness < 0.35 || bigFive.agreeableness < 0.35 ? "low" : "medium",
    trust_baseline: bigFive.agreeableness > 0.65 && bigFive.neuroticism < 0.5 ? "high" :
                   bigFive.neuroticism > 0.65 || bigFive.agreeableness < 0.35 ? "low" : "medium",
    conflict_orientation: bigFive.agreeableness > 0.65 ? (rng() < 0.7 ? "collaborative" : "avoidant") :
                         bigFive.agreeableness < 0.35 ? (bigFive.extraversion > 0.5 ? "confrontational" : "competitive") :
                         rng() < 0.5 ? "collaborative" : "avoidant",
    persuasion_style: bigFive.openness > 0.6 ? "story-led" :
                     bigFive.conscientiousness > 0.6 ? "evidence-led" :
                     bigFive.extraversion > 0.6 ? "authority-led" :
                     bigFive.agreeableness > 0.6 ? "reciprocity-led" : "status-led",
    attachment_style: bigFive.neuroticism < 0.35 && bigFive.agreeableness > 0.5 ? "secure" :
                     bigFive.neuroticism > 0.65 && bigFive.agreeableness > 0.5 ? "anxious" :
                     bigFive.agreeableness < 0.35 ? "avoidant" : "disorganized",
    ingroup_outgroup_sensitivity: bigFive.openness < 0.35 ? "high" : bigFive.openness > 0.65 ? "low" : "medium"
  };
}

function buildHealthProfile(bigFive: PersonaV2['cognitive_profile']['big_five'], identity: PersonaV2['identity'], behavioral: any, rng: () => number): PersonaV2['health_profile'] {
  const mental_health: PersonaV2['health_profile']['mental_health'] = ["none"];
  
  // Mental health correlations
  if (bigFive.neuroticism > 0.7 && rng() < 0.4) {
    mental_health.splice(0, 1); // Remove "none"
    mental_health.push(rng() < 0.6 ? "anxiety" : "depression");
  }
  if (behavioral.impulsivity > 0.75 && bigFive.conscientiousness < 0.4 && rng() < 0.15) {
    if (mental_health.includes("none")) mental_health.splice(0, 1);
    mental_health.push("adhd");
  }
  
  const physical_health: PersonaV2['health_profile']['physical_health'] = 
    identity.age > 50 && rng() < 0.3 ? ["chronic_illness"] : ["healthy"];
  
  const substance_use: PersonaV2['health_profile']['substance_use'] = ["none"];
  if (bigFive.openness > 0.6 && identity.age > 21 && rng() < 0.6) {
    substance_use.splice(0, 1);
    substance_use.push("alcohol");
    if (rng() < 0.2) substance_use.push("cannabis");
  }
  
  return {
    mental_health,
    physical_health,
    substance_use,
    energy_baseline: bigFive.extraversion > 0.6 && bigFive.neuroticism < 0.5 ? "high" :
                    bigFive.neuroticism > 0.6 || mental_health.some(m => ["depression", "anxiety"].includes(m)) ? "low" : "medium",
    circadian_rhythm: identity.age < 30 && bigFive.openness > 0.5 ? "evening" :
                     identity.age > 45 || bigFive.conscientiousness > 0.7 ? "morning" : "irregular"
  };
}

function buildSexualityProfile(bigFive: PersonaV2['cognitive_profile']['big_five'], identity: PersonaV2['identity'], health: PersonaV2['health_profile'], rng: () => number): PersonaV2['sexuality_profile'] {
  // Sample orientation with realistic base rates
  const orientations = ["heterosexual", "homosexual", "bisexual", "pansexual", "asexual"];
  const orientationWeights = [0.85, 0.05, 0.06, 0.02, 0.02]; // Approximate population rates
  const orientation = weightedSample(orientations, orientationWeights, rng) as PersonaV2['sexuality_profile']['orientation'];
  
  const privacy_preference = bigFive.extraversion > 0.6 && bigFive.openness > 0.5 ? "public" :
                            bigFive.extraversion < 0.4 || bigFive.neuroticism > 0.6 ? "private" : "selective";
  
  const expression = bigFive.extraversion > 0.7 && bigFive.openness > 0.6 ? "open" :
                    bigFive.extraversion < 0.3 ? "private" :
                    bigFive.conscientiousness > 0.7 ? "conservative" : "discreet";
  
  return {
    orientation,
    identity_labels: orientation === "heterosexual" ? [] : [orientation],
    expression,
    libido_level: health.mental_health.includes("depression") ? "low" :
                 bigFive.extraversion > 0.6 && health.energy_baseline === "high" ? "high" : "medium",
    relationship_norms: identity.age < 25 && bigFive.openness > 0.6 ? "casual" :
                       bigFive.conscientiousness > 0.7 ? "monogamous" :
                       bigFive.openness > 0.7 && rng() < 0.1 ? "polyamorous" : "serial_monogamy",
    flirtatiousness: bigFive.extraversion > 0.6 && bigFive.agreeableness > 0.5 ? "high" :
                    bigFive.extraversion < 0.4 ? "low" : "medium",
    privacy_preference,
    importance_in_identity: orientation === "heterosexual" ? rng() * 0.3 : 0.3 + rng() * 0.5,
    value_alignment: bigFive.openness > 0.6 ? "liberal" :
                    bigFive.conscientiousness > 0.7 && bigFive.openness < 0.4 ? "conservative" : "pragmatic",
    boundaries: {
      topics_off_limits: privacy_preference === "private" ? ["sexual history", "preferences", "relationships"] : [],
      consent_language_preferences: ["clear verbal", "enthusiastic"]
    },
    contradictions: [],
    hooks: {
      linguistic_influences: {
        register_bias: bigFive.extraversion > 0.6 ? "more_direct" : "more_indirect",
        humor_style_bias: bigFive.extraversion > 0.6 && bigFive.openness > 0.5 ? "flirtatious" : "none",
        taboo_navigation: privacy_preference === "private" ? "avoid" : "euphemistic"
      },
      reasoning_influences: {
        jealousy_sensitivity: bigFive.neuroticism * 0.8 + (1 - bigFive.agreeableness) * 0.2,
        commitment_weight: bigFive.conscientiousness * 0.7 + bigFive.agreeableness * 0.3,
        status_mating_bias: (1 - bigFive.agreeableness) * 0.5 + bigFive.extraversion * 0.3
      },
      group_behavior_influences: {
        attention_to_attraction_cues: bigFive.extraversion > 0.6 ? "high" : bigFive.extraversion < 0.4 ? "low" : "medium",
        self_disclosure_rate: privacy_preference === "public" ? "high" : privacy_preference === "private" ? "low" : "medium",
        boundary_enforcement: bigFive.conscientiousness > 0.6 ? "firm" : bigFive.agreeableness < 0.4 ? "rigid" : "soft"
      }
    }
  };
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