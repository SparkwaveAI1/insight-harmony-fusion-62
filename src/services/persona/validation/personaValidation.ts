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
  
  // Check if trait profile has non-default values
  const hasRealTraits = checkForRealTraits(persona.trait_profile);
  console.log("Has real traits:", hasRealTraits);
  
  if (!hasRealTraits) {
    errors.push("Persona has default trait values - generation may have failed");
    console.error("❌ TRAIT VALIDATION FAILED - All values appear to be defaults");
    logDetailedTraitAnalysis(persona.trait_profile);
  }
  
  // Check emotional triggers
  const hasEmotionalTriggers = checkEmotionalTriggers(persona.emotional_triggers);
  console.log("Has emotional triggers:", hasEmotionalTriggers);
  if (!hasEmotionalTriggers) {
    errors.push("Missing or empty emotional triggers");
  }
  
  // Check interview responses
  const hasInterviewResponses = checkInterviewResponses(persona.interview_sections);
  console.log("Has interview responses:", hasInterviewResponses);
  if (!hasInterviewResponses) {
    errors.push("Missing or empty interview responses");
  }
  
  // Check metadata completeness
  const hasMetadata = checkMetadata(persona.metadata);
  console.log("Has complete metadata:", hasMetadata);
  if (!hasMetadata) {
    warnings.push("Incomplete demographic metadata");
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
    console.error("Trait profile is missing or invalid:", traitProfile);
    return false;
  }
  
  console.log("=== ANALYZING TRAIT PROFILE FOR DEFAULTS ===");
  
  // Check if all values are default 0.5 (indicating failed generation)
  const checkCategory = (category: any, categoryName: string): boolean => {
    if (!category || typeof category !== 'object') {
      console.warn(`Category ${categoryName} is missing or invalid:`, category);
      return false;
    }
    
    const values = Object.values(category);
    const numericValues = values.filter(v => typeof v === 'number');
    
    console.log(`${categoryName} - Total values: ${values.length}, Numeric: ${numericValues.length}`);
    
    if (numericValues.length === 0) {
      console.warn(`${categoryName} has no numeric values`);
      return false;
    }
    
    // Count exact 0.5 values
    const exactHalfCount = numericValues.filter(v => v === 0.5).length;
    const defaultRatio = exactHalfCount / numericValues.length;
    
    console.log(`${categoryName} - Values at 0.5: ${exactHalfCount}/${numericValues.length} (${Math.round(defaultRatio * 100)}%)`);
    
    // Log some actual values for debugging
    const sampleValues = Object.entries(category).slice(0, 3);
    console.log(`${categoryName} sample values:`, sampleValues);
    
    // If more than 80% of values are exactly 0.5, likely default values
    const hasRealValues = defaultRatio < 0.8;
    console.log(`${categoryName} has real values: ${hasRealValues}`);
    
    return hasRealValues;
  };
  
  const categories = ['big_five', 'moral_foundations', 'world_values', 'political_compass'];
  let validCategories = 0;
  
  for (const cat of categories) {
    if (checkCategory(traitProfile[cat], cat)) {
      validCategories++;
    }
  }
  
  console.log(`Valid categories: ${validCategories}/${categories.length}`);
  
  // Require at least 2 categories to have real values
  const hasRealTraits = validCategories >= 2;
  console.log(`Overall has real traits: ${hasRealTraits}`);
  
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
  
  return hasPositive && hasNegative;
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
  if (!metadata || typeof metadata !== 'object') return false;
  
  const requiredFields = ['name', 'age', 'gender', 'occupation'];
  return requiredFields.every(field => metadata[field] && metadata[field] !== 'Not specified');
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
