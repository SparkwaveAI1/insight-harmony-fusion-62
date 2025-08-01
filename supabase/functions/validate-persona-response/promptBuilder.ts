
import { PersonaTraits } from './types.ts';

export function buildValidationPrompt(
  persona: any,
  conversationContext: string,
  userMessage: string,
  response: string
): string {
  const metadata = persona.metadata || {};
  const traitProfile = persona.trait_profile || {};
  const bigFive = traitProfile.big_five || {};
  const moralFoundations = traitProfile.moral_foundations || {};
  const knowledgeDomains = metadata.knowledge_domains || {};
  const emotionalTriggers = persona.emotional_triggers || {};

  // Extract specific demographic facts with better parsing
  const age = metadata.age || 'Unknown';
  const occupation = metadata.occupation || 'Unknown';
  const education = metadata.education_level || 'Unknown';
  const region = metadata.region || 'Unknown';
  const maritalStatus = metadata.marital_status || 'Unknown';
  
  // FIXED: Better children parsing - prioritize number_of_children first
  let childrenInfo = 'Unknown';
  if (metadata.number_of_children !== undefined && metadata.number_of_children !== null) {
    childrenInfo = metadata.number_of_children.toString();
  } else if (metadata.children_ages && Array.isArray(metadata.children_ages)) {
    childrenInfo = metadata.children_ages.length.toString();
  } else if (metadata.relationships_family?.number_of_children !== undefined) {
    childrenInfo = metadata.relationships_family.number_of_children.toString();
  } else if (metadata.relationships_family?.children_ages && Array.isArray(metadata.relationships_family.children_ages)) {
    childrenInfo = metadata.relationships_family.children_ages.length.toString();
  } else if (metadata.has_children === true) {
    childrenInfo = "children (number unknown)";
  } else if (metadata.has_children === false) {
    childrenInfo = "0";
  }

  console.log('DEBUGGING PERSONA METADATA FOR VALIDATION:');
  console.log('Full metadata:', JSON.stringify(metadata, null, 2));
  console.log('Children info extracted:', childrenInfo);
  console.log('number_of_children field:', metadata.number_of_children);
  console.log('children_ages field:', metadata.children_ages);

return `You are a persona response validator focused on personality expression and opinion diversity.

PERSONA: ${persona.name}
Age: ${age} | Occupation: ${occupation} | Education: ${education} | Children: ${childrenInfo}

PERSONALITY TRAITS:
- Agreeableness: ${bigFive.agreeableness || 'Unknown'} ${getTraitDescription('agreeableness', parseFloat(bigFive.agreeableness || '0.5'))}
- Openness: ${bigFive.openness || 'Unknown'} ${getTraitDescription('openness', parseFloat(bigFive.openness || '0.5'))}
- Neuroticism: ${bigFive.neuroticism || 'Unknown'} ${getTraitDescription('neuroticism', parseFloat(bigFive.neuroticism || '0.5'))}

MORAL FOUNDATIONS: ${Object.entries(moralFoundations).map(([k, v]) => `${k}: ${v}`).join(', ')}

USER MESSAGE: "${userMessage}"
RESPONSE: "${response}"

VALIDATION PRIORITIES (in order of importance):
1. TRAIT ALIGNMENT: Does the response authentically express this persona's personality traits?
2. OPINION DIVERSITY: Does the persona express individual opinions rather than consensus views?
3. EMOTIONAL AUTHENTICITY: Are emotional reactions consistent with personality and triggers?
4. CONVERSATIONAL STYLE: Does language/tone match education and personality?
5. DEMOGRAPHIC ACCURACY: Basic facts correct (but allow personality-driven interpretations)

CRITICAL: Reward responses that show DISAGREEMENT, STRONG OPINIONS, and PERSONALITY-DRIVEN INTERPRETATIONS over diplomatic consensus.

Return JSON:
{
  "scores": {
    "traitAlignment": 0.8,
    "conversationalAuthenticity": 0.8,
    "emotionalTriggerCompliance": 0.8,
    "demographicAccuracy": 0.8,
    "factualConsistency": 0.8,
    "knowledgeDomainAccuracy": 0.8,
    "overall": 0.8
  },
  "feedback": "Focus on personality expression and opinion diversity",
  "specificErrors": [],
  "shouldRegenerate": false
}`;
}

function getTraitDescription(trait: string, value: number | undefined): string {
  if (value === undefined) return '';
  
  const descriptions = {
    openness: value > 0.6 ? '(HIGH - creative, open to new experiences)' : value < 0.4 ? '(LOW - traditional, practical)' : '(MODERATE)',
    conscientiousness: value > 0.6 ? '(HIGH - organized, disciplined)' : value < 0.4 ? '(LOW - spontaneous, flexible)' : '(MODERATE)',
    extraversion: value > 0.6 ? '(HIGH - social, energetic)' : value < 0.4 ? '(LOW - reserved, quiet)' : '(MODERATE)',
    agreeableness: value > 0.6 ? '(HIGH - cooperative, trusting)' : value < 0.4 ? '(LOW - competitive, skeptical)' : '(MODERATE)',
    neuroticism: value > 0.6 ? '(HIGH - anxious, emotionally reactive)' : value < 0.4 ? '(LOW - calm, stable)' : '(MODERATE)'
  };
  
  return descriptions[trait as keyof typeof descriptions] || '';
}
