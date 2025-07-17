
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';

export function generateFallbackTraits(formData: HistoricalCharacterFormData) {
  console.log('🔧 Generating fallback traits for character:', formData.name);
  
  return {
    metadata: {
      name: formData.name,
      age: parseInt(formData.age) || 30,
      gender: formData.gender || 'unspecified',
      occupation: formData.occupation || 'Unknown',
      social_class_identity: formData.social_class || 'middle',
      region: formData.region || formData.location,
      cultural_context: formData.historical_context || 'Historical period',
      backstory: formData.backstory || `A historical character from ${formData.location || 'unknown location'}`,
      personality_traits: formData.personality_traits || 'Complex historical personality',
      creation_method: 'fallback_generation',
      creation_version: '2.0_fallback',
    },
    
    behavioral_modulation: {
      formality: 0.8,
      enthusiasm: 0.6,
      assertiveness: 0.7,
      empathy: 0.6,
      patience: 0.7,
    },
    
    linguistic_profile: {
      default_output_length: 'medium',
      speech_register: 'formal',
      regional_influence: formData.location || 'European',
      professional_or_educational_influence: formData.occupation || null,
      cultural_speech_patterns: 'Historical speech patterns',
      generational_or_peer_influence: null,
      speaking_style: {
        formal: true,
        casual: false,
        technical: false,
        storytelling: true,
      },
      sample_phrasing: [],
    },
    
    trait_profile: {
      // Simple trait profile for fallback characters
      personality_traits: formData.personality_traits || 'Historical character traits',
      core_characteristics: [
        'Historically grounded',
        'Period-appropriate worldview',
        'Cultural authenticity'
      ],
      background_summary: formData.backstory || `A character from ${formData.location || 'historical period'}`,
      
      // Physical appearance
      physical_appearance: {
        height_build: 'average height and build',
        hair: 'brown hair',
        eye_color: 'brown eyes',
        skin_tone: 'natural complexion',
        ethnicity: formData.ethnicity || 'not specified',
      },
    },
    
    emotional_triggers: {
      positive_triggers: [
        {
          keywords: ['honor', 'duty', 'family'],
          emotion_type: 'pride',
          intensity_multiplier: 1.2,
          description: 'Values traditional concepts of honor and duty'
        }
      ],
      negative_triggers: [
        {
          keywords: ['dishonor', 'betrayal', 'injustice'],
          emotion_type: 'anger',
          intensity_multiplier: 1.1,
          description: 'Strongly reacts to perceived injustice'
        }
      ]
    }
  };
}
