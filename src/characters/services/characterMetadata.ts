import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { 
  assignGenderByProbability, 
  assignEthnicityByProbability, 
  assignOccupationByProbability, 
  assignSocialClassByProbability, 
  assignMaritalStatusByProbability, 
  assignRelationshipAndFamilyDynamics 
} from './probabilityAssignments';
import { extractHistoricalPeriod, extractReligiousContext } from './historicalContext';

export function buildCharacterMetadata(formData: HistoricalCharacterFormData, aiGeneratedTraits: any) {
  const age = parseInt(formData.age) || 30;
  
  // CRITICAL: Prioritize form data and AI extraction over probability assignments
  console.log('🔧 Building character metadata with form data priority');
  console.log('📝 Form data gender:', formData.gender);
  console.log('🤖 AI extracted gender:', aiGeneratedTraits.gender);
  
  // Gender - prioritize form data, then AI extraction, then probability
  const gender = formData.gender || 
    aiGeneratedTraits.gender || 
    aiGeneratedTraits.demographics?.gender ||
    assignGenderByProbability();
  
  console.log('✅ Final gender assignment:', gender);
  
  // Other core demographics with proper priority
  const ethnicity = formData.ethnicity || 
    aiGeneratedTraits.ethnicity || 
    aiGeneratedTraits.race_ethnicity || 
    aiGeneratedTraits.cultural_background ||
    assignEthnicityByProbability();
  
  const occupation = formData.occupation || 
    aiGeneratedTraits.occupation || 
    assignOccupationByProbability();
  
  const socialClass = formData.social_class || 
    aiGeneratedTraits.social_class || 
    aiGeneratedTraits.social_class_identity ||
    assignSocialClassByProbability();
  
  const maritalStatus = aiGeneratedTraits.relationships_family?.marital_status ||
    aiGeneratedTraits.marital_status || 
    assignMaritalStatusByProbability(age);
  
  const relationshipDynamics = aiGeneratedTraits.relationships_family || 
    assignRelationshipAndFamilyDynamics(age, maritalStatus);
  
  const region = formData.region || 
    formData.location || 
    aiGeneratedTraits.region || 
    aiGeneratedTraits.location ||
    'Historical Region';

  // Extract historical period from date_of_birth and AI traits
  const historicalPeriod = extractHistoricalPeriod(formData.date_of_birth, aiGeneratedTraits);
  
  // Extract religious context appropriate for historical period
  const religiousContext = extractReligiousContext(aiGeneratedTraits, historicalPeriod);

  console.log('🏛️ Historical period determined:', historicalPeriod);
  console.log('⛪ Religious context:', religiousContext);

  return {
    // Core user inputs - ALWAYS prioritize these
    name: formData.name,
    date_of_birth: formData.date_of_birth,
    age: age,
    location: formData.location,
    description: formData.description,
    
    // Core Demographics - intelligently assigned with form data priority
    gender: gender,
    race_ethnicity: ethnicity,
    occupation: occupation,
    social_class_identity: socialClass,
    region: region,
    marital_status: maritalStatus,
    education_level: aiGeneratedTraits.education_level || 'traditional knowledge',
    
    // Historical Context - extracted from AI traits and date
    historical_period: historicalPeriod,
    cultural_context: aiGeneratedTraits.cultural_context || aiGeneratedTraits.historical_context || 'Rich historical and cultural context',
    
    // Location & Environment
    urban_rural_context: aiGeneratedTraits.urban_rural_context || 'rural',
    location_history: {
      grew_up_in: aiGeneratedTraits.birthplace || aiGeneratedTraits.location_history?.grew_up_in || formData.location,
      current_residence: formData.location,
      places_lived: [formData.location]
    },
    
    // Relationships & Family - from AI analysis or probability
    relationships_family: relationshipDynamics,
    
    // Health Profile
    physical_health_status: aiGeneratedTraits.physical_health_status || 'average',
    mental_health_status: aiGeneratedTraits.mental_health_status || 'stable',
    fitness_activity_level: aiGeneratedTraits.fitness_activity_level || 'moderate',
    
    // Physical Description - from AI analysis
    height: aiGeneratedTraits.physical_appearance?.height_build || aiGeneratedTraits.height || 'average height',
    build_body_type: aiGeneratedTraits.physical_appearance?.height_build || aiGeneratedTraits.build_body_type || 'average build',
    hair_color: aiGeneratedTraits.physical_appearance?.hair || aiGeneratedTraits.hair_color || 'appropriate for ethnicity',
    hair_style: aiGeneratedTraits.physical_appearance?.hair_style || aiGeneratedTraits.hair_style || 'period appropriate',
    eye_color: aiGeneratedTraits.physical_appearance?.eye_color || aiGeneratedTraits.eye_color || 'appropriate for ethnicity',
    skin_tone: aiGeneratedTraits.physical_appearance?.skin_tone || aiGeneratedTraits.skin_tone || 'appropriate for ethnicity',
    
    // Religious/Spiritual Context - historically appropriate
    religious_affiliation: religiousContext.affiliation,
    religious_practice_level: religiousContext.practice_level,
    cultural_background: aiGeneratedTraits.cultural_background || ethnicity,
    language_proficiency: aiGeneratedTraits.language_proficiency || ['Local language'],
    
    // Rich character details from AI analysis
    backstory: aiGeneratedTraits.backstory || formData.backstory || 'Rich backstory generated from character description',
    personality_traits: aiGeneratedTraits.personality_traits || formData.personality_traits || 'Detailed personality traits',
    appearance: aiGeneratedTraits.appearance || 'Detailed appearance description',
    historical_context: aiGeneratedTraits.historical_context || formData.historical_context || 'Rich historical context',
  };
}
