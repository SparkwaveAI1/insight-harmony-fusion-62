
// @ts-nocheck

import { PersonaTemplate } from "./types.ts";

export function validateAndCleanTraits(persona: PersonaTemplate): PersonaTemplate {
  console.log('Validating and cleaning trait profile for persona:', persona.name);
  
  // Ensure trait profile exists
  if (!persona.trait_profile) {
    console.warn('Missing trait profile, creating default structure');
    persona.trait_profile = createDefaultTraitProfile();
  }
  
  // Validate and clean each trait category
  persona.trait_profile = validateTraitProfile(persona.trait_profile);
  
  console.log('Trait profile validation complete');
  return persona;
}

function createDefaultTraitProfile() {
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

function validateTraitProfile(traitProfile: any) {
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
            traitProfile[category][trait] = defaultValue;
          } else {
            for (const [nestedTrait, nestedDefault] of Object.entries(defaultValue)) {
              if (typeof traitProfile[category][trait][nestedTrait] !== 'number' ||
                  traitProfile[category][trait][nestedTrait] < 0 ||
                  traitProfile[category][trait][nestedTrait] > 1) {
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
  
  return traitProfile;
}
