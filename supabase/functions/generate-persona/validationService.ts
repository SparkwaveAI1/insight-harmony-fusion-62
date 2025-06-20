
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateUserPrompt(prompt: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!prompt || typeof prompt !== 'string') {
    errors.push('Prompt is required and must be a string');
    return { isValid: false, errors, warnings };
  }
  
  const trimmedPrompt = prompt.trim();
  
  if (trimmedPrompt.length < 10) {
    errors.push('Prompt must be at least 10 characters long');
  }
  
  if (trimmedPrompt.length > 2000) {
    errors.push('Prompt must be less than 2000 characters');
  }
  
  if (trimmedPrompt.length < 30) {
    warnings.push('Short prompts may result in generic personas');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateGeneratedPersona(persona: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!persona.name || persona.name.trim().length === 0) {
    errors.push('Generated persona is missing a name');
  }
  
  if (!persona.persona_id || persona.persona_id.trim().length === 0) {
    errors.push('Generated persona is missing an ID');
  }
  
  if (!persona.metadata) {
    errors.push('Generated persona is missing metadata');
  } else {
    if (!persona.metadata.age || persona.metadata.age === 0) {
      errors.push('Generated persona is missing age information');
    }
    if (!persona.metadata.occupation || persona.metadata.occupation.trim().length === 0) {
      errors.push('Generated persona is missing occupation information');
    }
  }
  
  // Check trait profile completeness
  if (!persona.trait_profile) {
    errors.push('Generated persona is missing trait profile');
  } else {
    const requiredTraitCategories = ['big_five', 'moral_foundations', 'world_values', 'political_compass'];
    for (const category of requiredTraitCategories) {
      if (!persona.trait_profile[category]) {
        errors.push(`Generated persona is missing ${category} traits`);
      }
    }
  }
  
  // Check emotional triggers
  if (!persona.emotional_triggers) {
    errors.push('Generated persona is missing emotional triggers');
  } else {
    if (!Array.isArray(persona.emotional_triggers.positive_triggers) || 
        persona.emotional_triggers.positive_triggers.length === 0) {
      errors.push('Generated persona is missing positive emotional triggers');
    }
    if (!Array.isArray(persona.emotional_triggers.negative_triggers) || 
        persona.emotional_triggers.negative_triggers.length === 0) {
      errors.push('Generated persona is missing negative emotional triggers');
    }
  }
  
  // Check interview responses
  if (!persona.interview_sections || !Array.isArray(persona.interview_sections) || 
      persona.interview_sections.length === 0) {
    errors.push('Generated persona is missing interview responses');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateTraitValues(traitProfile: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!traitProfile || typeof traitProfile !== 'object') {
    errors.push('Trait profile is missing or invalid');
    return { isValid: false, errors, warnings };
  }
  
  // Check for default 0.5 values that indicate failed generation
  const checkDefaultValues = (category: any, categoryName: string): boolean => {
    if (!category || typeof category !== 'object') return false;
    
    const values = Object.values(category).filter(v => typeof v === 'number');
    if (values.length === 0) return false;
    
    const defaultCount = values.filter(v => v === 0.5).length;
    const defaultRatio = defaultCount / values.length;
    
    if (defaultRatio > 0.8) {
      errors.push(`${categoryName} traits appear to have default values - generation may have failed`);
      return false;
    }
    
    return true;
  };
  
  // Validate each trait category
  const categories = ['big_five', 'moral_foundations', 'world_values', 'political_compass'];
  let validCategories = 0;
  
  for (const categoryName of categories) {
    if (checkDefaultValues(traitProfile[categoryName], categoryName)) {
      validCategories++;
    }
  }
  
  if (validCategories === 0) {
    errors.push('All trait categories appear to have failed generation');
  } else if (validCategories < categories.length) {
    warnings.push(`Some trait categories may have incomplete generation`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
