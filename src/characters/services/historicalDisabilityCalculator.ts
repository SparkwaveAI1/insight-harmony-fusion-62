
// Historical disability and health status calculator based on historical data
export interface HistoricalHealthContext {
  historicalPeriod: string;
  region: string;
  age: number;
  gender: string;
  socialClass: string;
  occupation: string;
}

export function calculateHistoricalHealthTraits(context: HistoricalHealthContext) {
  const { historicalPeriod, region, age, gender, socialClass, occupation } = context;
  
  // Base health modifiers for historical periods
  let baseHealthModifier = 1.0;
  let infantMortalityRate = 0.15; // 15% baseline
  let lifeExpectancyModifier = 1.0;
  
  // Historical period adjustments
  if (historicalPeriod.includes('1700') || historicalPeriod.includes('18th')) {
    baseHealthModifier = 0.7; // Health was generally poor
    infantMortalityRate = 0.25; // 25% infant mortality
    lifeExpectancyModifier = 0.6; // Much lower life expectancy
  } else if (historicalPeriod.includes('1600') || historicalPeriod.includes('17th')) {
    baseHealthModifier = 0.6;
    infantMortalityRate = 0.30;
    lifeExpectancyModifier = 0.55;
  } else if (historicalPeriod.includes('1800') || historicalPeriod.includes('19th')) {
    baseHealthModifier = 0.75;
    infantMortalityRate = 0.20;
    lifeExpectancyModifier = 0.7;
  }
  
  // Regional and frontier adjustments
  const isFrontier = region.toLowerCase().includes('frontier') || 
                    region.toLowerCase().includes('virginia') ||
                    region.toLowerCase().includes('colony');
  
  if (isFrontier) {
    baseHealthModifier *= 0.85; // Frontier life was harsh
    lifeExpectancyModifier *= 0.9;
  }
  
  // Age-based health deterioration (historical context)
  let ageHealthModifier = 1.0;
  if (age > 50) ageHealthModifier = 0.7;
  else if (age > 40) ageHealthModifier = 0.8;
  else if (age > 30) ageHealthModifier = 0.9;
  
  // Social class health advantages/disadvantages
  let socialHealthModifier = 1.0;
  if (socialClass.toLowerCase().includes('upper') || socialClass.toLowerCase().includes('noble')) {
    socialHealthModifier = 1.2;
  } else if (socialClass.toLowerCase().includes('lower') || socialClass.toLowerCase().includes('poor')) {
    socialHealthModifier = 0.8;
  }
  
  // Occupation-based health risks
  let occupationHealthModifier = 1.0;
  const occupationLower = occupation.toLowerCase();
  if (occupationLower.includes('miner') || occupationLower.includes('blacksmith')) {
    occupationHealthModifier = 0.7; // Dangerous occupations
  } else if (occupationLower.includes('farmer') || occupationLower.includes('laborer')) {
    occupationHealthModifier = 0.85; // Hard physical labor
  } else if (occupationLower.includes('merchant') || occupationLower.includes('clerk')) {
    occupationHealthModifier = 1.1; // Safer occupations
  }
  
  // Calculate final health traits
  const overallHealthModifier = baseHealthModifier * ageHealthModifier * socialHealthModifier * occupationHealthModifier;
  
  // Common historical health issues probabilities
  const smallpoxScarring = Math.random() < 0.3; // 30% chance of smallpox scarring
  const dentalProblems = Math.random() < 0.7; // 70% chance of significant dental issues
  const visionProblems = age > 40 ? Math.random() < 0.4 : Math.random() < 0.1;
  const hearingProblems = age > 50 ? Math.random() < 0.3 : Math.random() < 0.05;
  const workRelatedInjuries = occupationLower.includes('laborer') || occupationLower.includes('farmer') ? Math.random() < 0.4 : Math.random() < 0.1;
  
  return {
    overall_health_status: Math.max(0.1, Math.min(1.0, 0.4 + (overallHealthModifier * 0.4) + (Math.random() * 0.2))),
    mobility_level: workRelatedInjuries ? Math.max(0.3, Math.random() * 0.7 + 0.3) : Math.max(0.7, Math.random() * 0.3 + 0.7),
    sensory_vision: visionProblems ? Math.max(0.2, Math.random() * 0.6 + 0.2) : Math.max(0.7, Math.random() * 0.3 + 0.7),
    sensory_hearing: hearingProblems ? Math.max(0.3, Math.random() * 0.5 + 0.3) : Math.max(0.8, Math.random() * 0.2 + 0.8),
    cognitive_function: Math.max(0.5, Math.min(1.0, 0.7 + (overallHealthModifier * 0.2) + (Math.random() * 0.1))),
    chronic_pain_level: workRelatedInjuries ? Math.random() * 0.4 + 0.3 : Math.random() * 0.3,
    infectious_disease_resistance: Math.max(0.2, Math.min(0.8, overallHealthModifier * 0.6 + (Math.random() * 0.2))),
    nutritional_status: Math.max(0.3, Math.min(0.9, socialHealthModifier * 0.6 + (Math.random() * 0.3))),
    dental_health: dentalProblems ? Math.max(0.1, Math.random() * 0.4) : Math.max(0.4, Math.random() * 0.4 + 0.4),
    respiratory_health: Math.max(0.4, Math.min(1.0, overallHealthModifier * 0.7 + (Math.random() * 0.2))),
    cardiovascular_health: Math.max(0.4, Math.min(1.0, overallHealthModifier * 0.7 + (Math.random() * 0.2))),
    musculoskeletal_integrity: workRelatedInjuries ? Math.max(0.3, Math.random() * 0.5 + 0.3) : Math.max(0.6, Math.random() * 0.4 + 0.6),
    skin_condition: smallpoxScarring ? Math.max(0.2, Math.random() * 0.5) : Math.max(0.5, Math.random() * 0.4 + 0.5),
    mental_health_status: Math.max(0.3, Math.min(1.0, overallHealthModifier * 0.6 + (Math.random() * 0.3))),
    life_expectancy_relative: Math.max(0.2, Math.min(0.9, lifeExpectancyModifier * 0.7 + (Math.random() * 0.2)))
  };
}

export function calculatePhysicalAppearanceTraits(context: HistoricalHealthContext, healthTraits: any) {
  const { age, gender, socialClass, occupation } = context;
  
  // Social class affects grooming and clothing quality
  let socialModifier = 1.0;
  if (socialClass.toLowerCase().includes('upper') || socialClass.toLowerCase().includes('noble')) {
    socialModifier = 1.3;
  } else if (socialClass.toLowerCase().includes('lower') || socialClass.toLowerCase().includes('poor')) {
    socialModifier = 0.6;
  }
  
  // Age affects various appearance factors
  const ageModifier = age > 50 ? 0.8 : age > 30 ? 0.9 : 1.0;
  
  // Occupation affects physical build and wear
  const occupationLower = occupation.toLowerCase();
  let physicalLaborModifier = 1.0;
  if (occupationLower.includes('laborer') || occupationLower.includes('farmer') || occupationLower.includes('blacksmith')) {
    physicalLaborModifier = 1.2; // More muscular from physical work
  }
  
  return {
    height_relative_to_average: (Math.random() - 0.5) * 3, // -1.5 to +1.5, centered on 0
    build_muscularity: Math.max(0.1, Math.min(1.0, (healthTraits.overall_health_status * 0.5) + (physicalLaborModifier * 0.3) + (Math.random() * 0.2))),
    build_weight: Math.max(-1.5, Math.min(1.5, (healthTraits.nutritional_status - 0.5) + ((Math.random() - 0.5) * 0.8))),
    facial_symmetry: Math.max(0.3, Math.min(1.0, 0.7 + (Math.random() * 0.3))),
    skin_quality: Math.max(0.1, healthTraits.skin_condition * ageModifier),
    grooming_attention: Math.max(0.1, Math.min(1.0, socialModifier * 0.6 + (Math.random() * 0.3))),
    clothing_quality: Math.max(0.1, Math.min(1.0, socialModifier * 0.7 + (Math.random() * 0.2))),
    clothing_cleanliness: Math.max(0.2, Math.min(1.0, socialModifier * 0.6 + (Math.random() * 0.3))),
    clothing_appropriateness: Math.max(0.4, Math.min(1.0, 0.7 + (socialModifier * 0.2) + (Math.random() * 0.1))),
    posture_bearing: Math.max(0.2, Math.min(1.0, healthTraits.musculoskeletal_integrity * 0.7 + (socialModifier * 0.2) + (Math.random() * 0.1))),
    distinctive_features_count: Math.floor(Math.random() * 4), // 0-3 distinctive features
    overall_attractiveness: Math.max(0.2, Math.min(0.9, 0.5 + (healthTraits.overall_health_status * 0.3) + ((Math.random() - 0.5) * 0.4)))
  };
}
