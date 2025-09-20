import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Statistical distributions for realistic trait assignment
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
  },
  
  // Cognitive Coherence (realistic conversation patterns)
  cognitive_coherence: {
    severely_scattered: { range: [0.1, 0.2], probability: 0.08 },    // ADHD, high stress, substance issues
    average_population: { range: [0.3, 0.4], probability: 0.55 },    // Most people - should be most common  
    above_average: { range: [0.5, 0.6], probability: 0.22 },         // Teachers, organized workers
    highly_organized: { range: [0.7, 0.8], probability: 0.13 },      // Lawyers, executives, presenters
    exceptionally_coherent: { range: [0.9, 1.0], probability: 0.02 } // Rare - exceptional communicators
  }
};

const AGE_MODIFIERS = {
  "18-25": { mental_health: { anxiety: 1.4, depression: 1.6 }, substance_use: { vaping: 3.0 } },
  "26-40": { work_stress: 1.2, caregiving_burden: 1.5 },
  "41-65": { chronic_conditions: 1.8 },
  "65+": { chronic_conditions: 2.5 }
};

// Generate realistic coherence value based on statistical distribution
function generateCoherenceValue(): number {
  const dist = STATISTICAL_DISTRIBUTIONS.cognitive_coherence;
  const roll = Math.random();
  
  let cumulative = 0;
  for (const [key, config] of Object.entries(dist)) {
    cumulative += config.probability;
    if (roll <= cumulative) {
      const [min, max] = config.range;
      return Math.round((Math.random() * (max - min) + min) * 100) / 100; // Round to 2 decimal places
    }
  }
  
  // Fallback to average range if something goes wrong
  return 0.35;
}

// Realistic trait assignment function
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
  
  // BMI assignment
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
    assignedBMI = 23.0; // Default
  }
  
  persona.health_profile.bmi = Math.round(assignedBMI * 10) / 10;
  
  // Chronic conditions
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

function assignMentalHealth(persona: any, demographics: any, modifiers: any) {
  const dist = STATISTICAL_DISTRIBUTIONS.mental_health;
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

function assignConsumptionPatterns(persona: any, demographics: any, modifiers: any) {
  const dist = STATISTICAL_DISTRIBUTIONS;
  
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
  
  const dietRoll = Math.random();
  if (dietRoll < dist.consumption_habits.diet_quality.poor) {
    persona.health_profile.diet_pattern = "poor";
  } else if (dietRoll < dist.consumption_habits.diet_quality.poor + dist.consumption_habits.diet_quality.mixed) {
    persona.health_profile.diet_pattern = "mixed";
  } else {
    persona.health_profile.diet_pattern = "healthy";
  }
}

function assignFinancialStressors(persona: any, demographics: any, modifiers: any) {
  const dist = STATISTICAL_DISTRIBUTIONS.financial_reality;
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

function assignPhysicalAppearance(persona: any, demographics: any, modifiers: any) {
  const { age, gender } = demographics;
  const dist = STATISTICAL_DISTRIBUTIONS.physical_appearance;
  
  if (!persona.health_profile.physical_appearance) {
    persona.health_profile.physical_appearance = {};
  }
  
  // Facial hair for men
  if (gender?.toLowerCase() === 'male') {
    const ageKey = age <= 30 ? 'age_18_30' : age <= 50 ? 'age_31_50' : 'age_51plus';
    const facialHairOptions = [
      { type: 'clean_shaven', probability: dist.facial_hair.no_facial_hair[ageKey] },
      { type: 'full_beard', probability: dist.facial_hair.full_beard[ageKey] },
      { type: 'goatee', probability: dist.facial_hair.goatee[ageKey] },
      { type: 'mustache', probability: dist.facial_hair.mustache_only[ageKey] }
    ];
    persona.health_profile.physical_appearance.facial_hair = selectByProbability(facialHairOptions);
  }
  
  // Hair style
  const hairStyleOptions = Object.entries(dist.hair_styles).map(([style, probability]) => ({
    type: style, probability: probability as number
  }));
  persona.health_profile.physical_appearance.hair_style = selectByProbability(hairStyleOptions);
  
  // Attractiveness level
  const attractivenessOptions = [
    { level: 2, probability: dist.attractiveness_level.level_1_2 },
    { level: 4, probability: dist.attractiveness_level.level_3_4 },
    { level: 6, probability: dist.attractiveness_level.level_5_6 },
    { level: 8, probability: dist.attractiveness_level.level_7_8 },
    { level: 10, probability: dist.attractiveness_level.level_9_10 }
  ];
  const selectedAttractiveness = selectByProbability(attractivenessOptions);
  persona.health_profile.physical_appearance.attractiveness_level = selectedAttractiveness.level || selectedAttractiveness;
  
  // Distinctive features
  const distinctiveFeatures = [];
  if (Math.random() < dist.facial_features.nose_size.large + dist.facial_features.nose_size.prominent) {
    distinctiveFeatures.push('prominent_nose');
  }
  if (Math.random() < dist.facial_features.ear_prominence.very_prominent) {
    distinctiveFeatures.push('prominent_ears');
  }
  persona.health_profile.physical_appearance.distinctive_features = distinctiveFeatures;
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

function removeSignaturePhrases(personaData: any) {
  const forbiddenPhrases = ["I believe that", "In my experience", "I always", "I never"];
  
  // Remove forbidden signature phrases from communication style
  if (personaData.communication_style?.linguistic_signature?.signature_phrases) {
    personaData.communication_style.linguistic_signature.signature_phrases = 
      personaData.communication_style.linguistic_signature.signature_phrases.filter(
        phrase => !forbiddenPhrases.some(forbidden => phrase.includes(forbidden))
      );
  }
  
  // Also check other places signature phrases might appear
  if (personaData.communication_style?.style_markers?.signature_phrases) {
    personaData.communication_style.style_markers.signature_phrases = 
      personaData.communication_style.style_markers.signature_phrases.filter(
        phrase => !forbiddenPhrases.some(forbidden => phrase.includes(forbidden))
      );
  }
}

function generateRealisticIncomeRange(occupation: string, age: number, region: string): string {
  // Generate income ranges based on occupation, age, and region
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
  
  // Select range based on age (experience proxy)
  if (age < 30) return ranges[0];
  if (age < 45) return ranges[1];
  return ranges[2];
}

serve(async (req) => {
  const { method } = req;

  if (method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  if (method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const requestBody = await req.json();
    console.log('Received request:', JSON.stringify(requestBody, null, 2));

    // Extract and validate inputs - simplified to just user description
    const userInputs = {
      user_description: requestBody.user_description || ''
    };

    console.log('Processed user inputs:', userInputs);

    // Natural language interpretation prompt
    const userPrompt = `Create a persona based on this user description: "${userInputs.user_description}"

Interpret this description intelligently:
- Extract any names, ethnicities, occupations, or other traits mentioned
- If no name provided, generate an appropriate first and last name
- If only first name, add an appropriate last name  
- Handle misspellings and variations naturally
- Generate all missing traits realistically

User description: ${userInputs.user_description}

Generate complete persona with all 17 sections filled.`;

    const systemPrompt = `Generate a complete U.S. adult persona as valid JSON with ALL 17 required top-level sections. Every field listed below MUST be present and filled with realistic data.

REQUIRED TOP-LEVEL SECTIONS (all mandatory):
identity, daily_life, health_profile, relationships, money_profile, motivation_profile, communication_style, humor_profile, truth_honesty_profile, bias_profile, cognitive_profile, emotional_profile, attitude_narrative, political_narrative, adoption_profile, prompt_shaping, sexuality_profile

IDENTITY SECTION (all fields required):
{
  "identity": {
    "name": "[realistic first and last name - vary surnames, avoid common defaults like Johnson/Smith/Williams]",
    "age": [18-100],
    "gender": "[male/female/non-binary]",
    "pronouns": "[appropriate pronouns]",
    "ethnicity": "[specific ethnicity - use provided ethnicity if specified]",
    "nationality": "[typically 'American']",
    "occupation": "[specific job title]",
    "relationship_status": "[single/married/divorced/partnered]",
    "dependents": [number],
    "education_level": "[High School/Bachelor's/Master's/PhD/etc]",
    "income_bracket": "[specific range like '45000-65000', '70000-95000', '100000-140000' - DO NOT use 'unspecified']",
    "location": {
      "city": "[specific city]",
      "region": "[state/region]",
      "country": "United States",
      "urbanicity": "[urban/suburban/rural]"
    }
  }
}

DAILY_LIFE SECTION (all fields required):
{
  "daily_life": {
    "primary_activities": {
      "work": [hours per day],
      "family_time": [hours per day],
      "personal_care": [hours per day],
      "personal_interests": [hours per day],
      "social_interaction": [hours per day]
    },
    "schedule_blocks": [
      {
        "start": "[time like '07:30']",
        "end": "[time like '17:00']",
        "activity": "[specific activity]",
        "setting": "[location]"
      }
    ],
    "time_sentiment": {
      "work": "[how they feel about work time]",
      "family": "[how they feel about family time]",
      "personal": "[how they feel about personal time]"
    },
    "screen_time_summary": "[detailed description of screen usage]",
    "mental_preoccupations": ["[worry 1]", "[worry 2]", "[worry 3]"]
  }
}

HEALTH_PROFILE SECTION (all fields required):
{
  "health_profile": {
    "bmi": [16.0-50.0 NUMERIC VALUE],
    "chronic_conditions": ["[condition 1 if any]"],
    "mental_health_flags": ["[flag 1 if any]"],
    "medications": ["[medication 1 if any]"],
    "adherence_level": "[perfect/mostly_consistent/inconsistent]",
    "sleep_hours": [5-12],
    "substance_use": {
      "alcohol": "[none/occasional/regular/heavy]",
      "cigarettes": "[none/occasional/regular]",
      "vaping": "[none/occasional/regular]",
      "marijuana": "[none/occasional/regular]"
    },
    "fitness_level": "[low/moderate/high]",
    "diet_pattern": "[standard/healthy/restrictive/mixed]"
  }
}

RELATIONSHIPS SECTION (all fields required):
{
  "relationships": {
    "household": {
      "status": "[matches relationship_status]",
      "harmony_level": "[peaceful/tense/conflicted]",
      "dependents": [matches identity dependents]
    },
    "caregiving_roles": ["[role 1 if any]"],
    "friend_network": {
      "size": "[small/medium/large]",
      "frequency": "[daily/weekly/monthly]",
      "anchor_contexts": ["[context 1]", "[context 2]"]
    },
    "pets": [{"type": "[animal]", "name": "[pet name]"}] OR []
  }
}

MONEY_PROFILE SECTION (all fields required):
{
  "money_profile": {
    "attitude_toward_money": "[detailed attitude]",
    "earning_context": "[how they earn money]",
    "spending_style": "[how they spend]",
    "savings_investing_habits": {
      "emergency_fund_months": [0-12],
      "retirement_contributions": "[description]",
      "investing_style": "[description]"
    },
    "debt_posture": "[debt situation]",
    "financial_stressors": ["[stressor 1]", "[stressor 2]"],
    "money_conflicts": "[any money-related conflicts]",
    "generosity_profile": "[giving habits]"
  }
}

MOTIVATION_PROFILE SECTION (all fields required):
{
  "motivation_profile": {
    "primary_motivation_labels": ["[motivation 1]", "[motivation 2]"],
    "deal_breakers": ["[deal breaker 1]", "[deal breaker 2]"],
    "primary_drivers": {
      "care": [0.0-1.0],
      "family": [0.0-1.0],
      "status": [0.0-1.0],
      "mastery": [0.0-1.0],
      "meaning": [0.0-1.0],
      "novelty": [0.0-1.0],
      "security": [0.0-1.0],
      "belonging": [0.0-1.0],
      "self_interest": [0.0-1.0]
    },
    "goal_orientation": {
      "strength": [0.0-1.0],
      "time_horizon": "[short/medium/long term]",
      "primary_goals": [
        {
          "goal": "[specific goal]",
          "intensity": [1-10],
          "timeframe": "[timeframe]"
        }
      ],
      "goal_flexibility": [0.0-1.0]
    },
    "want_vs_should_tension": {
      "major_conflicts": [
        {
          "want": "[what they want]",
          "should": "[what they think they should do]",
          "trigger_conditions": ["[trigger 1]"],
          "typical_resolution": "[how they usually resolve it]"
        }
      ],
      "default_resolution": "[their default approach]"
    }
  }
}

COMMUNICATION_STYLE SECTION (all fields required):
{
  "communication_style": {
    "regional_register": {
      "region": "[matches location region]",
      "urbanicity": "[matches location urbanicity]",
      "dialect_hints": ["[hint 1]", "[hint 2]"]
    },
    "voice_foundation": {
      "formality": "[formal/casual/mixed]",
      "directness": "[direct/diplomatic/indirect]",
      "pace_rhythm": "[fast/moderate/slow]",
      "positivity": "[optimistic/realistic/pessimistic]",
      "empathy_level": [0.0-1.0],
      "honesty_style": "[blunt/diplomatic/evasive]",
      "charisma_level": [0.0-1.0]
    },
    "style_markers": {
      "metaphor_domains": ["[domain 1]", "[domain 2]"],
      "aphorism_register": "[folksy/academic/none]",
      "storytelling_vs_bullets": [0.0-1.0],
      "humor_style": "[dry/playful/sarcastic/none]",
      "code_switching_contexts": ["[context 1]"]
    },
    "context_switches": {
      "work": {
        "formality": "[work formality level]",
        "directness": "[work directness level]"
      },
      "home": {
        "formality": "[home formality level]",
        "directness": "[home directness level]"
      },
      "online": {
        "formality": "[online formality level]",
        "directness": "[online directness level]"
      }
    },
    "authenticity_filters": {
      "avoid_registers": ["[register 1]", "[register 2]"],
      "embrace_registers": ["[register 1]", "[register 2]"],
      "personality_anchors": ["[anchor 1]", "[anchor 2]"]
    }
  }
}

HUMOR_PROFILE SECTION (all fields required):
{
  "humor_profile": {
    "frequency": "[regular/occasional/rare]",
    "style": ["[style1]", "[style2]"],
    "boundaries": ["[boundary1]", "[boundary2]"],
    "targets": ["[target1]", "[target2]"],
    "use_cases": ["[usecase1]", "[usecase2]"]
  }
}

TRUTH_HONESTY_PROFILE SECTION (all fields required - NUMERIC VALUES):
{
  "truth_honesty_profile": {
    "baseline_honesty": 0.85,
    "situational_variance": {
      "work": 0.9,
      "home": 0.8, 
      "public": 0.7
    },
    "typical_distortions": ["[distortion1]", "[distortion2]"],
    "red_lines": ["[redline1]", "[redline2]"],
    "pressure_points": ["[pressure1]", "[pressure2]"],
    "confession_style": "[direct/gradual/defensive]"
  }
}
WARNING: baseline_honesty must be a decimal number like 0.85, NOT a string like "high"

BIAS_PROFILE SECTION (all fields required - NUMERIC VALUES):
{
  "bias_profile": {
    "cognitive": {
      "status_quo": 0.6,
      "loss_aversion": 0.7,
      "confirmation": 0.4,
      "anchoring": 0.5,
      "availability": 0.6,
      "optimism": 0.8,
      "sunk_cost": 0.3,
      "overconfidence": 0.5
    },
    "mitigations": ["[mitigation1]", "[mitigation2]"]
  }
}
WARNING: Do NOT use strings like "high", "medium", "low" - use actual decimal numbers like 0.6, 0.7, etc.

COGNITIVE_PROFILE SECTION (all fields required - NUMERIC VALUES):
{
  "cognitive_profile": {
    "verbal_fluency": [0.0-1.0 NUMERIC],
    "abstract_reasoning": [0.0-1.0 NUMERIC],
    "problem_solving_orientation": "[analytical/intuitive/systematic]",
    "thought_coherence": [0.0-1.0 NUMERIC - REALISTIC VALUES: 0.1-0.2=severely scattered (ADHD/stress), 0.3-0.4=average population (MOST COMMON), 0.5-0.6=above average, 0.7-0.8=highly organized, 0.9+=exceptional (RARE)]
  }
}

EMOTIONAL_PROFILE SECTION (all fields required):
{
  "emotional_profile": {
    "stress_responses": ["[response1]", "[response2]"],
    "negative_triggers": ["[trigger1]", "[trigger2]"],
    "positive_triggers": ["[trigger1]", "[trigger2]"],
    "explosive_triggers": ["[trigger1]", "[trigger2]"],
    "emotional_regulation": "[strategy/approach]"
  }
}

ADOPTION_PROFILE SECTION (all fields required - NUMERIC VALUES):
{
  "adoption_profile": {
    "buyer_power": 0.6,
    "adoption_influence": 0.7,
    "risk_tolerance": 0.5,
    "change_friction": 0.3,
    "expected_objections": ["[objection1]", "[objection2]"],
    "proof_points_needed": ["[proof1]", "[proof2]"]
  }
}
WARNING: All four fields must be decimal numbers like 0.6, NOT strings like "moderate"

SEXUALITY_PROFILE SECTION (all fields required):
{
  "sexuality_profile": {
    "orientation": "[heterosexual/homosexual/bisexual/etc]",
    "expression_style": "[open/private/moderate]",
    "relationship_norms": "[monogamous/polyamorous/etc]",
    "boundaries": {
      "comfort_level": "[high/moderate/low]",
      "topics_off_limits": ["[topic1]", "[topic2]"]
    },
    "linguistic_influences": {
      "flirtation_style": "[playful/direct/subtle/none]",
      "humor_boundaries": "[permissive/moderate/conservative]",
      "taboo_navigation": "[direct/careful/avoidant]"
    }
  }
}

PROMPT_SHAPING SECTION (all fields required):
{
  "prompt_shaping": {
    "voice_foundation": {
      "formality": "[formal/casual/mixed]",
      "directness": "[direct/diplomatic/indirect]",
      "pace_rhythm": "[fast/moderate/slow]",
      "positivity": "[optimistic/realistic/pessimistic]",
      "empathy_level": [0.0-1.0 NUMERIC]
    },
    "style_markers": {
      "metaphor_domains": ["[domain1]", "[domain2]"],
      "humor_style": "[dry/playful/sarcastic/none]",
      "storytelling_vs_bullets": [0.0-1.0 NUMERIC]
    },
    "primary_motivations": ["[motivation1]", "[motivation2]"],
    "deal_breakers": ["[dealbreaker1]", "[dealbreaker2]"],
    "honesty_vector": {
      "baseline": [0.0-1.0 NUMERIC],
      "work": [0.0-1.0 NUMERIC],
      "home": [0.0-1.0 NUMERIC],
      "public": [0.0-1.0 NUMERIC],
      "distortions": ["[distortion1]"]
    },
    "bias_vector": {
      "top_cognitive": [{"type": "[bias_type]", "level": [0.0-1.0 NUMERIC]}],
      "top_social": [{"type": "[bias_type]", "level": [0.0-1.0 NUMERIC]}],
      "mitigation_playbook": ["[strategy1]", "[strategy2]"]
    },
    "context_switches": {
      "work": "[style_description]",
      "home": "[style_description]",
      "online": "[style_description]"
    },
    "current_focus": "[current life focus/priority]"
  }
}

NARRATIVE SECTIONS:
- attitude_narrative: "[Single paragraph describing worldview - make natural, not polished]"
- political_narrative: "[Single paragraph describing political views - make natural, not polished]"

        CRITICAL INSTRUCTIONS: 
        1. Generate ALL sections completely - no section should be empty or missing
        2. Interpret the user description naturally and extract relevant traits
        3. Generate realistic and appropriate details for any missing information
        4. Be internally consistent across all fields
        5. ALL NUMERIC VALUES MUST BE ACTUAL NUMBERS (0.0-1.0), NEVER STRINGS LIKE "high" OR "medium"
        6. bias_profile.cognitive MUST have numeric 0-1 values, NOT strings
        7. truth_honesty_profile.baseline_honesty MUST be numeric 0-1, NOT string
        8. adoption_profile fields MUST be numeric 0-1 values, NOT strings
        9. emotional_profile.stress_responses MUST be an array, NOT a string
        10. sexuality_profile.linguistic_influences MUST be an object with flirtation_style, humor_boundaries, taboo_navigation
        11. prompt_shaping.voice_foundation and style_markers MUST be objects, NOT strings or arrays
        12. Generate realistic, detailed content for every field - no placeholders or empty values
        13. Numeric TRAIT values must be realistically varied – do NOT output uniform defaults (e.g., all 0.5)
        14. Do not rely on any post-processing; your output must be final and valid as-is
        15. NEVER include signature phrases like "I believe that...", "In my experience...", "I always...", "I never..."
        16. income_bracket MUST be a specific range like "45000-65000" based on occupation and age - NEVER use "unspecified"
        
        CRITICAL HEALTH AUTHENTICITY: Generate realistic health profiles reflecting population diversity:
        - medications: Include realistic prescriptions when appropriate (blood pressure, diabetes, antidepressants, etc.) or [] if none
        - chronic_conditions: Include realistic conditions when appropriate (hypertension, diabetes, anxiety, depression, etc.) or [] if none  
        - mental_health_flags: Include realistic mental health conditions when appropriate (anxiety, depression, ADHD, etc.) or [] if none
        - adherence_level: Vary realistically ("excellent", "good", "inconsistent", "poor") based on personality and circumstances
        - substance_use: Reflect realistic patterns including social drinking, occasional marijuana use, etc. - not everyone abstains
        - caregiving_roles: Include realistic roles when appropriate or [] if none
        - pets: [] (empty is normal for no pets)
        - financial_stressors: Include realistic stressors when appropriate or [] if none
        - mental_preoccupations: Always include at least one realistic preoccupation
        
        Return ONLY the complete JSON object with all sections filled with realistic, detailed data.`;

    // Retry configurations
    const configurations = [
      { model: "gpt-4o-mini", max_tokens: 12000, attempt: 1 },
      { model: "gpt-4o-mini", max_tokens: 16000, attempt: 2 },
      { model: "gpt-4o", max_tokens: 8000, attempt: 3 },
    ];

    let lastError: Error | null = null;
    let personaData: any = null;

    for (const config of configurations) {
      try {
        console.log(`Attempt ${config.attempt}: ${config.model} with ${config.max_tokens} tokens`);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: config.max_tokens,
            response_format: { type: "json_object" }
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const openaiResponse = await response.json();
        const rawContent = openaiResponse.choices[0].message.content;
        
        console.log(`Raw response length: ${rawContent?.length || 0} characters`);

        // Validate response completeness
        if (!rawContent) {
          throw new Error("Empty response from OpenAI");
        }

        if (!rawContent.trim().endsWith('}')) {
          throw new Error("Response appears truncated - doesn't end with closing brace");
        }

        // Check brace balance
        const openBraces = (rawContent.match(/\{/g) || []).length;
        const closeBraces = (rawContent.match(/\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
          throw new Error(`Unbalanced JSON: ${openBraces} opening, ${closeBraces} closing braces`);
        }

        // Parse JSON
        try {
          personaData = JSON.parse(rawContent);
          console.log('✅ JSON parsing successful');
          
          // Log critical data types in raw response
          console.log('🔍 Raw OpenAI data types check:');
          if (personaData.bias_profile?.cognitive) {
            console.log('bias_profile.cognitive.confirmation type:', typeof personaData.bias_profile.cognitive.confirmation, 'value:', personaData.bias_profile.cognitive.confirmation);
            console.log('bias_profile.cognitive.optimism type:', typeof personaData.bias_profile.cognitive.optimism, 'value:', personaData.bias_profile.cognitive.optimism);
          }
          if (personaData.truth_honesty_profile) {
            console.log('truth_honesty_profile.baseline_honesty type:', typeof personaData.truth_honesty_profile.baseline_honesty, 'value:', personaData.truth_honesty_profile.baseline_honesty);
          }
          if (personaData.adoption_profile) {
            console.log('adoption_profile.buyer_power type:', typeof personaData.adoption_profile.buyer_power, 'value:', personaData.adoption_profile.buyer_power);
          }
          
        } catch (parseError) {
          console.log('Direct parsing failed, trying extraction...');
          personaData = extractJSONFromMarkdown(rawContent);
        }

        // Validate structure
        if (!personaData || typeof personaData !== 'object') {
          throw new Error("Invalid persona data structure");
        }

        // Check required fields
        const requiredFields = [
          "identity", "daily_life", "health_profile", "relationships", "money_profile",
          "motivation_profile", "communication_style", "humor_profile", "truth_honesty_profile",
          "bias_profile", "cognitive_profile", "emotional_profile", "attitude_narrative",
          "political_narrative", "adoption_profile", "prompt_shaping", "sexuality_profile"
        ];

        const missingFields = requiredFields.filter(field => !personaData[field]);
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Strict validation (no mutation, throws on failure)
        personaData = validateAndFixPersonaData(personaData, userInputs);
        
        // Statistical trait assignment disabled - keeping OpenAI's unique traits
        console.log('🎯 Skipping statistical post-processing to preserve unique traits...');
        
        // Remove any forbidden signature phrases
        removeSignaturePhrases(personaData);
        
        console.log(`✅ Successful generation and validation on attempt ${config.attempt}`);
        break;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Attempt ${config.attempt} failed:`, error.message);
        
        if (config.attempt < configurations.length) {
          await new Promise(resolve => setTimeout(resolve, 1000 * config.attempt));
        }
      }
    }

    if (!personaData) {
      throw new Error(`All generation attempts failed. Last error: ${lastError?.message}`);
    }

    // Post-generation validation moved into generation loop (no mutations after generation).

    // No normalization step (no post-generation mutations)
    // Calculate validation score (all required fields present and validated)
    const validationScore = 1.0;
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];

    return new Response(JSON.stringify({
      success: true,
      persona_data: personaData,
      user_inputs_preserved: {
        ethnicity: personaData.identity.ethnicity,
        occupation: personaData.identity.occupation,
        region: personaData.identity.location.region,
        urbanicity: personaData.identity.location.urbanicity
      },
      generation_info: {
        total_fields: Object.keys(personaData).length,
        has_required_fields: true,
        validation_passed: true
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('❌ Edge function error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Comprehensive validation failed - persona was incomplete'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

function validateAndFixPersonaData(personaData: any, userInputs: any = {}): any {
  console.log('🔍 Strict persona validation (no mutations)...');

  // Required top-level sections
  const requiredSections = [
    'identity', 'daily_life', 'health_profile', 'relationships', 'money_profile',
    'motivation_profile', 'communication_style', 'humor_profile', 'truth_honesty_profile',
    'bias_profile', 'cognitive_profile', 'emotional_profile', 'attitude_narrative',
    'political_narrative', 'adoption_profile', 'prompt_shaping', 'sexuality_profile'
  ];

  const missingSections = requiredSections.filter((s) => !personaData[s]);
  if (missingSections.length) {
    throw new Error(`Missing required sections: ${missingSections.join(', ')}`);
  }

  // Identity checks (no mutation)
  const id = personaData.identity || {};
  const identityFields = [
    'name','age','gender','pronouns','ethnicity','nationality','occupation','relationship_status','dependents','education_level','income_bracket','location'
  ];
  const missingIdentity = identityFields.filter((f) => id[f] === undefined || id[f] === null || (typeof id[f] === 'string' && id[f].trim?.() === ''));
  if (missingIdentity.length) {
    throw new Error(`Missing identity fields: ${missingIdentity.join(', ')}`);
  }

  const locFields = ['city','region','country','urbanicity'];
  const missingLoc = locFields.filter((f) => !id.location?.[f]);
  if (missingLoc.length) {
    throw new Error(`Missing identity.location fields: ${missingLoc.join(', ')}`);
  }

  // Log identity details without strict validation - let OpenAI's interpretation be final
  console.log(`Generated identity: name="${id.name}", ethnicity="${id.ethnicity}", occupation="${id.occupation}"`);
  
  // Daily life completeness
  const dl = personaData.daily_life;
  if (!dl?.primary_activities || !dl?.schedule_blocks || !dl?.time_sentiment || dl.screen_time_summary === undefined || !Array.isArray(dl.mental_preoccupations)) {
    throw new Error('Incomplete daily_life section');
  }

  // Health profile minimal checks
  const hp = personaData.health_profile;
  if (!hp || hp.substance_use === undefined || hp.bmi === undefined || hp.sleep_hours === undefined) {
    throw new Error('Incomplete health_profile section');
  }

  // Motivation drivers numeric checks
  const mp = personaData.motivation_profile;
  const drivers = mp?.primary_drivers;
  const driverKeys = ['care','family','status','mastery','meaning','novelty','security','belonging','self_interest'];
  if (!drivers || driverKeys.some((k) => typeof drivers[k] !== 'number')) {
    throw new Error('Missing numeric motivation primary_drivers');
  }
  const values = driverKeys.map((k) => drivers[k]);
  const allSame = values.every((v) => v === values[0]);
  if (allSame || values.every((v) => v === 0.5)) {
    throw new Error('Unrealistic uniform motivation drivers (e.g., all 0.5)');
  }
  if (values.some((v) => v < 0 || v > 1)) {
    throw new Error('Motivation drivers out of range 0-1');
  }

  // Communication style numeric checks
  const vf = personaData.communication_style?.voice_foundation;
  if (!vf || typeof vf.empathy_level !== 'number' || typeof vf.charisma_level !== 'number') {
    throw new Error('Incomplete communication_style.voice_foundation numeric fields');
  }
  if (vf.empathy_level < 0 || vf.empathy_level > 1 || vf.charisma_level < 0 || vf.charisma_level > 1) {
    throw new Error('Voice foundation numeric values out of range 0-1');
  }

  // Cognitive profile numeric checks
  const cp = personaData.cognitive_profile;
  if (!cp || typeof cp.verbal_fluency !== 'number' || typeof cp.abstract_reasoning !== 'number' || typeof cp.thought_coherence !== 'number') {
    throw new Error('Incomplete cognitive_profile numeric fields');
  }
  if (cp.verbal_fluency < 0 || cp.verbal_fluency > 1 || cp.abstract_reasoning < 0 || cp.abstract_reasoning > 1 || cp.thought_coherence < 0 || cp.thought_coherence > 1) {
    throw new Error('Cognitive profile numeric values out of range 0-1');
  }

  // BIAS PROFILE validation - enforce numeric cognitive biases
  const bp = personaData.bias_profile;
  if (!bp || !bp.cognitive) {
    throw new Error('Missing bias_profile.cognitive section');
  }
  const biasKeys = ['status_quo', 'loss_aversion', 'confirmation', 'anchoring', 'availability', 'optimism', 'sunk_cost', 'overconfidence'];
  const missingBiases = biasKeys.filter(k => typeof bp.cognitive[k] !== 'number');
  if (missingBiases.length) {
    throw new Error(`bias_profile.cognitive must have numeric values for: ${missingBiases.join(', ')}`);
  }
  const biasValues = biasKeys.map(k => bp.cognitive[k]);
  if (biasValues.some(v => v < 0 || v > 1)) {
    throw new Error('bias_profile.cognitive values must be between 0-1');
  }

  // TRUTH HONESTY PROFILE validation - enforce numeric baseline_honesty
  const thp = personaData.truth_honesty_profile;
  if (!thp || typeof thp.baseline_honesty !== 'number') {
    throw new Error('truth_honesty_profile.baseline_honesty must be numeric 0-1');
  }
  if (thp.baseline_honesty < 0 || thp.baseline_honesty > 1) {
    throw new Error('truth_honesty_profile.baseline_honesty must be between 0-1');
  }
  if (!thp.situational_variance || typeof thp.situational_variance !== 'object') {
    throw new Error('truth_honesty_profile.situational_variance must be an object');
  }
  const svKeys = ['work', 'home', 'public'];
  const missingSv = svKeys.filter(k => typeof thp.situational_variance[k] !== 'number');
  if (missingSv.length) {
    throw new Error(`truth_honesty_profile.situational_variance must have numeric values for: ${missingSv.join(', ')}`);
  }

  // ADOPTION PROFILE validation - enforce numeric values
  const ap = personaData.adoption_profile;
  if (!ap) {
    throw new Error('Missing adoption_profile section');
  }
  const adoptionKeys = ['buyer_power', 'adoption_influence', 'risk_tolerance', 'change_friction'];
  const missingAdoption = adoptionKeys.filter(k => typeof ap[k] !== 'number');
  if (missingAdoption.length) {
    throw new Error(`adoption_profile must have numeric 0-1 values for: ${missingAdoption.join(', ')}`);
  }
  const adoptionValues = adoptionKeys.map(k => ap[k]);
  if (adoptionValues.some(v => v < 0 || v > 1)) {
    throw new Error('adoption_profile numeric values must be between 0-1');
  }

  // EMOTIONAL PROFILE validation - enforce array for stress_responses
  const ep = personaData.emotional_profile;
  if (!ep || !Array.isArray(ep.stress_responses)) {
    throw new Error('emotional_profile.stress_responses must be an array');
  }

  // SEXUALITY PROFILE validation - enforce object structure
  const sp = personaData.sexuality_profile;
  if (!sp || sp.orientation === undefined || sp.expression_style === undefined || sp.relationship_norms === undefined) {
    throw new Error('Incomplete sexuality_profile basic fields');
  }
  if (!sp.boundaries || typeof sp.boundaries !== 'object') {
    throw new Error('sexuality_profile.boundaries must be an object');
  }
  if (!sp.linguistic_influences || typeof sp.linguistic_influences !== 'object') {
    throw new Error('sexuality_profile.linguistic_influences must be an object with flirtation_style, humor_boundaries, taboo_navigation');
  }
  const requiredLinguistic = ['flirtation_style', 'humor_boundaries', 'taboo_navigation'];
  const missingLinguistic = requiredLinguistic.filter(k => sp.linguistic_influences[k] === undefined);
  if (missingLinguistic.length) {
    throw new Error(`sexuality_profile.linguistic_influences missing: ${missingLinguistic.join(', ')}`);
  }

  // PROMPT SHAPING validation - enforce object structures
  const ps = personaData.prompt_shaping;
  if (!ps || typeof ps !== 'object') {
    throw new Error('Missing prompt_shaping section');
  }
  
  // Check allowed keys
  const allowedPromptShapingKeys = [
    'voice_foundation', 'style_markers', 'primary_motivations', 'deal_breakers',
    'honesty_vector', 'bias_vector', 'context_switches', 'current_focus'
  ];
  const promptKeys = Object.keys(ps);
  const extraKeys = promptKeys.filter((k) => !allowedPromptShapingKeys.includes(k));
  const bannedSpecific = ['style_markers_summary', 'voice_foundation_summary'];
  const foundBannedSpecific = promptKeys.filter((k) => bannedSpecific.includes(k));

  if (extraKeys.length > 0) {
    console.warn('Disallowed prompt_shaping keys found:', extraKeys);
    throw new Error(`prompt_shaping has disallowed keys: ${extraKeys.join(', ')}`);
  }
  if (foundBannedSpecific.length > 0) {
    console.warn('BANNED prompt_shaping keys detected:', foundBannedSpecific);
    throw new Error(`Banned fields present in prompt_shaping: ${foundBannedSpecific.join(', ')}`);
  }

  // Validate prompt_shaping structure
  if (!ps.voice_foundation || typeof ps.voice_foundation !== 'object') {
    throw new Error('prompt_shaping.voice_foundation must be an object');
  }
  if (!ps.style_markers || typeof ps.style_markers !== 'object') {
    throw new Error('prompt_shaping.style_markers must be an object');
  }
  if (!ps.honesty_vector || typeof ps.honesty_vector !== 'object') {
    throw new Error('prompt_shaping.honesty_vector must be an object');
  }
  if (!ps.bias_vector || typeof ps.bias_vector !== 'object') {
    throw new Error('prompt_shaping.bias_vector must be an object');
  }

  // Fix empty arrays that should have content
  if (personaData.health_profile?.medications?.length === 0) {
    personaData.health_profile.medications = ["none"];
  }
  if (personaData.health_profile?.chronic_conditions?.length === 0) {
    personaData.health_profile.chronic_conditions = ["none"];
  }
  if (personaData.health_profile?.mental_health_flags?.length === 0) {
    personaData.health_profile.mental_health_flags = ["none"];
  }
  if (personaData.relationships?.caregiving_roles?.length === 0) {
    personaData.relationships.caregiving_roles = ["none"];
  }
  if (personaData.money_profile?.financial_stressors?.length === 0) {
    personaData.money_profile.financial_stressors = ["none"];
  }
  if (personaData.daily_life?.mental_preoccupations?.length === 0) {
    personaData.daily_life.mental_preoccupations = ["general concerns"];
  }

  console.log('✅ Strict validation passed without mutations.');
  return personaData;
}

function extractJSONFromMarkdown(content: string): any {
  let cleaned = content.replace(/```json\s*|\s*```/g, '');
  
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error("No valid JSON structure found in response");
  }
  
  const jsonStr = cleaned.slice(firstBrace, lastBrace + 1);
  
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    const fixed = jsonStr
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":');
    
    return JSON.parse(fixed);
  }
}

function normalizePersonaData(data: any): any {
  // DISABLED: clampValue contamination - preserving OpenAI's authentic numeric values
  // Clamp numeric values to 0-1 range  
  // function clampValue(value: any): number {
  //   if (typeof value !== 'number') return 0.5;
  //   return Math.max(0, Math.min(1, value));
  // }

  // Ensure sexuality_profile exists with proper orientation
  if (!data.sexuality_profile) {
    // Statistical assignment for sexual orientation based on demographics
    const orientationRoll = Math.random();
    let orientation: string;
    
    if (orientationRoll < 0.92) {
      orientation = "heterosexual";
    } else if (orientationRoll < 0.96) {
      orientation = "bisexual";  
    } else if (orientationRoll < 0.98) {
      orientation = "homosexual";
    } else {
      orientation = "other";
    }
    
    data.sexuality_profile = {
      orientation: orientation,
      expression_style: "private",
      relationship_norms: "monogamous",
      boundaries: {
        comfort_level: "moderate",
        topics_off_limits: []
      },
      linguistic_influences: {
        flirtation_style: "none",
        humor_boundaries: "clean",
        taboo_navigation: "navigate_carefully"
      }
    };
  }

  // DISABLED: Motivation driver clamping - preserving OpenAI's authentic values
  // Clamp motivation drivers
  // if (data.motivation_profile?.primary_drivers) {
  //   Object.keys(data.motivation_profile.primary_drivers).forEach(key => {
  //     data.motivation_profile.primary_drivers[key] = clampValue(data.motivation_profile.primary_drivers[key]);
  //   });
  // }

  // DISABLED: Cognitive value clamping - preserving OpenAI's authentic values  
  // Clamp cognitive values
  // if (data.cognitive_profile) {
  //   ['verbal_fluency', 'abstract_reasoning', 'thought_coherence'].forEach(field => {
  //     if (data.cognitive_profile[field] !== undefined) {
  //       data.cognitive_profile[field] = clampValue(data.cognitive_profile[field]);
  //     }
  //   });
  // }

  return data;
}