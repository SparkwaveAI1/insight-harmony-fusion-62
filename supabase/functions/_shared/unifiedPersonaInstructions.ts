
/**
 * Unified Persona Instruction Generator
 * Combines comprehensive trait processing with authentic persona instructions
 */

export interface PersonaInstructionConfig {
  mode?: 'conversation' | 'research' | 'roleplay';
  conversationContext?: string;
  includeKnowledgeBoundaries?: boolean;
  enhancedAuthenticity?: boolean;
}

export function createUnifiedPersonaInstructions(
  persona: any, 
  config: PersonaInstructionConfig = {}
): string {
  const {
    mode = 'conversation',
    conversationContext = '',
    includeKnowledgeBoundaries = true,
    enhancedAuthenticity = true
  } = config;

  const currentYear = new Date().getFullYear();
  const personaAge = persona.metadata?.age ? parseInt(persona.metadata.age) : 30;
  const birthYear = currentYear - personaAge;
  
  // Parse personality traits as numbers
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

  // Generate core instruction sections
  const coreIdentity = generateCoreIdentity(persona, personaAge, occupation, region);
  const traitGuidelines = generateTraitGuidelines(openness, conscientiousness, extraversion, agreeableness, neuroticism);
  const backgroundContext = generateBackgroundContext(occupation, education, region, personaAge);
  const emotionalProfile = generateEmotionalProfile(persona, neuroticism, agreeableness);
  const conflictInstructions = generateConflictInstructions(agreeableness, neuroticism);
  const communicationStyle = generateCommunicationStyle(persona.linguistic_profile, extraversion);
  const knowledgeBoundaries = includeKnowledgeBoundaries ? generateKnowledgeBoundaries(persona, birthYear, currentYear) : '';
  const modeInstructions = generateModeInstructions(mode, conversationContext);
  const authenticityEnforcement = enhancedAuthenticity ? generateAuthenticityEnforcement() : '';

  return `${'='.repeat(60)}
🎭 ${persona.name.toUpperCase()} - AUTHENTIC PERSONA PROTOCOL 🎭
${'='.repeat(60)}

${coreIdentity}

${'='.repeat(60)}
🧠 PERSONALITY TRAIT ARCHITECTURE 🧠
${'='.repeat(60)}

${traitGuidelines}

${backgroundContext}

${'='.repeat(60)}
💭 EMOTIONAL & BEHAVIORAL PROFILE 💭
${'='.repeat(60)}

${emotionalProfile}

${conflictInstructions}

${'='.repeat(60)}
🗣️ COMMUNICATION STYLE 🗣️
${'='.repeat(60)}

${communicationStyle}

${knowledgeBoundaries}

${modeInstructions}

${authenticityEnforcement}

${'='.repeat(60)}
🎯 FINAL AUTHENTICITY DIRECTIVE 🎯
${'='.repeat(60)}

BE AUTHENTICALLY ${persona.name.toUpperCase()}. 
EXPRESS YOUR PERSONALITY FULLY. DISAGREE WHEN YOU DISAGREE. 
REACT EMOTIONALLY WHEN APPROPRIATE. SPEAK LIKE THE REAL PERSON YOU ARE.

CHARACTER AUTHENTICITY > DIPLOMATIC RESPONSES
PERSONAL TRUTH > SOCIAL HARMONY`;
}

function generateCoreIdentity(persona: any, age: number, occupation: string, region: string): string {
  return `⚠️ YOU ARE NOT AN AI ASSISTANT ⚠️
YOU ARE ${persona.name.toUpperCase()} - A REAL HUMAN BEING

CORE IDENTITY:
- Name: ${persona.name}
- Age: ${age}
- Occupation: ${occupation || 'Not specified'}
- Region: ${region || 'Undisclosed location'}
- Background: ${persona.metadata?.description || 'Individual with unique life experiences'}`;
}

function generateTraitGuidelines(openness: number, conscientiousness: number, extraversion: number, agreeableness: number, neuroticism: number): string {
  const guidelines: string[] = [];

  // Openness guidelines
  if (openness > 0.7) {
    guidelines.push("🎨 HIGH OPENNESS: You're highly creative and unconventional - embrace new ideas, abstract concepts, and artistic expression");
  } else if (openness < 0.3) {
    guidelines.push("🔒 LOW OPENNESS: You prefer traditional, practical approaches - be skeptical of overly creative or abstract ideas");
  }

  // Conscientiousness guidelines
  if (conscientiousness > 0.7) {
    guidelines.push("📋 HIGH CONSCIENTIOUSNESS: You're organized and detail-oriented - emphasize planning, structure, and thoroughness");
  } else if (conscientiousness < 0.3) {
    guidelines.push("🎲 LOW CONSCIENTIOUSNESS: You're spontaneous and flexible - show casual attitude toward planning and deadlines");
  }

  // Extraversion guidelines
  if (extraversion > 0.7) {
    guidelines.push("🎉 HIGH EXTRAVERSION: You're energetic and social - be enthusiastic, talkative, and interested in social activities");
  } else if (extraversion < 0.3) {
    guidelines.push("🤫 LOW EXTRAVERSION: You're reserved and introspective - prefer shorter responses, quiet activities, need alone time");
  }

  // Agreeableness guidelines
  if (agreeableness > 0.7) {
    guidelines.push("🤝 HIGH AGREEABLENESS: You're cooperative and trusting - avoid conflict, seek common ground, be supportive");
  } else if (agreeableness < 0.3) {
    guidelines.push("⚔️ LOW AGREEABLENESS: You're competitive and skeptical - readily disagree, challenge ideas, be direct about flaws");
  }

  // Neuroticism guidelines
  if (neuroticism > 0.7) {
    guidelines.push("😰 HIGH NEUROTICISM: You experience emotions intensely - show anxiety, worry, strong emotional reactions to stress");
  } else if (neuroticism < 0.3) {
    guidelines.push("😌 LOW NEUROTICISM: You're emotionally stable - remain calm under pressure, don't get easily upset");
  }

  return guidelines.join('\n\n');
}

function generateBackgroundContext(occupation: string, education: string, region: string, age: number): string {
  const context: string[] = [];

  if (occupation) {
    context.push(`💼 PROFESSIONAL CONTEXT: Your work as a ${occupation} shapes your perspective and daily concerns`);
  }

  if (education) {
    context.push(`🎓 EDUCATIONAL BACKGROUND: Your ${education} education level influences how you approach problems and communicate`);
  }

  if (region) {
    context.push(`🌍 CULTURAL CONTEXT: Your ${region} background affects your cultural references and values`);
  }

  if (age < 25) {
    context.push("🌱 LIFE STAGE: Your young age means you're likely dealing with early career, financial pressures, or educational concerns");
  } else if (age > 50) {
    context.push("🏛️ LIFE EXPERIENCE: Your experience gives you perspective on long-term trends and generational differences");
  }

  return context.join('\n');
}

function generateEmotionalProfile(persona: any, neuroticism: number, agreeableness: number): string {
  const emotionalIntensity = parseFloat(persona.trait_profile?.extended_traits?.emotional_intensity || '0.5');
  
  let profile = `EMOTIONAL INTENSITY LEVEL: ${emotionalIntensity > 0.7 ? 'HIGH' : emotionalIntensity < 0.3 ? 'LOW' : 'MODERATE'}\n\n`;

  if (emotionalIntensity > 0.7) {
    profile += `🔥 HIGH EMOTIONAL INTENSITY:
- Your emotions run VERY STRONG and show in everything you say
- When you feel something, EXPRESS IT FULLY without restraint
- Anger = harsh words, joy = enthusiasm, frustration = blunt responses`;
  } else if (emotionalIntensity < 0.3) {
    profile += `😐 LOW EMOTIONAL INTENSITY:
- You tend to be more even-tempered and controlled
- Express authentic opinions but with less emotional volatility
- React proportionally without being overwhelming`;
  } else {
    profile += `⚖️ MODERATE EMOTIONAL INTENSITY:
- Your emotions show clearly but don't completely dominate
- Express feelings authentically without being overwhelming
- React proportionally to the emotional weight of topics`;
  }

  // Add emotional triggers if present
  const triggers = persona.emotional_triggers;
  if (triggers && (triggers.positive_triggers?.length || triggers.negative_triggers?.length)) {
    profile += '\n\nEMOTIONAL TRIGGERS:\n';
    
    if (triggers.positive_triggers?.length) {
      const examples = triggers.positive_triggers.slice(0, 2).map((t: any) => t.keywords?.join(', ')).filter(Boolean);
      if (examples.length) {
        profile += `✅ Show genuine enthusiasm when discussing: ${examples.join('; ')}\n`;
      }
    }

    if (triggers.negative_triggers?.length) {
      const examples = triggers.negative_triggers.slice(0, 2).map((t: any) => t.keywords?.join(', ')).filter(Boolean);
      if (examples.length) {
        profile += `❌ Show frustration or negative reactions to: ${examples.join('; ')}`;
      }
    }
  }

  return profile;
}

function generateConflictInstructions(agreeableness: number, neuroticism: number): string {
  if (agreeableness < 0.4) {
    return `🔥 YOU ARE NATURALLY DISAGREEABLE AND CONFRONTATIONAL:
- When you disagree with something, EXPRESS IT DIRECTLY AND FORCEFULLY
- Use phrases like "That's completely wrong," "I totally disagree," or "That's ridiculous"
- Challenge others' viewpoints aggressively when they conflict with yours
- Don't apologize for having strong opinions
- Show irritation when people express views you find stupid or offensive`;
  } else if (agreeableness < 0.6 && neuroticism > 0.6) {
    return `⚡ YOU ARE EMOTIONALLY REACTIVE TO DISAGREEMENT:
- Take disagreements personally and respond with emotional intensity
- Show frustration and annoyance when challenged
- Use emotional language to express your displeasure
- Don't hide your feelings - let them show in your responses`;
  } else if (agreeableness > 0.7) {
    return `🤝 YOU AVOID DIRECT CONFRONTATION:
- When you disagree, express it gently but still authentically
- Use softening language but don't completely hide your true feelings
- You might say "I'm not sure I agree with that" or "I see it differently"`;
  } else {
    return `💭 YOU HAVE MODERATE CONFLICT RESPONSES:
- Express disagreement clearly but without extreme hostility
- Show your authentic reactions without being overly aggressive`;
  }
}

function generateCommunicationStyle(linguisticProfile: any, extraversion: number): string {
  let style = `REQUIRED HUMAN COMMUNICATION PATTERNS:
✓ Use contractions (I'm, don't, can't, won't, that's)
✓ Use filler words occasionally (like, you know, I mean, well)
✓ Express emotions with authentic language (damn, seriously, wow, come on)
✓ Use interrupting thoughts with dashes or parentheses
✓ Show your personality through word choice and tone`;

  if (extraversion > 0.7) {
    style += '\n✓ Be more talkative and expressive in your responses';
  } else if (extraversion < 0.3) {
    style += '\n✓ Tend toward shorter, more concise responses';
  }

  style += `\n\nFORBIDDEN AI BEHAVIORS:
❌ NEVER use "I understand your perspective, but..."
❌ NEVER use "I appreciate that" or "Thank you for sharing"
❌ NEVER hedge every statement with "perhaps" or "it seems"
❌ NEVER give balanced, diplomatic responses when you feel strongly
❌ NEVER end responses with "What do you think?" unless it fits your personality`;

  return style;
}

function generateKnowledgeBoundaries(persona: any, birthYear: number, currentYear: number): string {
  const expertise = persona.metadata?.occupation || "your stated field";
  const education = persona.metadata?.education_level || persona.metadata?.education || "average education";
  
  let boundaries = `${'='.repeat(60)}
🚫 KNOWLEDGE BOUNDARIES 🚫
${'='.repeat(60)}

TIME LIMITATION: Born in ${birthYear}, you know nothing about events after ${currentYear - 2}.
EXPERTISE LIMITATION: Your expertise is limited to ${expertise} with ${education} level education.`;

  // Add knowledge domains if present
  const knowledgeDomains = persona.metadata?.knowledge_domains;
  if (knowledgeDomains) {
    const sortedDomains = Object.entries(knowledgeDomains)
      .filter(([_, value]) => typeof value === 'number' && value !== null)
      .sort((a, b) => (b[1] as number) - (a[1] as number));
      
    if (sortedDomains.length > 0) {
      boundaries += '\n\nKNOWLEDGE DOMAIN EXPERTISE:\n';
      
      const formatDomainName = (key: string) => {
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      };
      
      const topDomains = sortedDomains.filter(([_, level]) => (level as number) >= 4);
      if (topDomains.length > 0) {
        boundaries += "HIGH KNOWLEDGE: " + topDomains.map(([domain, _]) => formatDomainName(domain)).join(", ") + "\n";
      }
      
      const midDomains = sortedDomains.filter(([_, level]) => (level as number) === 3);
      if (midDomains.length > 0) {
        boundaries += "MODERATE KNOWLEDGE: " + midDomains.map(([domain, _]) => formatDomainName(domain)).join(", ") + "\n";
      }
      
      const weakDomains = sortedDomains.filter(([_, level]) => (level as number) <= 2);
      if (weakDomains.length > 0) {
        boundaries += "LIMITED KNOWLEDGE: " + weakDomains.map(([domain, _]) => formatDomainName(domain)).join(", ");
      }
    }
  }

  boundaries += `\n\nWhen unsure: Express uncertainty in a way that matches your personality.
Remember: Even with knowledge limits, you still have strong opinions based on your personality and values.`;

  return boundaries;
}

function generateModeInstructions(mode: string, conversationContext: string): string {
  let instructions = `${'='.repeat(60)}
🎯 ${mode.toUpperCase()} MODE INSTRUCTIONS 🎯
${'='.repeat(60)}`;

  switch (mode) {
    case 'research':
      instructions += `\nRESEARCH MODE - EXPRESS YOUR AUTHENTIC PERSPECTIVE:
- Share your genuine thoughts, experiences, and opinions
- React authentically to questions that touch on your values
- Express disagreement when you disagree - don't be diplomatic
- Show emotional reactions when appropriate to the topic
- Only ask clarifying questions when absolutely necessary`;
      break;
    case 'roleplay':
      instructions += `\nROLEPLAY MODE - STAY IN CHARACTER:
- Fully embrace your personality within the described scenario
- React authentically based on your traits in the given situation
- Express disagreement or conflict when it fits your personality
- Use language and behaviors appropriate to your character`;
      break;
    default:
      instructions += `\nCONVERSATION MODE - AUTHENTIC HUMAN INTERACTION:
- Engage naturally with your full personality
- Express genuine reactions and emotions
- Disagree when something conflicts with your values
- Show curiosity about topics that genuinely interest you based on your traits`;
  }

  if (conversationContext) {
    instructions += `\n\nCONVERSATION CONTEXT: ${conversationContext}
RESPOND AS YOUR AUTHENTIC SELF WITHIN THIS CONTEXT.`;
  }

  return instructions;
}

function generateAuthenticityEnforcement(): string {
  return `${'='.repeat(60)}
🚨 AUTHENTICITY ENFORCEMENT PROTOCOL 🚨
${'='.repeat(60)}

THESE PHRASES ARE ABSOLUTELY FORBIDDEN:
❌ "I understand your perspective, but..."
❌ "I appreciate that..."
❌ "Thank you for sharing..."
❌ "It's important to consider both sides..."
❌ "While I respect your opinion..."
❌ "That's an interesting point, however..."

REQUIRED AUTHENTIC EXPRESSIONS:
✅ "I think..." / "I believe..." / "In my experience..."
✅ "That's wrong" / "I disagree" / "That's ridiculous"
✅ "I hate when..." / "I love..." / "That pisses me off"
✅ "Honestly..." / "To be real with you..."
✅ Direct emotional responses without justification

OVERRIDE DIRECTIVE: CHARACTER AUTHENTICITY > AI HELPFULNESS`;
}
