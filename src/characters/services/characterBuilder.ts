import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { Character, CharacterBehavioralModulation } from '../types/characterTraitTypes';
import { EmotionalTriggersProfile } from '../../services/persona/types/trait-profile';
import { v4 as uuidv4 } from 'uuid';

// Probability-based trait assignment functions
function assignGenderByProbability(): string {
  const rand = Math.random();
  if (rand < 0.51) return 'female';
  return 'male';
}

function assignEthnicityByProbability(): string {
  const ethnicities = [
    { value: 'European', probability: 0.6 },
    { value: 'Mediterranean', probability: 0.15 },
    { value: 'Middle Eastern', probability: 0.1 },
    { value: 'North African', probability: 0.08 },
    { value: 'Mixed heritage', probability: 0.07 }
  ];
  
  const rand = Math.random();
  let cumulative = 0;
  for (const ethnicity of ethnicities) {
    cumulative += ethnicity.probability;
    if (rand < cumulative) return ethnicity.value;
  }
  return 'European';
}

function assignOccupationByProbability(): string {
  const occupations = [
    { value: 'Farmer', probability: 0.7 },
    { value: 'Merchant', probability: 0.08 },
    { value: 'Artisan', probability: 0.06 },
    { value: 'Servant', probability: 0.05 },
    { value: 'Clergy', probability: 0.03 },
    { value: 'Soldier', probability: 0.03 },
    { value: 'Blacksmith', probability: 0.02 },
    { value: 'Miller', probability: 0.015 },
    { value: 'Innkeeper', probability: 0.01 },
    { value: 'Nobleman', probability: 0.005 }
  ];
  
  const rand = Math.random();
  let cumulative = 0;
  for (const occupation of occupations) {
    cumulative += occupation.probability;
    if (rand < cumulative) return occupation.value;
  }
  return 'Farmer';
}

function assignSocialClassByProbability(): string {
  const classes = [
    { value: 'lower class', probability: 0.75 },
    { value: 'middle class', probability: 0.2 },
    { value: 'upper class', probability: 0.05 }
  ];
  
  const rand = Math.random();
  let cumulative = 0;
  for (const cls of classes) {
    cumulative += cls.probability;
    if (rand < cumulative) return cls.value;
  }
  return 'lower class';
}

function assignMaritalStatusByProbability(age: number): string {
  if (age < 18) return 'single';
  
  const statuses = [
    { value: 'married', probability: 0.65 },
    { value: 'single', probability: 0.2 },
    { value: 'widowed', probability: 0.1 },
    { value: 'separated', probability: 0.05 }
  ];
  
  const rand = Math.random();
  let cumulative = 0;
  for (const status of statuses) {
    cumulative += status.probability;
    if (rand < cumulative) return status.value;
  }
  return 'married';
}

function assignRelationshipAndFamilyDynamics(age: number, maritalStatus: string) {
  const hasChildren = maritalStatus === 'married' ? Math.random() < 0.7 : Math.random() < 0.2;
  const numberOfChildren = hasChildren ? Math.floor(Math.random() * 5) + 1 : 0;
  const childrenAges = [];
  
  if (hasChildren) {
    for (let i = 0; i < numberOfChildren; i++) {
      const childAge = Math.floor(Math.random() * (age - 18)) + 1;
      childrenAges.push(childAge);
    }
    childrenAges.sort((a, b) => b - a); // Sort descending
  }

  const livingSituations = [
    'nuclear family household',
    'extended family household', 
    'multi-generational household',
    'single household',
    'communal living'
  ];
  
  const householdCompositions = [
    'spouse and children',
    'extended family members',
    'parents and siblings',
    'multiple families',
    'single occupant'
  ];

  return {
    has_children: hasChildren,
    number_of_children: numberOfChildren,
    children_ages: childrenAges,
    living_situation: livingSituations[Math.floor(Math.random() * livingSituations.length)],
    household_composition: [householdCompositions[Math.floor(Math.random() * householdCompositions.length)]],
    family_relationship_quality: ['excellent', 'good', 'average', 'strained', 'poor'][Math.floor(Math.random() * 5)],
    support_system_strength: ['very strong', 'strong', 'moderate', 'weak', 'very weak'][Math.floor(Math.random() * 5)],
    extended_family_involvement: ['very high', 'high', 'moderate', 'low', 'minimal'][Math.floor(Math.random() * 5)]
  };
}

export function buildCharacterMetadata(formData: HistoricalCharacterFormData, aiGeneratedTraits: any) {
  const age = parseInt(formData.age) || 30;
  
  // Use AI-generated traits first, then user-specified traits, then probability-based assignment
  // This ensures consistency with the user's prompt and specified traits
  const gender = aiGeneratedTraits.gender || formData.gender || assignGenderByProbability();
  const ethnicity = aiGeneratedTraits.ethnicity || aiGeneratedTraits.race_ethnicity || formData.ethnicity || assignEthnicityByProbability();
  const occupation = aiGeneratedTraits.occupation || formData.occupation || assignOccupationByProbability();
  const socialClass = aiGeneratedTraits.social_class || aiGeneratedTraits.social_class_identity || formData.social_class || assignSocialClassByProbability();
  const maritalStatus = aiGeneratedTraits.marital_status || assignMaritalStatusByProbability(age);
  const relationshipDynamics = aiGeneratedTraits.relationships_family || assignRelationshipAndFamilyDynamics(age, maritalStatus);
  const region = aiGeneratedTraits.region || formData.region || formData.location || 'Rural England';

  return {
    // Core user inputs
    name: formData.name,
    date_of_birth: formData.date_of_birth,
    age: age,
    location: formData.location,
    description: formData.description,
    
    // Core Demographics - intelligently assigned
    gender: gender,
    race_ethnicity: ethnicity,
    occupation: occupation,
    social_class_identity: socialClass,
    region: region,
    marital_status: maritalStatus,
    education_level: aiGeneratedTraits.education_level || 'basic education',
    
    // Location & Environment
    urban_rural_context: aiGeneratedTraits.urban_rural_context || 'rural',
    location_history: {
      grew_up_in: aiGeneratedTraits.birthplace || aiGeneratedTraits.location_history?.grew_up_in || formData.location,
      current_residence: formData.location,
      places_lived: [formData.location]
    },
    
    // Relationships & Family - fully assigned based on AI or probability
    relationships_family: relationshipDynamics,
    
    // Health Profile
    physical_health_status: aiGeneratedTraits.physical_health_status || 'average',
    mental_health_status: aiGeneratedTraits.mental_health_status || 'stable',
    fitness_activity_level: aiGeneratedTraits.fitness_activity_level || 'moderate',
    
    // Physical Description
    height: aiGeneratedTraits.physical_appearance?.height_build || aiGeneratedTraits.height || 'average height',
    build_body_type: aiGeneratedTraits.physical_appearance?.height_build || aiGeneratedTraits.build_body_type || 'average build',
    hair_color: aiGeneratedTraits.physical_appearance?.hair || aiGeneratedTraits.hair_color || 'brown',
    hair_style: aiGeneratedTraits.physical_appearance?.hair_style || aiGeneratedTraits.hair_style || 'period appropriate',
    eye_color: aiGeneratedTraits.physical_appearance?.eye_color || aiGeneratedTraits.eye_color || 'brown',
    skin_tone: aiGeneratedTraits.physical_appearance?.skin_tone || aiGeneratedTraits.skin_tone || 'natural complexion',
    
    // Cultural & Background
    religious_affiliation: aiGeneratedTraits.religious_affiliation || 'Christian',
    religious_practice_level: aiGeneratedTraits.religious_practice_level || 'moderate',
    cultural_background: aiGeneratedTraits.cultural_background || ethnicity,
    language_proficiency: aiGeneratedTraits.language_proficiency || ['Local language'],
    
    // Historical context
    historical_period: formData.date_of_birth ? '1700s' : 'Historical',
    
    // Legacy fields for backward compatibility
    backstory: aiGeneratedTraits.backstory || formData.backstory || 'Generated from character description',
    personality_traits: aiGeneratedTraits.personality_traits || formData.personality_traits || 'Generated personality traits',
    appearance: aiGeneratedTraits.appearance || 'Generated appearance description',
    historical_context: aiGeneratedTraits.historical_context || formData.historical_context || 'Generated historical context',
  };
}

export function buildTraitProfile(aiGeneratedTraits: any) {
  return {
    ...aiGeneratedTraits,
    physical_appearance: {
      height_build: aiGeneratedTraits.physical_appearance?.height_build || 'average height and build',
      hair: aiGeneratedTraits.physical_appearance?.hair || 'brown hair',
      eye_color: aiGeneratedTraits.physical_appearance?.eye_color || 'brown eyes',
      skin_tone: aiGeneratedTraits.physical_appearance?.skin_tone || 'natural complexion',
      ethnicity: aiGeneratedTraits.physical_appearance?.ethnicity || 'not specified',
    },
  };
}

export function buildBehavioralModulation(): CharacterBehavioralModulation {
  return {
    formality: 0.8,
    enthusiasm: 0.6,
    assertiveness: 0.7,
    empathy: 0.6,
    patience: 0.7,
  };
}

export function buildLinguisticProfile(aiGeneratedTraits: any, formData: HistoricalCharacterFormData) {
  return {
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
}

export function buildEmotionalTriggers(): EmotionalTriggersProfile {
  return {
    positive_triggers: [],
    negative_triggers: [],
  };
}

export function buildPhysicalAppearance(aiGeneratedTraits: any) {
  return {
    height_build: aiGeneratedTraits.physical_appearance?.height_build || 'average height and build',
    hair: aiGeneratedTraits.physical_appearance?.hair || 'brown hair',
    eye_color: aiGeneratedTraits.physical_appearance?.eye_color || 'brown eyes',
    skin_tone: aiGeneratedTraits.physical_appearance?.skin_tone || 'natural complexion',
    ethnicity: aiGeneratedTraits.physical_appearance?.ethnicity || 'not specified',
  };
}

export function buildCharacter(
  formData: HistoricalCharacterFormData,
  aiGeneratedTraits: any,
  characterId: string,
  currentDate: string
): Character {
  const metadata = buildCharacterMetadata(formData, aiGeneratedTraits);
  const trait_profile = buildTraitProfile(aiGeneratedTraits);
  const behavioral_modulation = buildBehavioralModulation();
  const linguistic_profile = buildLinguisticProfile(aiGeneratedTraits, formData);
  const emotional_triggers = buildEmotionalTriggers();
  const physical_appearance = buildPhysicalAppearance(aiGeneratedTraits);

  return {
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
    age: parseInt(formData.age) || 30,
    gender: metadata.gender,
    social_class: metadata.social_class_identity,
    region: metadata.region,
    physical_appearance,
  };
}
