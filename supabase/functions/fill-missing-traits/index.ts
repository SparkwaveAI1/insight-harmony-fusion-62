import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

// Import statistical enhancement functions
function applyStatisticalEnhancement(persona: any): any {
  const enhanced = JSON.parse(JSON.stringify(persona)); // Deep clone
  
  // DISABLED: Health sanitization removed - preserving authentic OpenAI health diversity
  // Initialize missing sections
  // if (!enhanced.health_profile) {
  //   enhanced.health_profile = {
  //     bmi: 22.5,
  //     chronic_conditions: ["N/A"],
  //     mental_health_flags: ["N/A"],
  //     medications: ["N/A"],
  //     adherence_level: "good",
  //     sleep_hours: 7,
  //     substance_use: { alcohol: "social", cigarettes: "N/A", vaping: "N/A", marijuana: "N/A" },
  //     fitness_level: "moderate",
  //     diet_pattern: "standard"
  //   };
  // }
  
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
  }

  // Extract demographics
  const age = enhanced.identity?.age || 25;
  const income = enhanced.identity?.income_bracket?.toLowerCase() || "middle";
  
  // Apply age-based health conditions
  if (age >= 45) {
    if (Math.random() < 0.35) { // 35% chance for hypertension after 45
      if (!enhanced.health_profile.chronic_conditions.includes("hypertension")) {
        enhanced.health_profile.chronic_conditions.push("hypertension");
        if (!enhanced.health_profile.medications.includes("lisinopril")) {
          enhanced.health_profile.medications.push("lisinopril");
        }
      }
    }
    if (age >= 50 && Math.random() < 0.15) { // 15% chance for diabetes after 50
      if (!enhanced.health_profile.chronic_conditions.includes("type_2_diabetes")) {
        enhanced.health_profile.chronic_conditions.push("type_2_diabetes");
        if (!enhanced.health_profile.medications.includes("metformin")) {
          enhanced.health_profile.medications.push("metformin");
        }
      }
    }
  }

  // Apply income-based financial stress
  if (income.includes("20k") || income.includes("30k") || income.includes("low")) {
    if (!enhanced.money_profile.financial_stressors.includes("credit_card_debt")) {
      enhanced.money_profile.financial_stressors.push("credit_card_debt");
    }
    if (!enhanced.money_profile.financial_stressors.includes("student_loans")) {
      enhanced.money_profile.financial_stressors.push("student_loans");
    }
    enhanced.money_profile.debt_posture = "struggling";
  } else if (income.includes("50k") || income.includes("middle")) {
    if (Math.random() < 0.4 && !enhanced.money_profile.financial_stressors.includes("mortgage_payments")) {
      enhanced.money_profile.financial_stressors.push("mortgage_payments");
    }
  }

  // Apply mental health based on stress levels
  if (enhanced.money_profile.financial_stressors.length > 1) {
    if (!enhanced.health_profile.mental_health_flags.includes("anxiety")) {
      enhanced.health_profile.mental_health_flags.push("anxiety");
    }
    if (Math.random() < 0.3 && !enhanced.health_profile.medications.includes("sertraline")) {
      enhanced.health_profile.medications.push("sertraline");
    }
  }

  return enhanced;
}

function getStatisticalTraitsAdded(before: any, after: any): string[] {
  const added = [];
  
  // Check for new chronic conditions
  const beforeConditions = before.health_profile?.chronic_conditions || [];
  const afterConditions = after.health_profile?.chronic_conditions || [];
  const newConditions = afterConditions.filter((c: any) => !beforeConditions.includes(c));
  if (newConditions.length > 0) {
    added.push("chronic_conditions");
  }
  
  // Check for new medications
  const beforeMeds = before.health_profile?.medications || [];
  const afterMeds = after.health_profile?.medications || [];
  const newMeds = afterMeds.filter((m: any) => !beforeMeds.includes(m));
  if (newMeds.length > 0) {
    added.push("medications");
  }
  
  // Check for new financial stressors
  const beforeStressors = before.money_profile?.financial_stressors || [];
  const afterStressors = after.money_profile?.financial_stressors || [];
  const newStressors = afterStressors.filter((s: any) => !beforeStressors.includes(s));
  if (newStressors.length > 0) {
    added.push("financial_stressors");
  }
  
  // Check for new mental health flags
  const beforeMental = before.health_profile?.mental_health_flags || [];
  const afterMental = after.health_profile?.mental_health_flags || [];
  const newMental = afterMental.filter((m: any) => !beforeMental.includes(m));
  if (newMental.length > 0) {
    added.push("mental_health_flags");
  }
  
  return added;
}

// NEW: Comprehensive enhancement functions
function applyComprehensiveEnhancement(persona: any, includeStatistical: boolean, includeCompleteness: boolean): any {
  const allChanges: string[] = [];
  let enhanced = { ...persona };

  // Phase 1: Statistical Enhancement (existing medical traits)
  if (includeStatistical) {
    const medicallyEnhanced = applyStatisticalEnhancement(enhanced);
    if (JSON.stringify(enhanced) !== JSON.stringify(medicallyEnhanced)) {
      enhanced = medicallyEnhanced;
      allChanges.push("Applied medical statistical traits");
    }

    // NEW: Income bracket assignment - must succeed or fail
    if (!enhanced.identity?.income_bracket || enhanced.identity.income_bracket === "unspecified") {
      const income = assignIncomeBracket(enhanced.identity?.occupation, enhanced.identity?.age);
      if (!income) {
        throw new Error(`Income bracket assignment failed for occupation: ${enhanced.identity?.occupation || 'unknown'}`);
      }
      enhanced.identity.income_bracket = income;
      allChanges.push(`Assigned income bracket: ${income}`);
    }
  }

  // Phase 2: Completeness Validation (no defaults)
  if (includeCompleteness) {
    validateCompleteness(enhanced, allChanges);
  }

  return {
    persona: enhanced,
    changesLog: allChanges,
    completenessScore: {
      before: calculateTrueCompleteness(persona),
      after: calculateTrueCompleteness(enhanced)
    }
  };
}

function assignIncomeBracket(occupation: string, age: number): string {
  const occupationMap: Record<string, string[]> = {
    "firefighter": ["$50k-75k", "$75k-100k"],
    "retired": ["$30k-50k", "$40k-60k"],
    "teacher": ["$35k-50k", "$45k-65k"],
    "nurse": ["$50k-75k", "$65k-85k"],
    "engineer": ["$75k-100k", "$100k+"],
    "retail": ["$20k-35k", "$25k-40k"],
    "manager": ["$60k-80k", "$75k-100k"],
    "student": ["$15k-25k", "$20k-30k"]
  };

  const key = occupation?.toLowerCase() || "";
  let brackets = occupationMap[key];
  
  // Handle retired occupations
  if (key.includes("retired") || age > 62) {
    brackets = ["$30k-50k", "$40k-60k"]; // Pension/retirement income
  }
  
  // Default if not found
  if (!brackets) {
    brackets = ["$40k-60k", "$50k-75k"];
  }
  
  // Age adjustments
  if (age < 25) return brackets[0];
  if (age > 65) return "$30k-50k";
  
  return brackets[Math.floor(Math.random() * brackets.length)];
}

function fillEmptyArraysAndValues(persona: any): string[] {
  const changes: string[] = [];

  // Fill humor arrays
  if (persona.humor_profile) {
    if (!persona.humor_profile.targets || persona.humor_profile.targets.length === 0) {
      persona.humor_profile.targets = ["everyday_situations", "self_deprecating", "work_situations"];
      changes.push("Added humor targets");
    }
    if (!persona.humor_profile.boundaries || persona.humor_profile.boundaries.length === 0) {
      persona.humor_profile.boundaries = ["no_offensive_jokes", "respectful_of_others"];
      changes.push("Added humor boundaries");
    }
    if (!persona.humor_profile.use_cases || persona.humor_profile.use_cases.length === 0) {
      persona.humor_profile.use_cases = ["lightening_mood", "building_rapport", "stress_relief"];
      changes.push("Added humor use cases");
    }
  }

  // Fill bias mitigations
  if (persona.bias_profile && (!persona.bias_profile.mitigations || persona.bias_profile.mitigations.length === 0)) {
    persona.bias_profile.mitigations = ["seek_diverse_perspectives", "question_assumptions", "consider_others_viewpoints"];
    changes.push("Added bias mitigations");
  }

  // Fill emotional triggers
  if (persona.emotional_profile) {
    if (!persona.emotional_profile.positive_triggers || persona.emotional_profile.positive_triggers.length === 0) {
      persona.emotional_profile.positive_triggers = ["achievement", "helping_others", "family_time"];
      changes.push("Added positive triggers");
    }
    if (!persona.emotional_profile.negative_triggers || persona.emotional_profile.negative_triggers.length === 0) {
      persona.emotional_profile.negative_triggers = ["unfairness", "disrespect", "overwhelming_situations"];  
      changes.push("Added negative triggers");
    }
  }

  // Fill motivation arrays
  if (persona.motivation_profile) {
    if (!persona.motivation_profile.primary_motivation_labels || persona.motivation_profile.primary_motivation_labels.length === 0) {
      persona.motivation_profile.primary_motivation_labels = ["security_conscious", "family_focused", "achievement_oriented"];
      changes.push("Added motivation labels");
    }
    if (!persona.motivation_profile.deal_breakers || persona.motivation_profile.deal_breakers.length === 0) {
      persona.motivation_profile.deal_breakers = ["dishonesty", "disrespect", "harm_to_others"];
      changes.push("Added deal breakers");
    }
  }

  return changes;
}

function validateCompleteness(persona: any, changes: string[]): void {
  // Check for "unspecified" values and fail if found
  function findUnspecifiedValues(obj: any, path: string = ''): string[] {
    const unspecified: string[] = [];
    
    function traverse(obj: any, currentPath: string = '') {
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = currentPath ? `${currentPath}.${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          traverse(value, fullPath);
        } else if (value === 'unspecified') {
          unspecified.push(fullPath);
        }
      }
    }
    
    traverse(obj, path);
    return unspecified;
  }
  
  const unspecifiedFound = findUnspecifiedValues(persona);
  if (unspecifiedFound.length > 0) {
    throw new Error(`Unspecified values found: ${unspecifiedFound.join(', ')} - statistical generation incomplete`);
  }
  
  changes.push('Validation passed - no unspecified values found');
}
function calculateTrueCompleteness(persona: any): number {
  let totalFields = 0;
  let completeFields = 0;

  // Helper function to check if a value represents "no applicable content"
  function isValidNoContentValue(value: any): boolean {
    if (Array.isArray(value)) {
      return value.length === 1 && value[0] === "N/A";
    }
    return value === "N/A";
  }

  function analyzeField(obj: any): void {
    for (const [key, value] of Object.entries(obj)) {
      totalFields++;
      
      if (value === null || value === '' || value === 'unspecified') {
        // Incomplete
      } else if (Array.isArray(value)) {
        const shouldHaveContent = ['targets', 'boundaries', 'use_cases', 'mitigations', 'positive_triggers', 'negative_triggers', 'primary_motivation_labels', 'deal_breakers'];
        if (shouldHaveContent.includes(key) && value.length === 0) {
          // Empty but should have content
        } else if (isValidNoContentValue(value) || value.length > 0) {
          // Treat "N/A" values as complete (properly evaluated but no applicable content)
          completeFields++;
        }
      } else if (isValidNoContentValue(value)) {
        // Treat "N/A" values as complete (properly evaluated but no applicable content)
        completeFields++;
      } else if (typeof value === 'object' && value !== null) {
        analyzeField(value);
      } else {
        completeFields++;
      }
    }
  }

  analyzeField(persona);
  return totalFields > 0 ? completeFields / totalFields : 0;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// New validation system - replace existing validation completely

// Quick JSON Schema guard for top-level structure
const PERSONA_SCHEMA = {
  type: "object",
  required: [
    "identity", "daily_life", "health_profile", "relationships", "money_profile",
    "motivation_profile", "communication_style", "humor_profile", "truth_honesty_profile",
    "bias_profile", "cognitive_profile", "emotional_profile", "attitude_narrative",
    "political_narrative", "adoption_profile", "prompt_shaping", "sexuality_profile"
  ],
  additionalProperties: false
};

// BANNED fields that should never appear anywhere
const BANNED_KEYS = [
  'big_five', 'social_identity', 'inhibitor_profile', 'cultural_dimensions', 
  'behavioral_economics', 'identity_salience', 'knowledge_profile', 'contradictions',
  'attitude_snapshot', 'political_signals', 'linguistic_signature', 'signature_phrases',
  'physical_profile'
];

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completenessScore: number;
}

function validatePersona(persona: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for banned keys anywhere in the object
  function checkForBannedKeys(obj: any, path = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (BANNED_KEYS.includes(key)) {
        errors.push(`Banned key found: ${currentPath}`);
      }
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        checkForBannedKeys(value, currentPath);
      }
    }
  }

  checkForBannedKeys(persona);

  // Check required top-level fields
  for (const field of PERSONA_SCHEMA.required) {
    if (!persona[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Hard stops - critical validations
  if (persona.identity) {
    if (!persona.identity.education_level) {
      errors.push('Missing identity.education_level');
    }
    if (!persona.identity.income_bracket) {
      errors.push('Missing identity.income_bracket');
    }
    if (!persona.identity.location?.urbanicity) {
      errors.push('Missing identity.location.urbanicity');
    }
    
    // Age validation
    if (persona.identity.age && (persona.identity.age < 18 || persona.identity.age > 100)) {
      errors.push(`Invalid age: ${persona.identity.age}`);
    }
  }

  if (persona.cognitive_profile && typeof persona.cognitive_profile.thought_coherence !== 'number') {
    errors.push('Missing or invalid cognitive_profile.thought_coherence');
  }

  // Daily activities validation
  if (persona.daily_life?.primary_activities) {
    const activities = persona.daily_life.primary_activities;
    const totalHours = Object.values(activities).reduce((sum: number, hours: any) => sum + (Number(hours) || 0), 0);
    
    if (totalHours > 30) { // Allow some flexibility but catch obvious errors
      errors.push(`Daily activities total ${totalHours} hours - unrealistic`);
    }
  }

  // Numeric range validations
  const numericFields = [
    { path: 'motivation_profile.primary_drivers', fields: ['care', 'family', 'status', 'mastery', 'meaning', 'novelty', 'security', 'belonging', 'self_interest'] },
    { path: 'truth_honesty_profile', fields: ['baseline_honesty'] },
    { path: 'truth_honesty_profile.situational_variance', fields: ['work', 'home', 'public'] },
    { path: 'bias_profile.cognitive', fields: ['status_quo', 'loss_aversion', 'confirmation', 'anchoring', 'availability', 'optimism', 'sunk_cost', 'overconfidence'] },
    { path: 'cognitive_profile', fields: ['verbal_fluency', 'abstract_reasoning', 'thought_coherence'] },
    { path: 'adoption_profile', fields: ['buyer_power', 'adoption_influence', 'risk_tolerance', 'change_friction'] },
    { path: 'communication_style.voice_foundation', fields: ['empathy_level', 'charisma_level'] }
  ];

  numericFields.forEach(({ path, fields }) => {
    const obj = path.split('.').reduce((current, key) => current?.[key], persona);
    if (obj) {
      fields.forEach(field => {
        const value = obj[field];
        if (typeof value === 'number' && (value < 0 || value > 1)) {
          errors.push(`${path}.${field} must be between 0 and 1, got ${value}`);
        }
      });
    }
  });

  // Check for empty values that should be filled
  function checkForEmptyValues(obj: any, path = ''): void {
    // Helper function to check if a value represents "no applicable content"
    function isValidNoContentValue(value: any): boolean {
      if (Array.isArray(value)) {
        return value.length === 1 && value[0] === "N/A";
      }
      return value === "N/A";
    }
    
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (value === '' || value === null) {
        warnings.push(`Empty value at ${currentPath} - should be filled`);
      } else if (Array.isArray(value) && value.length === 0 && !['pets', 'topics_off_limits'].includes(key)) {
        warnings.push(`Empty array at ${currentPath} - may need content`);
      } else if (Array.isArray(value) && isValidNoContentValue(value)) {
        // Don't warn about ["N/A"] arrays - they represent properly evaluated "no content"
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        checkForEmptyValues(value, currentPath);
      }
    }
  }

  checkForEmptyValues(persona);

  // Check for bloated prompt_shaping
  if (persona.prompt_shaping) {
    const allowedPromptShapingKeys = [
      'voice_foundation', 'style_markers', 'primary_motivations', 'deal_breakers',
      'honesty_vector', 'bias_vector', 'context_switches', 'current_focus'
    ];
    
    const extraKeys = Object.keys(persona.prompt_shaping).filter(key => !allowedPromptShapingKeys.includes(key));
    if (extraKeys.length > 0) {
      errors.push(`prompt_shaping has disallowed keys: ${extraKeys.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completenessScore: Math.max(0, 1 - (errors.length * 0.1) - (warnings.length * 0.02))
  };
}

function hasBannedKeys(persona: any): boolean {
  function checkRecursive(obj: any): boolean {
    for (const [key, value] of Object.entries(obj)) {
      if (BANNED_KEYS.includes(key)) {
        return true;
      }
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (checkRecursive(value)) {
          return true;
        }
      }
    }
    return false;
  }
  
  return checkRecursive(persona);
}

function hasRequiredKeys(persona: any): boolean {
  return PERSONA_SCHEMA.required.every(key => persona.hasOwnProperty(key));
}

function applyManualFixes(persona: any, personaName: string): any {
  const fixed = JSON.parse(JSON.stringify(persona)); // Deep clone
  
  console.log(`🔧 Applying manual fixes for ${personaName}`);
  
  // Fix missing identity.location.urbanicity
  if (fixed.identity?.location && !fixed.identity.location.urbanicity) {
    // Validate urbanicity assignment
    const city = fixed.identity.location.city?.toLowerCase() || '';
    if (city.includes('new york') || city.includes('chicago') || city.includes('los angeles') || 
        city.includes('boston') || city.includes('san francisco') || city.includes('seattle')) {
      fixed.identity.location.urbanicity = 'urban';
    } else if (city.includes('suburb') || city.includes('town')) {
      fixed.identity.location.urbanicity = 'suburban';  
    } else {
      throw new Error(`Cannot determine urbanicity for city: ${city} - statistical generation must provide this`);
    }
    console.log(`✅ Fixed urbanicity: ${fixed.identity.location.urbanicity}`);
  }
  
  // Validate education_level assignment  
  if (fixed.identity && !fixed.identity.education_level) {
    const occupation = fixed.identity.occupation?.toLowerCase() || '';
    if (occupation.includes('doctor') || occupation.includes('lawyer') || occupation.includes('professor')) {
      fixed.identity.education_level = 'doctorate';
    } else if (occupation.includes('engineer') || occupation.includes('manager') || occupation.includes('analyst')) {
      fixed.identity.education_level = 'bachelors';
    } else {
      throw new Error(`Cannot determine education_level for occupation: ${occupation} - statistical generation must provide this`);
    }
    console.log(`✅ Fixed education_level: ${fixed.identity.education_level}`);
  }
  
  // Validate income_bracket assignment
  if (fixed.identity && !fixed.identity.income_bracket) {
    const occupation = fixed.identity.occupation?.toLowerCase() || '';
    const age = fixed.identity.age || 30;
    
    if (occupation.includes('doctor') || occupation.includes('lawyer') || occupation.includes('executive')) {
      fixed.identity.income_bracket = '$100k+';
    } else if (occupation.includes('engineer') || occupation.includes('manager') || age > 40) {
      fixed.identity.income_bracket = '$75k-100k';
    } else if (occupation.includes('teacher') || occupation.includes('nurse') || occupation.includes('analyst')) {
      fixed.identity.income_bracket = '$50k-75k';
    } else {
      throw new Error(`Cannot determine income_bracket for occupation: ${occupation} - statistical generation must provide this`);
    }
    console.log(`✅ Fixed income_bracket: ${fixed.identity.income_bracket}`);
  }
  
  // Validate thought_coherence assignment
  if (fixed.cognitive_profile && typeof fixed.cognitive_profile.thought_coherence !== 'number') {
    throw new Error('Missing thought_coherence value - statistical generation must provide this');
  }
  
  return fixed;
}

function cleanAndValidatePersona(persona: any): any {
  // Remove any banned keys recursively
  function removeBannedKeys(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(removeBannedKeys);
    
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!BANNED_KEYS.includes(key)) {
        cleaned[key] = removeBannedKeys(value);
      }
    }
    return cleaned;
  }

  // Keep only allowed schema fields
  const allowedFields = PERSONA_SCHEMA.required;
  const cleanedPersona: any = {};
  
  const cleaned = removeBannedKeys(persona);
  
  for (const field of allowedFields) {
    if (cleaned[field] !== undefined) {
      cleanedPersona[field] = cleaned[field];
    }
  }
  
  return cleanedPersona;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { personaIds = [], mode = 'preview', includeStatisticalEnhancement = false } = await req.json();
    console.log('🔧 Fill missing traits request with new validation system:', { personaIds, mode, includeStatisticalEnhancement });

    // Get personas with missing traits
    let query = supabase
      .from('v4_personas')
      .select('persona_id, name, full_profile')
      .eq('creation_completed', true);

    if (personaIds.length > 0) {
      query = query.in('persona_id', personaIds);
    }

    const { data: personas, error: fetchError } = await query;

    if (fetchError) {
      console.error('❌ Error fetching personas:', fetchError);
      throw fetchError;
    }

    console.log(`📊 Found ${personas?.length || 0} personas to analyze`);

    const validationResults = [];
    const updates = [];

    for (const persona of personas || []) {
      console.log(`🔍 Validating persona: ${persona.name}`);
      
      // Run validation on existing persona
      const validation = validatePersona(persona.full_profile);
      
      validationResults.push({
        persona_id: persona.persona_id,
        name: persona.name,
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        completenessScore: validation.completenessScore,
        hasBannedKeys: hasBannedKeys(persona.full_profile),
        hasRequiredKeys: hasRequiredKeys(persona.full_profile)
      });

      if (mode === 'execute' && (!validation.isValid || hasBannedKeys(persona.full_profile) || !hasRequiredKeys(persona.full_profile))) {
        try {
          console.log(`🔧 Applying comprehensive enhancement to ${persona.name}`);
          
          // First apply comprehensive enhancement (the main fix)
          const enhancementResult = applyComprehensiveEnhancement(
            persona.full_profile, 
            includeStatisticalEnhancement, 
            true // Always include completeness enhancement
          );
          
          let enhanced = enhancementResult.persona;
          const enhancementChanges = enhancementResult.changesLog || [];
          
          // Then apply compliance fixes if still needed
          // DISABLED: Validation contamination removed - reject instead of fix
          const postEnhancementValidation = validatePersona(enhanced);
          if (postEnhancementValidation.errors.length > 0 || hasBannedKeys(enhanced)) {
            console.log(`❌ Rejecting persona ${persona.name} - Errors: ${postEnhancementValidation.errors.length}, Banned keys: ${hasBannedKeys(enhanced)}`);
            console.log('Validation errors:', postEnhancementValidation.errors);
            
            // READ-ONLY: Reject the persona instead of trying to fix it
            const rejectionReason = `Validation failed: ${postEnhancementValidation.errors.join(', ')}`;
            
            console.log(`❌ Persona ${persona.name} rejected: ${rejectionReason}`);
            return new Response(JSON.stringify({
              persona_id: persona.persona_id,
              name: persona.name,
              status: 'rejected',
              reason: rejectionReason,
              validation_before: validation,
              validation_after: postEnhancementValidation,
              rejected_profile: enhanced
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          // Final validation
          const finalValidation = validatePersona(enhanced);
          const isFullyComplete = finalValidation.errors.length === 0 && finalValidation.completenessScore > 0.85;
          
          console.log(`✅ Successfully enhanced persona ${persona.name} - Complete: ${isFullyComplete}`);
          
          updates.push({
            persona_id: persona.persona_id,
            name: persona.name,
            filled_traits: validation.errors.map(e => e.split(' ')[3] || 'unknown').filter(t => t !== 'unknown'),
            statistical_traits_added: enhancementChanges,
            validation_before: validation,
            validation_after: finalValidation,
            fixed_profile: enhanced
          });
          
          // Update the persona in database with proper status
          const updateData: any = {
            full_profile: enhanced,
            enrichment_status: isFullyComplete ? 'complete' : 'enhanced',
            enhancement_applied_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          if (includeStatisticalEnhancement) {
            updateData.statistical_enhancement_status = 'complete';
          }
          
          const { error: updateError } = await supabase
            .from('v4_personas')
            .update(updateData)
            .eq('persona_id', persona.persona_id);
          
          if (updateError) {
            console.error(`❌ Failed to update persona ${persona.name}:`, updateError);
          }
          
        } catch (error) {
          console.error(`❌ Enhancement failed for persona ${persona.name}:`, error);
          
          // Mark as failed in database
          await supabase
            .from('v4_personas')
            .update({ 
              enrichment_status: 'failed',
              enhancement_applied_at: new Date().toISOString()
            })
            .eq('persona_id', persona.persona_id);
        }
      } else if (mode === 'execute' && includeStatisticalEnhancement && validation.isValid) {
        // Only apply statistical enhancement to already valid personas
        console.log(`✨ Applying statistical enhancement to valid persona ${persona.name}`);
        
        const enhancedPersona = applyStatisticalEnhancement(persona.full_profile);
        const statisticalTraitsAdded = getStatisticalTraitsAdded(persona.full_profile, enhancedPersona);
        
        if (statisticalTraitsAdded.length > 0) {
          updates.push({
            persona_id: persona.persona_id,
            name: persona.name,
            filled_traits: [],
            statistical_traits_added: statisticalTraitsAdded,
            validation_before: validation,
            validation_after: validation, // No change in validation
            fixed_profile: enhancedPersona
          });

          // Update the persona in database
          const { error: updateError } = await supabase
            .from('v4_personas')
            .update({
              full_profile: enhancedPersona,
              statistical_enhancement_status: 'complete',
              updated_at: new Date().toISOString()
            })
            .eq('persona_id', persona.persona_id);

          if (updateError) {
            console.error(`❌ Error updating persona ${persona.persona_id}:`, updateError);
          } else {
            console.log(`✅ Successfully enhanced persona ${persona.name} with statistical traits`);
          }
        }
      }
    }

    // For analysis mode, convert validation results to the expected format
    const analysis = validationResults.map(result => ({
      persona_id: result.persona_id,
      name: result.name,
      missingTraits: result.errors.filter(e => e.includes('Missing required field')).map(e => e.split(': ')[1]),
      incompleteTraits: [],
      completenessScore: Math.round(result.completenessScore * 100)
    }));

    return new Response(JSON.stringify({
      success: true,
      mode,
      analyzed_count: validationResults.length,
      analysis: mode === 'preview' ? analysis : undefined,
      validation_results: validationResults,
      updates: mode === 'execute' ? updates : [],
      summary: {
        valid_personas: validationResults.filter(r => r.isValid).length,
        invalid_personas: validationResults.filter(r => !r.isValid).length,
        personas_with_banned_keys: validationResults.filter(r => r.hasBannedKeys).length,
        personas_missing_required: validationResults.filter(r => !r.hasRequiredKeys).length,
        statistical_enhancements_applied: includeStatisticalEnhancement ? updates.filter(u => u.statistical_traits_added?.length > 0).length : 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in fill-missing-traits function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// DISABLED: Validation contamination removed - no data modification
async function fixPersonaCompliance(persona: any, validation: ValidationResult) {
  console.log(`❌ Rejecting non-compliant persona: ${persona.name}`);
  console.log('Validation errors:', validation.errors);
  
  // READ-ONLY: Just reject the persona instead of modifying it
  return null; // Reject the persona entirely
}
