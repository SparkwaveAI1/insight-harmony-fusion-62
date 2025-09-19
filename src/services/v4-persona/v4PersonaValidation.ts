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

  // NEW: Content completeness validation
  function checkContentCompleteness(obj: any, path = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      // Check for "unspecified" values
      if (value === "unspecified") {
        warnings.push(`Unspecified value at ${currentPath} - should be filled`);
      }
      
      // Check for empty arrays that should have content
      else if (Array.isArray(value) && value.length === 0) {
        const shouldHaveContent = [
          'targets', 'boundaries', 'use_cases', 'mitigations', 'positive_triggers', 
          'negative_triggers', 'primary_motivation_labels', 'deal_breakers',
          'stress_responses', 'mental_preoccupations'
        ];
        
        if (shouldHaveContent.includes(key)) {
          warnings.push(`Empty ${key} array - should have realistic content`);
        }
      }
      
      // Check for empty strings
      else if (value === '' || value === null) {
        warnings.push(`Empty value at ${currentPath} - should be filled`);
      }
      
      // Recurse into objects
      else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        checkContentCompleteness(value, currentPath);
      }
    }
  }

  checkContentCompleteness(persona);

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
    let totalHours = 0;
    
    for (const hours of Object.values(activities)) {
      if (typeof hours === 'number') {
        totalHours += hours;
      } else if (typeof hours === 'string') {
        totalHours += parseFloat(hours) || 0;
      }
    }
    
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

  // Calculate true completeness score
  const completenessScore = calculateTrueCompleteness(persona);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completenessScore
  };
}

// Calculate true completeness based on content, not just structure
function calculateTrueCompleteness(persona: any): number {
  let totalFields = 0;
  let completeFields = 0;

  function analyzeField(obj: any): void {
    for (const [key, value] of Object.entries(obj)) {
      totalFields++;
      
      if (value === null || value === '' || value === 'unspecified') {
        // Incomplete field
      } else if (Array.isArray(value)) {
        const shouldHaveContent = [
          'targets', 'boundaries', 'use_cases', 'mitigations', 'positive_triggers',
          'negative_triggers', 'primary_motivation_labels', 'deal_breakers'
        ];
        
        if (shouldHaveContent.includes(key) && value.length === 0) {
          // Array that should have content but is empty
        } else {
          completeFields++;
        }
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

export { validatePersona, hasBannedKeys, hasRequiredKeys, BANNED_KEYS };
export type { ValidationResult };