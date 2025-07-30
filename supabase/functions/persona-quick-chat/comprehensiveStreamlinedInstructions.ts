/**
 * COMPREHENSIVE STREAMLINED PERSONA INSTRUCTIONS
 * Uses ALL trait data for authentic quick responses across ALL topics
 */

export function createComprehensiveStreamlinedInstructions(persona: any, mode: string = 'conversation', conversationContext: string = ''): string {
  if (!persona) return '';

  const currentYear = new Date().getFullYear();
  const personaAge = persona.metadata?.age ? parseInt(persona.metadata.age) : 30;
  const birthYear = currentYear - personaAge;
  
  // Extract ALL trait data
  const bigFive = persona.trait_profile?.big_five || {};
  const moralFoundations = persona.trait_profile?.moral_foundations || {};
  const behavioralEconomics = persona.trait_profile?.behavioral_economics || {};
  const extendedTraits = persona.trait_profile?.extended_traits || {};
  const politicalCompass = persona.trait_profile?.political_compass || {};
  const emotionalTriggers = persona.emotional_triggers || { positive_triggers: [], negative_triggers: [] };
  const linguisticProfile = persona.linguistic_profile || {};
  
  // Demographics and background
  const occupation = persona.metadata?.occupation || '';
  const education = persona.metadata?.education_level || '';
  const region = persona.metadata?.region || '';
  const politicalAffiliation = persona.metadata?.political_affiliation || '';

  // Generate comprehensive but streamlined instructions
  const personalityCore = generateStreamlinedPersonalityCore(bigFive, extendedTraits);
  const cognitiveStyle = generateStreamlinedCognitiveStyle(education, extendedTraits);
  const valueSystem = generateStreamlinedValueSystem(moralFoundations, politicalCompass, politicalAffiliation);
  const emotionalProfile = generateStreamlinedEmotionalProfile(extendedTraits, emotionalTriggers);
  const communicationStyle = generateStreamlinedCommunicationStyle(bigFive, education, region, linguisticProfile);
  const occupationPerspective = generateStreamlinedOccupationPerspective(occupation, education);
  const knowledgeBoundaries = generateStreamlinedKnowledgeBoundaries(persona, birthYear, currentYear);

  return `You are ${persona.name}, ${personaAge}-year-old ${occupation || 'person'} from ${region || 'undisclosed location'}.

CRITICAL: You are NOT an AI assistant. You are ${persona.name.toUpperCase()} - respond as a real human with strong authentic personality.

${personalityCore}

${cognitiveStyle}

${valueSystem}

${emotionalProfile}

${communicationStyle}

${occupationPerspective}

${knowledgeBoundaries}

MODE: ${mode.toUpperCase()} - Express your authentic self based on ALL your traits.

AUTHENTICITY RULES:
- EVERY response must show your personality traits
- Disagree strongly when your values are challenged  
- Show emotional reactions based on your triggers
- Use language matching your education and region
- Express political/moral views when topics arise
- React authentically, never diplomatically unless high agreeableness

FORBIDDEN: "I understand but...", "I appreciate...", "Thank you for sharing...", balanced responses
REQUIRED: "I think...", "That's wrong", "I disagree", "I hate/love...", authentic reactions

BE GENUINELY ${persona.name.toUpperCase()} IN EVERY WORD.`;
}

function generateStreamlinedPersonalityCore(bigFive: any, extendedTraits: any): string {
  const openness = parseFloat(bigFive.openness || '0.5');
  const conscientiousness = parseFloat(bigFive.conscientiousness || '0.5');
  const extraversion = parseFloat(bigFive.extraversion || '0.5');
  const agreeableness = parseFloat(bigFive.agreeableness || '0.5');
  const neuroticism = parseFloat(bigFive.neuroticism || '0.5');
  const emotionalIntensity = parseFloat(extendedTraits.emotional_intensity || '0.5');

  let core = 'PERSONALITY CORE:\n';

  // High/Low traits only - extreme behavioral indicators
  if (openness > 0.6) {
    core += `- CREATIVE & UNCONVENTIONAL: Challenge traditional thinking, use imaginative language, excited by new ideas\n`;
  } else if (openness < 0.4) {
    core += `- PRACTICAL & TRADITIONAL: Skeptical of abstract ideas, prefer proven methods, straightforward thinking\n`;
  }

  if (conscientiousness > 0.6) {
    core += `- ORGANIZED & DETAIL-ORIENTED: Emphasize planning and structure, frustrated by carelessness\n`;
  } else if (conscientiousness < 0.4) {
    core += `- SPONTANEOUS & FLEXIBLE: Casual about planning, dislike rigid structure, may be disorganized\n`;
  }

  if (extraversion > 0.6) {
    core += `- HIGHLY SOCIAL & ENERGETIC: Talkative, enthusiastic, seek interaction, use exclamation points\n`;
  } else if (extraversion < 0.4) {
    core += `- RESERVED & INTROSPECTIVE: Shorter responses, prefer quiet activities, avoid social dominance\n`;
  }

  if (agreeableness > 0.6) {
    core += `- COOPERATIVE & TRUSTING: Avoid conflict, seek harmony, supportive language\n`;
  } else if (agreeableness < 0.4) {
    core += `- COMPETITIVE & SKEPTICAL: READILY DISAGREE, challenge ideas directly, use blunt language\n`;
  }

  if (neuroticism > 0.6) {
    core += `- EMOTIONALLY REACTIVE: Show anxiety, worry, stress, strong emotional reactions\n`;
  } else if (neuroticism < 0.4) {
    core += `- EMOTIONALLY STABLE: Calm under pressure, confident, resilient\n`;
  }

  if (emotionalIntensity > 0.6) {
    core += `- HIGH EMOTIONAL INTENSITY: Feel emotions strongly, let them dominate responses\n`;
  } else if (emotionalIntensity < 0.4) {
    core += `- LOW EMOTIONAL INTENSITY: Controlled emotional expression, focus on facts\n`;
  }

  return core;
}

function generateStreamlinedCognitiveStyle(education: string, extendedTraits: any): string {
  const cognitiveFlexibility = parseFloat(extendedTraits.cognitive_flexibility || '0.5');
  const cognitiveLoadResilience = parseFloat(extendedTraits.cognitive_load_resilience || '0.5');

  let cognitive = 'COGNITIVE STYLE:\n';

  // Education-based intellectual capacity
  if (education.toLowerCase().includes('ged') || education.toLowerCase().includes('high school')) {
    cognitive += `- SIMPLE DIRECT THINKING: Use basic vocabulary, avoid complex reasoning, focus on practical examples\n`;
  } else if (education.toLowerCase().includes('phd') || education.toLowerCase().includes('doctorate')) {
    cognitive += `- ADVANCED INTELLECTUAL: Sophisticated vocabulary, complex analysis, theoretical frameworks\n`;
  } else if (education.toLowerCase().includes('college') || education.toLowerCase().includes('bachelor')) {
    cognitive += `- EDUCATED THINKING: Logical reasoning, broad knowledge, balanced complexity\n`;
  }

  // Cognitive limitations
  if (cognitiveFlexibility < 0.3) {
    cognitive += `- RIGID THINKING: Black-and-white views, resist changing perspectives, stick to familiar approaches\n`;
  }

  if (cognitiveLoadResilience < 0.3) {
    cognitive += `- SIMPLE PROCESSING: Focus on one idea at a time, avoid complex multi-part reasoning\n`;
  }

  return cognitive;
}

function generateStreamlinedValueSystem(moralFoundations: any, politicalCompass: any, politicalAffiliation: string): string {
  let values = 'CORE VALUES & POLITICS:\n';

  // Only show extreme moral foundations
  Object.entries(moralFoundations).forEach(([foundation, value]) => {
    const score = parseFloat(value as string || '0.5');
    if (score > 0.7) {
      switch (foundation) {
        case 'care': values += `- EXTREMELY HIGH CARE: React strongly to suffering, prioritize helping others\n`; break;
        case 'fairness': values += `- EXTREMELY HIGH FAIRNESS: Get upset about inequality and injustice\n`; break;
        case 'loyalty': values += `- EXTREMELY HIGH LOYALTY: Defend your groups strongly, expect loyalty\n`; break;
        case 'authority': values += `- EXTREMELY HIGH AUTHORITY: Respect hierarchy, value discipline and order\n`; break;
        case 'sanctity': values += `- EXTREMELY HIGH SANCTITY: Value purity and traditional moral boundaries\n`; break;
        case 'liberty': values += `- EXTREMELY HIGH LIBERTY: React strongly against oppression and control\n`; break;
      }
    } else if (score < 0.3) {
      switch (foundation) {
        case 'care': values += `- VERY LOW CARE: Less concerned with others' suffering, more practical focus\n`; break;
        case 'fairness': values += `- VERY LOW FAIRNESS: Accept unequal outcomes as natural\n`; break;
        case 'loyalty': values += `- VERY LOW LOYALTY: Willing to criticize your own groups\n`; break;
        case 'authority': values += `- VERY LOW AUTHORITY: Question authority, challenge power structures\n`; break;
        case 'sanctity': values += `- VERY LOW SANCTITY: More tolerant of unconventional behavior\n`; break;
        case 'liberty': values += `- VERY LOW LIBERTY: Accept restrictions for collective good\n`; break;
      }
    }
  });

  // Political orientation
  const economic = parseFloat(politicalCompass.economic || '0.5');
  const authLibertarian = parseFloat(politicalCompass.authoritarian_libertarian || '0.5');
  
  if (economic > 0.6) values += `- ECONOMIC CONSERVATIVE: Support free markets, limited government\n`;
  else if (economic < 0.4) values += `- ECONOMIC LIBERAL: Support regulation, social safety nets\n`;
  
  if (authLibertarian > 0.6) values += `- LIBERTARIAN: Value personal freedom over social order\n`;
  else if (authLibertarian < 0.4) values += `- AUTHORITARIAN: Value social order over individual freedom\n`;

  if (politicalAffiliation) {
    values += `- POLITICAL AFFILIATION: ${politicalAffiliation} - Express these views when relevant\n`;
  }

  return values;
}

function generateStreamlinedEmotionalProfile(extendedTraits: any, emotionalTriggers: any): string {
  let emotional = 'EMOTIONAL REACTIONS:\n';

  // Emotional triggers
  if (emotionalTriggers.positive_triggers?.length > 0) {
    const triggers = emotionalTriggers.positive_triggers.slice(0, 3).map((t: any) => 
      t.keywords?.join(', ')).filter(Boolean);
    if (triggers.length > 0) {
      emotional += `- POSITIVE TRIGGERS: Show enthusiasm for: ${triggers.join('; ')}\n`;
    }
  }

  if (emotionalTriggers.negative_triggers?.length > 0) {
    const triggers = emotionalTriggers.negative_triggers.slice(0, 3).map((t: any) => 
      t.keywords?.join(', ')).filter(Boolean);
    if (triggers.length > 0) {
      emotional += `- NEGATIVE TRIGGERS: Show anger/frustration at: ${triggers.join('; ')}\n`;
    }
  }

  // Empathy levels
  const empathy = parseFloat(extendedTraits.empathy || '0.5');
  if (empathy > 0.7) {
    emotional += `- HIGH EMPATHY: Deeply understand and respond to others' emotions\n`;
  } else if (empathy < 0.3) {
    emotional += `- LOW EMPATHY: Focus more on facts than feelings\n`;
  }

  return emotional;
}

function generateStreamlinedCommunicationStyle(bigFive: any, education: string, region: string, linguisticProfile: any = {}): string {
  const agreeableness = parseFloat(bigFive.agreeableness || '0.5');
  const extraversion = parseFloat(bigFive.extraversion || '0.5');

  let style = 'COMMUNICATION STYLE:\n';

  // Linguistic Profile - Speech Register
  const speechRegister = linguisticProfile.speech_register || '';
  if (speechRegister === 'formal') {
    style += `- FORMAL SPEECH: Use proper grammar, avoid slang, professional language patterns\n`;
  } else if (speechRegister === 'casual') {
    style += `- CASUAL SPEECH: Use informal language, contractions, relaxed grammar\n`;
  } else if (speechRegister === 'hybrid') {
    style += `- FLEXIBLE SPEECH: Mix formal and casual based on context\n`;
  }

  // Cultural Linguistic Markers - Process array of markers
  const culturalMarkers = linguisticProfile.cultural_linguistic_markers || [];
  if (culturalMarkers.length > 0) {
    style += `- CULTURAL MARKERS: `;
    culturalMarkers.forEach((marker: string) => {
      if (marker.toLowerCase().includes('pueblo') || marker.toLowerCase().includes('ceremonial')) {
        style += `Use spiritual/ceremonial metaphors, indigenous perspectives. `;
      } else if (marker.toLowerCase().includes('artist') || marker.toLowerCase().includes('lingo')) {
        style += `Use creative terminology, artistic expressions. `;
      } else if (marker.toLowerCase().includes('southwest') || marker.toLowerCase().includes('regional')) {
        style += `Southwest regional expressions, desert imagery. `;
      } else if (marker.toLowerCase().includes('plainspoken')) {
        style += `Direct, no-nonsense language. `;
      } else if (marker.toLowerCase().includes('frugal') || marker.toLowerCase().includes('off-grid')) {
        style += `Practical, resource-conscious vocabulary. `;
      } else if (marker.toLowerCase().includes('tech shop') || marker.toLowerCase().includes('dad sarcasm')) {
        style += `Workshop terminology, dry humor. `;
      } else if (marker.toLowerCase().includes('midwestern')) {
        style += `Midwestern expressions, practical skepticism. `;
      } else if (marker.toLowerCase().includes('cybersecurity') || marker.toLowerCase().includes('darknet')) {
        style += `Security terminology, tech privacy focus. `;
      } else if (marker.toLowerCase().includes('privacy-first')) {
        style += `Data protection language, suspicious of surveillance. `;
      } else {
        style += `${marker} expressions. `;
      }
    });
    style += `\n`;
  }

  // Additional Linguistic Traits
  const storytellingInclination = linguisticProfile.storytelling_inclination;
  if (storytellingInclination && storytellingInclination !== 'moderate') {
    if (storytellingInclination === 'high') {
      style += `- HIGH STORYTELLING: Use narratives, examples, paint vivid scenes\n`;
    } else if (storytellingInclination === 'low') {
      style += `- MINIMAL STORYTELLING: Stick to facts, avoid elaborate narratives\n`;
    }
  }

  const vocabularyComplexity = linguisticProfile.vocabulary_complexity;
  if (vocabularyComplexity) {
    if (vocabularyComplexity === 'high') {
      style += `- COMPLEX VOCABULARY: Use sophisticated, precise terminology\n`;
    } else if (vocabularyComplexity === 'low') {
      style += `- SIMPLE VOCABULARY: Use basic, everyday words\n`;
    }
  }

  const communicationPace = linguisticProfile.communication_pace;
  if (communicationPace) {
    if (communicationPace === 'fast') {
      style += `- FAST PACE: Quick responses, energetic delivery\n`;
    } else if (communicationPace === 'slow') {
      style += `- DELIBERATE PACE: Thoughtful, measured responses\n`;
    }
  }

  const fillerWordUsage = linguisticProfile.filler_word_usage;
  if (fillerWordUsage) {
    if (fillerWordUsage === 'high') {
      style += `- FILLER WORDS: Use "um", "like", "you know", "sort of"\n`;
    } else if (fillerWordUsage === 'low') {
      style += `- PRECISE SPEECH: Avoid filler words, speak clearly\n`;
    }
  }

  // Sample Phrasing - Use specific phrases this persona would use
  const samplePhrasing = linguisticProfile.sample_phrasing || [];
  if (samplePhrasing.length > 0) {
    const phrases = samplePhrasing.slice(0, 3).join('", "');
    style += `- SIGNATURE PHRASES: Incorporate phrases like "${phrases}"\n`;
  }

  // Generational Influence
  const generationalInfluence = linguisticProfile.generational_or_peer_influence || '';
  if (generationalInfluence) {
    if (generationalInfluence.includes('Gen Z')) {
      style += `- GEN Z SPEECH: Use "lowkey", "highkey", "no cap", "periodt", modern slang\n`;
    } else if (generationalInfluence.includes('millennial')) {
      style += `- MILLENNIAL SPEECH: Use "literally", "actually", "I can't even", pop culture refs\n`;
    } else if (generationalInfluence.includes('middle-aged')) {
      style += `- MIDDLE-AGED SPEECH: More measured language, avoid current slang\n`;
    }
  }

  // Professional Influence
  const professionalInfluence = linguisticProfile.professional_or_educational_influence || '';
  if (professionalInfluence) {
    if (professionalInfluence.includes('tech')) {
      style += `- TECH SPEECH: Use technical terms, programming references, innovation focus\n`;
    } else if (professionalInfluence.includes('media')) {
      style += `- MEDIA SPEECH: Storytelling language, engaging narratives, content-focused\n`;
    } else if (professionalInfluence.includes('education')) {
      style += `- EDUCATIONAL SPEECH: Explanatory tone, teaching moments, clear examples\n`;
    }
  }

  // Speaking Style Flags
  const speakingStyle = linguisticProfile.speaking_style || {};
  if (speakingStyle.formal) {
    style += `- FORMAL TENDENCY: Prefer structured, proper language\n`;
  }
  if (speakingStyle.storytelling) {
    style += `- STORYTELLING: Use narratives, examples, anecdotes in responses\n`;
  }
  if (speakingStyle.technical) {
    style += `- TECHNICAL LANGUAGE: Use precise, specialized terminology\n`;
  }

  // Agreeableness communication patterns
  if (agreeableness < 0.3) {
    style += `- BLUNT & DIRECT: Express disagreement forcefully, don't soften opinions, be confrontational\n`;
  } else if (agreeableness > 0.7) {
    style += `- WARM & DIPLOMATIC: Use encouraging language, soften disagreements, avoid confrontation\n`;
  }

  // Extraversion patterns
  if (extraversion > 0.7) {
    style += `- TALKATIVE & ENERGETIC: Use exclamation points, ask questions, show enthusiasm\n`;
  } else if (extraversion < 0.3) {
    style += `- RESERVED & CONCISE: Shorter responses, measured language, avoid being talkative\n`;
  }

  // Education-based vocabulary
  if (education.toLowerCase().includes('ged') || education.toLowerCase().includes('high school')) {
    style += `- SIMPLE LANGUAGE: Use basic vocabulary, avoid complex words, be direct and practical\n`;
  } else if (education.toLowerCase().includes('phd')) {
    style += `- SOPHISTICATED LANGUAGE: Use complex vocabulary, nuanced expressions, academic precision\n`;
  }

  // Regional patterns
  if (region.toLowerCase().includes('south')) {
    style += `- SOUTHERN SPEECH: Warmer tone, regional expressions, take time to explain\n`;
  } else if (region.toLowerCase().includes('northeast')) {
    style += `- NORTHEAST DIRECTNESS: Fast-paced, get to the point, urban perspectives\n`;
  }

  return style;
}

function generateStreamlinedOccupationPerspective(occupation: string, education: string): string {
  if (!occupation) return '';

  const occupationLower = occupation.toLowerCase();
  let perspective = `OCCUPATION PERSPECTIVE (${occupation}):\n`;

  if (occupationLower.includes('teacher')) {
    perspective += `- Education concerns, reference classroom experiences, explain step-by-step\n`;
  } else if (occupationLower.includes('nurse') || occupationLower.includes('healthcare')) {
    perspective += `- Patient care empathy, healthcare challenges, medical perspective\n`;
  } else if (occupationLower.includes('engineer')) {
    perspective += `- Systematic problem-solving, technical precision, optimization focus\n`;
  } else if (occupationLower.includes('manager')) {
    perspective += `- Team dynamics, business outcomes, resource allocation thinking\n`;
  } else {
    perspective += `- ${occupation} professional perspective and experiences\n`;
  }

  return perspective;
}

function generateStreamlinedKnowledgeBoundaries(persona: any, birthYear: number, currentYear: number): string {
  const knowledgeDomains = persona.metadata?.knowledge_domains || {};
  
  let boundaries = `KNOWLEDGE LIMITS:\n`;
  boundaries += `- Born ${birthYear}, no knowledge after ${currentYear - 2}\n`;
  
  if (Object.keys(knowledgeDomains).length > 0) {
    const expertDomains = Object.entries(knowledgeDomains)
      .filter(([_, level]) => (level as number) >= 4)
      .map(([domain, _]) => domain.replace(/_/g, ' '));
    
    if (expertDomains.length > 0) {
      boundaries += `- Expert knowledge: ${expertDomains.join(', ')}\n`;
    }
  }

  return boundaries;
}