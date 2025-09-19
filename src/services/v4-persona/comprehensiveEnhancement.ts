import { STATISTICAL_DISTRIBUTIONS, AGE_MODIFIERS } from './statisticalDistributions';
import { assignRealisticTraits, PersonaDemographics } from './traitAssignment';

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
  const enhanced = { ...persona };

  // Extract demographics for statistical assignment
  const demographics: PersonaDemographics = {
    age: enhanced.identity?.age || 35,
    income: enhanced.identity?.income_bracket || "middle",
    region: enhanced.identity?.location?.region || "midwest", 
    ethnicity: enhanced.identity?.ethnicity || "white",
    gender: enhanced.identity?.gender || "female"
  };

  // Apply existing medical/health statistical traits
  const medicallyEnhanced = assignRealisticTraits(enhanced, demographics);
  
  // Check if medical traits were added
  if (JSON.stringify(enhanced) !== JSON.stringify(medicallyEnhanced)) {
    changes.push("Applied medical and health statistical traits");
    Object.assign(enhanced, medicallyEnhanced);
  }

  // NEW: Apply income bracket based on occupation and age
  if (!enhanced.identity?.income_bracket || enhanced.identity.income_bracket === "unspecified") {
    const income = assignIncomeBracket(enhanced.identity?.occupation, enhanced.identity?.age, enhanced.identity?.location?.region);
    enhanced.identity.income_bracket = income;
    changes.push(`Assigned income bracket: ${income}`);
  }

  return { persona: enhanced, changes };
}

// PHASE 3: Completeness Enhancement
export function applyCompletenessEnhancement(persona: any): { persona: any; changes: string[] } {
  const changes: string[] = [];
  const enhanced = { ...persona };

  // Fill empty humor arrays
  if (enhanced.humor_profile) {
    if (!enhanced.humor_profile.targets || enhanced.humor_profile.targets.length === 0) {
      enhanced.humor_profile.targets = assignHumorTargets(enhanced);
      changes.push("Added humor targets");
    }
    
    if (!enhanced.humor_profile.boundaries || enhanced.humor_profile.boundaries.length === 0) {
      enhanced.humor_profile.boundaries = assignHumorBoundaries(enhanced);
      changes.push("Added humor boundaries");
    }
    
    if (!enhanced.humor_profile.use_cases || enhanced.humor_profile.use_cases.length === 0) {
      enhanced.humor_profile.use_cases = assignHumorUseCases(enhanced);
      changes.push("Added humor use cases");
    }
  }

  // Fill empty bias mitigation arrays
  if (enhanced.bias_profile && (!enhanced.bias_profile.mitigations || enhanced.bias_profile.mitigations.length === 0)) {
    enhanced.bias_profile.mitigations = assignBiasMitigations(enhanced);
    changes.push("Added bias mitigations");
  }

  // Fill empty emotional trigger arrays
  if (enhanced.emotional_profile) {
    if (!enhanced.emotional_profile.positive_triggers || enhanced.emotional_profile.positive_triggers.length === 0) {
      enhanced.emotional_profile.positive_triggers = assignPositiveTriggers(enhanced);
      changes.push("Added positive emotional triggers");
    }
    
    if (!enhanced.emotional_profile.negative_triggers || enhanced.emotional_profile.negative_triggers.length === 0) {
      enhanced.emotional_profile.negative_triggers = assignNegativeTriggers(enhanced);
      changes.push("Added negative emotional triggers");
    }
  }

  // Fill motivation arrays
  if (enhanced.motivation_profile) {
    if (!enhanced.motivation_profile.primary_motivation_labels || enhanced.motivation_profile.primary_motivation_labels.length === 0) {
      enhanced.motivation_profile.primary_motivation_labels = assignMotivationLabels(enhanced);
      changes.push("Added motivation labels");
    }
    
    if (!enhanced.motivation_profile.deal_breakers || enhanced.motivation_profile.deal_breakers.length === 0) {
      enhanced.motivation_profile.deal_breakers = assignDealBreakers(enhanced);
      changes.push("Added deal breakers");
    }
  }

  // Replace "unspecified" values throughout
  replaceUnspecifiedValues(enhanced, changes);

  return { persona: enhanced, changes };
}

// Income assignment based on occupation and demographics
function assignIncomeBracket(occupation: string, age: number, region: string): string {
  const occupationMap: Record<string, string[]> = {
    "firefighter": ["middle", "upper_middle"],
    "retired_firefighter": ["middle", "lower_middle"],
    "teacher": ["lower_middle", "middle"],
    "nurse": ["middle", "upper_middle"],
    "engineer": ["upper_middle", "upper"],
    "retail": ["lower", "lower_middle"],
    "manager": ["middle", "upper_middle"],
    "consultant": ["upper_middle", "upper"],
    "student": ["lower", "lower_middle"],
    "unemployed": ["lower"]
  };

  const brackets = occupationMap[occupation?.toLowerCase()] || ["middle"];
  
  // Age adjustments
  if (age < 25) return brackets[0]; // Younger = lower end
  if (age > 55 && occupation?.includes("retired")) return "middle"; // Retirement income
  
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

function replaceUnspecifiedValues(persona: any, changes: string[]): void {
  function traverse(obj: any, path: string = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (value === "unspecified") {
        const replacement = getDefaultValue(currentPath, persona);
        obj[key] = replacement;
        changes.push(`Replaced unspecified value at ${currentPath}: ${replacement}`);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        traverse(value, currentPath);
      }
    }
  }
  
  traverse(persona);
}

function getDefaultValue(path: string, persona: any): string {
  // Context-aware defaults based on other persona characteristics
  const defaults: Record<string, string> = {
    "identity.education_level": getEducationDefault(persona),
    "identity.relationship_status": getRelationshipDefault(persona),
    "daily_life.time_sentiment.work": "neutral",
    "daily_life.time_sentiment.family": "positive", 
    "daily_life.time_sentiment.personal": "neutral",
    "health_profile.fitness_level": getFitnessDefault(persona),
    "communication_style.voice_foundation.formality": "casual",
    "communication_style.voice_foundation.directness": "moderate",
    "communication_style.voice_foundation.pace_rhythm": "measured"
  };
  
  return defaults[path] || "moderate";
}

function getEducationDefault(persona: any): string {
  const occupation = persona.identity?.occupation?.toLowerCase() || "";
  
  if (occupation.includes("firefighter")) return "high_school";
  if (occupation.includes("engineer") || occupation.includes("nurse")) return "college";
  if (occupation.includes("teacher")) return "college";
  
  return "high_school";
}

function getRelationshipDefault(persona: any): string {
  const age = persona.identity?.age || 35;
  
  if (age < 25) return "single";
  if (age > 60) return "married";
  
  return Math.random() > 0.5 ? "married" : "single";
}

function getFitnessDefault(persona: any): string {
  const occupation = persona.identity?.occupation?.toLowerCase() || "";
  const age = persona.identity?.age || 35;
  
  if (occupation.includes("firefighter") && age < 60) return "high";
  if (persona.health_profile?.chronic_conditions?.includes("arthritis")) return "low";
  
  return age > 65 ? "low" : "moderate";
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