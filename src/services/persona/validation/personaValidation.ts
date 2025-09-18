
export interface PersonaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completeness: {
    hasRealTraits: boolean;
    hasEmotionalTriggers: boolean;
    hasInterviewResponses: boolean;
    hasMetadata: boolean;
  };
}

import { detectPersonaVersion, isV4Persona } from '@/utils/personaDetection';
import { validateV4PersonaCompleteness } from '@/services/v4-persona/v4PersonaValidation';

export function validatePersonaCompleteness(persona: any): PersonaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  console.log("=== DETAILED PERSONA VALIDATION ===");
  console.log("Persona name:", persona.name);
  console.log("Persona ID:", persona.persona_id);
  
  // Detect persona version
  const versionInfo = detectPersonaVersion(persona);
  console.log("Detected version:", versionInfo);
  
  // Handle V4 personas with proper validation
  if (versionInfo.isV4) {
    console.log("Validating V4 persona with dedicated V4 validation");
    const v4Validation = validateV4PersonaCompleteness(persona);
    
    return {
      isValid: v4Validation.isValid,
      errors: v4Validation.errors,
      warnings: v4Validation.warnings,
      completeness: {
        hasRealTraits: v4Validation.completeness.hasFullProfile,
        hasEmotionalTriggers: v4Validation.completeness.hasFullProfile,
        hasInterviewResponses: v4Validation.completeness.hasRequiredTraits,
        hasMetadata: v4Validation.completeness.isCreationCompleted
      }
    };
  }
  
  // Determine structure and extract trait data for V3 and legacy
  let traitData, emotionalTriggers, interviewSections, metadataOrIdentity;
  
  if (versionInfo.isV3) {
    // V3 structure - proper data paths
    traitData = persona.persona_data.cognitive_profile;
    emotionalTriggers = persona.persona_data.emotional_triggers;
    interviewSections = persona.persona_data.interview_sections;
    metadataOrIdentity = persona.persona_data.identity;
    
    console.log("🔍 V3 validation paths:", {
      hasTraitData: !!traitData,
      hasEmotionalTriggers: !!emotionalTriggers,
      hasInterviewSections: !!interviewSections,
      hasIdentity: !!metadataOrIdentity
    });
  } else {
    // Legacy structure
    traitData = persona.trait_profile;
    emotionalTriggers = persona.emotional_triggers;
    interviewSections = persona.interview_sections;
    metadataOrIdentity = persona.metadata;
  }
  
  // Check if trait profile has non-default values
  const hasRealTraits = checkForRealTraits(traitData);
  console.log("Has real traits:", hasRealTraits);
  
  if (!hasRealTraits) {
    errors.push("Persona has default trait values - generation failed completely");
    console.error("❌ CRITICAL: ALL TRAITS ARE DEFAULT VALUES - GENERATION FAILED");
    logDetailedTraitAnalysis(traitData);
  }
  
  // Check emotional triggers
  const hasEmotionalTriggers = checkEmotionalTriggers(emotionalTriggers);
  console.log("Has emotional triggers:", hasEmotionalTriggers);
  if (!hasEmotionalTriggers) {
    warnings.push("Missing or empty emotional triggers"); // Make this a warning for V3
  }
  
  // Check interview responses
  const hasInterviewResponses = checkInterviewResponses(interviewSections);
  console.log("Has interview responses:", hasInterviewResponses);
  if (!hasInterviewResponses) {
    errors.push("Missing or empty interview responses");
  }
  
  // Check metadata/identity completeness
  const hasMetadata = checkMetadata(metadataOrIdentity);
  console.log("Has complete metadata/identity:", hasMetadata);
  if (!hasMetadata) {
    errors.push("Missing required demographic metadata - persona creation incomplete");
  }
  
  console.log("=== END DETAILED VALIDATION ===");
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completeness: {
      hasRealTraits,
      hasEmotionalTriggers,
      hasInterviewResponses,
      hasMetadata
    }
  };
}

function validateV4Persona(persona: any, errors: string[], warnings: string[]): PersonaValidationResult {
  console.log("=== V4 PERSONA VALIDATION ===");
  
  const fullProfile = persona.full_profile;
  const conversationSummary = persona.conversation_summary;
  
  // Check if V4 persona is complete
  const hasFullProfile = fullProfile && 
    fullProfile.identity && 
    fullProfile.trait_profile && 
    fullProfile.communication_style;
    
  const hasConversationSummary = conversationSummary && 
    conversationSummary.demographics && 
    conversationSummary.motivation_summary;
    
  const isCreationCompleted = persona.creation_completed === true;
  
  console.log("V4 validation checks:", {
    hasFullProfile,
    hasConversationSummary,
    isCreationCompleted,
    creationStage: persona.creation_stage
  });
  
  if (!isCreationCompleted) {
    if (persona.creation_stage === 'not_started' || !persona.creation_stage) {
      errors.push("V4 persona creation has not been started");
    } else if (persona.creation_stage.includes('call1') || persona.creation_stage.includes('call2')) {
      warnings.push(`V4 persona creation in progress: ${persona.creation_stage}`);
    } else {
      errors.push(`V4 persona creation incomplete: ${persona.creation_stage}`);
    }
  }
  
  if (!hasFullProfile) {
    errors.push("V4 persona missing full_profile data");
  }
  
  if (!hasConversationSummary) {
    errors.push("V4 persona missing conversation_summary data");
  }
  
  // V4 personas are considered valid if creation is completed and core data exists
  const isValid = isCreationCompleted && hasFullProfile && hasConversationSummary && errors.length === 0;
  
  console.log("V4 validation result:", { isValid, errorCount: errors.length, warningCount: warnings.length });
  
  return {
    isValid,
    errors,
    warnings,
    completeness: {
      hasRealTraits: hasFullProfile,
      hasEmotionalTriggers: !!fullProfile?.emotional_profile,
      hasInterviewResponses: true, // V4 doesn't use traditional interview sections
      hasMetadata: hasConversationSummary
    }
  };
}

function checkForRealTraits(traitProfile: any): boolean {
  if (!traitProfile || typeof traitProfile !== 'object') {
    console.error("❌ Trait profile is missing or invalid:", traitProfile);
    return false;
  }
  
  console.log("=== ANALYZING TRAIT PROFILE FOR DEFAULTS ===");
  
  const checkCategory = (category: any, categoryName: string): boolean => {
    if (!category || typeof category !== 'object') {
      console.warn(`❌ Category ${categoryName} is missing or invalid:`, category);
      return false;
    }
    
    const allValues = [];
    const extractValues = (obj: any, path: string = '') => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'number') {
          allValues.push({ path: path ? `${path}.${key}` : key, value });
        } else if (typeof value === 'object' && value !== null) {
          extractValues(value, path ? `${path}.${key}` : key);
        }
      }
    };
    
    extractValues(category);
    
    if (allValues.length === 0) {
      console.warn(`❌ ${categoryName} has no numeric values`);
      return false;
    }
    
    // Count exact 0.5 values (defaults)
    const exactHalfCount = allValues.filter(item => item.value === 0.5).length;
    const defaultRatio = exactHalfCount / allValues.length;
    
    console.log(`${categoryName} analysis:`);
    console.log(`  - Total numeric values: ${allValues.length}`);
    console.log(`  - Values exactly 0.5: ${exactHalfCount}`);
    console.log(`  - Default ratio: ${Math.round(defaultRatio * 100)}%`);
    
    // Log sample values for debugging
    console.log(`  - Sample values:`, allValues.slice(0, 3).map(item => `${item.path}=${item.value}`));
    
    // If more than 50% of values are exactly 0.5, it's likely all defaults
    const hasRealValues = defaultRatio <= 0.5;
    console.log(`  - Has real values: ${hasRealValues} (threshold: ≤50% defaults)`);
    
    if (!hasRealValues) {
      console.error(`❌ ${categoryName} FAILED - ${Math.round(defaultRatio * 100)}% are default 0.5 values`);
    }
    
    return hasRealValues;
  };
  
  const categories = ['big_five', 'moral_foundations', 'extended_traits', 'behavioral_economics', 'political_orientation'];
  let validCategories = 0;
  
  for (const cat of categories) {
    if (traitProfile[cat] && checkCategory(traitProfile[cat], cat)) {
      validCategories++;
    }
  }
  
  console.log(`✅ Valid V3 categories: ${validCategories}/${categories.length}`);
  
  // Require at least 3 out of 5 V3 categories to have real values
  const hasRealTraits = validCategories >= 3;
  console.log(`✅ Overall has real traits: ${hasRealTraits} (need ≥3 valid V3 categories)`);
  
  if (!hasRealTraits) {
    console.error("❌ CRITICAL FAILURE: Not enough V3 trait categories have real values");
    console.error("❌ This indicates the OpenAI generation completely failed");
  }
  
  return hasRealTraits;
}

function logDetailedTraitAnalysis(traitProfile: any) {
  console.log("=== DETAILED TRAIT ANALYSIS ===");
  
  if (!traitProfile) {
    console.error("Trait profile is null/undefined");
    return;
  }
  
  for (const [categoryName, category] of Object.entries(traitProfile)) {
    if (category && typeof category === 'object') {
      console.log(`\n${categoryName.toUpperCase()}:`);
      for (const [traitName, value] of Object.entries(category as any)) {
        if (typeof value === 'number') {
          const status = value === 0.5 ? "⚠️ DEFAULT" : "✓ CUSTOM";
          console.log(`  ${traitName}: ${value} ${status}`);
        } else if (typeof value === 'object') {
          console.log(`  ${traitName}: [nested object]`);
          for (const [nestedName, nestedValue] of Object.entries(value as any)) {
            if (typeof nestedValue === 'number') {
              const status = nestedValue === 0.5 ? "⚠️ DEFAULT" : "✓ CUSTOM";
              console.log(`    ${nestedName}: ${nestedValue} ${status}`);
            }
          }
        }
      }
    }
  }
  
  console.log("=== END DETAILED TRAIT ANALYSIS ===");
}

function checkEmotionalTriggers(triggers: any): boolean {
  if (!triggers || typeof triggers !== 'object') {
    console.log("❌ Emotional triggers check failed: not an object", typeof triggers);
    return false;
  }
  
  console.log("🔍 Checking V3 emotional triggers:", {
    hasPositive: Array.isArray(triggers.positive),
    positiveCount: triggers.positive?.length || 0,
    hasNegative: Array.isArray(triggers.negative),
    negativeCount: triggers.negative?.length || 0,
    hasExplosive: Array.isArray(triggers.explosive),
    explosiveCount: triggers.explosive?.length || 0
  });
  
  // V3 format: { positive: string[], negative: string[], explosive: string[] }
  const hasPositive = Array.isArray(triggers.positive) && triggers.positive.length > 0;
  const hasNegative = Array.isArray(triggers.negative) && triggers.negative.length > 0;
  const hasExplosive = Array.isArray(triggers.explosive) && triggers.explosive.length > 0;
  
  // Accept if any of the three trigger types exist
  const result = hasPositive || hasNegative || hasExplosive;
  console.log(`✅ V3 emotional triggers check result: ${result}`);
  return result;
}

function checkInterviewResponses(sections: any): boolean {
  if (!sections) return false;
  
  // Handle different data structures
  let actualSections = sections;
  if (sections.interview_sections) {
    actualSections = sections.interview_sections;
  }
  
  if (!Array.isArray(actualSections)) return false;
  
  return actualSections.length > 0 && actualSections.some(section => 
    section.responses && Array.isArray(section.responses) && section.responses.length > 0
  );
}

function checkMetadata(metadata: any): boolean {
  if (!metadata || typeof metadata !== 'object') {
    console.warn("❌ Metadata is missing or invalid");
    return false;
  }
  
  console.log("Checking metadata structure:", Object.keys(metadata));
  
  // Check if this is V3 identity structure
  const isV3Identity = metadata.age && metadata.gender && metadata.occupation && metadata.location;
  
  if (isV3Identity) {
    // V3 identity structure validation
    const requiredV3Fields = ['age', 'gender', 'occupation'];
    const missingV3Fields = requiredV3Fields.filter(field => 
      !metadata[field] || metadata[field] === 'Not specified' || metadata[field] === ''
    );
    
    // Check location object
    const hasValidLocation = metadata.location && 
      (metadata.location.city || metadata.location.region || metadata.location.country);
    
    if (missingV3Fields.length > 0) {
      console.warn(`❌ Missing required V3 identity fields: ${missingV3Fields.join(', ')}`);
      return false;
    }
    
    if (!hasValidLocation) {
      console.warn("❌ Missing valid location data in V3 identity");
      return false;
    }
    
    console.log("✅ V3 identity structure is complete");
    return true;
  } else {
    // Legacy metadata structure validation
    const requiredLegacyFields = [
      'age',
      'gender', 
      'race_ethnicity',
      'education_level',
      'occupation',
      'employment_type',
      'income_level',
      'social_class_identity',
      'marital_status'
    ];
    
    const missingFields = requiredLegacyFields.filter(field => 
      !metadata[field] || metadata[field] === 'Not specified' || metadata[field] === ''
    );
    
    if (missingFields.length > 0) {
      console.warn(`❌ Missing required legacy demographic fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    console.log("✅ Legacy metadata structure is complete");
    return true;
  }
}

export function logPersonaValidation(persona: any, validationResult: PersonaValidationResult) {
  console.log(`=== PERSONA VALIDATION REPORT ===`);
  console.log(`Persona: ${persona.name} (${persona.persona_id})`);
  console.log(`Valid: ${validationResult.isValid}`);
  
  if (validationResult.errors.length > 0) {
    console.error(`❌ ERRORS (${validationResult.errors.length}):`);
    validationResult.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  if (validationResult.warnings.length > 0) {
    console.warn(`⚠️ WARNINGS (${validationResult.warnings.length}):`);
    validationResult.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log(`Completeness:`);
  console.log(`  - Real traits: ${validationResult.completeness.hasRealTraits ? '✓' : '✗'}`);
  console.log(`  - Emotional triggers: ${validationResult.completeness.hasEmotionalTriggers ? '✓' : '✗'}`);
  console.log(`  - Interview responses: ${validationResult.completeness.hasInterviewResponses ? '✓' : '✗'}`);
  console.log(`  - Metadata: ${validationResult.completeness.hasMetadata ? '✓' : '✗'}`);
  console.log(`=== END VALIDATION REPORT ===`);
}
