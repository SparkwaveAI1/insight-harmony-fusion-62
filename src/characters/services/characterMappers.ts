import { DbCharacter, Character, CharacterMetadata, CharacterInterviewSection, CharacterTraitProfile } from '../types/characterTraitTypes';

export function characterToDbCharacter(character: Character): Omit<DbCharacter, 'id' | 'created_at'> {
  console.log("=== CONVERTING CHARACTER TO DB FORMAT ===");
  console.log("Converting character to DB format:", character.character_id);
  console.log("Character name:", character.name);
  
  // Log trait profile before conversion
  if (character.trait_profile) {
    console.log("Trait profile categories:", Object.keys(character.trait_profile));
    
    // Sample some values to check for defaults
    const bigFive = character.trait_profile.big_five;
    if (bigFive) {
      console.log("Big Five sample values:", {
        openness: bigFive.openness,
        conscientiousness: bigFive.conscientiousness,
        extraversion: bigFive.extraversion
      });
    }
    
    const worldValues = character.trait_profile.world_values;
    if (worldValues) {
      console.log("World Values sample:", worldValues);
    }
  } else {
    console.error("❌ CHARACTER HAS NO TRAIT PROFILE");
  }
  
  // Ensure emotional_triggers has the correct structure for database storage
  let emotionalTriggers = character.emotional_triggers;
  if (!emotionalTriggers) {
    emotionalTriggers = {
      positive_triggers: [],
      negative_triggers: []
    };
  } else {
    // Ensure the structure matches what the database expects
    emotionalTriggers = {
      positive_triggers: emotionalTriggers.positive_triggers || [],
      negative_triggers: emotionalTriggers.negative_triggers || []
    };
  }
  
  const dbCharacter: Omit<DbCharacter, 'id' | 'created_at'> = {
    character_id: character.character_id,
    name: character.name,
    character_type: character.character_type,
    creation_date: character.creation_date,
    prompt: character.prompt || null,
    metadata: character.metadata as any,
    trait_profile: character.trait_profile as any,
    behavioral_modulation: character.behavioral_modulation as any,
    linguistic_profile: character.linguistic_profile as any,
    preinterview_tags: character.preinterview_tags as any,
    simulation_directives: character.simulation_directives as any,
    interview_sections: character.interview_sections as any,
    emotional_triggers: emotionalTriggers as any,
    is_public: character.is_public || false,
    user_id: character.user_id,
    profile_image_url: character.profile_image_url || null,
    enhanced_metadata_version: character.enhanced_metadata_version || 2,
  };
  
  console.log("DB character ready for insert:", {
    character_id: dbCharacter.character_id,
    name: dbCharacter.name,
    has_emotional_triggers: !!dbCharacter.emotional_triggers,
    emotional_triggers_structure: emotionalTriggers,
    enhanced_metadata_version: dbCharacter.enhanced_metadata_version,
    trait_profile_keys: dbCharacter.trait_profile ? Object.keys(dbCharacter.trait_profile as any) : []
  });
  
  console.log("=== END CHARACTER TO DB CONVERSION ===");
  
  return dbCharacter;
}

export function dbCharacterToCharacter(dbCharacter: DbCharacter): Character {
  console.log("=== CONVERTING DB CHARACTER TO APP FORMAT ===");
  console.log("Converting DB character to app format:", dbCharacter.character_id);
  console.log("DB character name:", dbCharacter.name);
  
  // Handle emotional triggers with proper fallback structure
  let emotionalTriggers;
  try {
    emotionalTriggers = dbCharacter.emotional_triggers as unknown as any;
    
    // Ensure the structure is correct
    if (!emotionalTriggers || typeof emotionalTriggers !== 'object') {
      emotionalTriggers = {
        positive_triggers: [],
        negative_triggers: []
      };
    } else {
      // Validate structure
      emotionalTriggers = {
        positive_triggers: Array.isArray(emotionalTriggers.positive_triggers) ? emotionalTriggers.positive_triggers : [],
        negative_triggers: Array.isArray(emotionalTriggers.negative_triggers) ? emotionalTriggers.negative_triggers : []
      };
    }
  } catch (error) {
    console.warn("Error parsing emotional triggers, using default structure:", error);
    emotionalTriggers = {
      positive_triggers: [],
      negative_triggers: []
    };
  }
  
  // Handle trait profile data with corrected validation
  let traitProfile = dbCharacter.trait_profile as unknown as CharacterTraitProfile;
  
  console.log("=== ANALYZING DB TRAIT PROFILE ===");
  console.log("Raw trait profile type:", typeof traitProfile);
  console.log("Raw trait profile keys:", traitProfile ? Object.keys(traitProfile) : "none");
  
  // Fixed validation - only create defaults if truly missing or empty
  if (!traitProfile || typeof traitProfile !== 'object') {
    console.warn("❌ TRAIT PROFILE IS MISSING OR NOT AN OBJECT");
    traitProfile = createDefaultTraitProfile();
  } else {
    console.log("✅ Trait profile exists, performing gentle validation...");
    
    // Log some sample values before validation
    if (traitProfile.big_five) {
      console.log("DB Big Five sample:", {
        openness: traitProfile.big_five.openness,
        conscientiousness: traitProfile.big_five.conscientiousness
      });
    }
    
    // Gentle validation - only fill in missing parts, don't replace existing values
    traitProfile = gentlyValidateTraitProfile(traitProfile);
  }
  
  console.log("=== FINAL TRAIT PROFILE CHECK ===");
  if (traitProfile.big_five) {
    console.log("Final Big Five values:", {
      openness: traitProfile.big_five.openness,
      conscientiousness: traitProfile.big_five.conscientiousness,
      extraversion: traitProfile.big_five.extraversion
    });
  }
  
  console.log("=== END DB TO CHARACTER CONVERSION ===");
  
  return {
    id: dbCharacter.id,
    character_id: dbCharacter.character_id,
    name: dbCharacter.name,
    character_type: dbCharacter.character_type,
    creation_date: dbCharacter.creation_date,
    prompt: dbCharacter.prompt || "",
    metadata: dbCharacter.metadata as unknown as CharacterMetadata,
    trait_profile: traitProfile,
    behavioral_modulation: dbCharacter.behavioral_modulation as unknown as Record<string, any>,
    linguistic_profile: dbCharacter.linguistic_profile as unknown as Record<string, any>,
    preinterview_tags: dbCharacter.preinterview_tags as unknown as string[],
    simulation_directives: dbCharacter.simulation_directives as unknown as Record<string, any>,
    interview_sections: dbCharacter.interview_sections as unknown as CharacterInterviewSection[],
    emotional_triggers: emotionalTriggers,
    is_public: dbCharacter.is_public || false,
    user_id: dbCharacter.user_id,
    profile_image_url: dbCharacter.profile_image_url || null,
    enhanced_metadata_version: dbCharacter.enhanced_metadata_version || 2,
    created_at: dbCharacter.created_at,
  };
}

function createDefaultTraitProfile(): CharacterTraitProfile {
  console.log("⚠️ CREATING DEFAULT TRAIT PROFILE - THIS INDICATES A PROBLEM");
  return {
    big_five: {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
    },
    moral_foundations: {
      care: 0.5,
      fairness: 0.5,
      loyalty: 0.5,
      authority: 0.5,
      sanctity: 0.5,
      liberty: 0.5,
    },
    world_values: {
      traditional_vs_secular: 0.5,
      survival_vs_self_expression: 0.5,
      materialist_vs_postmaterialist: 0.5,
    },
    political_compass: {
      economic: 0.5,
      authoritarian_libertarian: 0.5,
      cultural_conservative_progressive: 0.5,
      political_salience: 0.5,
      group_fusion_level: 0.5,
      outgroup_threat_sensitivity: 0.5,
      commons_orientation: 0.5,
      political_motivations: {
        material_interest: 0.5,
        moral_vision: 0.5,
        cultural_preservation: 0.5,
        status_reordering: 0.5,
      },
    },
    cultural_dimensions: {
      power_distance: 0.5,
      individualism_vs_collectivism: 0.5,
      masculinity_vs_femininity: 0.5,
      uncertainty_avoidance: 0.5,
      long_term_orientation: 0.5,
      indulgence_vs_restraint: 0.5,
    },
    social_identity: {
      identity_strength: 0.5,
      identity_complexity: 0.5,
      ingroup_bias_tendency: 0.5,
      outgroup_bias_tendency: 0.5,
      social_dominance_orientation: 0.5,
      system_justification: 0.5,
      intergroup_contact_comfort: 0.5,
      cultural_intelligence: 0.5,
    },
    behavioral_economics: {
      present_bias: 0.5,
      loss_aversion: 0.5,
      overconfidence: 0.5,
      risk_sensitivity: 0.5,
      scarcity_sensitivity: 0.5,
    },
    extended_traits: {
      truth_orientation: 0.5,
      moral_consistency: 0.5,
      self_awareness: 0.5,
      empathy: 0.5,
      self_efficacy: 0.5,
      manipulativeness: 0.5,
      impulse_control: 0.5,
      shadow_trait_activation: 0.5,
      attention_pattern: 0.5,
      cognitive_load_resilience: 0.5,
      institutional_trust: 0.5,
      conformity_tendency: 0.5,
      conflict_avoidance: 0.5,
      cognitive_flexibility: 0.5,
      need_for_cognitive_closure: 0.5,
      emotional_intensity: 0.5,
      emotional_regulation: 0.5,
      trigger_sensitivity: 0.5,
    },
    dynamic_state: {
      current_stress_level: 0.5,
      emotional_stability_context: 0.5,
      motivation_orientation: 0.5,
      trust_volatility: 0.5,
      trigger_threshold: 0.5,
    },
  };
}

function gentlyValidateTraitProfile(traitProfile: any): CharacterTraitProfile {
  console.log("=== GENTLY VALIDATING TRAIT PROFILE ===");
  const defaultProfile = createDefaultTraitProfile();
  
  // Create a copy to avoid modifying the original
  const validatedProfile = { ...traitProfile };
  
  // Ensure all main categories exist
  for (const [category, defaultValues] of Object.entries(defaultProfile)) {
    if (!validatedProfile[category] || typeof validatedProfile[category] !== 'object') {
      console.warn(`Missing trait category: ${category}, adding defaults`);
      validatedProfile[category] = defaultValues;
    } else {
      // For existing categories, only fill in missing traits
      for (const [trait, defaultValue] of Object.entries(defaultValues as any)) {
        if (typeof defaultValue === 'object') {
          // Handle nested objects like political_motivations
          if (!validatedProfile[category][trait] || typeof validatedProfile[category][trait] !== 'object') {
            console.warn(`Missing nested trait object: ${category}.${trait}, adding defaults`);
            validatedProfile[category][trait] = defaultValue;
          } else {
            // Fill in missing nested traits only
            for (const [nestedTrait, nestedDefault] of Object.entries(defaultValue)) {
              if (typeof validatedProfile[category][trait][nestedTrait] !== 'number') {
                console.warn(`Missing nested trait: ${category}.${trait}.${nestedTrait}, using default`);
                validatedProfile[category][trait][nestedTrait] = nestedDefault;
              }
              // Keep existing values if they're valid numbers, even if outside 0-1 range
            }
          }
        } else {
          // For regular traits, only add if missing
          if (typeof validatedProfile[category][trait] !== 'number') {
            console.warn(`Missing trait: ${category}.${trait}, using default`);
            validatedProfile[category][trait] = defaultValue;
          }
          // Keep existing numeric values even if they're outside 0-1 range
        }
      }
    }
  }
  
  console.log("=== END GENTLE TRAIT PROFILE VALIDATION ===");
  return validatedProfile;
}
