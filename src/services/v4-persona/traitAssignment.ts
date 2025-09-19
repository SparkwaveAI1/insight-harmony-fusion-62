import { STATISTICAL_DISTRIBUTIONS, AGE_MODIFIERS } from './statisticalDistributions';

export interface PersonaDemographics {
  age: number;
  income: string;
  region: string;
  ethnicity: string;
  gender: string;
}

export function assignRealisticTraits(persona: any, demographics: PersonaDemographics): any {
  const updatedPersona = { ...persona };
  
  // Apply age-based probability modifiers
  const ageGroup = getAgeGroup(demographics.age);
  const modifiers = AGE_MODIFIERS[ageGroup] || {};
  
  // Assign physical health traits
  assignPhysicalHealth(updatedPersona, demographics, modifiers);
  
  // Assign mental health traits
  assignMentalHealth(updatedPersona, demographics, modifiers);
  
  // Assign behavioral patterns
  assignConsumptionPatterns(updatedPersona, demographics, modifiers);
  
  // Assign financial realities
  assignFinancialStressors(updatedPersona, demographics, modifiers);
  
  // Ensure internal consistency
  ensureTraitConsistency(updatedPersona);
  
  return updatedPersona;
}

function assignPhysicalHealth(persona: any, demographics: PersonaDemographics, modifiers: any) {
  const dist = STATISTICAL_DISTRIBUTIONS.physical_health;
  
  // BMI assignment
  const bmiRoll = Math.random();
  if (bmiRoll < dist.bmi_category.normal) {
    persona.health_profile.bmi_category = "normal";
  } else if (bmiRoll < dist.bmi_category.normal + dist.bmi_category.overweight) {
    persona.health_profile.bmi_category = "overweight";  
  } else {
    persona.health_profile.bmi_category = "obese";
  }
  
  // Chronic conditions based on age
  const conditions = [];
  const ageMultiplier = demographics.age > 65 ? 2.5 : demographics.age > 40 ? 1.5 : 1.0;
  
  if (Math.random() < dist.chronic_conditions.hypertension.overall * ageMultiplier) {
    conditions.push("hypertension");
    // Add appropriate medications
    if (!persona.health_profile.medications.includes("none")) {
      persona.health_profile.medications = persona.health_profile.medications.filter(m => m !== "none");
    }
    persona.health_profile.medications.push("lisinopril");
  }
  
  if (Math.random() < dist.chronic_conditions.diabetes.overall * ageMultiplier) {
    conditions.push("type_2_diabetes");
    persona.health_profile.medications.push("metformin");
  }
  
  if (Math.random() < dist.chronic_conditions.arthritis.overall * ageMultiplier) {
    conditions.push("arthritis");
  }
  
  if (Math.random() < dist.chronic_conditions.chronic_pain.overall * ageMultiplier) {
    conditions.push("chronic_pain");
    persona.health_profile.medications.push("ibuprofen");
  }
  
  persona.health_profile.chronic_conditions = conditions.length > 0 ? conditions : ["none"];
  
  // Sleep patterns
  const sleepRoll = Math.random();
  if (sleepRoll < dist.sleep_issues.insufficient_sleep) {
    persona.health_profile.sleep_hours = Math.floor(Math.random() * 2) + 5; // 5-6 hours
  } else {
    persona.health_profile.sleep_hours = Math.floor(Math.random() * 2) + 7; // 7-8 hours
  }
}

function assignMentalHealth(persona: any, demographics: PersonaDemographics, modifiers: any) {
  const dist = STATISTICAL_DISTRIBUTIONS.mental_health;
  const flags = [];
  
  // Anxiety (higher in younger adults)
  const anxietyRate = dist.clinical_conditions.anxiety_disorders.overall * (modifiers.mental_health?.anxiety || 1.0);
  if (Math.random() < anxietyRate) {
    flags.push("generalized_anxiety");
    // May affect work performance and social interactions
    persona.emotional_profile.stress_responses.push("overthinking");
    persona.emotional_profile.negative_triggers.push("uncertainty");
  }
  
  // Depression screening
  const depressionRate = dist.clinical_conditions.depression.overall * (modifiers.mental_health?.depression || 1.0);
  if (Math.random() < depressionRate) {
    flags.push("depression");
    persona.emotional_profile.negative_triggers.push("isolation");
    persona.daily_life.mental_preoccupations.push("low_mood");
  }
  
  // ADHD (affects work and organization patterns)
  const adhdRate = dist.clinical_conditions.adhd.overall;
  if (Math.random() < adhdRate) {
    flags.push("adhd");
    persona.daily_life.mental_preoccupations.push("focus_challenges");
    persona.cognitive_profile.thought_coherence = Math.max(0.1, persona.cognitive_profile.thought_coherence * 0.8); // Affects coherence
  }
  
  // Work dissatisfaction
  if (Math.random() < dist.stress_factors.work_dissatisfaction) {
    persona.daily_life.time_sentiment.work = "frustrated";
    persona.emotional_profile.negative_triggers.push("work_demands");
  }
  
  persona.health_profile.mental_health_flags = flags.length > 0 ? flags : ["none"];
}

function assignConsumptionPatterns(persona: any, demographics: PersonaDemographics, modifiers: any) {
  const dist = STATISTICAL_DISTRIBUTIONS;
  
  // Alcohol use
  const alcoholRoll = Math.random();
  if (alcoholRoll < dist.substance_patterns.alcohol.abstain) {
    persona.health_profile.substance_use.alcohol = "none";
  } else if (alcoholRoll < dist.substance_patterns.alcohol.abstain + dist.substance_patterns.alcohol.casual) {
    persona.health_profile.substance_use.alcohol = "occasional";
  } else if (alcoholRoll < dist.substance_patterns.alcohol.abstain + dist.substance_patterns.alcohol.casual + dist.substance_patterns.alcohol.regular) {
    persona.health_profile.substance_use.alcohol = "regular";
  } else {
    persona.health_profile.substance_use.alcohol = "heavy";
  }
  
  // Tobacco use
  if (Math.random() < dist.substance_patterns.tobacco.cigarettes) {
    persona.health_profile.substance_use.cigarettes = "yes";
  } else if (Math.random() < dist.substance_patterns.tobacco.former_smoker) {
    persona.health_profile.substance_use.cigarettes = "former";
  } else {
    persona.health_profile.substance_use.cigarettes = "no";
  }
  
  // Vaping (higher in younger demographics)
  const vapingRate = dist.substance_patterns.tobacco.vaping * (modifiers.substance_use?.vaping || 1.0);
  persona.health_profile.substance_use.vaping = Math.random() < vapingRate ? "yes" : "no";
  
  // Diet patterns
  const dietRoll = Math.random();
  if (dietRoll < dist.consumption_habits.diet_quality.poor) {
    persona.health_profile.diet_pattern = "poor";
  } else if (dietRoll < dist.consumption_habits.diet_quality.poor + dist.consumption_habits.diet_quality.mixed) {
    persona.health_profile.diet_pattern = "mixed";
  } else if (dietRoll < dist.consumption_habits.diet_quality.poor + dist.consumption_habits.diet_quality.mixed + dist.consumption_habits.diet_quality.good) {
    persona.health_profile.diet_pattern = "healthy";
  } else {
    persona.health_profile.diet_pattern = "restrictive";
  }
}

function assignFinancialStressors(persona: any, demographics: PersonaDemographics, modifiers: any) {
  const dist = STATISTICAL_DISTRIBUTIONS.financial_reality;
  const stressors = [];
  
  // Student loan debt
  if (Math.random() < dist.debt_burden.student_loans.has_debt) {
    stressors.push("student_loans");
    if (Math.random() < dist.debt_burden.student_loans.high_burden) {
      stressors.push("high_debt_burden");
    }
  }
  
  // Credit card debt
  if (Math.random() < dist.debt_burden.credit_card.carries_balance) {
    stressors.push("credit_card_debt");
  }
  
  // Medical debt
  if (Math.random() < dist.debt_burden.medical_debt) {
    stressors.push("medical_debt");
  }
  
  // Employment issues
  if (Math.random() < dist.employment_stress.job_insecurity) {
    stressors.push("job_insecurity");
  }
  
  // Housing burden
  if (Math.random() < dist.employment_stress.underemployed) {
    stressors.push("underemployment");
  }
  
  persona.money_profile.financial_stressors = stressors;
}

function ensureTraitConsistency(persona: any) {
  // If person has diabetes, ensure diet reflects management attempts
  if (persona.health_profile.chronic_conditions.includes("type_2_diabetes")) {
    if (persona.health_profile.diet_pattern === "poor") {
      persona.health_profile.diet_pattern = "mixed"; // Trying to manage but not perfect
    }
  }
  
  // If person has anxiety, adjust social patterns
  if (persona.health_profile.mental_health_flags.includes("generalized_anxiety")) {
    persona.relationships.friend_network.size = "small"; // Common pattern
    persona.communication_style.voice_foundation.empathy_level = Math.min(0.9, persona.communication_style.voice_foundation.empathy_level + 0.1);
  }
  
  // Financial stress affects multiple areas
  if (persona.money_profile.financial_stressors.length > 2) {
    persona.daily_life.mental_preoccupations.push("money_worries");
    persona.emotional_profile.stress_responses.push("financial_anxiety");
  }
  
  // Chronic pain affects fitness level
  if (persona.health_profile.chronic_conditions.includes("chronic_pain")) {
    persona.health_profile.fitness_level = "low";
  }
  
  // Heavy alcohol use affects health
  if (persona.health_profile.substance_use.alcohol === "heavy") {
    persona.health_profile.fitness_level = "low";
    if (!persona.health_profile.chronic_conditions.includes("none")) {
      persona.health_profile.chronic_conditions = persona.health_profile.chronic_conditions.filter(c => c !== "none");
    }
  }
}

function assignConsumptionBehaviors(persona: any, demographics: PersonaDemographics, modifiers: any) {
  const dist = STATISTICAL_DISTRIBUTIONS.consumption_habits;
  
  // Food security
  const foodSecurityRoll = Math.random();
  if (foodSecurityRoll < dist.food_security.very_low_security) {
    persona.money_profile.financial_stressors.push("food_insecurity");
  } else if (foodSecurityRoll < dist.food_security.very_low_security + dist.food_security.low_security) {
    persona.money_profile.financial_stressors.push("limited_food_access");
  }
}

function getAgeGroup(age: number): string {
  if (age <= 25) return "18-25";
  if (age <= 40) return "26-40";  
  if (age <= 65) return "41-65";
  return "65+";
}

// Test function to demonstrate realistic trait combinations
export function testRealisticTraits() {
  // Sample persona structure (simplified for testing)
  const samplePersona = {
    identity: { name: "Test Person", age: 45 },
    health_profile: {
      bmi_category: "",
      chronic_conditions: ["none"],
      mental_health_flags: ["none"],
      medications: ["none"],
      sleep_hours: 7,
      substance_use: {
        alcohol: "none",
        cigarettes: "no",
        vaping: "no"
      },
      fitness_level: "moderate",
      diet_pattern: "mixed"
    },
    emotional_profile: {
      stress_responses: [],
      negative_triggers: [],
      explosive_triggers: []
    },
    daily_life: {
      mental_preoccupations: [],
      time_sentiment: {
        work: "neutral",
        family: "positive",
        personal: "neutral"
      }
    },
    relationships: {
      friend_network: { size: "medium" }
    },
    money_profile: {
      financial_stressors: []
    },
    communication_style: {
      voice_foundation: {
        empathy_level: 0.7
      }
    },
    cognitive_profile: {
      thought_coherence: 0.8
    }
  };
  
  const demographics: PersonaDemographics = {
    age: 45,
    income: "middle",
    region: "midwest",
    ethnicity: "white",
    gender: "female"
  };
  
  return assignRealisticTraits(samplePersona, demographics);
}