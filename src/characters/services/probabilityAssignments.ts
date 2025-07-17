
// Probability-based trait assignment functions - same as persona system
export function assignGenderByProbability(): string {
  const rand = Math.random();
  if (rand < 0.51) return 'female';
  return 'male';
}

export function assignEthnicityByProbability(): string {
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

export function assignOccupationByProbability(): string {
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

export function assignSocialClassByProbability(): string {
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

export function assignMaritalStatusByProbability(age: number): string {
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

export function assignRelationshipAndFamilyDynamics(age: number, maritalStatus: string) {
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
