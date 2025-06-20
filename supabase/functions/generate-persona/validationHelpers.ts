
import { PersonaGenerationError } from "./errorHandler.ts";

// Enhanced trait validation to catch default values
export function validateTraitRealism(traitProfile: any): { isValid: boolean; errors: string[]; defaultRatio: number } {
  console.log("=== VALIDATING TRAIT REALISM ===");
  
  if (!traitProfile || typeof traitProfile !== 'object') {
    return { isValid: false, errors: ["Trait profile is missing or invalid"], defaultRatio: 1.0 };
  }

  const allValues: number[] = [];
  
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
  
  // If more than 30% are exactly 0.5, it's likely a failed generation
  if (defaultRatio > 0.3) {
    return { 
      isValid: false, 
      errors: [`Too many default values: ${Math.round(defaultRatio * 100)}% are 0.5`], 
      defaultRatio 
    };
  }
  
  console.log("✅ Trait profile has realistic variation");
  return { isValid: true, errors: [], defaultRatio };
}

// Enhanced demographic validation to ensure proper structure
export function validateDemographicStructure(metadata: any): { isValid: boolean; errors: string[] } {
  console.log("=== VALIDATING DEMOGRAPHIC STRUCTURE ===");
  console.log("Received metadata:", metadata);
  
  if (!metadata || typeof metadata !== 'object') {
    return { isValid: false, errors: ["Metadata is missing or invalid"] };
  }

  // Check for the nested structure that OpenAI generates
  const requiredSections = [
    'core_demographics',
    'location_info', 
    'professional_life',
    'socioeconomic_status',
    'relationship_status',
    'lifestyle_health'
  ];
  
  const missingSections = requiredSections.filter(section => !metadata[section]);
  
  if (missingSections.length > 0) {
    console.warn(`Missing demographic sections: ${missingSections.join(', ')}`);
    return { 
      isValid: false, 
      errors: [`Missing demographic sections: ${missingSections.join(', ')}`] 
    };
  }
  
  // Validate core demographic fields within the nested structure
  const coreDemo = metadata.core_demographics;
  if (!coreDemo?.age || !coreDemo?.gender) {
    return { 
      isValid: false, 
      errors: ["Missing core demographic fields: age or gender"] 
    };
  }
  
  const professionalLife = metadata.professional_life;
  if (!professionalLife?.occupation || !professionalLife?.education_level) {
    return { 
      isValid: false, 
      errors: ["Missing professional fields: occupation or education_level"] 
    };
  }
  
  const locationInfo = metadata.location_info;
  if (!locationInfo?.current_location) {
    return { 
      isValid: false, 
      errors: ["Missing location information"] 
    };
  }
  
  console.log("✅ Demographic structure validation passed");
  return { isValid: true, errors: [] };
}

export async function validatePersonaUniqueness(supabase: any, persona: any): Promise<string> {
  // Validate persona_id uniqueness
  const { data: existingPersona } = await supabase
    .from('personas')
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
