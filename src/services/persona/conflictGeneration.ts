/**
 * Conflict Generation Service
 * Creates personality-driven disagreements and diverse viewpoints
 */

export interface ConflictTrigger {
  topic: string;
  disagreementPattern: string;
  triggerCondition: (traitProfile: any) => boolean;
  responseModifier: string;
}

/**
 * Predefined conflict triggers based on personality traits
 */
export const CONFLICT_TRIGGERS: ConflictTrigger[] = [
  // Economic/Financial Topics
  {
    topic: 'tokenomics',
    disagreementPattern: 'ECONOMIC_CONSERVATIVE_SKEPTICISM',
    triggerCondition: (traits) => 
      parseFloat(traits.political_compass?.economic || 0.5) > 0.6,
    responseModifier: 'Express skepticism about government regulation and favor free market solutions'
  },
  {
    topic: 'tokenomics',
    disagreementPattern: 'ECONOMIC_LIBERAL_CONCERN',
    triggerCondition: (traits) => 
      parseFloat(traits.political_compass?.economic || 0.5) < 0.4,
    responseModifier: 'Express concern about speculation, inequality, and lack of regulation'
  },
  
  // Authority/Hierarchy Topics
  {
    topic: 'decentralization',
    disagreementPattern: 'HIGH_AUTHORITY_SKEPTICISM',
    triggerCondition: (traits) => 
      parseFloat(traits.moral_foundations?.authority || 0.5) > 0.7,
    responseModifier: 'Favor hierarchical structures and express concern about lack of oversight'
  },
  {
    topic: 'decentralization',
    disagreementPattern: 'LOW_AUTHORITY_ENTHUSIASM',
    triggerCondition: (traits) => 
      parseFloat(traits.moral_foundations?.authority || 0.5) < 0.3,
    responseModifier: 'Enthusiastic about removing hierarchical control and traditional institutions'
  },
  
  // Technology/Innovation Topics
  {
    topic: 'innovation',
    disagreementPattern: 'LOW_OPENNESS_RESISTANCE',
    triggerCondition: (traits) => 
      parseFloat(traits.big_five?.openness || 0.5) < 0.4,
    responseModifier: 'Skeptical of new technology, prefer proven traditional methods'
  },
  {
    topic: 'innovation',
    disagreementPattern: 'HIGH_OPENNESS_EXCITEMENT',
    triggerCondition: (traits) => 
      parseFloat(traits.big_five?.openness || 0.5) > 0.7,
    responseModifier: 'Extremely enthusiastic about cutting-edge innovation and possibilities'
  },
  
  // Risk/Investment Topics
  {
    topic: 'investment',
    disagreementPattern: 'HIGH_NEUROTICISM_ANXIETY',
    triggerCondition: (traits) => 
      parseFloat(traits.big_five?.neuroticism || 0.5) > 0.6,
    responseModifier: 'Express anxiety and worry about potential risks and failures'
  },
  {
    topic: 'investment',
    disagreementPattern: 'LOW_AGREEABLENESS_SKEPTICISM',
    triggerCondition: (traits) => 
      parseFloat(traits.big_five?.agreeableness || 0.5) < 0.4,
    responseModifier: 'Challenge claims, express doubt about promises, be confrontational'
  },
  
  // Fairness/Inequality Topics
  {
    topic: 'wealth_distribution',
    disagreementPattern: 'HIGH_FAIRNESS_OUTRAGE',
    triggerCondition: (traits) => 
      parseFloat(traits.moral_foundations?.fairness || 0.5) > 0.7,
    responseModifier: 'Express strong anger about inequality and unfair advantages'
  },
  {
    topic: 'wealth_distribution',
    disagreementPattern: 'LOW_FAIRNESS_ACCEPTANCE',
    triggerCondition: (traits) => 
      parseFloat(traits.moral_foundations?.fairness || 0.5) < 0.3,
    responseModifier: 'Accept unequal outcomes as natural and merit-based'
  }
];

/**
 * Generate conflict instructions for a persona
 */
export function generateConflictInstructions(persona: any): string {
  const traitProfile = persona.trait_profile || {};
  const applicableConflicts = CONFLICT_TRIGGERS.filter(trigger => 
    trigger.triggerCondition(traitProfile)
  );

  if (applicableConflicts.length === 0) {
    return '';
  }

  let instructions = '\nPERSONALITY-DRIVEN CONFLICT PATTERNS:\n';
  
  applicableConflicts.forEach(conflict => {
    instructions += `- When discussing ${conflict.topic}: ${conflict.responseModifier}\n`;
  });

  return instructions;
}

/**
 * Check if a topic should trigger disagreement based on personality
 */
export function shouldTriggerDisagreement(
  persona: any, 
  topic: string, 
  position: 'positive' | 'negative'
): boolean {
  const traitProfile = persona.trait_profile || {};
  
  // Topic-specific disagreement triggers
  const topicTriggers = {
    'cryptocurrency': () => {
      const economic = parseFloat(traitProfile.political_compass?.economic || 0.5);
      const authority = parseFloat(traitProfile.moral_foundations?.authority || 0.5);
      
      if (position === 'positive' && economic < 0.4) return true; // Liberal skepticism
      if (position === 'positive' && authority > 0.7) return true; // Authority concern
      return false;
    },
    
    'regulation': () => {
      const liberty = parseFloat(traitProfile.moral_foundations?.liberty || 0.5);
      const authority = parseFloat(traitProfile.moral_foundations?.authority || 0.5);
      
      if (position === 'positive' && liberty > 0.7) return true; // High liberty hates regulation
      if (position === 'negative' && authority > 0.7) return true; // High authority supports regulation
      return false;
    },
    
    'innovation': () => {
      const openness = parseFloat(traitProfile.big_five?.openness || 0.5);
      
      if (position === 'positive' && openness < 0.3) return true; // Low openness resists innovation
      if (position === 'negative' && openness > 0.7) return true; // High openness loves innovation
      return false;
    }
  };

  const triggerFunction = topicTriggers[topic as keyof typeof topicTriggers];
  return triggerFunction ? triggerFunction() : false;
}

/**
 * Generate opinion modifiers based on personality traits
 */
export function generateOpinionModifiers(persona: any): string[] {
  const modifiers: string[] = [];
  const traitProfile = persona.trait_profile || {};
  
  // Big Five modifiers
  const agreeableness = parseFloat(traitProfile.big_five?.agreeableness || 0.5);
  const neuroticism = parseFloat(traitProfile.big_five?.neuroticism || 0.5);
  const openness = parseFloat(traitProfile.big_five?.openness || 0.5);
  
  if (agreeableness < 0.3) {
    modifiers.push('Express disagreement bluntly and confrontationally');
  }
  
  if (neuroticism > 0.7) {
    modifiers.push('Show emotional stress and anxiety in responses');
  }
  
  if (openness < 0.3) {
    modifiers.push('Resist new ideas and favor traditional approaches');
  }
  
  // Moral foundation modifiers
  const fairness = parseFloat(traitProfile.moral_foundations?.fairness || 0.5);
  const authority = parseFloat(traitProfile.moral_foundations?.authority || 0.5);
  
  if (fairness > 0.7) {
    modifiers.push('React strongly to any perceived unfairness or inequality');
  }
  
  if (authority < 0.3) {
    modifiers.push('Challenge hierarchies and question authority figures');
  }
  
  return modifiers;
}