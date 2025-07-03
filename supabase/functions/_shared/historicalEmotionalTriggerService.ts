
export function detectHistoricalEmotionalTriggers(
  message: string,
  character: any,
  emotionalIntensity: number = 0.5,
  currentStressLevel: number = 0.5
): Array<{ emotion_type: string; intensity: number; description: string }> {
  console.log('Detecting emotional triggers for historical character:', character?.name);
  
  const triggeredEmotions: Array<{ emotion_type: string; intensity: number; description: string }> = [];
  
  // Historical character emotional triggers based on their era and background
  const historicalTriggers = generateHistoricalTriggers(character);
  
  // Check positive triggers
  if (historicalTriggers.positive_triggers && Array.isArray(historicalTriggers.positive_triggers)) {
    const positiveMatches = historicalTriggers.positive_triggers.filter((trigger: any) => {
      if (!trigger || !trigger.keywords || !Array.isArray(trigger.keywords)) {
        return false;
      }
      return trigger.keywords.some((keyword: string) => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
    });

    positiveMatches.forEach((trigger: any) => {
      const baseIntensity = trigger.intensity_multiplier || 1.0;
      const adjustedIntensity = Math.min(10, baseIntensity * emotionalIntensity * (1 + currentStressLevel));
      
      triggeredEmotions.push({
        emotion_type: trigger.emotion_type || 'positive',
        intensity: adjustedIntensity,
        description: trigger.description || 'Positive emotional response triggered'
      });
    });
  }

  // Check negative triggers
  if (historicalTriggers.negative_triggers && Array.isArray(historicalTriggers.negative_triggers)) {
    const negativeMatches = historicalTriggers.negative_triggers.filter((trigger: any) => {
      if (!trigger || !trigger.keywords || !Array.isArray(trigger.keywords)) {
        return false;
      }
      return trigger.keywords.some((keyword: string) => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
    });

    negativeMatches.forEach((trigger: any) => {
      const baseIntensity = trigger.intensity_multiplier || 1.0;
      const adjustedIntensity = Math.min(10, baseIntensity * emotionalIntensity * (1 + currentStressLevel));
      
      triggeredEmotions.push({
        emotion_type: trigger.emotion_type || 'negative',
        intensity: adjustedIntensity,
        description: trigger.description || 'Negative emotional response triggered'
      });
    });
  }

  console.log('Historical character triggered emotions:', triggeredEmotions);
  return triggeredEmotions;
}

function generateHistoricalTriggers(character: any) {
  const triggers = {
    positive_triggers: [] as any[],
    negative_triggers: [] as any[]
  };

  const historicalPeriod = character?.metadata?.historical_period || '1723';
  const occupation = character?.metadata?.occupation?.toLowerCase() || '';
  const region = character?.metadata?.region?.toLowerCase() || '';

  // Era-based triggers
  if (historicalPeriod.includes('17') || historicalPeriod.includes('18')) {
    // 17th-18th century triggers
    triggers.positive_triggers.push({
      keywords: ['honor', 'duty', 'virtue', 'noble', 'righteous', 'proper'],
      emotion_type: 'pride',
      intensity_multiplier: 6,
      description: 'Values honor and proper conduct highly'
    });
    
    triggers.negative_triggers.push({
      keywords: ['dishonor', 'scandal', 'improper', 'disgrace', 'shameful'],
      emotion_type: 'shame',
      intensity_multiplier: 7,
      description: 'Deeply affected by matters of honor and propriety'
    });
  }

  // Occupation-based triggers
  if (occupation.includes('merchant') || occupation.includes('trader')) {
    triggers.positive_triggers.push({
      keywords: ['profit', 'trade', 'commerce', 'business', 'coin', 'gold'],
      emotion_type: 'excitement',
      intensity_multiplier: 5,
      description: 'Excited by commercial opportunities'
    });
    
    triggers.negative_triggers.push({
      keywords: ['loss', 'debt', 'bankruptcy', 'poor harvest', 'blocked trade'],
      emotion_type: 'anxiety',
      intensity_multiplier: 6,
      description: 'Worried about commercial risks'
    });
  }

  if (occupation.includes('soldier') || occupation.includes('warrior')) {
    triggers.positive_triggers.push({
      keywords: ['victory', 'battle', 'courage', 'bravery', 'glory'],
      emotion_type: 'pride',
      intensity_multiplier: 7,
      description: 'Takes pride in martial prowess'
    });
    
    triggers.negative_triggers.push({
      keywords: ['cowardice', 'retreat', 'defeat', 'surrender'],
      emotion_type: 'anger',
      intensity_multiplier: 8,
      description: 'Angered by cowardice and defeat'
    });
  }

  if (occupation.includes('scholar') || occupation.includes('philosopher')) {
    triggers.positive_triggers.push({
      keywords: ['knowledge', 'wisdom', 'learning', 'discovery', 'truth'],
      emotion_type: 'curiosity',
      intensity_multiplier: 5,
      description: 'Passionate about knowledge and learning'
    });
    
    triggers.negative_triggers.push({
      keywords: ['ignorance', 'superstition', 'folly', 'false knowledge'],
      emotion_type: 'frustration',
      intensity_multiplier: 6,
      description: 'Frustrated by ignorance and superstition'
    });
  }

  // Religious/spiritual triggers (common in historical periods)
  triggers.positive_triggers.push({
    keywords: ['divine', 'blessed', 'prayer', 'faith', 'salvation'],
    emotion_type: 'reverence',
    intensity_multiplier: 5,
    description: 'Shows reverence for spiritual matters'
  });
  
  triggers.negative_triggers.push({
    keywords: ['blasphemy', 'heresy', 'sacrilege', 'godless'],
    emotion_type: 'moral_outrage',
    intensity_multiplier: 7,
    description: 'Outraged by irreligious behavior'
  });

  // Class/social triggers
  triggers.positive_triggers.push({
    keywords: ['respect', 'courtesy', 'manners', 'station', 'rank'],
    emotion_type: 'satisfaction',
    intensity_multiplier: 4,
    description: 'Appreciates proper social order'
  });
  
  triggers.negative_triggers.push({
    keywords: ['insolence', 'impertinence', 'uppity', 'above station'],
    emotion_type: 'indignation',
    intensity_multiplier: 6,
    description: 'Offended by social impropriety'
  });

  return triggers;
}

export function generateHistoricalEmotionalStateInstructions(triggeredEmotions: Array<{ emotion_type: string; intensity: number; description: string }>): string {
  if (triggeredEmotions.length === 0) {
    return '';
  }

  let instructions = `\n\n${'='.repeat(50)}\n🎭 HISTORICAL EMOTIONAL STATE ACTIVATED 🎭\n${'='.repeat(50)}\n\n`;
  
  instructions += `CRITICAL: You are currently experiencing heightened emotional responses based on your historical character and the conversation:\n\n`;
  
  triggeredEmotions.forEach((emotion, index) => {
    instructions += `${index + 1}. EMOTION: ${emotion.emotion_type.toUpperCase()}\n`;
    instructions += `   INTENSITY: ${emotion.intensity}/10\n`;
    instructions += `   TRIGGER: ${emotion.description}\n`;
    instructions += `   HISTORICAL IMPACT: Let this emotion influence your response authentically for someone from your era\n\n`;
  });
  
  instructions += `REMEMBER: These emotional triggers should make you respond MORE AUTHENTICALLY as a historical character.\n`;
  instructions += `React with the emotional intensity and cultural understanding of someone from your time period.\n`;
  instructions += `Your emotional responses should reflect the values, concerns, and sensitivities of your historical era.\n`;
  instructions += `${'='.repeat(50)}`;
  
  return instructions;
}
