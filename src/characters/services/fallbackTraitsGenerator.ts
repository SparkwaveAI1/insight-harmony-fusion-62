
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';

export function generateFallbackTraits(formData: HistoricalCharacterFormData) {
  const isPreIndustrial = formData.date_of_birth && new Date(formData.date_of_birth).getFullYear() < 1800;
  
  return {
    big_five: {
      openness: isPreIndustrial ? 0.4 : 0.6,
      conscientiousness: 0.6,
      extraversion: 0.5,
      agreeableness: 0.6,
      neuroticism: 0.4,
    },
    moral_foundations: {
      care: 0.7,
      fairness: 0.6,
      loyalty: isPreIndustrial ? 0.8 : 0.6,
      authority: isPreIndustrial ? 0.8 : 0.5,
      sanctity: isPreIndustrial ? 0.7 : 0.4,
      liberty: isPreIndustrial ? 0.3 : 0.6,
    },
    world_values: {
      traditional_vs_secular: isPreIndustrial ? 0.2 : 0.4,
      survival_vs_self_expression: isPreIndustrial ? 0.3 : 0.5,
      materialist_vs_postmaterialist: 0.5,
    },
    political_compass: {
      economic: 0.3,
      authoritarian_libertarian: isPreIndustrial ? -0.3 : 0.2,
      cultural_conservative_progressive: isPreIndustrial ? -0.5 : 0.4,
      political_salience: 0.5,
      group_fusion_level: 0.6,
      outgroup_threat_sensitivity: 0.4,
      commons_orientation: 0.7,
      political_motivations: {
        material_interest: 0.5,
        moral_vision: 0.6,
        cultural_preservation: 0.7,
        status_reordering: 0.3,
      },
    },
    behavioral_economics: {
      present_bias: 0.4,
      loss_aversion: 0.6,
      overconfidence: 0.5,
      risk_sensitivity: 0.6,
      scarcity_sensitivity: isPreIndustrial ? 0.8 : 0.6,
    },
    cultural_dimensions: {
      power_distance: isPreIndustrial ? 0.8 : 0.6,
      individualism_vs_collectivism: isPreIndustrial ? 0.3 : 0.5,
      masculinity_vs_femininity: 0.5,
      uncertainty_avoidance: 0.6,
      long_term_orientation: 0.7,
      indulgence_vs_restraint: 0.4,
    },
    social_identity: {
      identity_strength: 0.7,
      identity_complexity: 0.5,
      ingroup_bias_tendency: 0.6,
      outgroup_bias_tendency: 0.4,
      social_dominance_orientation: 0.3,
      system_justification: 0.6,
      intergroup_contact_comfort: 0.5,
      cultural_intelligence: 0.6,
    },
    extended_traits: {
      truth_orientation: 0.7,
      moral_consistency: 0.6,
      self_awareness: 0.5,
      empathy: 0.6,
      self_efficacy: 0.7,
      manipulativeness: 0.2,
      impulse_control: 0.6,
      shadow_trait_activation: 0.3,
      attention_pattern: 0.5,
      cognitive_load_resilience: 0.6,
      institutional_trust: 0.7,
      conformity_tendency: 0.5,
      conflict_avoidance: 0.4,
      cognitive_flexibility: 0.6,
      need_for_cognitive_closure: 0.5,
      emotional_intensity: 0.5,
      emotional_regulation: 0.6,
      trigger_sensitivity: 0.4,
    },
    dynamic_state: {
      current_stress_level: 0.3,
      emotional_stability_context: 0.6,
      motivation_orientation: 0.7,
      trust_volatility: 0.4,
      trigger_threshold: 0.5,
    },
    physical_health: {
      disabilities: [],
      health_conditions: [],
      mobility: 'normal',
    },
  };
}
