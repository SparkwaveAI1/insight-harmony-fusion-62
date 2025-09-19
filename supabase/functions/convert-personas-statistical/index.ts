import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversionRequest {
  batchSize?: number;
  startIndex?: number;
  dryRun?: boolean;
}

interface ConversionResult {
  processed: number;
  success: number;
  failed: number;
  examples: Array<{
    personaId: string;
    traitsAdded: string[];
    beforeAfter: {
      chronicConditions: { before: string[], after: string[] };
      medications: { before: string[], after: string[] };
      financialStressors: { before: string[], after: string[] };
    }
  }>;
}

// Statistical distributions for realistic trait assignment
const STATISTICAL_DISTRIBUTIONS = {
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
      diabetes: { overall: 0.11, age_65plus: 0.27 },
      hypertension: { overall: 0.47, age_65plus: 0.75 },
      arthritis: { overall: 0.23, age_50plus: 0.49 },
      heart_disease: { overall: 0.06, age_65plus: 0.14 },
      chronic_pain: { overall: 0.20, age_65plus: 0.40 }
    },
    sleep_issues: {
      insomnia: 0.10,
      sleep_apnea: 0.04,
      insufficient_sleep: 0.35
    }
  },
  mental_health: {
    clinical_conditions: {
      anxiety_disorders: { overall: 0.18, age_18_25: 0.25 },
      depression: { overall: 0.08, age_18_25: 0.13 },
      adhd: { overall: 0.04, male: 0.05, female: 0.03 },
      ptsd: { overall: 0.035, veterans: 0.12, women: 0.05 }
    },
    stress_factors: {
      work_dissatisfaction: 0.32,
      financial_stress: 0.64,
      relationship_stress: 0.28,
      caregiving_burden: 0.16,
      anger_management_issues: 0.08
    }
  },
  substance_patterns: {
    alcohol: { 
      abstain: 0.30, 
      casual: 0.40, 
      regular: 0.20, 
      problematic: 0.10 
    },
    tobacco: { 
      cigarettes: 0.12, 
      vaping: 0.15, 
      former_smoker: 0.22 
    }
  },
  financial_reality: {
    debt_burden: {
      student_loans: { has_debt: 0.43, high_burden: 0.18 },
      credit_card: { carries_balance: 0.47, high_debt: 0.15 },
      medical_debt: 0.23
    },
    employment_stress: {
      underemployed: 0.07,
      multiple_jobs: 0.05,
      job_insecurity: 0.22,
      workplace_harassment: 0.15
    }
  }
};

const AGE_MODIFIERS = {
  "18-25": {
    mental_health: { anxiety: 1.4, depression: 1.6, adhd: 1.5 },
    substance_use: { binge_drinking: 2.0, vaping: 3.0 },
    financial_stress: 1.3,
    screen_time: 1.4
  },
  "26-40": {
    work_stress: 1.2,
    caregiving_burden: 1.5,
    financial_pressure: 1.3
  },
  "41-65": {
    chronic_conditions: 1.8,
    work_dissatisfaction: 1.1,
    caregiving_burden: 2.0
  },
  "65+": {
    chronic_conditions: 2.5,
    medication_use: 2.8,
    social_isolation: 1.6
  }
};

function getAgeGroup(age: number): string {
  if (age <= 25) return "18-25";
  if (age <= 40) return "26-40";  
  if (age <= 65) return "41-65";
  return "65+";
}

function assignRealisticTraits(persona: any): { updatedPersona: any, traitsAdded: string[] } {
  const updatedPersona = { ...persona };
  const traitsAdded: string[] = [];
  
  // Get demographics
  const age = updatedPersona.identity?.age || 35;
  const gender = updatedPersona.identity?.gender || 'non-binary';
  const ageGroup = getAgeGroup(age);
  const modifiers = AGE_MODIFIERS[ageGroup] || {};
  
  // Initialize missing sections
  if (!updatedPersona.health_profile) {
    updatedPersona.health_profile = {
      bmi: generateRealisticBMI(),
      chronic_conditions: ["none"],
      mental_health_flags: ["none"],
      medications: ["none"],
      adherence_level: "good",
      sleep_hours: 7,
      substance_use: {
        alcohol: "none",
        cigarettes: "no",
        vaping: "no",
        marijuana: "no"
      },
      fitness_level: "moderate",
      diet_pattern: "mixed"
    };
    traitsAdded.push("health_profile");
  }

  if (!updatedPersona.money_profile) {
    updatedPersona.money_profile = {
      attitude_toward_money: "practical",
      earning_context: "salary",
      spending_style: "balanced",
      savings_investing_habits: {
        emergency_fund_months: 3,
        retirement_contributions: "some",
        investing_style: "conservative"
      },
      debt_posture: "manageable",
      financial_stressors: [],
      money_conflicts: "moderate",
      generosity_profile: "selective"
    };
    traitsAdded.push("money_profile");
  }

  if (!updatedPersona.adoption_profile) {
    updatedPersona.adoption_profile = {
      buyer_power: 0.5,
      adoption_influence: 0.5,
      risk_tolerance: 0.5,
      change_friction: 0.5,
      expected_objections: [],
      proof_points_needed: []
    };
    traitsAdded.push("adoption_profile");
  }

  // Apply statistical health traits
  assignPhysicalHealth(updatedPersona, age, modifiers, traitsAdded);
  assignMentalHealth(updatedPersona, age, gender, modifiers, traitsAdded);
  assignSubstanceUse(updatedPersona, age, modifiers, traitsAdded);
  assignFinancialStressors(updatedPersona, age, traitsAdded);
  ensureTraitConsistency(updatedPersona);

  return { updatedPersona, traitsAdded };
}

function generateRealisticBMI(): number {
  const bmiRoll = Math.random();
  let bmi = 22.0; // fallback that should never be used
  
  if (bmiRoll < 0.02) {
    bmi = 16.5 + Math.random() * (18.4 - 16.5); // underweight
  } else if (bmiRoll < 0.34) { 
    bmi = 18.5 + Math.random() * (24.9 - 18.5); // normal
  } else if (bmiRoll < 0.70) {
    bmi = 25.0 + Math.random() * (29.9 - 25.0); // overweight
  } else if (bmiRoll < 0.90) {
    bmi = 30.0 + Math.random() * (34.9 - 30.0); // obese class 1
  } else if (bmiRoll < 0.97) {
    bmi = 35.0 + Math.random() * (39.9 - 35.0); // obese class 2
  } else {
    bmi = 40.0 + Math.random() * (50.0 - 40.0); // obese class 3
  }
  
  return Math.round(bmi * 10) / 10;
}

function assignPhysicalHealth(persona: any, age: number, modifiers: any, traitsAdded: string[]) {
  const dist = STATISTICAL_DISTRIBUTIONS.physical_health;
  
  // Generate realistic BMI
  persona.health_profile.bmi = generateRealisticBMI();
  
  // Chronic conditions based on age
  const conditions = [];
  const ageMultiplier = age > 65 ? 2.5 : age > 40 ? 1.5 : 1.0;
  
  if (Math.random() < dist.chronic_conditions.hypertension.overall * ageMultiplier) {
    conditions.push("hypertension");
    if (!persona.health_profile.medications.includes("none")) {
      persona.health_profile.medications = persona.health_profile.medications.filter(m => m !== "none");
    }
    persona.health_profile.medications.push("lisinopril");
    traitsAdded.push("hypertension + medication");
  }
  
  if (Math.random() < dist.chronic_conditions.diabetes.overall * ageMultiplier) {
    conditions.push("type_2_diabetes");
    persona.health_profile.medications.push("metformin");
    traitsAdded.push("diabetes + medication");
  }
  
  if (Math.random() < dist.chronic_conditions.arthritis.overall * ageMultiplier) {
    conditions.push("arthritis");
    traitsAdded.push("arthritis");
  }
  
  if (Math.random() < dist.chronic_conditions.chronic_pain.overall * ageMultiplier) {
    conditions.push("chronic_pain");
    persona.health_profile.medications.push("ibuprofen");
    traitsAdded.push("chronic_pain + medication");
  }
  
  persona.health_profile.chronic_conditions = conditions.length > 0 ? conditions : ["none"];
  
  // Sleep patterns
  const sleepRoll = Math.random();
  if (sleepRoll < dist.sleep_issues.insufficient_sleep) {
    persona.health_profile.sleep_hours = Math.floor(Math.random() * 2) + 5; // 5-6 hours
    traitsAdded.push("insufficient_sleep");
  } else {
    persona.health_profile.sleep_hours = Math.floor(Math.random() * 2) + 7; // 7-8 hours
  }
}

function assignMentalHealth(persona: any, age: number, gender: string, modifiers: any, traitsAdded: string[]) {
  const dist = STATISTICAL_DISTRIBUTIONS.mental_health;
  const flags = [];
  
  // Anxiety (higher in younger adults)
  const anxietyRate = dist.clinical_conditions.anxiety_disorders.overall * (modifiers.mental_health?.anxiety || 1.0);
  if (Math.random() < anxietyRate) {
    flags.push("generalized_anxiety");
    if (!persona.emotional_profile) persona.emotional_profile = { stress_responses: [], negative_triggers: [], explosive_triggers: [] };
    persona.emotional_profile.stress_responses.push("overthinking");
    persona.emotional_profile.negative_triggers.push("uncertainty");
    traitsAdded.push("anxiety + emotional_patterns");
  }
  
  // Depression screening
  const depressionRate = dist.clinical_conditions.depression.overall * (modifiers.mental_health?.depression || 1.0);
  if (Math.random() < depressionRate) {
    flags.push("depression");
    if (!persona.emotional_profile) persona.emotional_profile = { stress_responses: [], negative_triggers: [], explosive_triggers: [] };
    persona.emotional_profile.negative_triggers.push("isolation");
    if (!persona.daily_life) persona.daily_life = { mental_preoccupations: [], time_sentiment: { work: "neutral", family: "positive", personal: "neutral" } };
    persona.daily_life.mental_preoccupations.push("low_mood");
    traitsAdded.push("depression + daily_impact");
  }
  
  // ADHD (affects work and organization patterns)
  const adhdRate = dist.clinical_conditions.adhd.overall;
  if (Math.random() < adhdRate) {
    flags.push("adhd");
    if (!persona.daily_life) persona.daily_life = { mental_preoccupations: [], time_sentiment: { work: "neutral", family: "positive", personal: "neutral" } };
    persona.daily_life.mental_preoccupations.push("focus_challenges");
    if (!persona.cognitive_profile) persona.cognitive_profile = { thought_coherence: 0.8 };
    persona.cognitive_profile.thought_coherence = Math.max(0.1, persona.cognitive_profile.thought_coherence * 0.8);
    traitsAdded.push("adhd + cognitive_impact");
  }
  
  persona.health_profile.mental_health_flags = flags.length > 0 ? flags : ["none"];
}

function assignSubstanceUse(persona: any, age: number, modifiers: any, traitsAdded: string[]) {
  const dist = STATISTICAL_DISTRIBUTIONS.substance_patterns;
  
  // Alcohol use
  const alcoholRoll = Math.random();
  if (alcoholRoll < dist.alcohol.abstain) {
    persona.health_profile.substance_use.alcohol = "none";
  } else if (alcoholRoll < dist.alcohol.abstain + dist.alcohol.casual) {
    persona.health_profile.substance_use.alcohol = "occasional";
  } else if (alcoholRoll < dist.alcohol.abstain + dist.alcohol.casual + dist.alcohol.regular) {
    persona.health_profile.substance_use.alcohol = "regular";
  } else {
    persona.health_profile.substance_use.alcohol = "heavy";
    traitsAdded.push("heavy_alcohol_use");
  }
  
  // Tobacco use
  if (Math.random() < dist.tobacco.cigarettes) {
    persona.health_profile.substance_use.cigarettes = "yes";
    traitsAdded.push("cigarette_smoking");
  } else if (Math.random() < dist.tobacco.former_smoker) {
    persona.health_profile.substance_use.cigarettes = "former";
    traitsAdded.push("former_smoker");
  } else {
    persona.health_profile.substance_use.cigarettes = "no";
  }
  
  // Vaping (higher in younger demographics)
  const vapingRate = dist.tobacco.vaping * (age < 30 ? 3.0 : age < 45 ? 1.5 : 0.5);
  persona.health_profile.substance_use.vaping = Math.random() < vapingRate ? "yes" : "no";
  if (persona.health_profile.substance_use.vaping === "yes") {
    traitsAdded.push("vaping");
  }
}

function assignFinancialStressors(persona: any, age: number, traitsAdded: string[]) {
  const dist = STATISTICAL_DISTRIBUTIONS.financial_reality;
  const stressors = [];
  
  // Student loan debt
  if (Math.random() < dist.debt_burden.student_loans.has_debt) {
    stressors.push("student_loans");
    if (Math.random() < dist.debt_burden.student_loans.high_burden) {
      stressors.push("high_debt_burden");
    }
    traitsAdded.push("student_debt");
  }
  
  // Credit card debt
  if (Math.random() < dist.debt_burden.credit_card.carries_balance) {
    stressors.push("credit_card_debt");
    traitsAdded.push("credit_debt");
  }
  
  // Medical debt
  if (Math.random() < dist.debt_burden.medical_debt) {
    stressors.push("medical_debt");
    traitsAdded.push("medical_debt");
  }
  
  // Employment issues
  if (Math.random() < dist.employment_stress.job_insecurity) {
    stressors.push("job_insecurity");
    traitsAdded.push("job_insecurity");
  }
  
  // Housing burden
  if (Math.random() < dist.employment_stress.underemployed) {
    stressors.push("underemployment");
    traitsAdded.push("underemployment");
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
    if (!persona.relationships) persona.relationships = { friend_network: { size: "medium" } };
    persona.relationships.friend_network.size = "small"; // Common pattern
    if (!persona.communication_style) persona.communication_style = { voice_foundation: { empathy_level: 0.7 } };
    persona.communication_style.voice_foundation.empathy_level = Math.min(0.9, persona.communication_style.voice_foundation.empathy_level + 0.1);
  }
  
  // Financial stress affects multiple areas
  if (persona.money_profile.financial_stressors.length > 2) {
    if (!persona.daily_life) persona.daily_life = { mental_preoccupations: [], time_sentiment: { work: "neutral", family: "positive", personal: "neutral" } };
    persona.daily_life.mental_preoccupations.push("money_worries");
    if (!persona.emotional_profile) persona.emotional_profile = { stress_responses: [], negative_triggers: [], explosive_triggers: [] };
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { batchSize = 10, startIndex = 0, dryRun = false }: ConversionRequest = await req.json();
    
    console.log(`Starting conversion batch: size=${batchSize}, start=${startIndex}, dryRun=${dryRun}`);

    // Fetch incomplete personas
    const { data: personas, error: fetchError } = await supabase
      .from('v4_personas')
      .select('*')
      .eq('statistical_enhancement_status', 'pending')
      .range(startIndex, startIndex + batchSize - 1);

    if (fetchError) {
      console.error('Error fetching personas:', fetchError);
      throw fetchError;
    }

    const result: ConversionResult = {
      processed: 0,
      success: 0,
      failed: 0,
      examples: []
    };

    console.log(`Processing ${personas.length} personas`);

    for (const persona of personas) {
      try {
        result.processed++;
        
        const originalProfile = persona.full_profile || {};
        const { updatedPersona, traitsAdded } = assignRealisticTraits(originalProfile);
        
        // Track before/after for examples
        const beforeAfter = {
          chronicConditions: { 
            before: originalProfile.health_profile?.chronic_conditions || [], 
            after: updatedPersona.health_profile?.chronic_conditions || [] 
          },
          medications: { 
            before: originalProfile.health_profile?.medications || [], 
            after: updatedPersona.health_profile?.medications || [] 
          },
          financialStressors: { 
            before: originalProfile.money_profile?.financial_stressors || [], 
            after: updatedPersona.money_profile?.financial_stressors || [] 
          }
        };

        if (result.examples.length < 3) {
          result.examples.push({
            personaId: persona.persona_id,
            traitsAdded,
            beforeAfter
          });
        }

        if (!dryRun) {
          // Update the persona in database
          const { error: updateError } = await supabase
            .from('v4_personas')
            .update({
              full_profile: updatedPersona,
              statistical_enhancement_status: 'complete',
              enhancement_applied_at: new Date().toISOString()
            })
            .eq('persona_id', persona.persona_id);

          if (updateError) {
            console.error(`Error updating persona ${persona.persona_id}:`, updateError);
            result.failed++;
            continue;
          }
        }

        result.success++;
        console.log(`${dryRun ? 'Simulated' : 'Completed'} conversion for persona: ${persona.persona_id}`);
        
      } catch (error) {
        console.error(`Error processing persona ${persona.persona_id}:`, error);
        result.failed++;
      }
    }

    console.log(`Conversion batch complete:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in convert-personas-statistical function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});