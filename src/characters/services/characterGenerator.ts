
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { Character } from '../types/characterTraitTypes';
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

  // Generate basic trait profiles (these could be enhanced later)
  const trait_profile = {
    conscientiousness: 0.7,
    openness: 0.6,
    extraversion: 0.5,
    agreeableness: 0.6,
    neuroticism: 0.4,
  };

  const behavioral_modulation = {
    formality: 0.8,
    enthusiasm: 0.6,
    assertiveness: 0.7,
    empathy: 0.6,
    patience: 0.7,
  };

  const linguistic_profile = {
    vocabulary_complexity: 0.7,
    sentence_structure: 0.8,
    use_of_metaphors: 0.5,
    emotional_expressiveness: 0.6,
    technical_language: 0.4,
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
    emotional_triggers: {
      positive_triggers: [],
      negative_triggers: [],
    },
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
