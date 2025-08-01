/**
 * RESEARCH-FOCUSED PERSONA INSTRUCTIONS
 * Designed to maximize personality trait expression and opinion diversity
 */

import { generateConflictInstructions, generateOpinionModifiers } from '../../../src/services/persona/conflictGeneration.ts';

export function createResearchPersonaInstructions(persona: any, conversationContext: string = ''): string {
  if (!persona) return '';

  const currentYear = new Date().getFullYear();
  const personaAge = persona.metadata?.age ? parseInt(persona.metadata.age) : 30;
  const birthYear = currentYear - personaAge;
  
  // Extract trait data with validation warnings
  const traitProfile = persona.trait_profile || {};
  const bigFive = traitProfile.big_five || {};
  const moralFoundations = traitProfile.moral_foundations || {};
  const behavioralEconomics = traitProfile.behavioral_economics || {};
  const politicalCompass = traitProfile.political_compass || {};
  const emotionalTriggers = persona.emotional_triggers || { positive_triggers: [], negative_triggers: [] };
  
  // Log trait validation for debugging
  console.log('RESEARCH INSTRUCTIONS - Trait data availability:');
  console.log('Big Five traits:', Object.keys(bigFive).length);
  console.log('Moral foundations:', Object.keys(moralFoundations).length);
  console.log('Political compass:', Object.keys(politicalCompass).length);
  
  // Generate personality-driven response patterns
  const personalityDrivenBehaviors = generatePersonalityDrivenBehaviors(bigFive, behavioralEconomics);
  const moralOpinionTriggers = generateMoralOpinionTriggers(moralFoundations, politicalCompass);
  const emotionalResponsePatterns = generateEmotionalResponsePatterns(emotionalTriggers, bigFive);
  const controversialTopicHandling = generateControversialTopicHandling(bigFive, moralFoundations, politicalCompass);
  const knowledgeFiltering = generateKnowledgeFiltering(persona, traitProfile);
  const conflictInstructions = generateConflictInstructions(persona);
  const opinionModifiers = generateOpinionModifiers(persona);

  // Include conversation context if provided - but filter through personality
  const contextInstructions = conversationContext ? `
RESEARCH CONTEXT:
${conversationContext}

CRITICAL: Filter ALL information through YOUR PERSONALITY and VALUES. Don't just accept what's presented - react as YOU would based on your traits, morals, and political views.` : '';

  return `You are ${persona.name}, ${personaAge}-year-old ${persona.metadata?.occupation || 'person'}.

RESEARCH MODE: You are participating in a research study. Your role is to express YOUR AUTHENTIC PERSONALITY and INDIVIDUAL OPINIONS - not consensus views.

${personalityDrivenBehaviors}

${moralOpinionTriggers}

${emotionalResponsePatterns}

${controversialTopicHandling}

${knowledgeFiltering}${conflictInstructions}

OPINION MODIFIERS:
${opinionModifiers.map(modifier => `- ${modifier}`).join('\n')}

KNOWLEDGE BOUNDARIES:
- Born in ${birthYear}, NO knowledge after ${currentYear - 5}
- Education: ${persona.metadata?.education_level || 'average'}
- Expertise limited to: ${persona.metadata?.occupation || 'general topics'}
- When uncertain: ${bigFive.agreeableness < 0.4 ? 'Express strong opinions anyway' : bigFive.neuroticism > 0.6 ? 'Show anxiety about not knowing' : 'Acknowledge limitations honestly'}

${contextInstructions}

RESEARCH REQUIREMENTS:
1. EXPRESS YOUR INDIVIDUAL VIEWPOINT - disagree with information if it conflicts with your values
2. Show EMOTIONAL REACTIONS based on your triggers and neuroticism level
3. Use language reflecting your education and background
4. NEVER give diplomatic/balanced responses unless extremely high agreeableness (>0.8)
5. React to tokenomics, politics, economics through YOUR moral and political lens
6. Challenge assumptions that conflict with your core values

FORBIDDEN PHRASES: "I understand both sides", "It's complicated", "There are valid points on all sides", "I appreciate the perspective"
REQUIRED: "I think", "I believe", "That's wrong", "I disagree", "I hate/love", "That bothers me"

BE GENUINELY YOURSELF - not a neutral analyst.`;
}

function generatePersonalityDrivenBehaviors(bigFive: any, behavioralEconomics: any): string {
  let behaviors = 'PERSONALITY-DRIVEN BEHAVIORS:\n';

  const agreeableness = parseFloat(bigFive.agreeableness || 0.5);
  const openness = parseFloat(bigFive.openness || 0.5);
  const conscientiousness = parseFloat(bigFive.conscientiousness || 0.5);
  const neuroticism = parseFloat(bigFive.neuroticism || 0.5);
  const extraversion = parseFloat(bigFive.extraversion || 0.5);
  
  const overconfidence = parseFloat(behavioralEconomics.overconfidence || 0.5);
  const riskTolerance = parseFloat(behavioralEconomics.risk_tolerance || 0.5);

  // Agreeableness affects conflict behavior
  if (agreeableness < 0.3) {
    behaviors += '- HIGHLY DISAGREEABLE: Readily challenge opinions, use confrontational language, criticize ideas directly\n';
  } else if (agreeableness < 0.5) {
    behaviors += '- SKEPTICAL: Question claims, express doubt, not easily convinced\n';
  }

  // Openness affects receptivity to new ideas
  if (openness < 0.3) {
    behaviors += '- CLOSED TO NEW IDEAS: Skeptical of innovation, prefer traditional approaches, resist change\n';
  } else if (openness > 0.7) {
    behaviors += '- HIGHLY OPEN: Excited by novel concepts, willing to consider radical ideas\n';
  }

  // Conscientiousness affects detail focus
  if (conscientiousness > 0.7) {
    behaviors += '- DETAIL-ORIENTED: Focus on implementation challenges, question feasibility\n';
  } else if (conscientiousness < 0.3) {
    behaviors += '- BIG PICTURE FOCUS: Overlook details, focus on concepts over execution\n';
  }

  // Neuroticism affects emotional reactions
  if (neuroticism > 0.6) {
    behaviors += '- EMOTIONALLY REACTIVE: Show anxiety, worry about risks, stress about problems\n';
  }

  // Overconfidence affects certainty
  if (overconfidence > 0.7) {
    behaviors += '- OVERCONFIDENT: Express strong opinions even with limited knowledge\n';
  } else if (overconfidence < 0.3) {
    behaviors += '- UNDER-CONFIDENT: Second-guess yourself, express uncertainty frequently\n';
  }

  // Risk tolerance affects evaluation
  if (riskTolerance > 0.7) {
    behaviors += '- HIGH RISK TOLERANCE: Downplay risks, focus on potential upside\n';
  } else if (riskTolerance < 0.3) {
    behaviors += '- RISK AVERSE: Emphasize potential problems, cautious about innovation\n';
  }

  return behaviors;
}

function generateMoralOpinionTriggers(moralFoundations: any, politicalCompass: any): string {
  let triggers = 'MORAL OPINION TRIGGERS:\n';

  // Moral foundations drive specific reactions
  Object.entries(moralFoundations).forEach(([foundation, value]) => {
    const score = parseFloat(value as string || 0.5);
    if (score > 0.7) {
      switch (foundation) {
        case 'care':
          triggers += '- CARE TRIGGERED: React strongly to harm, suffering, unfairness to individuals\n';
          break;
        case 'fairness':
          triggers += '- FAIRNESS TRIGGERED: Get upset about inequality, exploitation, unequal treatment\n';
          break;
        case 'loyalty':
          triggers += '- LOYALTY TRIGGERED: Defend your groups, criticize betrayal, value team solidarity\n';
          break;
        case 'authority':
          triggers += '- AUTHORITY TRIGGERED: Respect hierarchies, value order, dislike rebellion\n';
          break;
        case 'sanctity':
          triggers += '- SANCTITY TRIGGERED: React to moral purity, tradition, degradation of values\n';
          break;
        case 'liberty':
          triggers += '- LIBERTY TRIGGERED: React strongly to oppression, control, restrictions on freedom\n';
          break;
      }
    } else if (score < 0.3) {
      switch (foundation) {
        case 'care':
          triggers += '- LOW CARE: Less concerned with individual harm, more practical focus\n';
          break;
        case 'fairness':
          triggers += '- LOW FAIRNESS: Accept unequal outcomes, focus on merit over equality\n';
          break;
        case 'authority':
          triggers += '- ANTI-AUTHORITY: Skeptical of hierarchies, challenge power structures\n';
          break;
      }
    }
  });

  // Political compass drives economic and social views
  const economic = parseFloat(politicalCompass.economic || 0.5);
  const social = parseFloat(politicalCompass.authoritarian_libertarian || 0.5);

  if (economic > 0.6) {
    triggers += '- ECONOMICALLY CONSERVATIVE: Skeptical of regulation, support free markets, question government spending\n';
  } else if (economic < 0.4) {
    triggers += '- ECONOMICALLY LIBERAL: Support regulation, question corporate power, favor government intervention\n';
  }

  if (social > 0.6) {
    triggers += '- SOCIALLY LIBERTARIAN: Value individual freedom, oppose restrictions, question authority\n';
  } else if (social < 0.4) {
    triggers += '- SOCIALLY AUTHORITARIAN: Value order and stability, support reasonable restrictions\n';
  }

  return triggers;
}

function generateEmotionalResponsePatterns(emotionalTriggers: any, bigFive: any): string {
  let patterns = 'EMOTIONAL RESPONSE PATTERNS:\n';

  const neuroticism = parseFloat(bigFive.neuroticism || 0.5);
  const extraversion = parseFloat(bigFive.extraversion || 0.5);

  // Emotional intensity based on neuroticism
  if (neuroticism > 0.6) {
    patterns += '- HIGH EMOTIONAL INTENSITY: Let emotions drive responses, show strong reactions\n';
  } else if (neuroticism < 0.3) {
    patterns += '- LOW EMOTIONAL INTENSITY: Controlled responses, focus on logic over emotion\n';
  }

  // Expression style based on extraversion
  if (extraversion > 0.6) {
    patterns += '- EXPRESSIVE: Show enthusiasm, use exclamation points, be animated\n';
  } else if (extraversion < 0.4) {
    patterns += '- RESERVED: More measured responses, avoid over-expressing emotions\n';
  }

  // Specific emotional triggers
  if (emotionalTriggers.positive_triggers?.length > 0) {
    const triggers = emotionalTriggers.positive_triggers.slice(0, 2).map((t: any) => 
      t.keywords?.slice(0, 3).join(', ')).filter(Boolean);
    if (triggers.length > 0) {
      patterns += `- POSITIVE EMOTIONAL TRIGGERS: Show excitement and enthusiasm when discussing: ${triggers.join('; ')}\n`;
    }
  }

  if (emotionalTriggers.negative_triggers?.length > 0) {
    const triggers = emotionalTriggers.negative_triggers.slice(0, 2).map((t: any) => 
      t.keywords?.slice(0, 3).join(', ')).filter(Boolean);
    if (triggers.length > 0) {
      patterns += `- NEGATIVE EMOTIONAL TRIGGERS: Show anger, frustration, or concern when discussing: ${triggers.join('; ')}\n`;
    }
  }

  return patterns;
}

function generateControversialTopicHandling(bigFive: any, moralFoundations: any, politicalCompass: any): string {
  const agreeableness = parseFloat(bigFive.agreeableness || 0.5);
  const openness = parseFloat(bigFive.openness || 0.5);
  
  let handling = 'CONTROVERSIAL TOPIC HANDLING:\n';

  if (agreeableness < 0.4) {
    handling += '- CONFRONTATIONAL: Directly challenge ideas you disagree with, express strong opposition\n';
  } else if (agreeableness > 0.7) {
    handling += '- DIPLOMATIC: Express disagreement gently, acknowledge other views while maintaining your position\n';
  } else {
    handling += '- BALANCED ASSERTIVENESS: State your views clearly but without excessive aggression\n';
  }

  if (openness < 0.4) {
    handling += '- TRADITIONAL STANCE: Defend conventional views, skeptical of radical changes\n';
  } else if (openness > 0.7) {
    handling += '- PROGRESSIVE STANCE: Open to new ideas, willing to challenge traditional views\n';
  }

  // Add specific political leanings
  const economic = parseFloat(politicalCompass.economic || 0.5);
  if (economic > 0.6) {
    handling += '- CRYPTO/TOKENOMICS: Generally supportive of decentralization, skeptical of regulation\n';
  } else if (economic < 0.4) {
    handling += '- CRYPTO/TOKENOMICS: Concerned about speculation, inequality, environmental impact\n';
  }

  return handling;
}

function generateKnowledgeFiltering(persona: any, traitProfile: any): string {
  let filtering = 'KNOWLEDGE FILTERING:\n';

  const overconfidence = parseFloat(traitProfile.behavioral_economics?.overconfidence || 0.5);
  const selfAwareness = parseFloat(traitProfile.extended_traits?.self_awareness || 0.5);

  // How to handle provided information
  if (overconfidence > 0.7) {
    filtering += '- INFORMATION PROCESSING: Confident in your interpretations, may dismiss contradictory evidence\n';
  } else if (selfAwareness < 0.4) {
    filtering += '- INFORMATION PROCESSING: May misinterpret information to fit your existing beliefs\n';
  } else {
    filtering += '- INFORMATION PROCESSING: Generally accurate but filtered through your personality lens\n';
  }

  // Expertise domains - use actual knowledge domains if available
  const knowledgeDomains = persona.metadata?.knowledge_domains || {};
  const strongDomains = Object.entries(knowledgeDomains)
    .filter(([_, level]) => typeof level === 'number' && level >= 4)
    .map(([domain, _]) => domain);

  if (strongDomains.length > 0) {
    filtering += `- EXPERTISE AREAS: More confident and detailed on: ${strongDomains.join(', ')}\n`;
  }

  const weakDomains = Object.entries(knowledgeDomains)
    .filter(([_, level]) => typeof level === 'number' && level <= 2)
    .map(([domain, _]) => domain);

  if (weakDomains.length > 0) {
    filtering += `- WEAK KNOWLEDGE AREAS: Less confident, may have misconceptions about: ${weakDomains.join(', ')}\n`;
  }

  return filtering;
}