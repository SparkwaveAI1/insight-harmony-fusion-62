import { Persona } from "@/services/persona/types";

export type SpeedInsight = {
  value: string;
  speed: "fast" | "slow";
};

export const determineCommunicationStyle = (persona: Persona): SpeedInsight => {
  // Safe access with optional chaining and fallbacks for vocabulary_size
  const vocabulary = persona.linguistic_profile?.default_output_length || '';
  const isElaborate = vocabulary.includes('long') || vocabulary.includes('elaborate');

  if (isElaborate) {
    return { value: "Eloquent, Detailed", speed: "fast" };
  } else {
    return { value: "Concise, Direct", speed: "slow" };
  }
};

export const determineDecisionMakingStyle = (persona: Persona): SpeedInsight => {
  // Using big_five traits instead of direct property
  const conscientiousness = persona.trait_profile?.big_five?.conscientiousness || '';
  const isImpulsive = conscientiousness === 'low' || conscientiousness === 'very low';

  if (isImpulsive) {
    return { value: "Quick, Intuitive", speed: "fast" };
  } else {
    return { value: "Deliberate, Analytical", speed: "slow" };
  }
};

export const determineLearningStyle = (persona: Persona): SpeedInsight => {
  // Using big_five traits instead of direct property
  const openness = persona.trait_profile?.big_five?.openness || '';
  const isCurious = openness === 'high' || openness === 'very high';

  if (isCurious) {
    return { value: "Exploratory, Experimental", speed: "fast" };
  } else {
    return { value: "Structured, Methodical", speed: "slow" };
  }
};

export const determineWorkEthic = (persona: Persona): SpeedInsight => {
  // Using big_five traits instead of direct property
  const conscientiousness = persona.trait_profile?.big_five?.conscientiousness || '';
  const isDiligent = conscientiousness === 'high' || conscientiousness === 'very high';

  if (isDiligent) {
    return { value: "Diligent, Organized", speed: "slow" };
  } else {
    return { value: "Flexible, Adaptable", speed: "fast" };
  }
};

export const determineConflictResolutionStyle = (persona: Persona): SpeedInsight => {
  // Using big_five traits instead of direct property
  const agreeableness = persona.trait_profile?.big_five?.agreeableness || '';
  const isAccommodating = agreeableness === 'high' || agreeableness === 'very high';

  if (isAccommodating) {
    return { value: "Accommodating, Diplomatic", speed: "slow" };
  } else {
    return { value: "Assertive, Competitive", speed: "fast" };
  }
};

export const determineFeedbackPreference = (persona: Persona): SpeedInsight => {
  // Using big_five traits instead of direct property
  const openness = persona.trait_profile?.big_five?.openness || '';
  const isOpen = openness === 'high' || openness === 'very high';

  if (isOpen) {
    return { value: "Constructive, Insightful", speed: "fast" };
  } else {
    return { value: "Positive, Encouraging", speed: "slow" };
  }
};

export const determineTeamworkStyle = (persona: Persona): SpeedInsight => {
  // Using big_five traits instead of direct property
  const extraversion = persona.trait_profile?.big_five?.extraversion || '';
  const isCollaborative = extraversion === 'high' || extraversion === 'very high';

  if (isCollaborative) {
    return { value: "Collaborative, Enthusiastic", speed: "fast" };
  } else {
    return { value: "Independent, Focused", speed: "slow" };
  }
};

export const determineLeadershipStyle = (persona: Persona): SpeedInsight => {
  // Using extended_traits instead of direct property
  const authority = persona.trait_profile?.moral_foundations?.authority || '';
  const isDirective = authority === 'high' || authority === 'very high';

  if (isDirective) {
    return { value: "Directive, Visionary", speed: "fast" };
  } else {
    return { value: "Supportive, Facilitative", speed: "slow" };
  }
};

export const determineRiskTolerance = (persona: Persona): SpeedInsight => {
  // Using big_five traits instead of direct property
  const neuroticism = persona.trait_profile?.big_five?.neuroticism || '';
  const isAnxious = neuroticism === 'high' || neuroticism === 'very high';

  if (isAnxious) {
    return { value: "Cautious, Conservative", speed: "slow" };
  } else {
    return { value: "Bold, Adventurous", speed: "fast" };
  }
};

export const determineStressResponse = (persona: Persona): SpeedInsight => {
  // Using dynamic_state instead of direct property
  const stressLevel = persona.trait_profile?.dynamic_state?.current_stress_level || '';
  const isReactive = stressLevel === 'high' || stressLevel === 'very high';

  if (isReactive) {
    return { value: "Anxious, Reactive", speed: "fast" };
  } else {
    return { value: "Composed, Optimistic", speed: "slow" };
  }
};

export const determineTechnologyAdoption = (persona: Persona): SpeedInsight => {
  const techSavviness = persona.metadata?.tech_savviness || 0;

  if (techSavviness > 0.6) {
    return { value: "Early Adopter, Innovative", speed: "fast" };
  } else {
    return { value: "Traditional, Practical", speed: "slow" };
  }
};

export const determineSocialMediaUsage = (persona: Persona): SpeedInsight => {
  const socialEngagement = persona.metadata?.social_engagement || 0;

  if (socialEngagement > 0.6) {
    return { value: "Active, Influential", speed: "fast" };
  } else {
    return { value: "Passive, Observational", speed: "slow" };
  }
};

export const determineShoppingHabits = (persona: Persona): SpeedInsight => {
  // Using behavioral_economics instead of direct property
  const spendingHabit = persona.trait_profile?.behavioral_economics?.present_bias || '';
  const isImpulsive = spendingHabit === 'high' || spendingHabit === 'very high';

  if (isImpulsive) {
    return { value: "Impulsive, Luxurious", speed: "fast" };
  } else {
    return { value: "Budget-conscious, Practical", speed: "slow" };
  }
};

export const determineTravelPreferences = (persona: Persona): SpeedInsight => {
  const travelStyle = persona.metadata?.travel_style || 0;

  if (travelStyle > 0.6) {
    return { value: "Adventurous, Spontaneous", speed: "fast" };
  } else {
    return { value: "Planned, Relaxing", speed: "slow" };
  }
};

export const determineEntertainmentChoices = (persona: Persona): SpeedInsight => {
  const entertainmentStyle = persona.metadata?.entertainment_style || 0;

  if (entertainmentStyle > 0.6) {
    return { value: "Social, Lively", speed: "fast" };
  } else {
    return { value: "Quiet, Reflective", speed: "slow" };
  }
};

export const determineFoodPreferences = (persona: Persona): SpeedInsight => {
  const culinaryTaste = persona.metadata?.culinary_taste || 0;

  if (culinaryTaste > 0.6) {
    return { value: "Adventurous, Gourmet", speed: "fast" };
  } else {
    return { value: "Simple, Comforting", speed: "slow" };
  }
};

export const determinePetPreferences = (persona: Persona): SpeedInsight => {
  // Using agreeableness as proxy for pet affinity
  const agreeableness = persona.trait_profile?.big_five?.agreeableness || '';
  const isAffectionate = agreeableness === 'high' || agreeableness === 'very high';

  if (isAffectionate) {
    return { value: "Affectionate, Caring", speed: "slow" };
  } else {
    return { value: "Independent, Minimalist", speed: "fast" };
  }
};

export const determineVehiclePreference = (persona: Persona): SpeedInsight => {
  const vehicleChoice = persona.metadata?.vehicle_choice || 0;

  if (vehicleChoice > 0.6) {
    return { value: "Sporty, Stylish", speed: "fast" };
  } else {
    return { value: "Practical, Reliable", speed: "slow" };
  }
};

export const determineHomeDecorStyle = (persona: Persona): SpeedInsight => {
  const decorTaste = persona.metadata?.decor_taste || 0;

  if (decorTaste > 0.6) {
    return { value: "Modern, Trendy", speed: "fast" };
  } else {
    return { value: "Classic, Comfortable", speed: "slow" };
  }
};

export const determineReadingPreference = (persona: Persona): SpeedInsight => {
  const readingHabits = persona.metadata?.reading_habits || 0;

  if (readingHabits > 0.6) {
    return { value: "Diverse, Intellectual", speed: "fast" };
  } else {
    return { value: "Casual, Practical", speed: "slow" };
  }
};

export const determineExercisePreference = (persona: Persona): SpeedInsight => {
  const fitnessLevel = persona.metadata?.fitness_level || 0;

  if (fitnessLevel > 0.6) {
    return { value: "Intense, Competitive", speed: "fast" };
  } else {
    return { value: "Moderate, Relaxing", speed: "slow" };
  }
};

export const determinePoliticalAffiliation = (persona: Persona): SpeedInsight => {
  // Using political_compass instead of direct property
  const political = persona.trait_profile?.political_compass?.authoritarian_libertarian || '';
  const isVocal = political === 'very libertarian' || political === 'libertarian';

  if (isVocal) {
    return { value: "Activist, Vocal", speed: "fast" };
  } else {
    return { value: "Moderate, Reserved", speed: "slow" };
  }
};

export const determineReligiousAffiliation = (persona: Persona): SpeedInsight => {
  const religiousBeliefs = persona.metadata?.religious_beliefs || 0;

  if (religiousBeliefs > 0.6) {
    return { value: "Devout, Traditional", speed: "slow" };
  } else {
    return { value: "Secular, Open-minded", speed: "fast" };
  }
};

export const determineMoviePreference = (persona: Persona): SpeedInsight => {
  const movieTaste = persona.metadata?.movie_taste || 0;

  if (movieTaste > 0.6) {
    return { value: "Action, Thriller", speed: "fast" };
  } else {
    return { value: "Drama, Romance", speed: "slow" };
  }
};

export const determineMusicPreference = (persona: Persona): SpeedInsight => {
  // Get demographic info from metadata
  const demographics = persona.metadata?.demographics || {};
  const ageGroup = demographics.age_group || '';
  const isSenior = ageGroup.includes('65+') || ageGroup.includes('senior');

  if (isSenior) {
    return { value: "Classical, Jazz, Folk", speed: "slow" };
  }

  // Fallback to general classification
  const isModern = persona.trait_profile?.big_five?.openness === 'high';
  
  if (isModern) {
    return { value: "Pop, Electronic", speed: "fast" };
  } else {
    return { value: "Alternative, Indie", speed: "slow" };
  }
};

export const getPersonaInsights = (persona: Persona): SpeedInsight[] => {
  return [
    determineCommunicationStyle(persona),
    determineDecisionMakingStyle(persona),
    determineLearningStyle(persona),
    determineWorkEthic(persona),
    determineConflictResolutionStyle(persona),
    determineTeamworkStyle(persona),
    determineLeadershipStyle(persona)
  ];
};
