
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
  
  // Check if trait profile has non-default values
  const hasRealTraits = checkForRealTraits(persona.trait_profile);
  if (!hasRealTraits) {
    errors.push("Persona has default trait values - generation may have failed");
  }
  
  // Check emotional triggers
  const hasEmotionalTriggers = checkEmotionalTriggers(persona.emotional_triggers);
  if (!hasEmotionalTriggers) {
    errors.push("Missing or empty emotional triggers");
  }
  
  // Check interview responses
  const hasInterviewResponses = checkInterviewResponses(persona.interview_sections);
  if (!hasInterviewResponses) {
    errors.push("Missing or empty interview responses");
  }
  
  // Check metadata completeness
  const hasMetadata = checkMetadata(persona.metadata);
  if (!hasMetadata) {
    warnings.push("Incomplete demographic metadata");
  }
  
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
  if (!traitProfile || typeof traitProfile !== 'object') return false;
  
  // Check if all values are default 0.5 (indicating failed generation)
  const checkCategory = (category: any): boolean => {
    if (!category || typeof category !== 'object') return false;
    
    const values = Object.values(category);
    const numericValues = values.filter(v => typeof v === 'number');
    
    // If more than 80% of values are exactly 0.5, likely default values
    const defaultCount = numericValues.filter(v => v === 0.5).length;
    return defaultCount < (numericValues.length * 0.8);
  };
  
  const categories = ['big_five', 'moral_foundations', 'world_values', 'political_compass'];
  return categories.some(cat => checkCategory(traitProfile[cat]));
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
