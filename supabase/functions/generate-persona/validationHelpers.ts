import { PersonaGenerationError } from "./errorHandler.ts";

// Enhanced trait validation to handle all 9 trait categories
export function validateTraitRealism(traitProfile: any): { isValid: boolean; errors: string[]; defaultRatio: number } {
  console.log("=== VALIDATING COMPLETE TRAIT PROFILE REALISM ===");
  
  if (!traitProfile || typeof traitProfile !== 'object') {
    return { isValid: false, errors: ["Trait profile is missing or invalid"], defaultRatio: 1.0 };
  }

  const allValues: number[] = [];
  const expectedCategories = [
    'big_five',
    'moral_foundations', 
    'world_values',
    'political_compass',
    'behavioral_economics',
    'cultural_dimensions',
    'social_identity',
    'extended_traits',
    'dynamic_state'
  ];
  
  // Check for all expected trait categories
  const missingCategories = expectedCategories.filter(category => !traitProfile[category]);
  if (missingCategories.length > 0) {
    console.warn(`Missing trait categories: ${missingCategories.join(', ')}`);
  }
  
  // Extract all numeric values from trait profile
  const extractValues = (obj: any) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'number') {
        allValues.push(value);
      } else if (typeof value === 'object' && value !== null) {
        extractValues(value);
      }
    }
  };
  
  extractValues(traitProfile);
  
  if (allValues.length === 0) {
    return { isValid: false, errors: ["No numeric trait values found"], defaultRatio: 1.0 };
  }
  
  // Count values that are exactly 0.5 (defaults)
  const exactHalfCount = allValues.filter(val => val === 0.5).length;
  const defaultRatio = exactHalfCount / allValues.length;
  
  console.log(`Trait validation: ${allValues.length} total values, ${exactHalfCount} are 0.5 (${Math.round(defaultRatio * 100)}% defaults)`);
  console.log(`Found categories: ${Object.keys(traitProfile).join(', ')}`);
  console.log(`Expected categories: ${expectedCategories.join(', ')}`);
  
  // If more than 30% are exactly 0.5, it's likely a failed generation
  if (defaultRatio > 0.3) {
    return { 
      isValid: false, 
      errors: [`Too many default values: ${Math.round(defaultRatio * 100)}% are 0.5`], 
      defaultRatio 
    };
  }
  
  // Check minimum number of trait values (should have 70+ traits across 9 categories)
  if (allValues.length < 50) {
    return {
      isValid: false,
      errors: [`Insufficient trait coverage: only ${allValues.length} traits generated`],
      defaultRatio
    };
  }
  
  console.log("✅ Trait profile has realistic variation and comprehensive coverage");
  return { isValid: true, errors: [], defaultRatio };
}

// Updated demographic validation that aligns with our 10-stage process
export function validateDemographicStructure(metadata: any): { isValid: boolean; errors: string[] } {
  console.log("=== VALIDATING DEMOGRAPHIC STRUCTURE ===");
  console.log("Received metadata:", metadata);
  
  if (!metadata || typeof metadata !== 'object') {
    return { isValid: false, errors: ["Metadata is missing or invalid"] };
  }

  // Check for required core demographic fields - expanded to ensure completeness
  const requiredCoreFields = [
    'age', 'gender', 'race_ethnicity', 'education_level', 'occupation', 
    'employment_type', 'income_level', 'social_class_identity', 'marital_status'
  ];
  
  const missingCoreFields = requiredCoreFields.filter(field => 
    !metadata[field] || metadata[field] === 'Not specified' || metadata[field] === ''
  );
  
  if (missingCoreFields.length > 0) {
    console.error(`❌ Missing or invalid required demographic fields: ${missingCoreFields.join(', ')}`);
    return { 
      isValid: false, 
      errors: [`Missing required demographic fields: ${missingCoreFields.join(', ')}`] 
    };
  }
  
  console.log("✅ Complete demographic structure validation passed");
  return { isValid: true, errors: [] };
}

// New function to validate complete metadata after all stages
export function validateCompleteMetadata(metadata: any): { isValid: boolean; errors: string[] } {
  console.log("=== VALIDATING COMPLETE METADATA ===");
  
  if (!metadata || typeof metadata !== 'object') {
    return { isValid: false, errors: ["Metadata is missing or invalid"] };
  }

  const errors: string[] = [];
  
  // Check core demographics (Stage 1)
  const requiredCoreFields = ['age', 'gender', 'education_level', 'occupation'];
  const missingCoreFields = requiredCoreFields.filter(field => !metadata[field]);
  if (missingCoreFields.length > 0) {
    errors.push(`Missing core fields: ${missingCoreFields.join(', ')}`);
  }
  
  // Check location information (Stage 2)
  const hasLocationInfo = metadata.region || metadata.urban_rural_context || metadata.location_history;
  if (!hasLocationInfo) {
    errors.push("Missing location information");
  }
  
  // Check family relationships (Stage 3)
  if (!metadata.relationships_family || typeof metadata.relationships_family !== 'object') {
    errors.push("Missing family relationships data");
  }
  
  // Check health attributes (Stage 4)
  const hasHealthInfo = metadata.physical_health_status || metadata.mental_health_status;
  if (!hasHealthInfo) {
    errors.push("Missing health information");
  }
  
  // Check physical description (Stage 5)
  const hasPhysicalInfo = metadata.height || metadata.build_body_type;
  if (!hasPhysicalInfo) {
    errors.push("Missing physical description");
  }
  
  // Check knowledge domains (Stage 6)
  if (!metadata.knowledge_domains || typeof metadata.knowledge_domains !== 'object') {
    errors.push("Missing knowledge domains");
  } else {
    const knowledgeCount = Object.keys(metadata.knowledge_domains).length;
    if (knowledgeCount < 20) {
      errors.push(`Insufficient knowledge domains: only ${knowledgeCount} domains`);
    }
  }
  
  // Check psychological/cultural data (Stage 7)
  const hasPsychCultural = metadata.political_affiliation || metadata.tech_familiarity || metadata.media_ecosystem;
  if (!hasPsychCultural) {
    errors.push("Missing psychological/cultural information");
  }
  
  console.log(`Complete metadata validation: ${errors.length === 0 ? '✅ PASSED' : '❌ FAILED'}`);
  if (errors.length > 0) {
    console.error("Validation errors:", errors);
  }
  
  return { isValid: errors.length === 0, errors };
}

export async function validatePersonaUniqueness(supabase: any, persona: any): Promise<string> {
  // Validate persona_id uniqueness
  const { data: existingPersona } = await supabase
    .from('v4_personas')
    .select('persona_id')
    .eq('persona_id', persona.persona_id)
    .single();

  if (existingPersona) {
    const newId = `${persona.persona_id}-${Math.random().toString(36).substr(2, 4)}`;
    console.log(`Persona ID collision detected, using: ${newId}`);
    return newId;
  }
  
  return persona.persona_id;
}
