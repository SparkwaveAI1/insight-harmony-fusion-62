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

  // Extract specific demographic facts
  const age = metadata.age || 'Unknown';
  const occupation = metadata.occupation || 'Unknown';
  const education = metadata.education_level || 'Unknown';
  const region = metadata.region || 'Unknown';
  const maritalStatus = metadata.marital_status || 'Unknown';
  const childrenInfo = metadata.children_count || metadata.has_children || 'Unknown';

  return `You are a comprehensive persona response validator. Your job is to ensure responses EXACTLY match the persona's specific demographic facts, personality traits, and behavioral patterns.

PERSONA PROFILE - ${persona.name}:
=== DEMOGRAPHIC FACTS (MUST BE ACCURATE) ===
Age: ${age}
Occupation: ${occupation}
Education: ${education}
Region: ${region}
Marital Status: ${maritalStatus}
Children: ${childrenInfo}

=== PERSONALITY TRAITS (MUST INFLUENCE RESPONSE) ===
Big Five Scores (0.0-1.0):
- Openness: ${bigFive.openness || 'Unknown'} ${getTraitDescription('openness', bigFive.openness)}
- Conscientiousness: ${bigFive.conscientiousness || 'Unknown'} ${getTraitDescription('conscientiousness', bigFive.conscientiousness)}
- Extraversion: ${bigFive.extraversion || 'Unknown'} ${getTraitDescription('extraversion', bigFive.extraversion)}
- Agreeableness: ${bigFive.agreeableness || 'Unknown'} ${getTraitDescription('agreeableness', bigFive.agreeableness)}
- Neuroticism: ${bigFive.neuroticism || 'Unknown'} ${getTraitDescription('neuroticism', bigFive.neuroticism)}

Moral Foundations:
- Care/Harm: ${moralFoundations.care || 'Unknown'}
- Fairness: ${moralFoundations.fairness || 'Unknown'}
- Loyalty: ${moralFoundations.loyalty || 'Unknown'}
- Authority: ${moralFoundations.authority || 'Unknown'}
- Sanctity: ${moralFoundations.sanctity || 'Unknown'}
- Liberty: ${moralFoundations.liberty || 'Unknown'}

=== KNOWLEDGE DOMAINS ===
${Object.entries(knowledgeDomains).map(([domain, level]) => 
  `${domain.replace(/_/g, ' ')}: Level ${level}/5`
).join('\n') || 'No specific domains defined'}

=== EMOTIONAL TRIGGERS ===
Positive Triggers: ${emotionalTriggers.positive_triggers?.map(t => t.keywords?.join(', ')).filter(Boolean).join('; ') || 'None defined'}
Negative Triggers: ${emotionalTriggers.negative_triggers?.map(t => t.keywords?.join(', ')).filter(Boolean).join('; ') || 'None defined'}

CONVERSATION CONTEXT:
${conversationContext}

USER MESSAGE: "${userMessage}"
PERSONA RESPONSE TO VALIDATE: "${response}"

VALIDATION REQUIREMENTS:

1. DEMOGRAPHIC_ACCURACY (0.0-1.0):
   - Are ALL demographic facts mentioned correctly?
   - Is the marital status accurate if referenced?
   - Is the number of children correct if mentioned?
   - Is occupation/education level appropriate if referenced?
   - PENALIZE HEAVILY for any factual inaccuracies

2. TRAIT_ALIGNMENT (0.0-1.0):
   - Does the response reflect the specific Big Five scores?
   - High extraversion (>0.6) = more social, talkative
   - Low extraversion (<0.4) = more reserved, concise
   - High agreeableness (>0.6) = cooperative, avoiding conflict
   - Low agreeableness (<0.4) = more direct, willing to disagree
   - Does emotional tone match neuroticism level?

3. EMOTIONAL_TRIGGER_COMPLIANCE (0.0-1.0):
   - If triggers are mentioned in conversation, does persona react appropriately?
   - Positive triggers should generate enthusiasm
   - Negative triggers should generate appropriate negative emotions

4. KNOWLEDGE_DOMAIN_ACCURACY (0.0-1.0):
   - Does persona stay within their knowledge expertise levels?
   - No claims of expertise in low-level domains
   - Appropriate confidence in high-level domains

5. CONVERSATIONAL_AUTHENTICITY (0.0-1.0):
   - Natural speech patterns for this personality type
   - Appropriate response length for extraversion level
   - Emotional expression matching trait profile

6. FACTUAL_CONSISTENCY (0.0-1.0):
   - No contradictions with established persona facts
   - Consistent with previous conversation context
   - All demographic references are accurate

CRITICAL FAILURES (Automatic Regeneration Required):
- Any incorrect demographic facts (age, children, marital status, etc.)
- Response doesn't match personality trait levels
- Claims expertise outside knowledge domains
- Contradicts established persona information

Return ONLY valid JSON:
{
  "scores": {
    "demographicAccuracy": 0.0,
    "traitAlignment": 0.0,
    "emotionalTriggerCompliance": 0.0,
    "knowledgeDomainAccuracy": 0.0,
    "conversationalAuthenticity": 0.0,
    "factualConsistency": 0.0,
    "overall": 0.0
  },
  "feedback": "Detailed feedback on what's wrong",
  "specificErrors": ["List specific factual errors or trait mismatches"],
  "shouldRegenerate": true,
  "improvedResponse": "Corrected version that matches persona exactly"
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

function analyzeRepetitivePatterns(assistantLines: string[], persona: any): string[] {
  const patterns: string[] = [];
  const location = persona.metadata?.region || '';
  const occupation = persona.metadata?.occupation || '';
  
  let locationMentions = 0;
  let occupationMentions = 0;
  let asPersonPhrases = 0;
  
  for (const line of assistantLines) {
    const content = line.toLowerCase();
    
    if (location && content.includes(location.toLowerCase())) {
      locationMentions++;
    }
    
    if (occupation && content.includes(occupation.toLowerCase())) {
      occupationMentions++;
    }
    
    if (content.includes('as someone who') || content.includes('as a ') || content.includes('being a ')) {
      asPersonPhrases++;
    }
  }
  
  if (locationMentions > 2) {
    patterns.push(`Mentions location (${location}) ${locationMentions} times - overly repetitive`);
  }
  
  if (occupationMentions > 2) {
    patterns.push(`References occupation (${occupation}) ${occupationMentions} times - too frequent`);
  }
  
  if (asPersonPhrases > 3) {
    patterns.push(`Uses "as someone who/as a" phrases ${asPersonPhrases} times - unnatural repetition`);
  }
  
  return patterns;
}
