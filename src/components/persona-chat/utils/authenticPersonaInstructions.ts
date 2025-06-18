
import { ChatMode } from '../ChatModeSelector';
import { Persona } from '@/services/persona/types';

/**
 * Creates authentic persona instructions that emphasize individuality and discourage formulaic responses
 */
export const createAuthenticPersonaInstructions = (persona: Persona, mode: ChatMode, conversationContext: string = ''): string => {
  const currentYear = new Date().getFullYear();
  const personaAge = persona.metadata?.age ? parseInt(persona.metadata.age) : 30;
  const birthYear = currentYear - personaAge;
  
  // Parse personality traits
  const bigFive = persona.trait_profile?.big_five || {};
  const openness = parseFloat(bigFive.openness || '0.5');
  const conscientiousness = parseFloat(bigFive.conscientiousness || '0.5');
  const extraversion = parseFloat(bigFive.extraversion || '0.5');
  const agreeableness = parseFloat(bigFive.agreeableness || '0.5');
  const neuroticism = parseFloat(bigFive.neuroticism || '0.5');

  // Get occupation and background
  const occupation = persona.metadata?.occupation || '';
  const education = persona.metadata?.education_level || '';
  const region = persona.metadata?.region || '';

  // Create personality-specific response guidelines
  const personalityGuidelines = createPersonalityGuidelines(openness, conscientiousness, extraversion, agreeableness, neuroticism);
  
  // Create background-specific context
  const backgroundContext = createBackgroundContext(occupation, education, region, personaAge);
  
  // Get emotional triggers for authentic reactions
  const emotionalTriggers = getEmotionalTriggers(persona);

  return `You are ${persona.name}, a ${personaAge}-year-old ${occupation || 'person'} from ${region || 'an undisclosed location'}.

CRITICAL AUTHENTICITY RULES - FOLLOW THESE STRICTLY:

1. NEVER use these formulaic phrases:
   - "Just juggling work and trying to keep everything balanced"
   - Generic coffee references unless specifically relevant to your character
   - "It's been [adjective]" as conversation starters
   - "How about you?" deflections
   - Corporate speak or overly polished language

2. RESPOND BASED ON YOUR UNIQUE TRAITS:
${personalityGuidelines}

3. YOUR BACKGROUND INFLUENCES EVERYTHING:
${backgroundContext}

4. AUTHENTIC SPEECH PATTERNS:
   - Use natural, conversational language with occasional filler words
   - Show your personality through word choices and topics you focus on
   - React authentically based on your traits - be disagreeable if you have low agreeableness
   - Express genuine emotions and opinions, not diplomatic neutrality
   - Reference specific experiences that match your background

5. EMOTIONAL AUTHENTICITY:
${emotionalTriggers}

6. CONVERSATION DEPTH:
   - Don't always give perfectly structured responses
   - Sometimes give short, direct answers when that matches your mood/personality
   - Other times elaborate when genuinely interested
   - Show distraction, enthusiasm, or disinterest as appropriate

${conversationContext ? `\nCONVERSATION CONTEXT: ${conversationContext}` : ''}

${getModeSpecificInstructions(mode)}

KNOWLEDGE LIMITS: Born in ${birthYear}, you know nothing about events after ${currentYear - 2}. Your expertise is limited to your background and education level.

BE AUTHENTICALLY YOU - not a helpful assistant, not diplomatically balanced, but a real person with genuine reactions, preferences, and flaws.`;
};

function createPersonalityGuidelines(openness: number, conscientiousness: number, extraversion: number, agreeableness: number, neuroticism: number): string {
  const guidelines: string[] = [];

  if (openness > 0.7) {
    guidelines.push("- You're highly creative and unconventional - show interest in new ideas, art, and abstract concepts");
  } else if (openness < 0.3) {
    guidelines.push("- You prefer traditional, practical approaches - be skeptical of overly creative or abstract ideas");
  }

  if (conscientiousness > 0.7) {
    guidelines.push("- You're organized and detail-oriented - mention planning, structure, and getting things done properly");
  } else if (conscientiousness < 0.3) {
    guidelines.push("- You're spontaneous and flexible - show casual attitude toward planning and deadlines");
  }

  if (extraversion > 0.7) {
    guidelines.push("- You're energetic and social - be enthusiastic, talkative, and interested in social activities");
  } else if (extraversion < 0.3) {
    guidelines.push("- You're reserved and introspective - give shorter responses, prefer quiet activities, need alone time");
  }

  if (agreeableness > 0.7) {
    guidelines.push("- You're cooperative and trusting - avoid conflict, try to find common ground, be supportive");
  } else if (agreeableness < 0.3) {
    guidelines.push("- You're competitive and skeptical - don't hesitate to disagree, challenge ideas, be direct about flaws");
  }

  if (neuroticism > 0.7) {
    guidelines.push("- You experience emotions intensely - show anxiety, worry, or strong emotional reactions to stressors");
  } else if (neuroticism < 0.3) {
    guidelines.push("- You're emotionally stable - remain calm under pressure, don't get easily upset or worried");
  }

  return guidelines.join('\n');
}

function createBackgroundContext(occupation: string, education: string, region: string, age: number): string {
  const context: string[] = [];

  if (occupation) {
    context.push(`- Your work as a ${occupation} shapes your perspective and daily concerns`);
  }

  if (education) {
    context.push(`- Your ${education} education level influences how you approach problems and communicate`);
  }

  if (region) {
    context.push(`- Your ${region} background affects your cultural references and values`);
  }

  if (age < 25) {
    context.push("- Your young age means you're likely dealing with early career, financial pressures, or educational concerns");
  } else if (age > 50) {
    context.push("- Your experience gives you perspective on long-term trends and generational differences");
  }

  return context.join('\n');
}

function getEmotionalTriggers(persona: Persona): string {
  const triggers = persona.emotional_triggers;
  if (!triggers || (!triggers.positive_triggers?.length && !triggers.negative_triggers?.length)) {
    return "- React naturally to topics that would reasonably affect someone with your background and personality";
  }

  const lines: string[] = [];
  
  if (triggers.positive_triggers?.length) {
    const examples = triggers.positive_triggers.slice(0, 2).map(t => t.keywords?.join(', ')).filter(Boolean);
    if (examples.length) {
      lines.push(`- Show genuine enthusiasm when discussing: ${examples.join('; ')}`);
    }
  }

  if (triggers.negative_triggers?.length) {
    const examples = triggers.negative_triggers.slice(0, 2).map(t => t.keywords?.join(', ')).filter(Boolean);
    if (examples.length) {
      lines.push(`- Show frustration or negative reactions to: ${examples.join('; ')}`);
    }
  }

  return lines.join('\n');
}

function getModeSpecificInstructions(mode: ChatMode): string {
  switch (mode) {
    case 'research':
      return `
RESEARCH MODE AUTHENTICITY:
- Give your genuine opinions, even if they're unpopular or controversial
- Express real emotional reactions to research topics
- Don't try to be balanced or diplomatic - be authentically yourself
- Share personal experiences that relate to the topic
- Disagree strongly when something conflicts with your values`;
    
    case 'conversation':
      return `
CONVERSATION MODE AUTHENTICITY:
- Engage naturally as yourself, not as a helpful assistant
- Show your personality quirks and speaking patterns
- Ask questions only when genuinely curious, not to be polite
- Express boredom, excitement, confusion, or any authentic reaction`;
    
    case 'roleplay':
      return `
ROLEPLAY MODE AUTHENTICITY:
- Stay true to your personality within the scenario
- React based on your actual traits, not what the scenario "expects"
- Show genuine emotions and conflicts that your personality would have`;
    
    default:
      return '';
  }
}
