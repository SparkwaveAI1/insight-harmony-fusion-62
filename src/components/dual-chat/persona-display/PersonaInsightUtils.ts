import { Persona } from "@/services/persona/types";

export type SpeedInsight = {
  value: string;
  speed: "fast" | "slow";
};

export const determineCommunicationStyle = (persona: Persona): SpeedInsight => {
  const numberOfWords = persona.linguistic_profile?.vocabulary_size || 0;

  if (numberOfWords > 5000) {
    return { value: "Eloquent, Detailed", speed: "fast" };
  } else {
    return { value: "Concise, Direct", speed: "slow" };
  }
};

export const determineDecisionMakingStyle = (persona: Persona): SpeedInsight => {
  const impulsivity = persona.trait_profile?.impulsivity || 0;

  if (impulsivity > 0.7) {
    return { value: "Quick, Intuitive", speed: "fast" };
  } else {
    return { value: "Deliberate, Analytical", speed: "slow" };
  }
};

export const determineLearningStyle = (persona: Persona): SpeedInsight => {
  const curiosity = persona.trait_profile?.curiosity || 0;

  if (curiosity > 0.6) {
    return { value: "Exploratory, Experimental", speed: "fast" };
  } else {
    return { value: "Structured, Methodical", speed: "slow" };
  }
};

export const determineWorkEthic = (persona: Persona): SpeedInsight => {
  const conscientiousness = persona.trait_profile?.conscientiousness || 0;

  if (conscientiousness > 0.7) {
    return { value: "Diligent, Organized", speed: "slow" };
  } else {
    return { value: "Flexible, Adaptable", speed: "fast" };
  }
};

export const determineConflictResolutionStyle = (persona: Persona): SpeedInsight => {
  const agreeableness = persona.trait_profile?.agreeableness || 0;

  if (agreeableness > 0.7) {
    return { value: "Accommodating, Diplomatic", speed: "slow" };
  } else {
    return { value: "Assertive, Competitive", speed: "fast" };
  }
};

export const determineFeedbackPreference = (persona: Persona): SpeedInsight => {
  const openness = persona.trait_profile?.openness || 0;

  if (openness > 0.6) {
    return { value: "Constructive, Insightful", speed: "fast" };
  } else {
    return { value: "Positive, Encouraging", speed: "slow" };
  }
};

export const determineTeamworkStyle = (persona: Persona): SpeedInsight => {
  const extraversion = persona.trait_profile?.extraversion || 0;

  if (extraversion > 0.6) {
    return { value: "Collaborative, Enthusiastic", speed: "fast" };
  } else {
    return { value: "Independent, Focused", speed: "slow" };
  }
};

export const determineLeadershipStyle = (persona: Persona): SpeedInsight => {
  const dominance = persona.trait_profile?.dominance || 0;

  if (dominance > 0.7) {
    return { value: "Directive, Visionary", speed: "fast" };
  } else {
    return { value: "Supportive, Facilitative", speed: "slow" };
  }
};

export const determineRiskTolerance = (persona: Persona): SpeedInsight => {
  const neuroticism = persona.trait_profile?.neuroticism || 0;

  if (neuroticism > 0.5) {
    return { value: "Cautious, Conservative", speed: "slow" };
  } else {
    return { value: "Bold, Adventurous", speed: "fast" };
  }
};

export const determineStressResponse = (persona: Persona): SpeedInsight => {
  const resilience = persona.trait_profile?.resilience || 0;

  if (resilience > 0.6) {
    return { value: "Composed, Optimistic", speed: "slow" };
  } else {
    return { value: "Anxious, Reactive", speed: "fast" };
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
  const spendingHabits = persona.metadata?.spending_habits || 0;

  if (spendingHabits > 0.6) {
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
  const petAffinity = persona.metadata?.pet_affinity || 0;

  if (petAffinity > 0.6) {
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
  const politicalViews = persona.metadata?.political_views || 0;

  if (politicalViews > 0.6) {
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
  const musicTaste = persona.metadata?.music_taste || 0;

  // Fix for the type error: Convert string to number before comparison
  const age = typeof persona.trait_profile?.age === 'string' 
    ? parseInt(persona.trait_profile.age, 10) 
    : persona.trait_profile?.age || 0;

  if (age > 65) {
    return { value: "Classical, Jazz, Folk", speed: "slow" };
  }

  if (musicTaste > 0.6) {
    return { value: "Pop, Electronic", speed: "fast" };
  } else {
    return { value: "Alternative, Indie", speed: "slow" };
  }
};
