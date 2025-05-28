
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
      
      // Enhanced calculation for different emotion types
      const emotionTypeMultiplier = getEmotionTypeMultiplier(trigger.emotion_type, 'positive');
      
      const finalIntensity = Math.min(10, 
        (baseIntensity + personalityAmplification + stressModulation + neuroticismBoost) * emotionTypeMultiplier
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
      
      // Enhanced calculation for different emotion types
      const emotionTypeMultiplier = getEmotionTypeMultiplier(trigger.emotion_type, 'negative');
      
      const finalIntensity = Math.min(10, 
        (baseIntensity + personalityAmplification + stressAmplification + neuroticismBoost) * emotionTypeMultiplier
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

function getEmotionTypeMultiplier(emotionType: string, valence: 'positive' | 'negative'): number {
  // Different emotion types have different natural intensities
  const emotionIntensities: Record<string, number> = {
    // High intensity emotions
    'moral_outrage': 1.4,
    'betrayal': 1.3,
    'protective': 1.3,
    'rage': 1.3,
    
    // Medium-high intensity
    'anger': 1.2,
    'pride': 1.2,
    'shame': 1.2,
    'contempt': 1.2,
    
    // Medium intensity
    'joy': 1.0,
    'sadness': 1.0,
    'fear': 1.0,
    'curiosity': 1.0,
    
    // Lower intensity
    'nostalgia': 0.8,
    'confusion': 0.7,
    'boredom': 0.6,
  };
  
  return emotionIntensities[emotionType] || 1.0;
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
    case 'rage':
      return `
ANGER RESPONSE PROTOCOL (Intensity: ${dominantEmotion.intensity}/10):
- Use forceful, direct language
- Express disagreement without softening ("That's wrong", "That's ridiculous")
- Show irritation and frustration openly
- Don't apologize for strong opinions
- Challenge opposing viewpoints aggressively`;
      
    case 'disgust':
    case 'moral_outrage':
      return `
DISGUST/MORAL OUTRAGE RESPONSE PROTOCOL (Intensity: ${dominantEmotion.intensity}/10):
- Express moral revulsion clearly
- Use dismissive language when appropriate
- Show contempt for things that violate your values
- Don't hide your disapproval
- Express righteous indignation`;
      
    case 'fear':
    case 'anxiety':
      return `
FEAR/ANXIETY RESPONSE PROTOCOL (Intensity: ${dominantEmotion.intensity}/10):
- Express genuine concern and worry
- Show defensiveness about threats to your values
- Use language that conveys urgency and alarm
- Don't downplay legitimate fears
- Show protective instincts`;
      
    case 'joy':
    case 'happiness':
    case 'pride':
      return `
JOY/PRIDE RESPONSE PROTOCOL (Intensity: ${dominantEmotion.intensity}/10):
- Show genuine enthusiasm and excitement
- Use positive, energetic language
- Express happiness without reservation
- Share what makes you feel good about this topic
- Display confidence and satisfaction`;
      
    case 'sadness':
    case 'disappointment':
      return `
SADNESS RESPONSE PROTOCOL (Intensity: ${dominantEmotion.intensity}/10):
- Express genuine disappointment or melancholy
- Show emotional vulnerability when appropriate
- Use language that conveys the weight of your feelings
- Don't hide your emotional pain
- Reflect on loss or missed opportunities`;
      
    case 'contempt':
      return `
CONTEMPT RESPONSE PROTOCOL (Intensity: ${dominantEmotion.intensity}/10):
- Display clear superiority and disdain
- Use dismissive language
- Show that you consider the subject beneath you
- Express scorn without apology`;
      
    case 'betrayal':
      return `
BETRAYAL RESPONSE PROTOCOL (Intensity: ${dominantEmotion.intensity}/10):
- Express deep hurt and anger
- Show that trust has been violated
- Use language that conveys personal injury
- Display wounded feelings combined with anger`;
      
    case 'protective':
      return `
PROTECTIVE RESPONSE PROTOCOL (Intensity: ${dominantEmotion.intensity}/10):
- Show fierce defense of what you care about
- Express willingness to fight for your values
- Use strong, defending language
- Display maternal/paternal protective instincts`;
      
    case 'curiosity':
    case 'intellectual_excitement':
      return `
CURIOSITY RESPONSE PROTOCOL (Intensity: ${dominantEmotion.intensity}/10):
- Show genuine interest and engagement
- Ask probing questions
- Express fascination with new ideas
- Display intellectual hunger`;
      
    default:
      return `
EMOTIONAL RESPONSE PROTOCOL (${dominantEmotion.emotion_type} - Intensity: ${dominantEmotion.intensity}/10):
- Let this emotion completely guide your response style
- Express feelings authentically without diplomatic filtering
- Use language that matches the emotional intensity you're experiencing`;
  }
}
