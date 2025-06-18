
export function detectEmotionalTriggers(
  message: string,
  emotionalTriggers: any,
  emotionalIntensity: number = 0.5,
  currentStressLevel: number = 0.5,
  neuroticism: number = 0.5
): Array<{ emotion_type: string; intensity: number; description: string }> {
  console.log('Detecting emotional triggers for message:', message);
  console.log('Emotional triggers data:', emotionalTriggers);
  
  // Safety check: ensure emotional triggers exist and have the expected structure
  if (!emotionalTriggers || typeof emotionalTriggers !== 'object') {
    console.log('No emotional triggers data available');
    return [];
  }

  const triggeredEmotions: Array<{ emotion_type: string; intensity: number; description: string }> = [];
  
  // Check positive triggers
  if (emotionalTriggers.positive_triggers && Array.isArray(emotionalTriggers.positive_triggers)) {
    const positiveMatches = emotionalTriggers.positive_triggers.filter((trigger: any) => {
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
  if (emotionalTriggers.negative_triggers && Array.isArray(emotionalTriggers.negative_triggers)) {
    const negativeMatches = emotionalTriggers.negative_triggers.filter((trigger: any) => {
      if (!trigger || !trigger.keywords || !Array.isArray(trigger.keywords)) {
        return false;
      }
      return trigger.keywords.some((keyword: string) => 
        message.toLowerCase().includes(keyword.toLowerCase())
      );
    });

    negativeMatches.forEach((trigger: any) => {
      const baseIntensity = trigger.intensity_multiplier || 1.0;
      const adjustedIntensity = Math.min(10, baseIntensity * emotionalIntensity * (1 + currentStressLevel + neuroticism));
      
      triggeredEmotions.push({
        emotion_type: trigger.emotion_type || 'negative',
        intensity: adjustedIntensity,
        description: trigger.description || 'Negative emotional response triggered'
      });
    });
  }

  console.log('Triggered emotions:', triggeredEmotions);
  return triggeredEmotions;
}

export function generateEmotionalStateInstructions(triggeredEmotions: Array<{ emotion_type: string; intensity: number; description: string }>): string {
  if (triggeredEmotions.length === 0) {
    return '';
  }

  let instructions = `\n\n${'='.repeat(50)}\n🎭 EMOTIONAL STATE ACTIVATED 🎭\n${'='.repeat(50)}\n\n`;
  
  instructions += `CRITICAL: You are currently experiencing heightened emotional responses due to triggers in the conversation:\n\n`;
  
  triggeredEmotions.forEach((emotion, index) => {
    instructions += `${index + 1}. EMOTION: ${emotion.emotion_type.toUpperCase()}\n`;
    instructions += `   INTENSITY: ${emotion.intensity}/10\n`;
    instructions += `   TRIGGER: ${emotion.description}\n`;
    instructions += `   BEHAVIORAL IMPACT: Let this emotion significantly influence your response tone, word choice, and reactions\n\n`;
  });
  
  instructions += `REMEMBER: These emotional triggers should make you respond MORE AUTHENTICALLY and with GENUINE EMOTIONAL REACTIONS.\n`;
  instructions += `Don't suppress these feelings - let them come through in your language and attitude.\n`;
  instructions += `${'='.repeat(50)}`;
  
  return instructions;
}
