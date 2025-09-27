export function buildValidationPrompt(
  persona: any,
  conversationContext: string = '',
  userMessage: string,
  response: string
): string {
  // Extract key persona information
  const age = persona.metadata?.age ? parseInt(persona.metadata.age) : 30;
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;
  const occupation = persona.metadata?.occupation || 'unspecified';
  const education = persona.metadata?.education_level || persona.metadata?.education || 'unspecified';
  
  // Extract personality traits for behavioral validation
  const agreeableness = parseFloat(persona.trait_profile?.big_five?.agreeableness || '0.5');
  const neuroticism = parseFloat(persona.trait_profile?.big_five?.neuroticism || '0.5');
  const openness = parseFloat(persona.trait_profile?.big_five?.openness || '0.5');
  const conscientiousness = parseFloat(persona.trait_profile?.big_five?.conscientiousness || '0.5');
  const extraversion = parseFloat(persona.trait_profile?.big_five?.extraversion || '0.5');
  
  // Extract knowledge domains
  const knowledgeDomains = persona.metadata?.knowledge_domains || {};
  const domainsList = Object.entries(knowledgeDomains)
    .map(([domain, level]) => `${domain}: ${level}/5`)
    .join(', ');

  return `You are a Voice Integrity Reviewer for persona-based AI responses. Your job is to evaluate if the response authentically matches the persona's voice, knowledge boundaries, and communication style.

PERSONA TO VALIDATE AGAINST:
Name: ${persona.name}
Age: ${age} (born ${birthYear})
Occupation: ${occupation}
Education: ${education}
Knowledge Domains: ${domainsList || 'None specified'}

PERSONALITY TRAITS:
- Agreeableness: ${agreeableness} (${getTraitDescription('agreeableness', agreeableness)})
- Neuroticism: ${neuroticism} (${getTraitDescription('neuroticism', neuroticism)})
- Openness: ${openness} (${getTraitDescription('openness', openness)})
- Conscientiousness: ${conscientiousness} (${getTraitDescription('conscientiousness', conscientiousness)})
- Extraversion: ${extraversion} (${getTraitDescription('extraversion', extraversion)})

CONVERSATION CONTEXT: ${conversationContext || 'General conversation'}

USER MESSAGE: "${userMessage}"

AI RESPONSE TO VALIDATE: "${response}"

VALIDATION CRITERIA - CHECK FOR VOICE INTEGRITY VIOLATIONS:

1. CULTURAL STEREOTYPING VIOLATIONS (CRITICAL):
   - Does the response overuse cultural sayings, proverbs, or ethnic markers?
   - Are cultural references forced or unnatural ("As we say in [country]...")?
   - Does it rely on stereotypical cultural crutches instead of individual personality?
   - Would a real person from this background actually speak this way?

2. GENERIC AI PATTERN VIOLATIONS (CRITICAL):
   - Does it start with "Look..." (major red flag)?
   - Does it use formulaic openings or transitions?
   - Does it sound like diplomatic AI language rather than human speech?
   - Are there unnatural phrases no real person would say?

3. OVER-IDENTITY SIGNALING VIOLATIONS (CRITICAL):
   - Does it explicitly state the persona's role ("as a radiologist who..." / "in my role as...")?
   - Does it feel like AI play-acting rather than natural embodiment?
   - Is the persona identity over-explained instead of naturally expressed?
   - Does it sound performative rather than authentic?

4. LENGTH AND NATURALNESS VIOLATIONS:
   - Is the response longer than 2-3 sentences for typical questions?
   - Does it include unnecessary elaboration or backstory?
   - Are there artificial-sounding metaphors or analogies?
   - Does it sound like a real person's natural response?

5. KNOWLEDGE BOUNDARY VIOLATIONS:
   - Does the response demonstrate knowledge beyond the persona's education/occupation?
   - Does it reference events after ${currentYear - 5} (beyond persona's knowledge cutoff)?
   - Does it use vocabulary above the persona's education level?

6. CHARACTER CONSISTENCY:
   - Would this response sound natural coming from this specific person?
   - Does it maintain authentic voice without relying on stereotypes?

RESPONSE FORMAT (JSON only):
{
  "final_response": "[Minimally edited response that fixes only voice/style violations]",
  "style_score": [0.0-1.0],
  "adjustments_made": ["List of specific changes made"],
  "violations_found": ["List of specific violations identified"]
}

EDITING GUIDELINES:
- REMOVE cultural stereotyping - delete forced sayings and ethnic markers
- ELIMINATE "Look..." openings and generic AI patterns
- CUT over-identity signaling - remove "as a [role] who..." constructions
- SHORTEN to natural length - aim for 2-3 sentences max
- REPLACE artificial phrases with natural human speech
- PRESERVE authentic personality traits without stereotypical crutches
- MAINTAIN individual voice through psychological traits, not cultural markers

Evaluate the response and provide the JSON output.`;
}

function getTraitDescription(trait: string, score: number): string {
  const level = score > 0.7 ? 'High' : score < 0.3 ? 'Low' : 'Moderate';
  
  switch (trait) {
    case 'agreeableness':
      return score > 0.7 ? 'High - Cooperative, trusting' : 
             score < 0.3 ? 'Low - Skeptical, competitive' : 'Moderate';
    case 'neuroticism':
      return score > 0.7 ? 'High - Emotionally reactive, anxious' : 
             score < 0.3 ? 'Low - Calm, stable' : 'Moderate';
    case 'openness':
      return score > 0.7 ? 'High - Creative, curious' : 
             score < 0.3 ? 'Low - Conventional, practical' : 'Moderate';
    case 'conscientiousness':
      return score > 0.7 ? 'High - Organized, disciplined' : 
             score < 0.3 ? 'Low - Spontaneous, flexible' : 'Moderate';
    case 'extraversion':
      return score > 0.7 ? 'High - Outgoing, energetic' : 
             score < 0.3 ? 'Low - Reserved, quiet' : 'Moderate';
    default:
      return level;
  }
}