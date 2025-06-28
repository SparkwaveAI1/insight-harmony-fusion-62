import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { Character, CharacterBehavioralModulation } from '../types/characterTraitTypes';
import { EmotionalTriggersProfile } from '../../services/persona/types/trait-profile';
import { generateCharacterTraits } from './characterTraitService';
import { v4 as uuidv4 } from 'uuid';

export const generateHistoricalCharacter = async (formData: HistoricalCharacterFormData): Promise<Character> => {
  console.log('=== GENERATING HISTORICAL CHARACTER FROM MINIMAL INPUT ===');
  console.log('Form data:', formData);

  const characterId = uuidv4();
  const currentDate = new Date().toISOString();

  try {
    // Generate comprehensive character details from the description and core inputs
    console.log('Generating AI-powered character from description...');
    const aiGeneratedTraits = await generateCharacterTraits({
      name: formData.name, // Use the provided name
      description: formData.description,
      date_of_birth: formData.date_of_birth,
      age: parseInt(formData.age) || 30,
      location: formData.location,
      // AI will infer these from the description
      gender: formData.gender || '',
      ethnicity: formData.ethnicity || '',
      social_class: formData.social_class || '',
      region: formData.region || '',
      occupation: formData.occupation || '',
      personality_traits: formData.personality_traits || '',
      backstory: formData.backstory || '',
      historical_context: formData.historical_context || '',
    });

    console.log('Successfully generated AI traits for character from description');

    // Build comprehensive metadata from AI generation and user inputs
    const metadata = {
      // Core user inputs
      name: formData.name, // Use the provided name
      date_of_birth: formData.date_of_birth,
      age: parseInt(formData.age) || 30,
      location: formData.location,
      description: formData.description,
      
      // AI-generated details (will be populated by the trait service)
      gender: aiGeneratedTraits.gender || 'not specified',
      ethnicity: aiGeneratedTraits.ethnicity || 'not specified',
      social_class: aiGeneratedTraits.social_class || 'middle class',
      region: aiGeneratedTraits.region || 'Europe',
      
      // Physical appearance (AI-generated)
      height_build: aiGeneratedTraits.physical_appearance?.height_build || 'average height and build',
      hair: aiGeneratedTraits.physical_appearance?.hair || 'brown hair',
      eye_color: aiGeneratedTraits.physical_appearance?.eye_color || 'brown eyes',
      skin_tone: aiGeneratedTraits.physical_appearance?.skin_tone || 'natural complexion',
      
      // Character details (AI-generated)
      backstory: aiGeneratedTraits.backstory || 'Generated from character description',
      personality_traits: aiGeneratedTraits.personality_traits || 'Generated personality traits',
      appearance: aiGeneratedTraits.appearance || 'Generated appearance description',
      occupation: aiGeneratedTraits.occupation || 'Generated occupation',
      historical_context: aiGeneratedTraits.historical_context || 'Generated historical context',
    };

    // Use AI-generated traits as the foundation
    const trait_profile = {
      ...aiGeneratedTraits,
      // Ensure physical appearance is properly set
      physical_appearance: {
        height_build: aiGeneratedTraits.physical_appearance?.height_build || 'average height and build',
        hair: aiGeneratedTraits.physical_appearance?.hair || 'brown hair',
        eye_color: aiGeneratedTraits.physical_appearance?.eye_color || 'brown eyes',
        skin_tone: aiGeneratedTraits.physical_appearance?.skin_tone || 'natural complexion',
        ethnicity: aiGeneratedTraits.physical_appearance?.ethnicity || 'not specified',
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
      regional_influence: aiGeneratedTraits.region || formData.location || 'European',
      professional_or_educational_influence: aiGeneratedTraits.occupation || null,
      cultural_speech_patterns: 'Historical speech patterns',
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
      name: formData.name, // Use the provided name
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
      gender: aiGeneratedTraits.gender || 'not specified',
      social_class: aiGeneratedTraits.social_class || 'middle class',
      region: aiGeneratedTraits.region || 'Europe',
      physical_appearance: {
        height_build: aiGeneratedTraits.physical_appearance?.height_build || 'average height and build',
        hair: aiGeneratedTraits.physical_appearance?.hair || 'brown hair',
        eye_color: aiGeneratedTraits.physical_appearance?.eye_color || 'brown eyes',
        skin_tone: aiGeneratedTraits.physical_appearance?.skin_tone || 'natural complexion',
        ethnicity: aiGeneratedTraits.physical_appearance?.ethnicity || 'not specified',
      },
    };

    console.log('Generated character with AI-powered traits from user description:', character);
    return character;

  } catch (error) {
    console.error('Error generating AI traits for character, falling back to defaults:', error);
    
    // Fallback to basic character creation if AI generation fails
    const fallbackTraits = generateFallbackTraits(formData);
    
    const trait_profile = {
      ...fallbackTraits,
      physical_appearance: {
        height_build: 'average height and build',
        hair: 'brown hair',
        eye_color: 'brown eyes',
        skin_tone: 'natural complexion',
        ethnicity: 'not specified',
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
      regional_influence: formData.location || 'European',
      professional_or_educational_influence: null,
      cultural_speech_patterns: 'Historical speech patterns',
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

    const metadata = {
      name: formData.name, // Use the provided name
      date_of_birth: formData.date_of_birth,
      age: parseInt(formData.age) || 30,
      location: formData.location,
      description: formData.description,
      gender: 'not specified',
      ethnicity: 'not specified',
      social_class: 'middle class',
      region: 'Europe',
      height_build: 'average height and build',
      hair: 'brown hair',
      eye_color: 'brown eyes',
      skin_tone: 'natural complexion',
      backstory: 'Generated from user description',
      personality_traits: 'To be determined from description',
      appearance: 'Average appearance for the historical period',
      occupation: 'To be determined from description',
      historical_context: 'Historical context based on date and location',
    };

    const character: Character = {
      character_id: characterId,
      name: formData.name, // Use the provided name
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
      age: parseInt(formData.age) || 30,
      gender: 'not specified',
      social_class: 'middle class',
      region: 'Europe',
      physical_appearance: {
        height_build: 'average height and build',
        hair: 'brown hair',
        eye_color: 'brown eyes',
        skin_tone: 'natural complexion',
        ethnicity: 'not specified',
      },
    };

    console.log('Generated character with fallback traits due to AI error');
    return character;
  }
};

// Fallback function for historically-informed defaults
function generateFallbackTraits(formData: HistoricalCharacterFormData) {
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

// Export alias for consistency with the form component
export const generateCharacterFromFormData = generateHistoricalCharacter;
