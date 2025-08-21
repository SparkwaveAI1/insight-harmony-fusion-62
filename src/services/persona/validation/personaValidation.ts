
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

export function validatePersonaCompleteness(persona: any): PersonaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  console.log("=== DETAILED PERSONA VALIDATION ===");
  console.log("Persona name:", persona.name);
  console.log("Persona ID:", persona.persona_id);
  console.log("Persona structure:", persona.persona_data ? "V3" : "Legacy");
  
  // Determine structure and extract trait data
  let traitData, emotionalTriggers, interviewSections, metadataOrIdentity;
  
  if (persona.persona_data) {
    // V3 structure
    traitData = persona.persona_data.cognitive_profile;
    emotionalTriggers = persona.persona_data.state_modifiers?.emotional_triggers;
    interviewSections = persona.persona_data.interview_sections || persona.interview_sections;
    metadataOrIdentity = persona.persona_data.identity;
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
  
  const categories = ['big_five', 'moral_foundations', 'world_values', 'political_compass'];
  let validCategories = 0;
  
  for (const cat of categories) {
    if (traitProfile[cat] && checkCategory(traitProfile[cat], cat)) {
      validCategories++;
    }
  }
  
  console.log(`✅ Valid categories: ${validCategories}/${categories.length}`);
  
  // Require at least 3 out of 4 core categories to have real values
  const hasRealTraits = validCategories >= 3;
  console.log(`✅ Overall has real traits: ${hasRealTraits} (need ≥3 valid categories)`);
  
  if (!hasRealTraits) {
    console.error("❌ CRITICAL FAILURE: Not enough trait categories have real values");
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
  if (!triggers || typeof triggers !== 'object') return false;
  
  const hasPositive = Array.isArray(triggers.positive_triggers) && triggers.positive_triggers.length > 0;
  const hasNegative = Array.isArray(triggers.negative_triggers) && triggers.negative_triggers.length > 0;
  
  // For imported personas, accept if either positive or negative triggers exist
  return hasPositive || hasNegative;
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
