import { Persona } from './types';

export interface TraitValidationResult {
  isValid: boolean;
  missingTraits: string[];
  invalidValues: string[];
  warnings: string[];
}

export function validateEnhancedTraits(persona: Persona): TraitValidationResult {
  const result: TraitValidationResult = {
    isValid: true,
    missingTraits: [],
    invalidValues: [],
    warnings: []
  };

  const traitProfile = persona.trait_profile;
  
  if (!traitProfile) {
    result.isValid = false;
    result.missingTraits.push('trait_profile');
    return result;
  }

  // Validate World Values
  const worldValues = traitProfile.world_values;
  if (!worldValues) {
    result.missingTraits.push('world_values');
    result.isValid = false;
  } else {
    // Check for the new materialist_vs_postmaterialist trait
    if (worldValues.materialist_vs_postmaterialist === null || worldValues.materialist_vs_postmaterialist === undefined) {
      result.missingTraits.push('world_values.materialist_vs_postmaterialist');
      result.isValid = false;
    } else if (typeof worldValues.materialist_vs_postmaterialist === 'string') {
      const numValue = parseFloat(worldValues.materialist_vs_postmaterialist);
      if (isNaN(numValue) || numValue < 0 || numValue > 1) {
        result.invalidValues.push(`world_values.materialist_vs_postmaterialist: ${worldValues.materialist_vs_postmaterialist}`);
        result.isValid = false;
      }
    }
    
    // Validate other world values
    ['traditional_vs_secular', 'survival_vs_self_expression'].forEach(field => {
      const value = worldValues[field as keyof typeof worldValues];
      if (value === null || value === undefined) {
        result.missingTraits.push(`world_values.${field}`);
        result.isValid = false;
      }
    });
  }

  // Validate Political Compass
  const politicalCompass = traitProfile.political_compass;
  if (!politicalCompass) {
    result.missingTraits.push('political_compass');
    result.isValid = false;
  } else {
    // Check enhanced political compass traits
    const enhancedTraits = [
      'political_salience',
      'group_fusion_level', 
      'outgroup_threat_sensitivity',
      'commons_orientation',
      'cultural_conservative_progressive'
    ];
    
    enhancedTraits.forEach(trait => {
      const value = politicalCompass[trait as keyof typeof politicalCompass];
      if (value === null || value === undefined) {
        result.missingTraits.push(`political_compass.${trait}`);
        result.isValid = false;
      } else if (typeof value === 'string') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          result.invalidValues.push(`political_compass.${trait}: ${value}`);
          result.isValid = false;
        } else if (trait === 'political_salience' && (numValue < 0 || numValue > 100)) {
          result.invalidValues.push(`political_compass.${trait}: ${value} (should be 0-100)`);
          result.isValid = false;
        } else if (trait !== 'political_salience' && (numValue < 0 || numValue > 1)) {
          result.invalidValues.push(`political_compass.${trait}: ${value} (should be 0-1)`);
          result.isValid = false;
        }
      }
    });
    
    // Check political motivations
    const politicalMotivations = politicalCompass.political_motivations;
    if (!politicalMotivations) {
      result.missingTraits.push('political_compass.political_motivations');
      result.isValid = false;
    } else {
      const motivationTypes = ['material_interest', 'moral_vision', 'cultural_preservation', 'status_reordering'];
      motivationTypes.forEach(motivation => {
        const value = politicalMotivations[motivation as keyof typeof politicalMotivations];
        if (value === null || value === undefined) {
          result.missingTraits.push(`political_compass.political_motivations.${motivation}`);
          result.isValid = false;
        } else if (typeof value === 'string') {
          const numValue = parseFloat(value);
          if (isNaN(numValue) || numValue < 0 || numValue > 1) {
            result.invalidValues.push(`political_compass.political_motivations.${motivation}: ${value}`);
            result.isValid = false;
          }
        }
      });
    }
  }

  // Validate Cultural Dimensions (NEW)
  const culturalDimensions = traitProfile.cultural_dimensions;
  if (!culturalDimensions) {
    result.missingTraits.push('cultural_dimensions');
    result.isValid = false;
  } else {
    const culturalTraits = [
      'power_distance',
      'individualism_vs_collectivism',
      'masculinity_vs_femininity',
      'uncertainty_avoidance',
      'long_term_orientation',
      'indulgence_vs_restraint'
    ];
    
    culturalTraits.forEach(trait => {
      const value = culturalDimensions[trait as keyof typeof culturalDimensions];
      if (value === null || value === undefined) {
        result.missingTraits.push(`cultural_dimensions.${trait}`);
        result.isValid = false;
      } else if (typeof value === 'string') {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0 || numValue > 1) {
          result.invalidValues.push(`cultural_dimensions.${trait}: ${value}`);
          result.isValid = false;
        }
      }
    });
  }

  // Validate Social Identity (NEW)
  const socialIdentity = traitProfile.social_identity;
  if (!socialIdentity) {
    result.missingTraits.push('social_identity');
    result.isValid = false;
  } else {
    const socialTraits = [
      'identity_strength',
      'identity_complexity',
      'ingroup_bias_tendency',
      'outgroup_bias_tendency',
      'social_dominance_orientation',
      'system_justification',
      'intergroup_contact_comfort',
      'cultural_intelligence'
    ];
    
    socialTraits.forEach(trait => {
      const value = socialIdentity[trait as keyof typeof socialIdentity];
      if (value === null || value === undefined) {
        result.missingTraits.push(`social_identity.${trait}`);
        result.isValid = false;
      } else if (typeof value === 'string') {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0 || numValue > 1) {
          result.invalidValues.push(`social_identity.${trait}: ${value}`);
          result.isValid = false;
        }
      }
    });
  }

  // Validate Emotional Triggers (NEW)
  const emotionalTriggers = persona.emotional_triggers;
  if (!emotionalTriggers) {
    result.warnings.push('Missing emotional_triggers');
  } else {
    if (!emotionalTriggers.positive_triggers || !Array.isArray(emotionalTriggers.positive_triggers)) {
      result.missingTraits.push('emotional_triggers.positive_triggers');
      result.isValid = false;
    }
    
    if (!emotionalTriggers.negative_triggers || !Array.isArray(emotionalTriggers.negative_triggers)) {
      result.missingTraits.push('emotional_triggers.negative_triggers');
      result.isValid = false;
    }
    
    // Validate trigger structure
    [...(emotionalTriggers.positive_triggers || []), ...(emotionalTriggers.negative_triggers || [])].forEach((trigger, index) => {
      if (!trigger.keywords || !Array.isArray(trigger.keywords) || trigger.keywords.length === 0) {
        result.invalidValues.push(`trigger[${index}]: missing or empty keywords array`);
        result.isValid = false;
      }
      
      if (!trigger.emotion_type || typeof trigger.emotion_type !== 'string') {
        result.invalidValues.push(`trigger[${index}]: missing or invalid emotion_type`);
        result.isValid = false;
      }
      
      if (typeof trigger.intensity_multiplier !== 'number' || trigger.intensity_multiplier < 1 || trigger.intensity_multiplier > 10) {
        result.invalidValues.push(`trigger[${index}]: intensity_multiplier should be 1-10`);
        result.isValid = false;
      }
      
      if (!trigger.description || typeof trigger.description !== 'string') {
        result.invalidValues.push(`trigger[${index}]: missing or invalid description`);
        result.isValid = false;
      }
    });
  }

  // Add warnings for missing extended traits
  const extendedTraits = traitProfile.extended_traits;
  if (!extendedTraits?.emotional_intensity) {
    result.warnings.push('Missing extended_traits.emotional_intensity');
  }
  if (!extendedTraits?.emotional_regulation) {
    result.warnings.push('Missing extended_traits.emotional_regulation');
  }
  if (!extendedTraits?.trigger_sensitivity) {
    result.warnings.push('Missing extended_traits.trigger_sensitivity');
  }

  return result;
}

export function logTraitValidation(persona: Persona): void {
  const validation = validateEnhancedTraits(persona);
  
  console.log('=== TRAIT VALIDATION RESULTS ===');
  console.log(`Persona: ${persona.name} (${persona.persona_id})`);
  console.log(`Valid: ${validation.isValid}`);
  
  if (validation.missingTraits.length > 0) {
    console.error('Missing traits:', validation.missingTraits);
  }
  
  if (validation.invalidValues.length > 0) {
    console.error('Invalid values:', validation.invalidValues);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('Warnings:', validation.warnings);
  }
  
  if (validation.isValid) {
    console.log('✅ All enhanced traits are properly implemented!');
  }
  
  console.log('=== END VALIDATION ===');
}
