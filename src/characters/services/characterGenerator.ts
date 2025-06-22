
import { Character, CharacterTraitProfile, CharacterEmotionalTriggers } from '../types/characterTraitTypes';
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';

export const generateCharacterFromFormData = async (formData: HistoricalCharacterFormData): Promise<Character> => {
  console.log('=== GENERATING CHARACTER FROM FORM DATA ===');
  console.log('Form data:', formData);

  // Generate a unique character ID
  const characterId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create basic trait profile with realistic values based on form data
  const traitProfile: CharacterTraitProfile = generateTraitProfileFromData(formData);
  
  // Create emotional triggers based on the character data
  const emotionalTriggers: CharacterEmotionalTriggers = generateEmotionalTriggersFromData(formData);
  
  const character: Character = {
    id: '', // Will be set by database
    character_id: characterId,
    name: formData.name,
    character_type: 'historical',
    creation_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    metadata: {
      enhanced_metadata_version: 2,
      age: formData.age,
      gender: 'Unknown', // Can be inferred from historical context
      education_level: 'Historical Context Based',
      occupation: formData.occupation || 'Historical Figure',
      marital_status: 'Historical Context',
      location_history: {
        grew_up_in: formData.location,
        current_residence: formData.location,
        places_lived: [formData.location]
      },
      political_affiliation: 'Historical Context',
      cultural_background: formData.historical_context || 'Historical Period Context'
    },
    trait_profile: traitProfile,
    behavioral_modulation: {
      cognitive_load_pattern: 'context-aware',
      attention_regulation: 'historically-focused',
      emotional_reactivity: 'period-appropriate',
      stress_behavior: 'historical-context',
      fatigue_pattern: 'sustainable',
      physical_health_consideration: 'historical-realistic',
      trust_behavior_under_strain: 'contextual',
      coping_mechanisms: 'period-appropriate'
    },
    linguistic_profile: {
      default_output_length: 'moderate',
      speech_register: 'historical-formal',
      regional_influence: formData.location,
      professional_or_educational_influence: formData.occupation,
      cultural_speech_patterns: 'historical-period',
      generational_or_peer_influence: 'historical-era',
      speaking_style: {
        uses_neutral_fillers: false,
        sentence_revisions: true,
        topic_length_variability: true,
        contradiction_tolerance: false,
        trust_modulated_tone: true,
        mirroring_tendency: false
      },
      sample_phrasing: []
    },
    emotional_triggers: emotionalTriggers,
    preinterview_tags: ['historical', 'generated', formData.occupation || 'figure'].filter(Boolean),
    simulation_directives: {
      encourage_contradiction: false,
      emotional_asymmetry: true,
      stress_behavior_expected: true,
      inconsistency_is_valid: false,
      response_length_variability: true
    },
    interview_sections: generateInterviewSections(formData),
    prompt: `Historical character: ${formData.name}, born ${formData.date_of_birth}, age ${formData.age}, from ${formData.location}`,
    user_id: undefined, // Will be set by the calling code
    is_public: false,
    profile_image_url: null,
    enhanced_metadata_version: 2
  };

  console.log('✅ Character generated successfully');
  return character;
};

function generateTraitProfileFromData(formData: HistoricalCharacterFormData): CharacterTraitProfile {
  // Generate realistic trait values based on historical context
  // These are educated estimates that could be refined with more historical data
  return {
    big_five: {
      openness: 0.7, // Historical figures often show high openness
      conscientiousness: 0.8, // Usually high for notable historical figures
      extraversion: 0.6, // Varies, but many leaders show moderate to high
      agreeableness: 0.5, // Highly variable among historical figures
      neuroticism: 0.4, // Often lower in successful historical figures
    },
    moral_foundations: {
      care: 0.6,
      fairness: 0.7,
      loyalty: 0.8, // Often high in historical contexts
      authority: 0.7, // Respect for hierarchy common in historical periods
      sanctity: 0.6,
      liberty: 0.5,
    },
    world_values: {
      traditional_vs_secular: 0.7, // Historical figures often more traditional
      survival_vs_self_expression: 0.4, // More survival-oriented in historical contexts
      materialist_vs_postmaterialist: 0.3, // More materialist concerns historically
    },
    political_compass: {
      economic: 0.5,
      authoritarian_libertarian: 0.6, // Often more authoritarian in historical contexts
      cultural_conservative_progressive: 0.7, // Often more conservative culturally
      political_salience: 0.8, // Politics often central to historical figures
      group_fusion_level: 0.7,
      outgroup_threat_sensitivity: 0.6,
      commons_orientation: 0.5,
      political_motivations: {
        material_interest: 0.4,
        moral_vision: 0.8,
        cultural_preservation: 0.7,
        status_reordering: 0.6,
      },
    },
    behavioral_economics: {
      present_bias: 0.3,
      loss_aversion: 0.6,
      overconfidence: 0.7, // Often high in historical leaders
      risk_sensitivity: 0.5,
      scarcity_sensitivity: 0.7, // Higher in historical contexts
    },
    cultural_dimensions: {
      power_distance: 0.8, // Higher in historical periods
      individualism_vs_collectivism: 0.4, // More collectivist historically
      masculinity_vs_femininity: 0.7, // Often more masculine culturally
      uncertainty_avoidance: 0.6,
      long_term_orientation: 0.7, // Many historical figures were long-term thinkers
      indulgence_vs_restraint: 0.3, // More restraint in historical contexts
    },
    social_identity: {
      identity_strength: 0.8,
      identity_complexity: 0.6,
      ingroup_bias_tendency: 0.7,
      outgroup_bias_tendency: 0.6,
      social_dominance_orientation: 0.6,
      system_justification: 0.7,
      intergroup_contact_comfort: 0.4,
      cultural_intelligence: 0.6,
    },
    extended_traits: {
      truth_orientation: 0.7,
      moral_consistency: 0.8,
      self_awareness: 0.6,
      empathy: 0.5,
      self_efficacy: 0.8,
      manipulativeness: 0.4,
      impulse_control: 0.7,
      shadow_trait_activation: 0.3,
      attention_pattern: 0.7,
      cognitive_load_resilience: 0.8,
      institutional_trust: 0.6,
      conformity_tendency: 0.5,
      conflict_avoidance: 0.3,
      cognitive_flexibility: 0.6,
      need_for_cognitive_closure: 0.6,
      emotional_intensity: 0.6,
      emotional_regulation: 0.7,
      trigger_sensitivity: 0.5,
    },
    dynamic_state: {
      current_stress_level: 0.5,
      emotional_stability_context: 0.7,
      motivation_orientation: 0.8,
      trust_volatility: 0.4,
      trigger_threshold: 0.6,
    },
  };
}

function generateEmotionalTriggersFromData(formData: HistoricalCharacterFormData): CharacterEmotionalTriggers {
  const positive_triggers = [
    {
      keywords: ['honor', 'duty', 'service', 'legacy'],
      emotion_type: 'pride',
      intensity_multiplier: 1.2,
      description: 'Responds positively to concepts of honor and duty'
    },
    {
      keywords: ['achievement', 'accomplishment', 'success', 'victory'],
      emotion_type: 'satisfaction',
      intensity_multiplier: 1.1,
      description: 'Takes pride in achievements and successes'
    }
  ];

  const negative_triggers = [
    {
      keywords: ['dishonor', 'betrayal', 'failure', 'defeat'],
      emotion_type: 'indignation',
      intensity_multiplier: 1.3,
      description: 'Strong negative reaction to dishonor or betrayal'
    },
    {
      keywords: ['injustice', 'unfairness', 'corruption'],
      emotion_type: 'anger',
      intensity_multiplier: 1.2,
      description: 'Responds strongly to perceived injustice'
    }
  ];

  return {
    positive_triggers,
    negative_triggers
  };
}

function generateInterviewSections(formData: HistoricalCharacterFormData) {
  return [
    {
      section_title: 'Background and Early Life',
      responses: [
        {
          question: 'Tell me about your early life and upbringing.',
          answer: formData.backstory || `I was born in ${formData.date_of_birth} in ${formData.location}. My early years shaped who I would become.`
        },
        {
          question: 'What influenced your character development?',
          answer: formData.personality_traits || 'The times and circumstances of my era greatly influenced my character and worldview.'
        }
      ]
    },
    {
      section_title: 'Historical Context and Role',
      responses: [
        {
          question: 'What was your role in history?',
          answer: `As a ${formData.occupation || 'historical figure'}, I played a part in the events of my time.`
        },
        {
          question: 'How did the historical context shape your actions?',
          answer: formData.historical_context || 'The historical circumstances of my era presented both challenges and opportunities that shaped my decisions.'
        }
      ]
    }
  ];
}
