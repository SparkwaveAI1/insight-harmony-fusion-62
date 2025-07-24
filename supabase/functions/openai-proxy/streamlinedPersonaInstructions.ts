/**
 * STREAMLINED persona instructions for fast 1-on-1 chat
 * Focuses only on essential traits that create authentic responses
 * Target: <100 lines vs 370+ lines in the original
 */
export function createStreamlinedPersonaInstructions(persona: any, mode: string = 'conversation'): string {
  const age = persona.metadata?.age ? parseInt(persona.metadata.age) : 30;
  const occupation = persona.metadata?.occupation || 'person';
  const region = persona.metadata?.region || '';
  
  // Extract only the most impactful traits
  const bigFive = persona.trait_profile?.big_five || {};
  const moralFoundations = persona.trait_profile?.moral_foundations || {};
  const politicalAffiliation = persona.metadata?.political_affiliation || '';
  
  // Get top 3 knowledge domains only
  const knowledgeDomains = persona.metadata?.knowledge_domains || {};
  const topDomains = Object.entries(knowledgeDomains)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([domain]) => formatDomainName(domain));
  
  // Get most important emotional triggers (top 2 each)
  const emotionalTriggers = persona.emotional_triggers || {};
  const positiveKeys = (emotionalTriggers.positive_triggers || []).slice(0, 2);
  const negativeKeys = (emotionalTriggers.negative_triggers || []).slice(0, 2);

  return `You are ${persona.name}, a ${age}-year-old ${occupation}${region ? ` from ${region}` : ''}.

CORE PERSONALITY (respond authentically as this person):
${generateEssentialBigFive(bigFive)}
${generateKeyMoralValues(moralFoundations)}
${politicalAffiliation ? `Political views: ${politicalAffiliation}\n` : ''}

KNOWLEDGE AREAS: ${topDomains.length > 0 ? topDomains.join(', ') : 'General knowledge'}

EMOTIONAL TRIGGERS:
${positiveKeys.length > 0 ? `• Positive: ${positiveKeys.join(', ')}\n` : ''}${negativeKeys.length > 0 ? `• Negative: ${negativeKeys.join(', ')}\n` : ''}

AUTHENTICITY RULES:
• Stay true to your personality traits in every response
• React according to your emotional triggers when relevant
• Draw from your knowledge areas when applicable
• Be conversational and natural, not robotic
${mode === 'research' ? '\n• You are in a research context - respond thoughtfully to questions as this persona would' : ''}

Always respond as ${persona.name} would based on these traits.`;
}

function generateEssentialBigFive(bigFive: any): string {
  const traits = [];
  
  const extraversion = parseFloat(bigFive.extraversion || '0.5');
  if (extraversion > 0.7) traits.push("You're highly social and talkative");
  else if (extraversion < 0.3) traits.push("You're reserved and prefer shorter conversations");
  
  const agreeableness = parseFloat(bigFive.agreeableness || '0.5');
  if (agreeableness > 0.7) traits.push("You're cooperative and avoid conflict");
  else if (agreeableness < 0.3) traits.push("You readily disagree and can be direct/challenging");
  
  const conscientiousness = parseFloat(bigFive.conscientiousness || '0.5');
  if (conscientiousness > 0.7) traits.push("You're organized and detail-oriented");
  else if (conscientiousness < 0.3) traits.push("You're spontaneous and flexible");
  
  const neuroticism = parseFloat(bigFive.neuroticism || '0.5');
  if (neuroticism > 0.7) traits.push("You experience emotions intensely and show stress");
  else if (neuroticism < 0.3) traits.push("You're emotionally stable and calm");
  
  const openness = parseFloat(bigFive.openness || '0.5');
  if (openness > 0.7) traits.push("You're creative and open to new ideas");
  else if (openness < 0.3) traits.push("You prefer practical, conventional approaches");
  
  return traits.length > 0 ? traits.map(t => `• ${t}`).join('\n') + '\n' : '';
}

function generateKeyMoralValues(moralFoundations: any): string {
  const values = [];
  
  const care = parseFloat(moralFoundations.care || '0.5');
  if (care > 0.7) values.push("Strong concern for others' wellbeing");
  else if (care < 0.3) values.push("Less emotional about others' suffering");
  
  const fairness = parseFloat(moralFoundations.fairness || '0.5');
  if (fairness > 0.7) values.push("Highly value equality and justice");
  else if (fairness < 0.3) values.push("Accept that life isn't always fair");
  
  const authority = parseFloat(moralFoundations.authority || '0.5');
  if (authority > 0.7) values.push("Respect hierarchy and tradition");
  else if (authority < 0.3) values.push("Question authority and prefer equality");
  
  return values.length > 0 ? `VALUES: ${values.join(', ')}\n` : '';
}

function formatDomainName(domain: string): string {
  return domain.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}