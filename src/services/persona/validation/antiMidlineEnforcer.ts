import { PersonaV2 } from '../../../types/persona-v2';

export interface AntiMidlineResult {
  passesValidation: boolean;
  adjustmentsMade: number;
  traitsOutsideMidrange: number;
  totalTraits: number;
  adjustedFields: string[];
}

/**
 * Enforces anti-midline policy: 30% low (0.05-0.30), 40% mid (0.35-0.65), 30% high (0.70-0.95)
 * Requires at least 6 traits outside midrange for personality contrast
 */
export function enforceAntiMidline(persona: PersonaV2, seed: string): AntiMidlineResult {
  const rng = createSeededRNG(hashSeed(seed + '_antimidline'));
  const adjustedFields: string[] = [];
  let adjustmentsMade = 0;
  
  // Extract all trait values that should follow anti-midline distribution
  const traitValues = extractTraitValues(persona);
  const originalOutsideMidrange = countOutsideMidrange(traitValues);
  const totalTraits = Object.keys(traitValues).length;
  
  // Require at least 55% of traits outside midrange (approximately 6 out of 11 key traits)
  const requiredOutside = Math.ceil(totalTraits * 0.55);
  
  if (originalOutsideMidrange >= requiredOutside) {
    return {
      passesValidation: true,
      adjustmentsMade: 0,
      traitsOutsideMidrange: originalOutsideMidrange,
      totalTraits,
      adjustedFields: []
    };
  }
  
  // Need to adjust traits to increase contrast
  const traitsToAdjust = requiredOutside - originalOutsideMidrange;
  const midrangeTraits = Object.entries(traitValues).filter(([_, value]) => 
    value >= 0.35 && value <= 0.65
  );
  
  // Randomly select traits to push to extremes
  const traitsToModify = shuffleArray(midrangeTraits, rng).slice(0, traitsToAdjust);
  
  traitsToModify.forEach(([traitPath, currentValue]) => {
    // Push to extreme: 50/50 chance of low vs high
    const newValue = rng() < 0.5 ? 
      sampleLowExtreme(rng) :    // 0.05-0.30
      sampleHighExtreme(rng);    // 0.70-0.95
    
    // Apply the change to the persona object
    setNestedValue(persona, traitPath, newValue);
    adjustedFields.push(traitPath);
    adjustmentsMade++;
  });
  
  const finalTraitValues = extractTraitValues(persona);
  const finalOutsideMidrange = countOutsideMidrange(finalTraitValues);
  
  return {
    passesValidation: finalOutsideMidrange >= requiredOutside,
    adjustmentsMade,
    traitsOutsideMidrange: finalOutsideMidrange,
    totalTraits,
    adjustedFields
  };
}

/**
 * Validates that trait distributions follow anti-midline policy across population
 */
export function validateDistributionCompliance(personas: PersonaV2[]): {
  lowPercentage: number;
  midPercentage: number;
  highPercentage: number;
  passesDistributionTest: boolean;
  recommendations: string[];
} {
  if (personas.length === 0) {
    return {
      lowPercentage: 0,
      midPercentage: 0,
      highPercentage: 0,
      passesDistributionTest: false,
      recommendations: ["No personas to validate"]
    };
  }
  
  // Analyze Big Five distributions across all personas
  const allTraitValues: number[] = [];
  
  personas.forEach(persona => {
    const traitValues = extractTraitValues(persona);
    allTraitValues.push(...Object.values(traitValues));
  });
  
  const lowCount = allTraitValues.filter(v => v >= 0.05 && v <= 0.30).length;
  const midCount = allTraitValues.filter(v => v >= 0.35 && v <= 0.65).length;
  const highCount = allTraitValues.filter(v => v >= 0.70 && v <= 0.95).length;
  const total = allTraitValues.length;
  
  const lowPercentage = (lowCount / total) * 100;
  const midPercentage = (midCount / total) * 100;
  const highPercentage = (highCount / total) * 100;
  
  // Target: 30% low, 40% mid, 30% high (±5% tolerance)
  const lowInRange = lowPercentage >= 25 && lowPercentage <= 35;
  const midInRange = midPercentage >= 35 && midPercentage <= 45;
  const highInRange = highPercentage >= 25 && highPercentage <= 35;
  
  const passesDistributionTest = lowInRange && midInRange && highInRange;
  
  const recommendations: string[] = [];
  if (!lowInRange) {
    recommendations.push(`Low range (${lowPercentage.toFixed(1)}%) should be 25-35%`);
  }
  if (!midInRange) {
    recommendations.push(`Mid range (${midPercentage.toFixed(1)}%) should be 35-45%`);
  }
  if (!highInRange) {
    recommendations.push(`High range (${highPercentage.toFixed(1)}%) should be 25-35%`);
  }
  
  return {
    lowPercentage,
    midPercentage,
    highPercentage,
    passesDistributionTest,
    recommendations
  };
}

function extractTraitValues(persona: PersonaV2): Record<string, number> {
  const traits: Record<string, number> = {};
  
  // Big Five personality traits
  Object.entries(persona.cognitive_profile.big_five).forEach(([trait, value]) => {
    traits[`cognitive_profile.big_five.${trait}`] = value;
  });
  
  // Key behavioral modifiers from sexuality profile
  if (persona.sexuality_profile) {
    traits['sexuality_profile.importance_in_identity'] = persona.sexuality_profile.importance_in_identity;
    
    if (persona.sexuality_profile.hooks?.reasoning_influences) {
      const reasoning = persona.sexuality_profile.hooks.reasoning_influences;
      traits['sexuality_profile.hooks.reasoning_influences.jealousy_sensitivity'] = reasoning.jealousy_sensitivity;
      traits['sexuality_profile.hooks.reasoning_influences.commitment_weight'] = reasoning.commitment_weight;
      traits['sexuality_profile.hooks.reasoning_influences.status_mating_bias'] = reasoning.status_mating_bias;
    }
  }
  
  // Reasoning modifiers baseline
  if (persona.reasoning_modifiers) {
    Object.entries(persona.reasoning_modifiers.baseline).forEach(([key, value]) => {
      if (typeof value === 'number') {
        traits[`reasoning_modifiers.baseline.${key}`] = value;
      }
    });
  }
  
  return traits;
}

function countOutsideMidrange(traitValues: Record<string, number>): number {
  return Object.values(traitValues).filter(value => 
    value < 0.35 || value > 0.65
  ).length;
}

function sampleLowExtreme(rng: () => number): number {
  // Beta(2,6) approximation for low mode: 0.05-0.30
  return 0.05 + 0.25 * Math.pow(rng(), 2);
}

function sampleHighExtreme(rng: () => number): number {
  // Beta(6,2) approximation for high mode: 0.70-0.95
  return 0.70 + 0.25 * (1 - Math.pow(rng(), 2));
}

function setNestedValue(obj: any, path: string, value: number): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
}

function shuffleArray<T>(array: T[], rng: () => number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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