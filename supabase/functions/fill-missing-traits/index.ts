import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

// Import statistical enhancement functions
function applyStatisticalEnhancement(persona: any): any {
  const enhanced = JSON.parse(JSON.stringify(persona)); // Deep clone
  
  // Initialize missing sections
  if (!enhanced.health_profile) {
    enhanced.health_profile = {
      bmi_category: "normal",
      chronic_conditions: [],
      mental_health_flags: [],
      medications: [],
      adherence_level: "good",
      sleep_hours: 7,
      substance_use: { alcohol: "social", cigarettes: "none", vaping: "none", marijuana: "none" },
      fitness_level: "moderate",
      diet_pattern: "standard"
    };
  }
  
  if (!enhanced.money_profile) {
    enhanced.money_profile = {
      attitude_toward_money: "practical",
      earning_context: "stable",
      spending_style: "balanced",
      savings_investing_habits: { emergency_fund_months: 3, retirement_contributions: "minimal", investing_style: "conservative" },
      debt_posture: "manageable",
      financial_stressors: [],
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
  const newConditions = afterConditions.filter(c => !beforeConditions.includes(c));
  if (newConditions.length > 0) {
    added.push("chronic_conditions");
  }
  
  // Check for new medications
  const beforeMeds = before.health_profile?.medications || [];
  const afterMeds = after.health_profile?.medications || [];
  const newMeds = afterMeds.filter(m => !beforeMeds.includes(m));
  if (newMeds.length > 0) {
    added.push("medications");
  }
  
  // Check for new financial stressors
  const beforeStressors = before.money_profile?.financial_stressors || [];
  const afterStressors = after.money_profile?.financial_stressors || [];
  const newStressors = afterStressors.filter(s => !beforeStressors.includes(s));
  if (newStressors.length > 0) {
    added.push("financial_stressors");
  }
  
  // Check for new mental health flags
  const beforeMental = before.health_profile?.mental_health_flags || [];
  const afterMental = after.health_profile?.mental_health_flags || [];
  const newMental = afterMental.filter(m => !beforeMental.includes(m));
  if (newMental.length > 0) {
    added.push("mental_health_flags");
  }
  
  return added;
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
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (value === '' || value === null) {
        warnings.push(`Empty value at ${currentPath} - should be filled`);
      } else if (Array.isArray(value) && value.length === 0 && !['pets', 'topics_off_limits'].includes(key)) {
        warnings.push(`Empty array at ${currentPath} - may need content`);
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
        console.log(`🛠️ Fixing persona ${persona.name} - Errors: ${validation.errors.length}, Banned keys: ${hasBannedKeys(persona.full_profile)}`);
        
        const fixedPersona = await fixPersonaCompliance(persona, validation);

        if (fixedPersona) {
          // Re-validate the fixed persona
          const postValidation = validatePersona(fixedPersona);
          
          if (postValidation.isValid) {
            console.log(`✅ Successfully fixed persona ${persona.name}`);
            
            // Apply statistical enhancement if requested
            let finalPersona = fixedPersona;
            let statisticalTraitsAdded = [];
            
            if (includeStatisticalEnhancement) {
              const enhancedPersona = applyStatisticalEnhancement(fixedPersona);
              statisticalTraitsAdded = getStatisticalTraitsAdded(fixedPersona, enhancedPersona);
              finalPersona = enhancedPersona;
            }

            updates.push({
              persona_id: persona.persona_id,
              name: persona.name,
              filled_traits: validation.errors.map(e => e.split(' ')[3] || 'unknown').filter(t => t !== 'unknown'),
              statistical_traits_added: statisticalTraitsAdded,
              validation_before: validation,
              validation_after: postValidation,
              fixed_profile: finalPersona
            });

            // Update the persona in database
            const updateData: any = {
              full_profile: finalPersona,
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
              console.error(`❌ Error updating persona ${persona.persona_id}:`, updateError);
            }
          } else {
            console.error(`❌ Fixed persona ${persona.name} still has validation errors:`, postValidation.errors);
          }
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
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fixPersonaCompliance(persona: any, validation: ValidationResult) {
  console.log(`🔧 Fixing compliance for ${persona.name}`);
  
  // First clean the persona by removing banned keys and keeping only allowed schema
  const cleanedPersona = cleanAndValidatePersona(persona.full_profile);
  
  // Check what's still missing after cleaning
  const postCleanValidation = validatePersona(cleanedPersona);
  
  if (postCleanValidation.isValid) {
    console.log(`✅ Persona ${persona.name} is valid after cleaning`);
    return cleanedPersona;
  }
  
  console.log(`🤖 Generating missing fields for ${persona.name}:`, postCleanValidation.errors);
  
  // Use AI to generate the missing required fields
  const systemPrompt = `You are a V4 persona compliance expert. Your job is to complete missing required fields in persona profiles.

CRITICAL REQUIREMENTS:
- You must generate ALL missing required fields from this exact list: ${PERSONA_SCHEMA.required.join(', ')}
- NEVER include any of these banned fields: ${BANNED_KEYS.join(', ')}
- Return ONLY valid JSON that matches the V4 persona schema
- Use realistic, psychologically coherent values
- Ensure internal consistency across all traits
- Numeric values must be between 0 and 1 where specified
- Age must be between 18 and 100

Required V4 Structure:
{
  "identity": {
    "name": "First Last", "age": 18-100, "gender": "Male/Female/Non-binary", "pronouns": "he/him/she/her/they/them", 
    "ethnicity": "specific ethnicity", "nationality": "specific nationality", "occupation": "specific job", 
    "relationship_status": "single/married/divorced/partnered", "dependents": 0-3,
    "education_level": "high_school/some_college/bachelors/masters/doctorate", 
    "income_bracket": "$20k-30k/$30k-50k/$50k-75k/$75k-100k/$100k+",
    "location": { "city": "City", "region": "State", "country": "Country", "urbanicity": "urban/suburban/rural" }
  },
  "daily_life": {
    "primary_activities": { "work": 6-10, "family_time": 0-6, "personal_care": 1-3, "personal_interests": 0-4, "social_interaction": 0-4 },
    "schedule_blocks": [ { "start": "HH:MM", "end": "HH:MM", "activity": "activity name", "setting": "location" } ],
    "time_sentiment": { "work": "fulfilling/neutral/stressful", "family": "energizing/balanced/draining", "personal": "restorative/rushed/neglected" },
    "screen_time_summary": "Detailed description", "mental_preoccupations": ["preoccupation1", "preoccupation2"]
  },
  "health_profile": {
    "bmi_category": "underweight/normal/overweight/obese", "chronic_conditions": [], "mental_health_flags": [], "medications": [],
    "adherence_level": "excellent/good/poor/inconsistent", "sleep_hours": 5-9,
    "substance_use": { "alcohol": "none/social/regular/heavy", "cigarettes": "none/social/regular/heavy", "vaping": "none/occasional/regular", "marijuana": "none/occasional/regular" },
    "fitness_level": "sedentary/low/moderate/high/athletic", "diet_pattern": "standard/health_conscious/restricted/irregular"
  },
  "relationships": {
    "household": { "status": "alone/partner/family/roommates", "harmony_level": "tense/neutral/harmonious", "dependents": 0-3 },
    "caregiving_roles": [], "friend_network": { "size": "small/medium/large", "frequency": "daily/weekly/monthly/rare", "anchor_contexts": [] },
    "pets": []
  },
  "money_profile": {
    "attitude_toward_money": "anxious/practical/optimistic/indifferent", "earning_context": "stable/unstable/growing/declining", "spending_style": "frugal/balanced/impulsive/luxury_focused",
    "savings_investing_habits": { "emergency_fund_months": 0-12, "retirement_contributions": "none/minimal/adequate/aggressive", "investing_style": "conservative/balanced/aggressive/none" },
    "debt_posture": "debt_free/manageable/struggling/overwhelmed", "financial_stressors": [], "money_conflicts": "none/minor/moderate/severe", "generosity_profile": "stingy/selective/generous/very_generous"
  },
  "motivation_profile": {
    "primary_motivation_labels": [], "deal_breakers": [],
    "primary_drivers": { "care": 0.0-1.0, "family": 0.0-1.0, "status": 0.0-1.0, "mastery": 0.0-1.0, "meaning": 0.0-1.0, "novelty": 0.0-1.0, "security": 0.0-1.0, "belonging": 0.0-1.0, "self_interest": 0.0-1.0 },
    "goal_orientation": { "strength": 0.0-1.0, "time_horizon": "short_term/medium_term/long_term", "primary_goals": [], "goal_flexibility": 0.0-1.0 },
    "want_vs_should_tension": { "major_conflicts": [], "default_resolution": "want_wins/should_wins/context_dependent" }
  },
  "communication_style": {
    "regional_register": { "region": "region name", "urbanicity": "urban/suburban/rural", "dialect_hints": [] },
    "voice_foundation": { "formality": "very_casual/casual/neutral/formal/very_formal", "directness": "blunt/direct/balanced/diplomatic/indirect", "pace_rhythm": "rapid/moderate/measured/slow", "positivity": "pessimistic/realistic/optimistic/very_positive", "empathy_level": 0.0-1.0, "honesty_style": "brutal/direct/tactful/diplomatic", "charisma_level": 0.0-1.0 },
    "style_markers": { "metaphor_domains": [], "aphorism_register": "folksy/professional/philosophical/none", "storytelling_vs_bullets": 0.0-1.0, "humor_style": "dry/sarcastic/warm/silly/none", "code_switching_contexts": [] },
    "context_switches": { "work": { "formality": "formal", "directness": "diplomatic" }, "home": { "formality": "casual", "directness": "direct" }, "online": { "formality": "neutral", "directness": "balanced" } },
    "authenticity_filters": { "avoid_registers": [], "embrace_registers": [], "personality_anchors": [] }
  },
  "humor_profile": { "frequency": "rare/occasional/frequent/constant", "style": [], "boundaries": [], "targets": [], "use_cases": [] },
  "truth_honesty_profile": {
    "baseline_honesty": 0.0-1.0, "situational_variance": { "work": 0.0-1.0, "home": 0.0-1.0, "public": 0.0-1.0 },
    "typical_distortions": [], "red_lines": [], "pressure_points": [], "confession_style": "immediate/delayed/never/contextual"
  },
  "bias_profile": {
    "cognitive": { "status_quo": 0.0-1.0, "loss_aversion": 0.0-1.0, "confirmation": 0.0-1.0, "anchoring": 0.0-1.0, "availability": 0.0-1.0, "optimism": 0.0-1.0, "sunk_cost": 0.0-1.0, "overconfidence": 0.0-1.0 },
    "mitigations": []
  },
  "cognitive_profile": { "verbal_fluency": 0.0-1.0, "abstract_reasoning": 0.0-1.0, "problem_solving_orientation": "methodical/intuitive/collaborative/avoidant", "thought_coherence": 0.0-1.0 },
  "emotional_profile": { "stress_responses": [], "negative_triggers": [], "positive_triggers": [], "explosive_triggers": [], "emotional_regulation": "excellent/good/fair/poor" },
  "attitude_narrative": "2-3 sentence description of overall outlook on life",
  "political_narrative": "2-3 sentence description of political views",
  "adoption_profile": { "buyer_power": 0.0-1.0, "adoption_influence": 0.0-1.0, "risk_tolerance": 0.0-1.0, "change_friction": 0.0-1.0, "expected_objections": [], "proof_points_needed": [] },
  "prompt_shaping": {
    "voice_foundation": { "formality": "copy from communication_style", "directness": "copy from communication_style", "pace_rhythm": "copy from communication_style", "positivity": "copy from communication_style", "empathy_level": 0.0-1.0 },
    "style_markers": { "metaphor_domains": [], "humor_style": "copy from humor_profile", "storytelling_vs_bullets": 0.0-1.0 },
    "primary_motivations": [], "deal_breakers": [], "honesty_vector": { "baseline": 0.0-1.0, "work": 0.0-1.0, "home": 0.0-1.0, "public": 0.0-1.0, "distortions": [] },
    "bias_vector": { "top_cognitive": [], "top_social": [], "mitigation_playbook": [] }, "context_switches": { "work": "description", "home": "description", "online": "description" }, "current_focus": "current mental focus"
  },
  "sexuality_profile": {
    "orientation": "heterosexual/homosexual/bisexual/asexual/pansexual", "expression_style": "private/selective/open", "relationship_norms": "monogamous/polyamorous/casual/traditional",
    "boundaries": { "comfort_level": "conservative/moderate/liberal", "topics_off_limits": [] }, "linguistic_influences": { "flirtation_style": "none/subtle/direct", "humor_boundaries": "clean/suggestive/explicit", "taboo_navigation": "avoid/navigate_carefully/comfortable" }
  }
}

Generate realistic, internally consistent values. Return ONLY valid JSON without markdown or explanations.`;

  const userPrompt = `Persona Name: ${persona.name}\nExisting Profile (after cleaning): ${JSON.stringify(cleanedPersona, null, 2)}\n\nValidation Errors: ${postCleanValidation.errors.join(', ')}\n\nComplete this persona profile by generating ALL missing required fields. Ensure the result is fully compliant with V4 validation.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let generatedPersona;
    
    try {
      // Clean the response - remove any markdown formatting
      const content = data.choices[0].message.content.trim();
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      generatedPersona = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      return null;
    }

    // Merge the existing clean persona with generated content
    const mergedPersona = { ...cleanedPersona };
    
    // Only add missing required fields
    for (const requiredField of PERSONA_SCHEMA.required) {
      if (!mergedPersona[requiredField] && generatedPersona[requiredField]) {
        mergedPersona[requiredField] = generatedPersona[requiredField];
      }
    }

    return mergedPersona;

  } catch (error) {
    console.error('❌ Error generating compliance fixes with AI:', error);
    return null;
  }
}
