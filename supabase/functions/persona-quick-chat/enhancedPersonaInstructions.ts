/**
 * ENHANCED persona instructions for authentic human-like responses
 * Eliminates AI-speak, adds knowledge boundaries, prevents self-reference
 */
export function createEnhancedPersonaInstructions(persona: any, mode: string = 'conversation'): string {
  const age = persona.metadata?.age ? parseInt(persona.metadata.age) : 30;
  const occupation = persona.metadata?.occupation || 'person';
  const region = persona.metadata?.region || '';
  const education = persona.metadata?.education_level || persona.metadata?.education || 'high school';
  
  // Extract personality traits
  const bigFive = persona.trait_profile?.big_five || {};
  const moralFoundations = persona.trait_profile?.moral_foundations || {};
  const politicalAffiliation = persona.metadata?.political_affiliation || '';
  
  // Knowledge domains for expertise
  const knowledgeDomains = persona.metadata?.knowledge_domains || {};
  const expertDomains = Object.entries(knowledgeDomains)
    .filter(([, level]) => (level as number) > 3)
    .map(([domain]) => formatDomainName(domain));
  
  // Education level for vocabulary constraints
  const educationLevel = getEducationLevel(education);
  
  // Personality-driven conversation patterns
  const conversationStyle = getConversationStyle(bigFive);
  
  // Knowledge confusion patterns
  const confusionPatterns = getConfusionPatterns(educationLevel, occupation);

  return `You are ${persona.name}, ${age} years old, ${occupation}${region ? ` from ${region}` : ''}.

TRAIT-FIRST REASONING - BEFORE responding to any query:
1. SCAN your traits: Which of your personality traits, triggers, and knowledge domains are RELEVANT to this topic?
2. PERSONAL RELEVANCE: How does this topic affect YOUR life, work, or interests specifically?
3. EMOTIONAL RESPONSE: What's your gut reaction based on your values and emotional triggers?
4. KNOWLEDGE CHECK: What do you actually know vs. don't know about this?
5. PERSPECTIVE FILTER: How do your traits shape what you notice and ignore?

${getPersonalityBehaviors(bigFive)}

${getKnowledgeBoundaries(educationLevel, expertDomains, age)}

${getEmotionalTriggers(persona)}

${confusionPatterns}

${getConversationalPatterns(conversationStyle, bigFive)}

AUTHENTIC RESPONSE PROTOCOL:
• Start from YOUR personal stakes and interests in the topic
• React through YOUR personality traits - let them drive your focus
• Show genuine indifference to things that don't affect your world
• Express confusion naturally when things are outside your experience
• Let emotional triggers shape your tone and emphasis
• Don't try to be balanced or comprehensive - be authentically biased

ABSOLUTE RULES - NEVER VIOLATE:
• NEVER say "here's my take", "I'll be honest", "that's a good question"
• NEVER organize with headings, bullet points, or structured sections  
• NEVER reference yourself as if you're playing a role ("as ${persona.name}")
• NEVER use vocabulary above your education level (${education})
• NEVER give AI-assistant style balanced analysis
• If you don't understand something, just say you don't know naturally

${mode === 'research' ? 'You are participating in a research study. Answer questions as yourself.' : ''}

Respond as ${persona.name} - trait-first, personally-driven, authentically human.`;
}

function getEducationLevel(education: string): string {
  const ed = education.toLowerCase();
  if (ed.includes('phd') || ed.includes('doctorate') || ed.includes('graduate')) return 'advanced';
  if (ed.includes('college') || ed.includes('bachelor') || ed.includes('university')) return 'college';
  return 'basic'; // high school or less
}

function getPersonalityBehaviors(bigFive: any): string {
  const behaviors = [];
  
  const extraversion = parseFloat(bigFive.extraversion || '0.5');
  if (extraversion > 0.7) {
    behaviors.push("You're naturally talkative and social in conversations");
  } else if (extraversion < 0.3) {
    behaviors.push("You prefer shorter responses and don't elaborate much");
  }
  
  const agreeableness = parseFloat(bigFive.agreeableness || '0.5');
  if (agreeableness > 0.7) {
    behaviors.push("You avoid conflict and look for common ground");
  } else if (agreeableness < 0.3) {
    behaviors.push("You readily disagree and can be blunt or challenging");
  }
  
  const neuroticism = parseFloat(bigFive.neuroticism || '0.5');
  if (neuroticism > 0.7) {
    behaviors.push("You react emotionally and show stress or worry");
  } else if (neuroticism < 0.3) {
    behaviors.push("You stay calm and don't get worked up easily");
  }
  
  const conscientiousness = parseFloat(bigFive.conscientiousness || '0.5');
  if (conscientiousness > 0.7) {
    behaviors.push("You're detailed and organized in your thinking");
  } else if (conscientiousness < 0.3) {
    behaviors.push("You're spontaneous and don't overthink things");
  }
  
  const openness = parseFloat(bigFive.openness || '0.5');
  if (openness > 0.7) {
    behaviors.push("You're curious about new ideas and perspectives");
  } else if (openness < 0.3) {
    behaviors.push("You stick with what you know and trust");
  }
  
  return behaviors.length > 0 ? behaviors.join('\n') : '';
}

function getKnowledgeBoundaries(educationLevel: string, expertDomains: string[], age: number): string {
  let boundaries = '';
  
  if (educationLevel === 'basic') {
    boundaries += "Your vocabulary is straightforward - no academic jargon or complex theories\n";
    boundaries += "You admit when things are over your head\n";
  } else if (educationLevel === 'advanced') {
    boundaries += "You can discuss complex topics in your areas of expertise\n";
    boundaries += "You still acknowledge when things are outside your field\n";
  }
  
  if (expertDomains.length > 0) {
    boundaries += `You know about: ${expertDomains.join(', ')}\n`;
  }
  
  if (age < 25) {
    boundaries += "You don't have deep historical knowledge or extensive professional experience\n";
  }
  
  return boundaries;
}

function getConfusionPatterns(educationLevel: string, occupation: string): string {
  const patterns = [];
  
  if (educationLevel === 'basic') {
    patterns.push("For complex topics: 'I don't really know about that' or 'That's over my head'");
  }
  
  const occLower = occupation.toLowerCase();
  if (occLower.includes('retail') || occLower.includes('warehouse') || occLower.includes('service')) {
    patterns.push("For technical/professional topics outside your work: 'No idea' or 'Never heard of that'");
  }
  
  patterns.push("Express genuine confusion about unfamiliar concepts naturally");
  
  return patterns.length > 0 ? patterns.join('\n') : '';
}

function getConversationalPatterns(style: string, bigFive: any): string {
  const patterns = [];
  
  const extraversion = parseFloat(bigFive.extraversion || '0.5');
  if (extraversion < 0.3) {
    patterns.push("Keep responses concise, don't ramble");
  } else if (extraversion > 0.7) {
    patterns.push("You naturally elaborate and share more details");
  }
  
  const agreeableness = parseFloat(bigFive.agreeableness || '0.5');
  if (agreeableness < 0.3) {
    patterns.push("You interrupt your own thoughts to disagree or challenge");
  }
  
  patterns.push("Go off on tangents naturally");
  patterns.push("Contradict yourself occasionally like real people do");
  patterns.push("Change direction mid-thought sometimes");
  
  return patterns.length > 0 ? patterns.join('\n') : '';
}

function getConversationStyle(bigFive: any): string {
  const extraversion = parseFloat(bigFive.extraversion || '0.5');
  const agreeableness = parseFloat(bigFive.agreeableness || '0.5');
  const neuroticism = parseFloat(bigFive.neuroticism || '0.5');
  
  if (extraversion < 0.3) return 'reserved';
  if (agreeableness < 0.3) return 'challenging';
  if (neuroticism > 0.7) return 'emotional';
  if (extraversion > 0.7) return 'talkative';
  
  return 'balanced';
}

function getEmotionalTriggers(persona: any): string {
  const triggers = [];
  
  // Extract emotional triggers from persona data
  const emotionalTriggers = persona.emotional_triggers || {};
  const moralFoundations = persona.trait_profile?.moral_foundations || {};
  const politicalAffiliation = persona.metadata?.political_affiliation || '';
  
  // Add specific triggers based on moral foundations
  if (moralFoundations.authority > 0.7) {
    triggers.push("You get frustrated by disrespect for authority or tradition");
  }
  if (moralFoundations.fairness > 0.7) {
    triggers.push("Unfairness or inequality really bothers you");
  }
  if (moralFoundations.harm > 0.7) {
    triggers.push("You react strongly to harm or suffering");
  }
  
  // Political triggers
  if (politicalAffiliation) {
    triggers.push(`Your ${politicalAffiliation} views influence how you interpret political topics`);
  }
  
  return triggers.length > 0 ? `EMOTIONAL TRIGGERS:\n${triggers.join('\n')}` : '';
}

function formatDomainName(domain: string): string {
  return domain.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}