import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./corsHeaders.ts";
import { validateUserAuthentication } from "./authService.ts";
import { 
  handleGenerationError, 
  PersonaGenerationError 
} from "./errorHandler.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { generateKnowledgeDomains } from "../_shared/knowledgeDomains.ts";

// Statistical distributions for realistic trait assignment (copied from v4-persona-call1)
const STATISTICAL_DISTRIBUTIONS = {
  physical_appearance: {
    facial_hair: {
      no_facial_hair: { age_18_30: 0.45, age_31_50: 0.35, age_51plus: 0.25 },
      full_beard: { age_18_30: 0.25, age_31_50: 0.35, age_51plus: 0.40 },
      goatee: { age_18_30: 0.15, age_31_50: 0.15, age_51plus: 0.10 },
      mustache_only: { age_18_30: 0.05, age_31_50: 0.08, age_51plus: 0.15 },
      stubble: { age_18_30: 0.08, age_31_50: 0.05, age_51plus: 0.08 },
      van_dyke: { age_18_30: 0.02, age_31_50: 0.02, age_51plus: 0.02 }
    },
    hair_patterns: {
      male_pattern_baldness: { age_20_30: 0.25, age_31_40: 0.35, age_41_50: 0.50, age_51_60: 0.65, age_61plus: 0.80 }
    },
    hair_styles: {
      short_professional: 0.35, medium_casual: 0.25, long_hair: 0.15, buzz_cut: 0.08, styled_trendy: 0.12, unkempt: 0.05
    },
    facial_features: {
      nose_size: { small: 0.20, average: 0.60, large: 0.15, prominent: 0.05 },
      ear_prominence: { close_set: 0.70, slightly_prominent: 0.20, very_prominent: 0.10 },
      jaw_type: { narrow: 0.15, average: 0.60, strong: 0.20, prominent: 0.05 },
      eye_shape: { narrow: 0.15, average: 0.65, wide: 0.15, deep_set: 0.05 },
      lip_thickness: { thin: 0.20, average: 0.60, full: 0.15, very_full: 0.05 },
      cheekbones: { low: 0.25, average: 0.50, high: 0.20, very_prominent: 0.05 }
    },
    attractiveness_level: {
      level_1_2: 0.05, level_3_4: 0.20, level_5_6: 0.50, level_7_8: 0.20, level_9_10: 0.05
    },
    skin_characteristics: {
      acne_scarring: { age_18_25: 0.15, age_26_40: 0.08, age_41plus: 0.05 },
      moles_birthmarks: 0.30, visible_scars: 0.15
    }
  },
  physical_health: {
    bmi_distributions: {
      underweight: { min: 16.5, max: 18.4, probability: 0.02 },
      normal: { min: 18.5, max: 24.9, probability: 0.32 },
      overweight: { min: 25.0, max: 29.9, probability: 0.36 },
      obese_class_1: { min: 30.0, max: 34.9, probability: 0.20 },
      obese_class_2: { min: 35.0, max: 39.9, probability: 0.07 },
      obese_class_3: { min: 40.0, max: 50.0, probability: 0.03 }
    },
    chronic_conditions: {
      diabetes: { overall: 0.11 }, hypertension: { overall: 0.47 }, arthritis: { overall: 0.23 }, chronic_pain: { overall: 0.20 }
    },
    sleep_issues: { insufficient_sleep: 0.35 }
  },
  mental_health: {
    clinical_conditions: {
      anxiety_disorders: { overall: 0.18, age_18_25: 0.25 },
      depression: { overall: 0.08, age_18_25: 0.13 },
      adhd: { overall: 0.04 }
    },
    stress_factors: { work_dissatisfaction: 0.32 }
  },
  substance_patterns: {
    alcohol: { abstain: 0.30, casual: 0.40, regular: 0.20, problematic: 0.10 },
    tobacco: { cigarettes: 0.12, vaping: 0.15, former_smoker: 0.22 }
  },
  consumption_habits: {
    diet_quality: { poor: 0.40, mixed: 0.35, good: 0.20, restrictive: 0.05 },
    food_security: { secure: 0.89, low_security: 0.07, very_low_security: 0.04 }
  },
  financial_reality: {
    debt_burden: {
      student_loans: { has_debt: 0.43, high_burden: 0.18 },
      credit_card: { carries_balance: 0.47 },
      medical_debt: 0.23
    },
    employment_stress: { job_insecurity: 0.22, underemployed: 0.07 }
  }
};

const AGE_MODIFIERS = {
  "18-25": { mental_health: { anxiety: 1.4, depression: 1.6 }, substance_use: { vaping: 3.0 } },
  "26-40": { work_stress: 1.2, caregiving_burden: 1.5 },
  "41-65": { chronic_conditions: 1.8 },
  "65+": { chronic_conditions: 2.5 }
};

interface EnhancementOptions {
  enhanceEmotionalTriggers?: boolean;
  enhanceInterviewResponses?: boolean;
  enhanceTraitProfile?: boolean;
  enhanceMetadata?: boolean;
  enhanceKnowledgeDomains?: boolean;
}

// Trait assignment and generation functions (copied from v4-persona-call1)
function assignRealisticTraits(persona: any, demographics: any): any {
  const updatedPersona = { ...persona };
  const ageGroup = getAgeGroup(demographics.age);
  const modifiers = AGE_MODIFIERS[ageGroup] || {};
  
  assignPhysicalHealth(updatedPersona, demographics, modifiers);
  assignMentalHealth(updatedPersona, demographics, modifiers);
  assignConsumptionPatterns(updatedPersona, demographics, modifiers);
  assignFinancialStressors(updatedPersona, demographics, modifiers);
  assignPhysicalAppearance(updatedPersona, demographics, modifiers);
  ensureTraitConsistency(updatedPersona);
  
  return updatedPersona;
}

function assignPhysicalHealth(persona: any, demographics: any, modifiers: any) {
  const dist = STATISTICAL_DISTRIBUTIONS.physical_health;
  
  // Only assign BMI if missing or invalid
  if (!persona.health_profile.bmi || persona.health_profile.bmi < 16 || persona.health_profile.bmi > 50) {
    const bmiRoll = Math.random();
    const bmiDist = dist.bmi_distributions;
    let cumulativeProbability = 0;
    let assignedBMI: number | null = null;
    
    for (const [category, config] of Object.entries(bmiDist)) {
      cumulativeProbability += config.probability;
      if (bmiRoll <= cumulativeProbability) {
        assignedBMI = config.min + Math.random() * (config.max - config.min);
        break;
      }
    }
    
    if (assignedBMI === null) {
      assignedBMI = 23.0;
    }
    
    persona.health_profile.bmi = Math.round(assignedBMI * 10) / 10;
  }
  
  // Chronic conditions (only if missing)
  if (!persona.health_profile.chronic_conditions || persona.health_profile.chronic_conditions.length === 0) {
    const conditions = [];
    const ageMultiplier = demographics.age > 65 ? 2.5 : demographics.age > 40 ? 1.5 : 1.0;
    
    if (Math.random() < dist.chronic_conditions.hypertension.overall * ageMultiplier) {
      conditions.push("hypertension");
      if (persona.health_profile.medications.includes("none") || persona.health_profile.medications.includes("N/A")) {
        persona.health_profile.medications = ["lisinopril"];
      } else {
        persona.health_profile.medications.push("lisinopril");
      }
    }
    
    if (Math.random() < dist.chronic_conditions.diabetes.overall * ageMultiplier) {
      conditions.push("type_2_diabetes");
      persona.health_profile.medications.push("metformin");
    }
    
    persona.health_profile.chronic_conditions = conditions.length > 0 ? conditions : ["none"];
  }
}

function assignMentalHealth(persona: any, demographics: any, modifiers: any) {
  const dist = STATISTICAL_DISTRIBUTIONS.mental_health;
  
  // Only assign if missing
  if (!persona.health_profile.mental_health_flags || persona.health_profile.mental_health_flags.length === 0) {
    const flags = [];
    
    const anxietyRate = dist.clinical_conditions.anxiety_disorders.overall * (modifiers.mental_health?.anxiety || 1.0);
    if (Math.random() < anxietyRate) {
      flags.push("generalized_anxiety");
      if (!persona.emotional_profile.stress_responses.includes("overthinking")) {
        persona.emotional_profile.stress_responses.push("overthinking");
      }
    }
    
    const depressionRate = dist.clinical_conditions.depression.overall * (modifiers.mental_health?.depression || 1.0);
    if (Math.random() < depressionRate) {
      flags.push("depression");
    }
    
    persona.health_profile.mental_health_flags = flags.length > 0 ? flags : ["none"];
  }
}

function assignConsumptionPatterns(persona: any, demographics: any, modifiers: any) {
  const dist = STATISTICAL_DISTRIBUTIONS;
  
  // Only assign substance use if missing
  if (!persona.health_profile.substance_use || !persona.health_profile.substance_use.alcohol) {
    const alcoholRoll = Math.random();
    if (alcoholRoll < dist.substance_patterns.alcohol.abstain) {
      persona.health_profile.substance_use.alcohol = "none";
    } else if (alcoholRoll < dist.substance_patterns.alcohol.abstain + dist.substance_patterns.alcohol.casual) {
      persona.health_profile.substance_use.alcohol = "occasional";
    } else {
      persona.health_profile.substance_use.alcohol = "regular";
    }
    
    if (Math.random() < dist.substance_patterns.tobacco.cigarettes) {
      persona.health_profile.substance_use.cigarettes = "yes";
    } else {
      persona.health_profile.substance_use.cigarettes = "no";
    }
    
    const vapingRate = dist.substance_patterns.tobacco.vaping * (modifiers.substance_use?.vaping || 1.0);
    persona.health_profile.substance_use.vaping = Math.random() < vapingRate ? "yes" : "no";
  }
  
  // Only assign diet pattern if missing
  if (!persona.health_profile.diet_pattern) {
    const dietRoll = Math.random();
    if (dietRoll < dist.consumption_habits.diet_quality.poor) {
      persona.health_profile.diet_pattern = "poor";
    } else if (dietRoll < dist.consumption_habits.diet_quality.poor + dist.consumption_habits.diet_quality.mixed) {
      persona.health_profile.diet_pattern = "mixed";
    } else {
      persona.health_profile.diet_pattern = "healthy";
    }
  }
}

function assignFinancialStressors(persona: any, demographics: any, modifiers: any) {
  const dist = STATISTICAL_DISTRIBUTIONS.financial_reality;
  
  // Only assign if missing
  if (!persona.money_profile.financial_stressors || persona.money_profile.financial_stressors.length === 0) {
    const stressors = [];
    
    if (Math.random() < dist.debt_burden.student_loans.has_debt) {
      stressors.push("student_loans");
    }
    if (Math.random() < dist.debt_burden.credit_card.carries_balance) {
      stressors.push("credit_card_debt");
    }
    if (Math.random() < dist.employment_stress.job_insecurity) {
      stressors.push("job_insecurity");
    }
    
    persona.money_profile.financial_stressors = stressors.length > 0 ? stressors : ["none"];
  }
}

function assignPhysicalAppearance(persona: any, demographics: any, modifiers: any) {
  const { age, gender } = demographics;
  const dist = STATISTICAL_DISTRIBUTIONS.physical_appearance;
  
  if (!persona.health_profile.physical_appearance) {
    persona.health_profile.physical_appearance = {};
  }
  
  // Only assign if missing
  if (!persona.health_profile.physical_appearance.facial_hair && gender?.toLowerCase() === 'male') {
    const ageKey = age <= 30 ? 'age_18_30' : age <= 50 ? 'age_31_50' : 'age_51plus';
    const facialHairOptions = [
      { type: 'clean_shaven', probability: dist.facial_hair.no_facial_hair[ageKey] },
      { type: 'full_beard', probability: dist.facial_hair.full_beard[ageKey] },
      { type: 'goatee', probability: dist.facial_hair.goatee[ageKey] },
      { type: 'mustache', probability: dist.facial_hair.mustache_only[ageKey] }
    ];
    persona.health_profile.physical_appearance.facial_hair = selectByProbability(facialHairOptions);
  }
  
  // Only assign if missing
  if (!persona.health_profile.physical_appearance.hair_style) {
    const hairStyleOptions = Object.entries(dist.hair_styles).map(([style, probability]) => ({
      type: style, probability: probability as number
    }));
    persona.health_profile.physical_appearance.hair_style = selectByProbability(hairStyleOptions);
  }
  
  // Only assign if missing
  if (!persona.health_profile.physical_appearance.attractiveness_level) {
    const attractivenessOptions = [
      { level: 2, probability: dist.attractiveness_level.level_1_2 },
      { level: 4, probability: dist.attractiveness_level.level_3_4 },
      { level: 6, probability: dist.attractiveness_level.level_5_6 },
      { level: 8, probability: dist.attractiveness_level.level_7_8 },
      { level: 10, probability: dist.attractiveness_level.level_9_10 }
    ];
    const selectedAttractiveness = selectByProbability(attractivenessOptions);
    persona.health_profile.physical_appearance.attractiveness_level = selectedAttractiveness.level || selectedAttractiveness;
  }
  
  // Only assign if missing
  if (!persona.health_profile.physical_appearance.distinctive_features) {
    const distinctiveFeatures = [];
    if (Math.random() < dist.facial_features.nose_size.large + dist.facial_features.nose_size.prominent) {
      distinctiveFeatures.push('prominent_nose');
    }
    if (Math.random() < dist.facial_features.ear_prominence.very_prominent) {
      distinctiveFeatures.push('prominent_ears');
    }
    persona.health_profile.physical_appearance.distinctive_features = distinctiveFeatures;
  }
}

function ensureTraitConsistency(persona: any) {
  if (persona.health_profile.chronic_conditions.includes("type_2_diabetes")) {
    if (persona.health_profile.diet_pattern === "poor") {
      persona.health_profile.diet_pattern = "mixed";
    }
  }
  
  if (persona.health_profile.mental_health_flags.includes("generalized_anxiety")) {
    if (persona.relationships?.friend_network) {
      persona.relationships.friend_network.size = "small";
    }
  }
}

function selectByProbability(options: Array<{type?: string, level?: number, probability: number}>): any {
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (const option of options) {
    cumulativeProbability += option.probability;
    if (random <= cumulativeProbability) {
      return option.type || option.level || option;
    }
  }
  return options[0].type || options[0].level || options[0];
}

function getAgeGroup(age: number): string {
  if (age <= 25) return "18-25";
  if (age <= 40) return "26-40";  
  if (age <= 65) return "41-65";
  return "65+";
}

function ensureScaffolding(persona: any) {
  persona.identity = persona.identity || {};
  persona.identity.location = persona.identity.location || {};
  if (!persona.identity.income_bracket) persona.identity.income_bracket = 'unspecified';

  persona.health_profile = persona.health_profile || {};
  persona.health_profile.medications = Array.isArray(persona.health_profile.medications) ? persona.health_profile.medications : [];
  persona.health_profile.chronic_conditions = Array.isArray(persona.health_profile.chronic_conditions) ? persona.health_profile.chronic_conditions : [];
  persona.health_profile.mental_health_flags = Array.isArray(persona.health_profile.mental_health_flags) ? persona.health_profile.mental_health_flags : [];
  persona.health_profile.substance_use = persona.health_profile.substance_use || {};
  persona.health_profile.physical_appearance = persona.health_profile.physical_appearance || {};

  persona.money_profile = persona.money_profile || {};
  persona.money_profile.financial_stressors = Array.isArray(persona.money_profile.financial_stressors) ? persona.money_profile.financial_stressors : [];

  persona.relationships = persona.relationships || {};
  persona.emotional_profile = persona.emotional_profile || { stress_responses: [], negative_triggers: [], positive_triggers: [] };

  persona.communication_style = persona.communication_style || {};
  persona.communication_style.linguistic_signature = persona.communication_style.linguistic_signature || {};
  persona.communication_style.linguistic_signature.signature_phrases = Array.isArray(persona.communication_style.linguistic_signature.signature_phrases) ? persona.communication_style.linguistic_signature.signature_phrases : [];
  persona.communication_style.style_markers = persona.communication_style.style_markers || {};
  persona.communication_style.style_markers.signature_phrases = Array.isArray(persona.communication_style.style_markers.signature_phrases) ? persona.communication_style.style_markers.signature_phrases : [];
}

function removeSignaturePhrases(personaData: any) {
  const forbiddenRaw = [
    "I believe that","In my experience","I always","I never",
    "You know what I mean?","It's not that complicated."
  ];
  const normalize = (s: string) => s?.toString().trim().replace(/^[\'\"]|[\'\"]$/g,'').toLowerCase();
  const forbidden = new Set(forbiddenRaw.map(normalize));

  const purge = (arr?: string[]) => Array.isArray(arr) ? arr.filter(p => !forbidden.has(normalize(p))) : [];

  if (personaData.communication_style?.linguistic_signature) {
     personaData.communication_style.linguistic_signature.signature_phrases = purge(
       personaData.communication_style.linguistic_signature.signature_phrases
     );
  }
  if (personaData.communication_style?.style_markers) {
     personaData.communication_style.style_markers.signature_phrases = purge(
       personaData.communication_style.style_markers.signature_phrases
     );
  }
}

// DISABLED: Validation contamination removed - converted to read-only validation
function validatePersonaReadOnly(persona: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields without modifying
  if (!persona.identity?.income_bracket || persona.identity.income_bracket === 'unspecified') {
    errors.push('Missing or invalid income_bracket');
  }

  const needsHealth = !persona.health_profile?.bmi || persona.health_profile.bmi < 16 || persona.health_profile.bmi > 50;
  const needsAppearance = !persona.health_profile?.physical_appearance?.hair_style || !persona.health_profile?.physical_appearance?.attractiveness_level;

  if (needsHealth) {
    errors.push('Invalid or missing health profile BMI');
  }
  
  if (needsAppearance) {
    errors.push('Missing physical appearance data');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// DISABLED: Data modification function - now read-only validation only
function validateAndRepair(persona: any): string[] {
  // This function previously modified persona data - now disabled
  // Use validatePersonaReadOnly instead for pass/fail validation
  console.warn('⚠️ validateAndRepair is disabled - use validatePersonaReadOnly for read-only validation');
  return [];
}

function generateRealisticIncomeRange(occupation: string, age: number, region: string): string {
  const baseRanges = {
    "software engineer": ["60000-80000", "80000-120000", "120000-180000"],
    "teacher": ["35000-50000", "45000-65000", "55000-75000"],
    "nurse": ["50000-70000", "65000-85000", "75000-95000"],
    "manager": ["55000-75000", "70000-100000", "90000-140000"],
    "analyst": ["45000-65000", "60000-85000", "80000-110000"],
    "default": ["35000-55000", "50000-75000", "65000-95000"]
  };
  
  const occupationKey = Object.keys(baseRanges).find(key => 
    occupation.toLowerCase().includes(key)) || "default";
  
  const ranges = baseRanges[occupationKey];
  
  if (age < 30) return ranges[0];
  if (age < 45) return ranges[1];
  return ranges[2];
}

async function generateV4PersonaTraits(basePersona: any, missingTraits: string[]): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  console.log('🔄 Generating missing traits using V4 generation logic:', missingTraits);

  const systemPrompt = `You are a persona enhancement AI. Generate ONLY the missing traits for an existing persona. 
  
CRITICAL: Generate realistic, specific data for ONLY these missing sections: ${missingTraits.join(', ')}

For income_bracket, use specific ranges like "45000-65000", "70000-95000", "100000-140000" - NEVER use "unspecified".
For bmi, use numeric values between 16.0-50.0 (e.g., 22.3, 28.1, 35.7).
For physical_appearance, include specific traits like facial_hair, hair_style, attractiveness_level, distinctive_features.

Return valid JSON with ONLY the missing sections requested. Do not include existing data.`;

  const userPrompt = `Existing persona: ${JSON.stringify(basePersona, null, 2)}

Generate ONLY these missing traits: ${missingTraits.join(', ')}

Context: This is a ${basePersona.identity?.age || 'unknown age'} year old ${basePersona.identity?.gender || 'person'} who works as a ${basePersona.identity?.occupation || 'unknown occupation'}.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const generatedContent = data.choices[0].message.content;
  
  try {
    return JSON.parse(generatedContent);
  } catch (error) {
    console.warn('Failed to parse JSON, attempting extraction...', error);
    const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to extract valid JSON from OpenAI response');
  }
}

function analyzePersonaGaps(persona: any): string[] {
  const gaps: string[] = [];
  
  // Check income bracket
  if (!persona.identity?.income_bracket || persona.identity.income_bracket === 'unspecified') {
    gaps.push('income_bracket');
  }
  
  // Check BMI
  if (!persona.health_profile?.bmi || persona.health_profile.bmi < 16 || persona.health_profile.bmi > 50) {
    gaps.push('health_profile');
  }
  
  // Check for forbidden signature phrases
  const hasForbiddenPhrases = persona.communication_style?.linguistic_signature?.signature_phrases?.some((phrase: string) => 
    ["I believe that", "In my experience", "I always", "I never"].some(forbidden => phrase.includes(forbidden))
  ) || persona.communication_style?.style_markers?.signature_phrases?.some((phrase: string) => 
    ["I believe that", "In my experience", "I always", "I never"].some(forbidden => phrase.includes(forbidden))
  );
  
  if (hasForbiddenPhrases) {
    gaps.push('signature_phrases');
  }
  
  // Check physical appearance
  if (!persona.health_profile?.physical_appearance || 
      !persona.health_profile.physical_appearance.attractiveness_level ||
      !persona.health_profile.physical_appearance.hair_style) {
    gaps.push('physical_appearance');
  }
  
  return gaps;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security validation: Verify user authentication
    const authHeader = req.headers.get('Authorization');
    const { user, supabase } = await validateUserAuthentication(authHeader);

    const { personaId, options } = await req.json() as { 
      personaId: string; 
      options: EnhancementOptions;
    };

    if (!personaId) {
      throw new PersonaGenerationError('validation', 'Persona ID is required');
    }

    console.log('=== STARTING V4 PERSONA ENHANCEMENT ===');
    console.log(`User: ${user.id}`);
    console.log(`Persona ID: ${personaId}`);
    console.log(`Enhancement options:`, options);

    // Fetch the existing persona
    const { data: existingPersona, error: fetchError } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('persona_id', personaId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingPersona) {
      throw new PersonaGenerationError('validation', 'Persona not found or access denied');
    }

let enhancedPersona = { ...(existingPersona.full_profile || {}) };
const enhancementLog: string[] = [];

console.log('🧱 Scaffolding persona for enhancement...');
ensureScaffolding(enhancedPersona);

console.log('🔍 Analyzing persona gaps...');
const gaps = analyzePersonaGaps(enhancedPersona);
console.log('📋 Identified gaps:', gaps);

    // PHASE 1: Fix Core Data Issues (Income, BMI, Signature Phrases)
    console.log('🔧 Phase 1: Fixing core data issues...');
    
    // Fix income bracket
    if (gaps.includes('income_bracket') || !enhancedPersona.identity?.income_bracket || enhancedPersona.identity.income_bracket === 'unspecified') {
      const newIncome = generateRealisticIncomeRange(
        enhancedPersona.identity?.occupation || 'professional',
        enhancedPersona.identity?.age || 35,
        enhancedPersona.identity?.location?.region || 'California'
      );
      enhancedPersona.identity.income_bracket = newIncome;
      enhancementLog.push(`Fixed income bracket: ${newIncome}`);
      console.log(`✅ Fixed income bracket: ${newIncome}`);
    }

    // Apply statistical trait assignment for missing health/appearance data
    if (gaps.includes('health_profile') || gaps.includes('physical_appearance')) {
      console.log('🎯 Applying statistical trait assignment...');
      const demographics = {
        age: enhancedPersona.identity?.age || 35,
        income: enhancedPersona.identity?.income_bracket,
        region: enhancedPersona.identity?.location?.region || 'California',
        ethnicity: enhancedPersona.identity?.ethnicity,
        gender: enhancedPersona.identity?.gender
      };
      
      // DISABLED: Statistical contamination system - preserving OpenAI's authentic generation
      // enhancedPersona = assignRealisticTraits(enhancedPersona, demographics);
      // enhancementLog.push('Applied statistical trait assignment for health and appearance');
      console.log('✅ Preserving original OpenAI traits (statistical override disabled)');
    }

    // Remove forbidden signature phrases
    if (gaps.includes('signature_phrases')) {
      removeSignaturePhrases(enhancedPersona);
      enhancementLog.push('Removed forbidden signature phrases');
      console.log('✅ Cleaned signature phrases');
    }

    // PHASE 2: Generate Missing Traits via OpenAI (if requested)
    const traitsToGenerate = [];
    
    if (options.enhanceEmotionalTriggers && !enhancedPersona.emotional_triggers) {
      traitsToGenerate.push('emotional_triggers');
    }
    
    if (options.enhanceInterviewResponses && !enhancedPersona.interview_sections) {
      traitsToGenerate.push('interview_sections');
    }
    
    if (options.enhanceTraitProfile && !enhancedPersona.trait_profile) {
      traitsToGenerate.push('trait_profile');
    }
    
    if (options.enhanceMetadata && (!enhancedPersona.metadata || Object.keys(enhancedPersona.metadata).length < 5)) {
      traitsToGenerate.push('metadata');
    }

    if (traitsToGenerate.length > 0) {
      console.log('🔄 Phase 2: Generating missing traits via OpenAI...');
      try {
        const generatedTraits = await generateV4PersonaTraits(enhancedPersona, traitsToGenerate);
        
        // Merge generated traits
        Object.keys(generatedTraits).forEach(key => {
          enhancedPersona[key] = generatedTraits[key];
          enhancementLog.push(`Generated ${key}`);
          console.log(`✅ Generated ${key}`);
        });
      } catch (error) {
        console.warn('⚠️ Failed to generate traits via OpenAI:', error);
        enhancementLog.push('Failed to generate some traits via OpenAI');
      }
    }

    // PHASE 3: Knowledge Domains Enhancement
    if (options.enhanceKnowledgeDomains) {
      console.log('🔄 Phase 3: Enhancing knowledge domains...');
      try {
        // Use the shared knowledge domains generator
        const knowledgeResult = await generateKnowledgeDomains(enhancedPersona);
        
        if (knowledgeResult.knowledge_domains) {
          if (!enhancedPersona.metadata) {
            enhancedPersona.metadata = {};
          }
          enhancedPersona.metadata.knowledge_domains = knowledgeResult.knowledge_domains;
          enhancementLog.push('Enhanced knowledge domains');
          console.log('✅ Knowledge domains enhanced');
        }
      } catch (error) {
        console.warn('⚠️ Failed to enhance knowledge domains:', error);
        enhancementLog.push('Failed to enhance knowledge domains');
      }
    }

// DISABLED: Validation contamination removed - converted to read-only validation
// Final validation and repair before saving
console.log('🧪 Final validation pass...');
// const validationFixes = validateAndRepair(enhancedPersona);
// if (validationFixes.length) {
//   enhancementLog.push(`Final fixes: ${validationFixes.join(', ')}`);
//   console.log('✅ Final fixes applied:', validationFixes);
// }

// READ-ONLY VALIDATION: Check if persona is valid, reject if not
const validationResult = validatePersonaReadOnly(enhancedPersona);
if (!validationResult.isValid) {
  console.error('❌ Persona failed read-only validation:', validationResult.errors);
  throw new PersonaGenerationError('validation', `Persona validation failed: ${validationResult.errors.join(', ')}`);
}

// Save the enhanced persona
console.log('💾 Saving enhanced persona...');
const { data: updatedPersona, error: updateError } = await supabase
  .from('v4_personas')
  .update({
    full_profile: enhancedPersona
  })
  .eq('persona_id', personaId)
  .eq('user_id', user.id)
  .select()
      .single();

    if (updateError) {
      throw new PersonaGenerationError('database', `Failed to save enhanced persona: ${updateError.message}`);
    }

    console.log('✅ V4 PERSONA ENHANCEMENT COMPLETE');
    console.log('Final enhancement log:', enhancementLog);

    return new Response(
      JSON.stringify({ 
        success: true,
        persona: updatedPersona,
        enhancementLog
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Enhancement error:', error);
    
    if (error instanceof PersonaGenerationError) {
      return handleGenerationError(error);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred during enhancement',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});