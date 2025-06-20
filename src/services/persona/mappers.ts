import { DbPersona, Persona, PersonaMetadata, InterviewSection } from "./types";
import { Json } from "@/integrations/supabase/types";

export function personaToDbPersona(persona: Persona): Omit<DbPersona, 'id' | 'created_at'> {
  console.log("=== CONVERTING PERSONA TO DB FORMAT ===");
  console.log("Converting persona to DB format:", persona.persona_id);
  console.log("Persona name:", persona.name);
  
  // Log trait profile before conversion
  if (persona.trait_profile) {
    console.log("Trait profile categories:", Object.keys(persona.trait_profile));
    
    // Sample some values to check for defaults
    const bigFive = persona.trait_profile.big_five;
    if (bigFive) {
      console.log("Big Five sample values:", {
        openness: bigFive.openness,
        conscientiousness: bigFive.conscientiousness,
        extraversion: bigFive.extraversion
      });
    }
    
    const worldValues = persona.trait_profile.world_values;
    if (worldValues) {
      console.log("World Values sample:", worldValues);
    }
  } else {
    console.error("❌ PERSONA HAS NO TRAIT PROFILE");
  }
  
  // Ensure emotional_triggers has the correct structure for database storage
  let emotionalTriggers = persona.emotional_triggers;
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
  
  const dbPersona: Omit<DbPersona, 'id' | 'created_at'> = {
    persona_id: persona.persona_id,
    name: persona.name,
    creation_date: persona.creation_date,
    prompt: persona.prompt || null,
    metadata: persona.metadata as unknown as Json,
    trait_profile: persona.trait_profile as unknown as Json,
    behavioral_modulation: persona.behavioral_modulation as unknown as Json,
    linguistic_profile: persona.linguistic_profile as unknown as Json,
    preinterview_tags: persona.preinterview_tags as unknown as Json,
    simulation_directives: persona.simulation_directives as unknown as Json,
    interview_sections: persona.interview_sections as unknown as Json,
    emotional_triggers: emotionalTriggers as unknown as Json,
    is_public: persona.is_public || false,
    user_id: persona.user_id,
    profile_image_url: persona.profile_image_url || null,
    enhanced_metadata_version: persona.enhanced_metadata_version || 2,
  };
  
  console.log("DB persona ready for insert:", {
    persona_id: dbPersona.persona_id,
    name: dbPersona.name,
    has_emotional_triggers: !!dbPersona.emotional_triggers,
    emotional_triggers_structure: emotionalTriggers,
    enhanced_metadata_version: dbPersona.enhanced_metadata_version,
    trait_profile_keys: dbPersona.trait_profile ? Object.keys(dbPersona.trait_profile as any) : []
  });
  
  console.log("=== END PERSONA TO DB CONVERSION ===");
  
  return dbPersona;
}

export function dbPersonaToPersona(dbPersona: DbPersona): Persona {
  console.log("=== CONVERTING DB PERSONA TO APP FORMAT ===");
  console.log("Converting DB persona to app format:", dbPersona.persona_id);
  console.log("DB persona name:", dbPersona.name);
  
  // Handle emotional triggers with proper fallback structure
  let emotionalTriggers;
  try {
    emotionalTriggers = dbPersona.emotional_triggers as unknown as any;
    
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
  
  // Handle trait profile data more carefully with comprehensive validation
  let traitProfile = dbPersona.trait_profile as unknown as Record<string, any>;
  
  console.log("=== ANALYZING DB TRAIT PROFILE ===");
  console.log("Raw trait profile type:", typeof traitProfile);
  console.log("Raw trait profile keys:", traitProfile ? Object.keys(traitProfile) : "none");
  
  // Check for various forms of malformed trait data
  if (!traitProfile || 
      typeof traitProfile !== 'object' || 
      traitProfile._type === "undefined" || 
      traitProfile.value === "undefined" ||
      Object.keys(traitProfile).length === 0) {
    
    console.warn("❌ TRAIT PROFILE DATA IS MALFORMED OR EMPTY");
    console.warn("Creating comprehensive default structure");
    traitProfile = createDefaultTraitProfile();
  } else {
    console.log("✅ Trait profile exists, validating structure...");
    
    // Log some sample values before validation
    if (traitProfile.big_five) {
      console.log("DB Big Five sample:", {
        openness: traitProfile.big_five.openness,
        conscientiousness: traitProfile.big_five.conscientiousness
      });
    }
    
    // Validate existing trait profile structure
    traitProfile = validateTraitProfile(traitProfile);
  }
  
  console.log("=== FINAL TRAIT PROFILE CHECK ===");
  if (traitProfile.big_five) {
    console.log("Final Big Five values:", {
      openness: traitProfile.big_five.openness,
      conscientiousness: traitProfile.big_five.conscientiousness,
      extraversion: traitProfile.big_five.extraversion
    });
  }
  
  console.log("=== END DB TO PERSONA CONVERSION ===");
  
  return {
    id: dbPersona.id,
    persona_id: dbPersona.persona_id,
    name: dbPersona.name,
    creation_date: dbPersona.creation_date,
    prompt: dbPersona.prompt || "",
    metadata: dbPersona.metadata as unknown as PersonaMetadata,
    trait_profile: traitProfile,
    behavioral_modulation: dbPersona.behavioral_modulation as unknown as Record<string, any>,
    linguistic_profile: dbPersona.linguistic_profile as unknown as Record<string, any>,
    preinterview_tags: dbPersona.preinterview_tags as unknown as string[],
    simulation_directives: dbPersona.simulation_directives as unknown as Record<string, any>,
    interview_sections: dbPersona.interview_sections as unknown as InterviewSection[] | {
      interview_sections: InterviewSection[];
    },
    emotional_triggers: emotionalTriggers,
    is_public: dbPersona.is_public || false,
    user_id: dbPersona.user_id,
    profile_image_url: dbPersona.profile_image_url || null,
    enhanced_metadata_version: dbPersona.enhanced_metadata_version || 2,
    created_at: dbPersona.created_at,
    // Add missing required properties with defaults
    persona_context: {},
    persona_type: "generated",
  };
}

function createDefaultTraitProfile() {
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
  };
}

function validateTraitProfile(traitProfile: Record<string, any>) {
  console.log("=== VALIDATING TRAIT PROFILE ===");
  const defaultProfile = createDefaultTraitProfile();
  
  // Ensure all main categories exist and have proper values
  for (const [category, defaultValues] of Object.entries(defaultProfile)) {
    if (!traitProfile[category] || typeof traitProfile[category] !== 'object') {
      console.warn(`Missing trait category: ${category}, using defaults`);
      traitProfile[category] = defaultValues;
    } else {
      // Validate individual traits within each category
      for (const [trait, defaultValue] of Object.entries(defaultValues as any)) {
        if (typeof defaultValue === 'object') {
          // Handle nested objects like political_motivations
          if (!traitProfile[category][trait] || typeof traitProfile[category][trait] !== 'object') {
            console.warn(`Missing nested trait object: ${category}.${trait}, using defaults`);
            traitProfile[category][trait] = defaultValue;
          } else {
            for (const [nestedTrait, nestedDefault] of Object.entries(defaultValue)) {
              if (typeof traitProfile[category][trait][nestedTrait] !== 'number' ||
                  traitProfile[category][trait][nestedTrait] < 0 ||
                  traitProfile[category][trait][nestedTrait] > 1) {
                console.warn(`Invalid nested trait value for ${category}.${trait}.${nestedTrait}, using default`);
                traitProfile[category][trait][nestedTrait] = nestedDefault;
              }
            }
          }
        } else {
          // Handle regular numeric traits
          if (typeof traitProfile[category][trait] !== 'number' ||
              traitProfile[category][trait] < 0 ||
              traitProfile[category][trait] > 1) {
            console.warn(`Invalid trait value for ${category}.${trait}, using default`);
            traitProfile[category][trait] = defaultValue;
          }
        }
      }
    }
  }
  
  console.log("=== END TRAIT PROFILE VALIDATION ===");
  return traitProfile;
}
