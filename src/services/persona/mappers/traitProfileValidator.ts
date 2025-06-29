
import { createDefaultTraitProfile } from './defaultTraitProfile';

export function validateAndPreserveTraitProfile(traitProfile: Record<string, any>) {
  console.log("=== VALIDATING AND PRESERVING TRAIT PROFILE ===");
  const defaultProfile = createDefaultTraitProfile();
  
  // Only fill in missing categories, don't overwrite existing valid values
  for (const [category, defaultValues] of Object.entries(defaultProfile)) {
    if (!traitProfile[category] || typeof traitProfile[category] !== 'object') {
      console.warn(`Missing trait category: ${category}, adding defaults`);
      traitProfile[category] = defaultValues;
    } else {
      // For existing categories, only add missing traits, preserve existing values
      for (const [trait, defaultValue] of Object.entries(defaultValues as any)) {
        if (typeof defaultValue === 'object') {
          // Handle nested objects like political_motivations
          if (!traitProfile[category][trait] || typeof traitProfile[category][trait] !== 'object') {
            console.warn(`Missing nested trait object: ${category}.${trait}, adding defaults`);
            traitProfile[category][trait] = defaultValue;
          } else {
            for (const [nestedTrait, nestedDefault] of Object.entries(defaultValue)) {
              if (traitProfile[category][trait][nestedTrait] === undefined || 
                  traitProfile[category][trait][nestedTrait] === null) {
                console.warn(`Missing nested trait value for ${category}.${trait}.${nestedTrait}, adding default`);
                traitProfile[category][trait][nestedTrait] = nestedDefault;
              }
              // Only validate ranges, don't replace valid values
              else if (typeof traitProfile[category][trait][nestedTrait] === 'number') {
                const value = traitProfile[category][trait][nestedTrait];
                if (value < 0) traitProfile[category][trait][nestedTrait] = 0;
                else if (value > 1) traitProfile[category][trait][nestedTrait] = 1;
              }
            }
          }
        } else {
          // Handle regular numeric traits - only add if missing
          if (traitProfile[category][trait] === undefined || 
              traitProfile[category][trait] === null) {
            console.warn(`Missing trait value for ${category}.${trait}, adding default`);
            traitProfile[category][trait] = defaultValue;
          }
          // Only validate ranges, don't replace valid values
          else if (typeof traitProfile[category][trait] === 'number') {
            const value = traitProfile[category][trait];
            if (value < 0) traitProfile[category][trait] = 0;
            else if (value > 1) traitProfile[category][trait] = 1;
          }
        }
      }
    }
  }
  
  console.log("=== END TRAIT PROFILE VALIDATION AND PRESERVATION ===");
  return traitProfile;
}
