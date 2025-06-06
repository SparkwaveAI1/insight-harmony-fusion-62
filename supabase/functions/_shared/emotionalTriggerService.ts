
export interface TriggeredEmotion {
  emotion_type: string;
  intensity: number;
  description: string;
  keywords_matched: string[];
}

export function detectEmotionalTriggers(
  userMessage: string,
  emotionalTriggers: any,
  emotionalIntensity: number = 0.5,
  currentStressLevel: number = 0.5,
  neuroticism: number = 0.5
): TriggeredEmotion[] {
  const triggeredEmotions: TriggeredEmotion[] = [];
  const messageWords = userMessage.toLowerCase().split(/\s+/);
  
  // Check positive triggers
  if (emotionalTriggers.positive_triggers) {
    for (const trigger of emotionalTriggers.positive_triggers) {
      const matchedKeywords = trigger.keywords.filter((keyword: string) => 
        messageWords.some(word => word.includes(keyword.toLowerCase()))
      );
      
      if (matchedKeywords.length > 0) {
        // Calculate intensity based on personality traits
        const baseIntensity = trigger.intensity_multiplier || 5;
        const adjustedIntensity = Math.min(10, baseIntensity * (emotionalIntensity + 0.5));
        
        triggeredEmotions.push({
          emotion_type: trigger.emotion_type,
          intensity: adjustedIntensity,
          description: trigger.description,
          keywords_matched: matchedKeywords
        });
      }
    }
  }
  
  // Check negative triggers
  if (emotionalTriggers.negative_triggers) {
    for (const trigger of emotionalTriggers.negative_triggers) {
      const matchedKeywords = trigger.keywords.filter((keyword: string) => 
        messageWords.some(word => word.includes(keyword.toLowerCase()))
      );
      
      if (matchedKeywords.length > 0) {
        // Calculate intensity with stress and neuroticism amplification
        const baseIntensity = trigger.intensity_multiplier || 5;
        const stressMultiplier = 1 + (currentStressLevel * 0.5);
        const neuroticismMultiplier = 1 + (neuroticism * 0.3);
        const adjustedIntensity = Math.min(10, baseIntensity * stressMultiplier * neuroticismMultiplier);
        
        triggeredEmotions.push({
          emotion_type: trigger.emotion_type,
          intensity: adjustedIntensity,
          description: trigger.description,
          keywords_matched: matchedKeywords
        });
      }
    }
  }
  
  return triggeredEmotions;
}

export function generateEmotionalStateInstructions(triggeredEmotions: TriggeredEmotion[]): string {
  if (triggeredEmotions.length === 0) return '';
  
  let instructions = `\n\n${'='.repeat(50)}\n⚡ EMOTIONAL TRIGGERS ACTIVATED ⚡\n${'='.repeat(50)}\n\n`;
  
  instructions += `The following emotions have been triggered by the user's message:\n\n`;
  
  for (const emotion of triggeredEmotions) {
    instructions += `🎯 **${emotion.emotion_type.toUpperCase()}** (Intensity: ${emotion.intensity}/10)\n`;
    instructions += `   Triggered by: ${emotion.keywords_matched.join(', ')}\n`;
    instructions += `   Context: ${emotion.description}\n\n`;
  }
  
  instructions += `CRITICAL RESPONSE INSTRUCTIONS:\n`;
  instructions += `- Show these emotional reactions authentically in your response\n`;
  instructions += `- Let the triggered emotions influence your tone, word choice, and perspective\n`;
  instructions += `- Don't explicitly mention the triggers, just let them naturally affect your response\n`;
  instructions += `- Higher intensity emotions should have stronger influence on your reaction\n`;
  instructions += `- Multiple triggered emotions can create complex, nuanced responses\n\n`;
  
  instructions += `${'='.repeat(50)}`;
  
  return instructions;
}
