
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { Character, CharacterBehavioralModulation } from '../types/characterTraitTypes';
import { EmotionalTriggersProfile } from '../../services/persona/types/trait-profile';
import { v4 as uuidv4 } from 'uuid';

export const generateHistoricalCharacter = async (formData: HistoricalCharacterFormData): Promise<Character> => {
  console.log('=== GENERATING HISTORICAL CHARACTER ===');
  console.log('Form data:', formData);

  const characterId = uuidv4();
  const currentDate = new Date().toISOString();

  // Build metadata with all the form data
  const metadata = {
    // Demographics
    age: parseInt(formData.age) || 30,
    gender: formData.gender || 'male',
    historical_period: formData.historical_period || '1700s',
    social_class: formData.social_class || 'middle class',
    region: formData.region || 'Europe',
    
    // Physical appearance
    height: formData.height || 'average height',
    build_body_type: formData.build_body_type || 'average build',
    hair_color: formData.hair_color || 'brown',
    hair_style: formData.hair_style || 'practical unstyled',
    eye_color: formData.eye_color || 'brown',
    skin_tone: formData.skin_tone || 'natural complexion',
    
    // Basic info
    date_of_birth: formData.date_of_birth,
    location: formData.location,
    occupation: formData.occupation,
    
    // Character details
    description: formData.description,
    backstory: formData.backstory,
    personality_traits: formData.personality_traits,
    appearance: formData.appearance,
    historical_context: formData.historical_context,
  };

  // Build physical appearance object
  const physical_appearance = {
    height: formData.height || 'average height',
    build_body_type: formData.build_body_type || 'average build',
    hair_color: formData.hair_color || 'brown',
    hair_style: formData.hair_style || 'practical unstyled',
    eye_color: formData.eye_color || 'brown',
    skin_tone: formData.skin_tone || 'natural complexion',
  };

  // Generate comprehensive trait profile with full persona system structure
  const trait_profile = {
    // Core personality traits (Big Five)
    big_five: {
      openness: 0.6,
      conscientiousness: 0.7,
      extraversion: 0.5,
      agreeableness: 0.6,
      neuroticism: 0.4,
    },
    
    // Moral foundations
    moral_foundations: {
      care: 0.7,
      fairness: 0.6,
      loyalty: 0.8,
      authority: 0.7,
      sanctity: 0.5,
      liberty: 0.6,
    },
    
    // World values
    world_values: {
      traditional_vs_secular: 0.3,
      survival_vs_self_expression: 0.4,
      materialist_vs_postmaterialist: 0.5,
    },
    
    // Political compass with enhanced structure
    political_compass: {
      economic: 0.3,
      authoritarian_libertarian: 0.2,
      cultural_conservative_progressive: 0.4,
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
    
    // Behavioral economics
    behavioral_economics: {
      present_bias: 0.4,
      loss_aversion: 0.6,
      overconfidence: 0.5,
      risk_sensitivity: 0.6,
      scarcity_sensitivity: 0.7,
    },
    
    // Cultural dimensions
    cultural_dimensions: {
      power_distance: 0.6,
      individualism_vs_collectivism: 0.4,
      masculinity_vs_femininity: 0.5,
      uncertainty_avoidance: 0.6,
      long_term_orientation: 0.7,
      indulgence_vs_restraint: 0.4,
    },
    
    // Social identity
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
    
    // Extended traits
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
    
    // Dynamic state
    dynamic_state: {
      current_stress_level: 0.3,
      emotional_stability_context: 0.6,
      motivation_orientation: 0.7,
      trust_volatility: 0.4,
      trigger_threshold: 0.5,
    },
    
    // Character-specific physical traits from form data
    physical_appearance: {
      height: formData.height || 'average height',
      build_body_type: formData.build_body_type || 'average build',
      hair_color: formData.hair_color || 'brown',
      hair_style: formData.hair_style || 'practical unstyled',
      eye_color: formData.eye_color || 'brown',
      skin_tone: formData.skin_tone || 'natural complexion',
    },
    
    // Physical health (basic for historical context)
    physical_health: {
      disabilities: [],
      health_conditions: [],
      mobility: 'normal',
    },
  };

  const behavioral_modulation: CharacterBehavioralModulation = {
    formality: 0.8,
    enthusiasm: 0.6,
    assertiveness: 0.7,
    empathy: 0.6,
    patience: 0.7,
  };

  const linguistic_profile = {
    default_output_length: 'medium',
    speech_register: 'formal',
    regional_influence: formData.region || 'European',
    professional_or_educational_influence: formData.occupation || null,
    cultural_speech_patterns: `${formData.historical_period || '1700s'} speech patterns`,
    generational_or_peer_influence: null,
    speaking_style: {
      formal: true,
      casual: false,
      technical: false,
      storytelling: true,
    },
    sample_phrasing: [],
  };

  const emotional_triggers: EmotionalTriggersProfile = {
    positive_triggers: [],
    negative_triggers: [],
  };

  const character: Character = {
    character_id: characterId,
    name: formData.name,
    character_type: 'historical',
    creation_date: currentDate,
    created_at: currentDate,
    metadata,
    behavioral_modulation,
    interview_sections: [],
    linguistic_profile,
    preinterview_tags: [],
    simulation_directives: {},
    trait_profile,
    emotional_triggers,
    is_public: false,
    enhanced_metadata_version: 2,
    // New demographic fields
    age: parseInt(formData.age) || 30,
    gender: formData.gender || 'male',
    historical_period: formData.historical_period || '1700s',
    social_class: formData.social_class || 'middle class',
    region: formData.region || 'Europe',
    physical_appearance,
  };

  console.log('Generated character:', character);
  return character;
};

// Export alias for consistency with the form component
export const generateCharacterFromFormData = generateHistoricalCharacter;
