
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

return `You are a fast persona response validator. Quickly check if the response matches basic persona facts.

PERSONA: ${persona.name}
Age: ${age} | Occupation: ${occupation} | Children: ${childrenInfo}

USER MESSAGE: "${userMessage}"
RESPONSE: "${response}"

Check ONLY:
1. Basic demographic facts are correct
2. Response tone matches personality (Extraversion: ${bigFive.extraversion || 'Unknown'})

Return JSON:
{
  "scores": {
    "demographicAccuracy": 0.8,
    "traitAlignment": 0.8,
    "emotionalTriggerCompliance": 0.8,
    "knowledgeDomainAccuracy": 0.8,
    "conversationalAuthenticity": 0.8,
    "factualConsistency": 0.8,
    "overall": 0.8
  },
  "feedback": "Brief feedback",
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
