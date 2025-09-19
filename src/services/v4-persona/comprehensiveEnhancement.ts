// Removed broken imports - all functionality implemented directly in this file

export interface EnhancementPhases {
  structural: boolean;
  statistical: boolean;
  completeness: boolean;
}

export interface ComprehensiveEnhancementResult {
  persona: any;
  phasesApplied: EnhancementPhases;
  changesLog: string[];
  completenessScore: {
    before: number;
    after: number;
  };
}

// PHASE 1: Structural Enhancement (existing functionality)
export function applyStructuralEnhancement(persona: any): { persona: any; changes: string[] } {
  // This is handled by the existing AI fix system
  return { persona, changes: [] };
}

// PHASE 2: Enhanced Statistical Enhancement
export function applyStatisticalEnhancement(persona: any): { persona: any; changes: string[] } {
  const changes: string[] = [];
  const enhanced = JSON.parse(JSON.stringify(persona)); // Deep clone
  
  // Initialize missing sections
  if (!enhanced.health_profile) {
    enhanced.health_profile = {
      bmi: 22.3,
      chronic_conditions: ["N/A"],
      mental_health_flags: ["N/A"],
      medications: ["N/A"],
      adherence_level: "good",
      sleep_hours: 7,
      substance_use: { alcohol: "social", cigarettes: "N/A", vaping: "N/A", marijuana: "N/A" },
      fitness_level: "moderate",
      diet_pattern: "standard"
    };
    changes.push("Initialized health_profile");
  }
  
  if (!enhanced.money_profile) {
    enhanced.money_profile = {
      attitude_toward_money: "practical",
      earning_context: "stable",
      spending_style: "balanced",
      savings_investing_habits: { emergency_fund_months: 3, retirement_contributions: "minimal", investing_style: "conservative" },
      debt_posture: "manageable",
      financial_stressors: ["N/A"],
      money_conflicts: "minor",
      generosity_profile: "selective"
    };
    changes.push("Initialized money_profile");
  }

  // Apply statistical medical traits based on demographics
  const age = enhanced.identity?.age || 25;
  const income = enhanced.identity?.income_bracket?.toLowerCase() || "";
  
  // Age-based health conditions
  if (age >= 45) {
    if (Math.random() < 0.35 && !enhanced.health_profile.chronic_conditions.includes("hypertension")) {
      enhanced.health_profile.chronic_conditions.push("hypertension");
      if (!enhanced.health_profile.medications.includes("lisinopril")) {
        enhanced.health_profile.medications.push("lisinopril");
      }
      changes.push("Added age-appropriate hypertension");
    }
    if (age >= 50 && Math.random() < 0.15 && !enhanced.health_profile.chronic_conditions.includes("type_2_diabetes")) {
      enhanced.health_profile.chronic_conditions.push("type_2_diabetes");
      if (!enhanced.health_profile.medications.includes("metformin")) {
        enhanced.health_profile.medications.push("metformin");
      }
      changes.push("Added age-appropriate diabetes");
    }
  }

  // Income-based financial stress
  if (income.includes("20k") || income.includes("30k") || income.includes("low")) {
    if (!enhanced.money_profile.financial_stressors.includes("credit_card_debt")) {
      enhanced.money_profile.financial_stressors.push("credit_card_debt");
      changes.push("Added income-appropriate financial stressors");
    }
    enhanced.money_profile.debt_posture = "struggling";
  } else if (income.includes("50k") || income.includes("middle")) {
    if (Math.random() < 0.4 && !enhanced.money_profile.financial_stressors.includes("mortgage_payments")) {
      enhanced.money_profile.financial_stressors.push("mortgage_payments");
      changes.push("Added mortgage-related financial stress");
    }
  }

  // Mental health based on stress
  if (enhanced.money_profile.financial_stressors.length > 1) {
    if (!enhanced.health_profile.mental_health_flags.includes("anxiety")) {
      enhanced.health_profile.mental_health_flags.push("anxiety");
      changes.push("Added stress-related anxiety");
    }
  }

  // NEW: Apply income bracket based on occupation and age (must succeed or fail)
  if (!enhanced.identity?.income_bracket || enhanced.identity.income_bracket === "unspecified") {
    const income = assignIncomeBracket(enhanced.identity?.occupation, enhanced.identity?.age, enhanced.identity?.location?.region);
    if (!income) {
      throw new Error(`Income bracket assignment failed for occupation: ${enhanced.identity?.occupation || 'unknown'}`);
    }
    enhanced.identity.income_bracket = income;
    changes.push(`Assigned income bracket: ${income}`);
  }

  return { persona: enhanced, changes };
}

// PHASE 3: Completeness Validation (No defaults - fail if incomplete)
export function applyCompletenessEnhancement(persona: any): { persona: any; changes: string[] } {
  const changes: string[] = [];
  
  // Validate that required arrays exist and are populated
  const requiredArrays = [
    'humor_profile.targets',
    'humor_profile.boundaries', 
    'humor_profile.use_cases',
    'bias_profile.mitigations', 
    'emotional_profile.positive_triggers',
    'emotional_profile.negative_triggers',
    'motivation_profile.primary_motivation_labels',
    'motivation_profile.deal_breakers'
  ];
  
  for (const arrayPath of requiredArrays) {
    const [section, field] = arrayPath.split('.');
    if (!persona[section]?.[field] || persona[section][field].length === 0) {
      throw new Error(`Required field ${arrayPath} is empty - statistical generation must populate this field`);
    }
  }
  
  // Check for "unspecified" values and fail if found
  const unspecifiedFound = findUnspecifiedValues(persona);
  if (unspecifiedFound.length > 0) {
    throw new Error(`Unspecified values found: ${unspecifiedFound.join(', ')} - statistical generation incomplete`);
  }
  
  // Check for empty string values and fail if found
  const emptyStringFields = findEmptyStringValues(persona);
  if (emptyStringFields.length > 0) {
    throw new Error(`Empty string values found: ${emptyStringFields.join(', ')} - all fields must have meaningful values`);
  }
  
  return { persona, changes: ['Validation passed - no fallbacks needed'] };
}

// Income assignment based on occupation and demographics
function assignIncomeBracket(occupation: string, age: number, region: string = ""): string {
  const occupationMap: Record<string, string[]> = {
    "firefighter": ["$50k-75k", "$75k-100k"],
    "retired_firefighter": ["$30k-50k", "$40k-60k"],
    "teacher": ["$35k-50k", "$45k-65k"],
    "nurse": ["$50k-75k", "$65k-85k"],
    "engineer": ["$75k-100k", "$100k+"],
    "retail": ["$20k-35k", "$25k-40k"],
    "manager": ["$60k-80k", "$75k-100k"],
    "consultant": ["$80k-120k", "$100k+"],
    "student": ["$15k-25k", "$20k-30k"],
    "unemployed": ["$15k-25k"]
  };

  const key = occupation?.toLowerCase() || "";
  let brackets = occupationMap[key];
  
  // Handle retired occupations
  if (key.includes("retired") || (age > 62 && key !== "student")) {
    brackets = ["$30k-50k", "$40k-60k"]; // Pension/retirement income
  }
  
  // Default brackets if occupation not found
  if (!brackets) {
    brackets = ["$40k-60k", "$50k-75k"];
  }
  
  // Age adjustments
  if (age < 25) return brackets[0]; // Younger = lower end
  if (age > 65) return "$30k-50k"; // Retirement/fixed income
  
  return brackets[Math.floor(Math.random() * brackets.length)];
}

// Humor targets based on personality and demographics
function assignHumorTargets(persona: any): string[] {
  const baseTargets = ["everyday_situations", "self_deprecating"];
  
  if (persona.identity?.occupation === "firefighter") {
    baseTargets.push("work_situations", "colleagues");
  }
  
  if (persona.communication_style?.voice_foundation?.directness === "direct") {
    baseTargets.push("absurd_situations", "social_norms");
  }
  
  return baseTargets;
}

function assignHumorBoundaries(persona: any): string[] {
  const boundaries = ["no_offensive_jokes", "respectful_of_others"];
  
  if (persona.motivation_profile?.primary_drivers?.care > 0.7) {
    boundaries.push("no_harm_based_humor");
  }
  
  if (persona.identity?.ethnicity && persona.identity.ethnicity !== "white") {
    boundaries.push("sensitive_to_cultural_issues");
  }
  
  return boundaries;
}

function assignHumorUseCases(persona: any): string[] {
  const useCases = ["lightening_mood", "building_rapport"];
  
  if (persona.relationships?.friend_network?.size === "large") {
    useCases.push("social_situations", "group_dynamics");
  }
  
  if (persona.emotional_profile?.stress_responses?.includes("humor")) {
    useCases.push("stress_relief", "coping_mechanism");
  }
  
  return useCases;
}

function assignBiasMitigations(persona: any): string[] {
  const mitigations = ["seek_diverse_perspectives"];
  
  if (persona.cognitive_profile?.abstract_reasoning > 0.7) {
    mitigations.push("analytical_thinking", "evidence_based_decisions");
  }
  
  if (persona.communication_style?.voice_foundation?.empathy_level > 0.7) {
    mitigations.push("consider_others_viewpoints", "emotional_intelligence");
  }
  
  if (persona.identity?.education_level === "college" || persona.identity?.education_level === "graduate") {
    mitigations.push("research_before_deciding", "question_assumptions");
  }
  
  return mitigations;
}

function assignPositiveTriggers(persona: any): string[] {
  const triggers = ["achievement", "connection_with_others"];
  
  if (persona.motivation_profile?.primary_drivers?.family > 0.7) {
    triggers.push("family_time", "helping_family");
  }
  
  if (persona.motivation_profile?.primary_drivers?.mastery > 0.7) {
    triggers.push("learning_new_skills", "completing_projects");
  }
  
  if (persona.identity?.occupation?.includes("firefighter")) {
    triggers.push("helping_others", "community_service");
  }
  
  return triggers;
}

function assignNegativeTriggers(persona: any): string[] {
  const triggers = ["unfairness", "disrespect"];
  
  if (persona.bias_profile?.cognitive?.loss_aversion > 0.7) {
    triggers.push("losing_something_important", "wasted_effort");
  }
  
  if (persona.health_profile?.mental_health_flags?.includes("anxiety")) {
    triggers.push("uncertainty", "overwhelming_situations");
  }
  
  if (persona.money_profile?.financial_stressors?.length > 0) {
    triggers.push("financial_pressure", "unexpected_expenses");
  }
  
  return triggers;
}

function assignMotivationLabels(persona: any): string[] {
  const labels = [];
  
  const drivers = persona.motivation_profile?.primary_drivers || {};
  
  if (drivers.care > 0.7) labels.push("caregiver");
  if (drivers.family > 0.7) labels.push("family_focused");
  if (drivers.security > 0.7) labels.push("security_conscious");
  if (drivers.mastery > 0.7) labels.push("achievement_oriented");
  if (drivers.meaning > 0.7) labels.push("purpose_driven");
  
  return labels.length > 0 ? labels : ["balanced_motivations"];
}

function assignDealBreakers(persona: any): string[] {
  const dealBreakers = ["dishonesty", "disrespect"];
  
  if (persona.motivation_profile?.primary_drivers?.care > 0.8) {
    dealBreakers.push("harm_to_others");
  }
  
  if (persona.identity?.occupation?.includes("firefighter")) {
    dealBreakers.push("endangering_others", "cowardice");
  }
  
  if (persona.truth_honesty_profile?.baseline_honesty > 0.8) {
    dealBreakers.push("manipulation", "deception");
  }
  
  return dealBreakers;
}

function findUnspecifiedValues(persona: any, path: string = ''): string[] {
  const unspecified: string[] = [];
  
  function processObject(obj: any, currentPath: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = currentPath ? `${currentPath}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        processObject(value, fullPath);
      } else if (value === 'unspecified') {
        unspecified.push(fullPath);
      }
    }
  }
  
  processObject(persona, path);
  return unspecified;
}

function findEmptyStringValues(persona: any, path: string = ''): string[] {
  const emptyStrings: string[] = [];
  
  function processObject(obj: any, currentPath: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = currentPath ? `${currentPath}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        processObject(value, fullPath);
      } else if (typeof value === 'string' && value === '') {
        emptyStrings.push(fullPath);
      }
    }
  }
  
  processObject(persona, path);
  return emptyStrings;
}

// Comprehensive enhancement orchestrator
export function applyComprehensiveEnhancement(
  persona: any, 
  includeStatistical: boolean = true, 
  includeCompleteness: boolean = true
): ComprehensiveEnhancementResult {
  const allChanges: string[] = [];
  let enhanced = { ...persona };
  const phasesApplied: EnhancementPhases = {
    structural: false,
    statistical: false,
    completeness: false
  };

  const beforeScore = calculateCompletenessScore(enhanced);

  // Phase 2: Statistical Enhancement
  if (includeStatistical) {
    const { persona: statEnhanced, changes: statChanges } = applyStatisticalEnhancement(enhanced);
    if (statChanges.length > 0) {
      enhanced = statEnhanced;
      allChanges.push(...statChanges);
      phasesApplied.statistical = true;
    }
  }

  // Phase 3: Completeness Enhancement  
  if (includeCompleteness) {
    const { persona: compEnhanced, changes: compChanges } = applyCompletenessEnhancement(enhanced);
    if (compChanges.length > 0) {
      enhanced = compEnhanced;
      allChanges.push(...compChanges);
      phasesApplied.completeness = true;
    }
  }

  const afterScore = calculateCompletenessScore(enhanced);

  return {
    persona: enhanced,
    phasesApplied,
    changesLog: allChanges,
    completenessScore: {
      before: beforeScore,
      after: afterScore
    }
  };
}

// Calculate completeness score (0-1)
export function calculateCompletenessScore(persona: any): number {
  let totalFields = 0;
  let filledFields = 0;

  function analyzeCompleteness(obj: any): void {
    for (const [key, value] of Object.entries(obj)) {
      totalFields++;
      
      if (value === null || value === "" || value === "unspecified") {
        // Empty field
      } else if (Array.isArray(value) && value.length === 0) {
        // Empty array (may or may not be expected)
        if (!['pets', 'topics_off_limits'].includes(key)) {
          // This array should probably have content
        } else {
          filledFields++; // Some arrays are legitimately empty
        }
      } else if (isValidNoContentValue(value)) {
        // Treat "N/A" values as complete (properly evaluated but no applicable content)
        filledFields++;
      } else if (typeof value === 'object' && value !== null) {
        analyzeCompleteness(value);
      } else {
        filledFields++;
      }
    }
  }

  analyzeCompleteness(persona);
  
  return totalFields > 0 ? filledFields / totalFields : 0;
}

// Helper function to check if a value represents "no applicable content"
function isValidNoContentValue(value: any): boolean {
  if (Array.isArray(value)) {
    return value.length === 1 && value[0] === "N/A";
  }
  return value === "N/A";
}