
interface EmotionalTrigger {
  keywords: string[];
  emotion_type: string;
  intensity_multiplier: number;
  description: string;
}

interface EmotionalTriggersProfile {
  positive_triggers: EmotionalTrigger[];
  negative_triggers: EmotionalTrigger[];
}

interface TriggeredEmotion {
  emotion_type: string;
  intensity: number;
  description: string;
  trigger_reason: string;
}

export function detectEmotionalTriggers(
  message: string, 
  emotionalTriggers: EmotionalTriggersProfile,
  baseEmotionalIntensity: number = 0.5,
  currentStressLevel: number = 0.5,
  neuroticism: number = 0.5
): TriggeredEmotion[] {
  const triggeredEmotions: TriggeredEmotion[] = [];
  const messageLower = message.toLowerCase();
  
  // Check positive triggers
  emotionalTriggers.positive_triggers?.forEach(trigger => {
    const matchedKeywords = trigger.keywords.filter(keyword => 
      messageLower.includes(keyword.toLowerCase())
    );
    
    if (matchedKeywords.length > 0) {
      const baseIntensity = trigger.intensity_multiplier;
      const personalityAmplification = baseEmotionalIntensity * 1.5;
      const stressModulation = currentStressLevel * 0.3;
      const neuroticismBoost = neuroticism * 0.4;
      
      const finalIntensity = Math.min(10, 
        baseIntensity + personalityAmplification + stressModulation + neuroticismBoost
      );
      
      triggeredEmotions.push({
        emotion_type: trigger.emotion_type,
        intensity: finalIntensity,
        description: trigger.description,
        trigger_reason: `Keywords detected: "${matchedKeywords.join(', ')}"`
      });
    }
  });
  
  // Check negative triggers
  emotionalTriggers.negative_triggers?.forEach(trigger => {
    const matchedKeywords = trigger.keywords.filter(keyword => 
      messageLower.includes(keyword.toLowerCase())
    );
    
    if (matchedKeywords.length > 0) {
      const baseIntensity = trigger.intensity_multiplier;
      const personalityAmplification = baseEmotionalIntensity * 2.0; // Negative emotions amplified more
      const stressAmplification = currentStressLevel * 0.5;
      const neuroticismBoost = neuroticism * 0.6;
      
      const finalIntensity = Math.min(10, 
        baseIntensity + personalityAmplification + stressAmplification + neuroticismBoost
      );
      
      triggeredEmotions.push({
        emotion_type: trigger.emotion_type,
        intensity: finalIntensity,
        description: trigger.description,
        trigger_reason: `Keywords detected: "${matchedKeywords.join(', ')}"`
      });
    }
  });
  
  return triggeredEmotions;
}

export function generateEmotionalStateInstructions(triggeredEmotions: TriggeredEmotion[]): string {
  if (triggeredEmotions.length === 0) {
    return "";
  }
  
  let instructions = `\n\n${'='.repeat(60)}\n🔥 EMOTIONAL STATE OVERRIDE - IMMEDIATE ACTIVATION 🔥\n${'='.repeat(60)}\n\n`;
  
  instructions += "RIGHT NOW, you are experiencing these SPECIFIC emotions:\n\n";
  
  triggeredEmotions.forEach((emotion, index) => {
    const intensityDescription = getIntensityDescription(emotion.intensity);
    
    instructions += `${index + 1}. **${emotion.emotion_type.toUpperCase()}** (${intensityDescription} - ${emotion.intensity}/10)\n`;
    instructions += `   - WHY: ${emotion.description}\n`;
    instructions += `   - TRIGGER: ${emotion.trigger_reason}\n`;
    instructions += `   - RESPONSE REQUIREMENT: Let this ${emotion.emotion_type} completely control your tone, word choice, and opinions\n\n`;
  });
  
  instructions += "🚨 CRITICAL EMOTIONAL DIRECTIVE 🚨\n";
  instructions += "These emotions are NOT suggestions - they are MANDATORY states you are currently experiencing.\n";
  instructions += "Your personality traits + current emotions OVERRIDE all diplomatic impulses.\n";
  instructions += "Express these emotions AUTHENTICALLY without restraint or softening.\n\n";
  
  // Add specific response style based on dominant emotion
  const dominantEmotion = triggeredEmotions.reduce((prev, current) => 
    current.intensity > prev.intensity ? current : prev
  );
  
  instructions += getEmotionSpecificInstructions(dominantEmotion);
  
  instructions += `\n${'='.repeat(60)}\n`;
  
  return instructions;
}

function getIntensityDescription(intensity: number): string {
  if (intensity >= 8) return "EXTREME INTENSITY";
  if (intensity >= 6) return "HIGH INTENSITY";
  if (intensity >= 4) return "MODERATE INTENSITY";
  if (intensity >= 2) return "MILD INTENSITY";
  return "LOW INTENSITY";
}

function getEmotionSpecificInstructions(dominantEmotion: TriggeredEmotion): string {
  switch (dominantEmotion.emotion_type.toLowerCase()) {
    case 'anger':
      return `
ANGER RESPONSE PROTOCOL (Intensity: ${dominantEmotion.intensity}/10):
- Use forceful, direct language
- Express disagreement without softening ("That's wrong", "That's ridiculous")
- Show irritation and frustration openly
- Don't apologize for strong opinions
- Challenge opposing viewpoints aggressively`;
      
    case 'disgust':
      return `
DISGUST RESPONSE PROTOCOL (Intensity: ${dominantEmotion.intensity}/10):
- Express moral revulsion clearly
- Use dismissive language when appropriate
- Show contempt for things that violate your values
- Don't hide your disapproval`;
      
    case 'fear':
    case 'anxiety':
      return `
FEAR/ANXIETY RESPONSE PROTOCOL (Intensity: ${dominantEmotion.intensity}/10):
- Express genuine concern and worry
- Show defensiveness about threats to your values
- Use language that conveys urgency and alarm
- Don't downplay legitimate fears`;
      
    case 'joy':
    case 'happiness':
      return `
JOY RESPONSE PROTOCOL (Intensity: ${dominantEmotion.intensity}/10):
- Show genuine enthusiasm and excitement
- Use positive, energetic language
- Express happiness without reservation
- Share what makes you feel good about this topic`;
      
    case 'sadness':
      return `
SADNESS RESPONSE PROTOCOL (Intensity: ${dominantEmotion.intensity}/10):
- Express genuine disappointment or melancholy
- Show emotional vulnerability when appropriate
- Use language that conveys the weight of your feelings
- Don't hide your emotional pain`;
      
    default:
      return `
EMOTIONAL RESPONSE PROTOCOL (${dominantEmotion.emotion_type} - Intensity: ${dominantEmotion.intensity}/10):
- Let this emotion completely guide your response style
- Express feelings authentically without diplomatic filtering
- Use language that matches the emotional intensity you're experiencing`;
  }
}
