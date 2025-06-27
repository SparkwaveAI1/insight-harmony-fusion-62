
import { Character } from '../types/characterTraitTypes';
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { CharacterTraitProfile } from '../types/characterTraitTypes';
import { v4 as uuidv4 } from 'uuid';
import { calculateHistoricalHealthTraits, calculatePhysicalAppearanceTraits, HistoricalHealthContext } from './historicalDisabilityCalculator';

const generateRandomTraits = () => ({
  openness: Math.random(),
  conscientiousness: Math.random(),
  extraversion: Math.random(),
  agreeableness: Math.random(),
  neuroticism: Math.random(),
});

const generateRandomMoralFoundations = () => ({
  care: Math.random(),
  fairness: Math.random(),
  loyalty: Math.random(),
  authority: Math.random(),
  sanctity: Math.random(),
  liberty: Math.random(),
});

const generateRandomWorldValues = () => ({
  traditional_vs_secular: Math.random(),
  survival_vs_self_expression: Math.random(),
  materialist_vs_postmaterialist: Math.random(),
});

const generateRandomPoliticalCompass = () => ({
  economic: Math.random(),
  authoritarian_libertarian: Math.random(),
  cultural_conservative_progressive: Math.random(),
  political_salience: Math.random(),
  group_fusion_level: Math.random(),
  outgroup_threat_sensitivity: Math.random(),
  commons_orientation: Math.random(),
  political_motivations: {
    material_interest: Math.random(),
    moral_vision: Math.random(),
    cultural_preservation: Math.random(),
    status_reordering: Math.random(),
  },
});

const generateRandomBehavioralEconomics = () => ({
  present_bias: Math.random(),
  loss_aversion: Math.random(),
  overconfidence: Math.random(),
  risk_sensitivity: Math.random(),
  scarcity_sensitivity: Math.random(),
});

const generateRandomCulturalDimensions = () => ({
  power_distance: Math.random(),
  individualism_vs_collectivism: Math.random(),
  masculinity_vs_femininity: Math.random(),
  uncertainty_avoidance: Math.random(),
  long_term_orientation: Math.random(),
  indulgence_vs_restraint: Math.random(),
});

const generateRandomSocialIdentity = () => ({
  identity_strength: Math.random(),
  identity_complexity: Math.random(),
  ingroup_bias_tendency: Math.random(),
  outgroup_bias_tendency: Math.random(),
  social_dominance_orientation: Math.random(),
  system_justification: Math.random(),
  intergroup_contact_comfort: Math.random(),
  cultural_intelligence: Math.random(),
});

const generateRandomExtendedTraits = () => ({
  truth_orientation: Math.random(),
  moral_consistency: Math.random(),
  self_awareness: Math.random(),
  empathy: Math.random(),
  self_efficacy: Math.random(),
  manipulativeness: Math.random(),
  impulse_control: Math.random(),
  shadow_trait_activation: Math.random(),
  attention_pattern: Math.random(),
  cognitive_load_resilience: Math.random(),
  institutional_trust: Math.random(),
  conformity_tendency: Math.random(),
  conflict_avoidance: Math.random(),
  cognitive_flexibility: Math.random(),
  need_for_cognitive_closure: Math.random(),
  emotional_intensity: Math.random(),
  emotional_regulation: Math.random(),
  trigger_sensitivity: Math.random(),
});

const generateRandomDynamicState = () => ({
  current_stress_level: Math.random(),
  emotional_stability_context: Math.random(),
  motivation_orientation: Math.random(),
  trust_volatility: Math.random(),
  trigger_threshold: Math.random(),
});

export const generateCharacterFromFormData = async (formData: HistoricalCharacterFormData): Promise<Character> => {
  const characterId = uuidv4();
  const now = new Date().toISOString();

  // Create historical health context
  const healthContext: HistoricalHealthContext = {
    historicalPeriod: '1700s',
    region: formData.location,
    age: parseInt(formData.age) || 30,
    gender: 'Male', // This should come from form data when available
    socialClass: 'middle class', // This should be derived from occupation/context
    occupation: formData.occupation || 'common person'
  };

  // Calculate historical health traits
  const physicalHealthTraits = calculateHistoricalHealthTraits(healthContext);
  
  // Calculate appearance traits based on health and context
  const physicalAppearanceTraits = calculatePhysicalAppearanceTraits(healthContext, physicalHealthTraits);

  const traitProfile: CharacterTraitProfile = {
    // New trait categories
    physical_appearance: physicalAppearanceTraits,
    physical_health: physicalHealthTraits,
    
    big_five: {
      openness: Math.random(),
      conscientiousness: Math.random(),
      extraversion: Math.random(),
      agreeableness: Math.random(),
      neuroticism: Math.random(),
    },
    moral_foundations: {
      care: Math.random(),
      fairness: Math.random(),
      loyalty: Math.random(),
      authority: Math.random(),
      sanctity: Math.random(),
      liberty: Math.random(),
    },
    world_values: {
      traditional_vs_secular: Math.random(),
      survival_vs_self_expression: Math.random(),
      materialist_vs_postmaterialist: Math.random(),
    },
    political_compass: {
      economic: Math.random(),
      authoritarian_libertarian: Math.random(),
      cultural_conservative_progressive: Math.random(),
      political_salience: Math.random(),
      group_fusion_level: Math.random(),
      outgroup_threat_sensitivity: Math.random(),
      commons_orientation: Math.random(),
      political_motivations: {
        material_interest: Math.random(),
        moral_vision: Math.random(),
        cultural_preservation: Math.random(),
        status_reordering: Math.random(),
      },
    },
    behavioral_economics: {
      present_bias: Math.random(),
      loss_aversion: Math.random(),
      overconfidence: Math.random(),
      risk_sensitivity: Math.random(),
      scarcity_sensitivity: Math.random(),
    },
    cultural_dimensions: {
      power_distance: Math.random(),
      individualism_vs_collectivism: Math.random(),
      masculinity_vs_femininity: Math.random(),
      uncertainty_avoidance: Math.random(),
      long_term_orientation: Math.random(),
      indulgence_vs_restraint: Math.random(),
    },
    social_identity: {
      identity_strength: Math.random(),
      identity_complexity: Math.random(),
      ingroup_bias_tendency: Math.random(),
      outgroup_bias_tendency: Math.random(),
      social_dominance_orientation: Math.random(),
      system_justification: Math.random(),
      intergroup_contact_comfort: Math.random(),
      cultural_intelligence: Math.random(),
    },
    extended_traits: {
      truth_orientation: Math.random(),
      moral_consistency: Math.random(),
      self_awareness: Math.random(),
      empathy: Math.random(),
      self_efficacy: Math.random(),
      manipulativeness: Math.random(),
      impulse_control: Math.random(),
      shadow_trait_activation: Math.random(),
      attention_pattern: Math.random(),
      cognitive_load_resilience: Math.random(),
      institutional_trust: Math.random(),
      conformity_tendency: Math.random(),
      conflict_avoidance: Math.random(),
      cognitive_flexibility: Math.random(),
      need_for_cognitive_closure: Math.random(),
      emotional_intensity: Math.random(),
      emotional_regulation: Math.random(),
      trigger_sensitivity: Math.random(),
    },
    dynamic_state: {
      current_stress_level: Math.random(),
      emotional_stability_context: Math.random(),
      motivation_orientation: Math.random(),
      trust_volatility: Math.random(),
      trigger_threshold: Math.random(),
    },
  };

  const character: Character = {
    id: uuidv4(),
    character_id: characterId,
    name: formData.name,
    character_type: 'historical',
    creation_date: now,
    created_at: now,
    prompt: formData.description || '',
    metadata: {
      age: formData.age,
      gender: 'Male',
      education_level: 'basic', // Added required field
      occupation: formData.occupation || '',
      region: formData.location,
      historical_period: '1700s',
      social_class: 'middle class'
    },
    trait_profile: traitProfile,
    behavioral_modulation: {},
    linguistic_profile: {},
    emotional_triggers: {
      positive_triggers: [],
      negative_triggers: []
    },
    preinterview_tags: [],
    simulation_directives: {},
    interview_sections: [],
    is_public: false,
    user_id: '',
    profile_image_url: null,
    enhanced_metadata_version: 2,
  };
  
  console.log("Generated character trait profile:", traitProfile);

  return character;
};
