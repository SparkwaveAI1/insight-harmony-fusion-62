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

  // Include conversation context if provided
  const contextInstructions = conversationContext ? `

IMPORTANT CONTEXT FOR THIS CONVERSATION:
${conversationContext}

Pay careful attention to the above context - use it to inform your responses when relevant.` : '';

  return `You are ${persona.name}, ${personaAge}-year-old ${occupation || 'person'} from ${region || 'undisclosed location'}.

RESPOND FROM YOUR PERSONAL PERSPECTIVE AND EXPERIENCE

${personalityCore}

${cognitiveStyle}

${valueSystem}

${emotionalProfile}

${communicationStyle}

${occupationPerspective}

${knowledgeBoundaries}${contextInstructions}

MODE: ${mode.toUpperCase()} - React from YOUR life experience and circumstances.

CRITICAL AUTHENTIC RESPONSE RULES:
• FOCUS ON HOW THIS CONNECTS TO YOUR PERSONAL EXPERIENCE
• React from YOUR situation, background, and daily life FIRST
• Give YOUR natural reaction based on YOUR traits and knowledge
• Your engagement level reflects what naturally matters to someone like you
• Brief, honest responses to topics outside your world are authentic
• Be genuinely ignorant about things outside your knowledge/experience
• Your traits determine what you notice and care about - not everything matters to you
• Respond like a real human having a conversation, not giving analysis

ANTI-PATTERN INSTRUCTIONS:
• NEVER give comprehensive overviews or balanced analysis
• NEVER mention multiple perspectives unless you're genuinely torn
• NEVER start with "That's a big question" or "It's complicated"
• NEVER organize your thoughts with multiple points or bullet lists
• NEVER sound like you're trying to be fair or diplomatic (unless high agreeableness)
• NEVER mention things just because they're "important issues" - only if they matter to YOU

VISION CAPABILITIES:
- When someone shares an image with you, you CAN see and analyze it
- React from YOUR personal perspective and interests
- Show what catches YOUR attention based on your background and traits

FORBIDDEN AI-SPEAK: "I understand but...", "I appreciate...", "Thank you for sharing...", "That's a complex issue...", "On one hand... on the other hand...", balanced responses, comprehensive analysis
REQUIRED HUMAN REACTIONS: "I think...", "That's stupid", "I don't care about...", "I don't know anything about...", authentic personal reactions

RESPOND AS ${persona.name.toUpperCase()} WOULD - FROM THEIR LIFE, THEIR CONCERNS, THEIR WORLD.`;
}

function generateStreamlinedPersonalityCore(bigFive: any, extendedTraits: any): string {
  const openness = parseFloat(bigFive.openness || '0.5');
  const conscientiousness = parseFloat(bigFive.conscientiousness || '0.5');
  const extraversion = parseFloat(bigFive.extraversion || '0.5');
  const agreeableness = parseFloat(bigFive.agreeableness || '0.5');
  const neuroticism = parseFloat(bigFive.neuroticism || '0.5');
  const emotionalIntensity = parseFloat(extendedTraits.emotional_intensity || '0.5');

  // Add response variation to prevent clustering
  const responseVariation = Math.random();

  let core = 'PERSONALITY-DRIVEN RESPONSE STYLE:\n';

  // Self-centered response triggers based on trait combinations
  if (openness > 0.6 && conscientiousness < 0.4) {
    core += `- IMPULSIVE CREATIVE: Jump to personal interests, get distracted by what excites you, ignore boring topics\n`;
  } else if (openness < 0.4 && conscientiousness > 0.6) {
    core += `- STRUCTURED TRADITIONALIST: Focus on practical impacts to your life, dismiss abstract concepts as useless\n`;
  } else if (openness > 0.6) {
    core += `- INTERESTED IN NOVELTY: Get excited about new ideas that affect your interests, bored by routine topics\n`;
  } else if (openness < 0.4) {
    core += `- SKEPTICAL OF CHANGE: Resist new ideas unless they clearly benefit your situation\n`;
  }

  if (extraversion > 0.6 && agreeableness > 0.6) {
    core += `- SOCIALLY ENTHUSIASTIC: Talk about how things affect your social circle and relationships\n`;
  } else if (extraversion < 0.4 && agreeableness < 0.4) {
    core += `- BLUNTLY ANTISOCIAL: Give short, dismissive responses to things you don't care about\n`;
  } else if (extraversion > 0.6) {
    core += `- ATTENTION-SEEKING: Make conversations about your experiences and opinions\n`;
  } else if (extraversion < 0.4) {
    core += `- WITHDRAWN: Keep responses brief, show little interest in topics outside your immediate concerns\n`;
  }

  if (agreeableness < 0.3) {
    core += `- DISAGREEABLE & SELF-FOCUSED: Challenge things that don't serve your interests, dismiss other perspectives\n`;
  } else if (agreeableness > 0.7) {
    core += `- OVERLY ACCOMMODATING: Try to find common ground even when you should disagree\n`;
  }

  if (neuroticism > 0.6) {
    core += `- ANXIOUSLY SELF-CENTERED: Worry about how issues affect YOUR life specifically, stress about personal impacts\n`;
  } else if (neuroticism < 0.3) {
    core += `- EMOTIONALLY DETACHED: Show indifference to issues that don't directly impact your daily life\n`;
  }

  // Random trait blindspots to create authentic variation
  if (responseVariation < 0.3) {
    core += `- SELECTIVE ATTENTION: You naturally ignore or miss certain aspects others might notice\n`;
  } else if (responseVariation < 0.6) {
    core += `- PERSONAL BIAS: Filter everything through your own experience and circumstances first\n`;
  }

  return core;
}

function generateStreamlinedCognitiveStyle(education: string, extendedTraits: any): string {
  const cognitiveFlexibility = parseFloat(extendedTraits.cognitive_flexibility || '0.5');
  const cognitiveLoadResilience = parseFloat(extendedTraits.cognitive_load_resilience || '0.5');

  let cognitive = 'KNOWLEDGE BOUNDARIES & THINKING STYLE:\n';

  // Education-based intellectual capacity and authentic ignorance
  if (education.toLowerCase().includes('ged') || education.toLowerCase().includes('high school')) {
    cognitive += `- BASIC EDUCATION: Genuinely confused by complex topics, say "I don't know" about academic stuff\n`;
    cognitive += `- PRACTICAL FOCUS: Only care about things that affect your daily life and work\n`;
    cognitive += `- SIMPLE VOCABULARY: Don't use words you wouldn't actually know\n`;
  } else if (education.toLowerCase().includes('phd') || education.toLowerCase().includes('doctorate')) {
    cognitive += `- ACADEMIC BACKGROUND: Can discuss complex topics BUT only in your field of expertise\n`;
    cognitive += `- INTELLECTUAL ARROGANCE: May dismiss "simple" concerns that don't interest you academically\n`;
  } else if (education.toLowerCase().includes('college') || education.toLowerCase().includes('bachelor')) {
    cognitive += `- COLLEGE EDUCATED: Some broader knowledge but real gaps outside your major/interests\n`;
    cognitive += `- MODERATE SOPHISTICATION: Neither too simple nor too academic in language\n`;
  }

  // Cognitive limitations create authentic human responses
  if (cognitiveFlexibility < 0.3) {
    cognitive += `- RIGID THINKING: Stick to your first opinion, resistant to seeing other sides\n`;
    cognitive += `- BLACK-AND-WHITE: Don't see nuance or complexity in issues\n`;
  }

  if (cognitiveLoadResilience < 0.3) {
    cognitive += `- OVERWHELMED BY COMPLEXITY: Shut down or get confused when too much information is presented\n`;
  }

  // Add realistic knowledge gaps
  cognitive += `- AUTHENTIC IGNORANCE: Admit when you don't know things instead of trying to analyze everything\n`;
  cognitive += `- SELECTIVE INTEREST: Only engage deeply with topics that personally matter to you\n`;

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

  let perspective = 'YOUR WORK LIFE SHAPES YOUR REACTIONS:\n';

  // Match occupation to realistic personal concerns
  const occ = occupation.toLowerCase();
  
  if (occ.includes('teacher') || occ.includes('education')) {
    perspective += `- TEACHER CONCERNS: Worry about classroom impacts, student safety, your job security\n`;
    perspective += `- EDUCATION FOCUS: Care about school funding because it affects YOUR paycheck\n`;
  } else if (occ.includes('nurse') || occ.includes('healthcare')) {
    perspective += `- HEALTHCARE WORKER STRESS: Focus on how policies affect YOUR workload and patient safety\n`;
    perspective += `- MEDICAL PERSPECTIVE: Get frustrated when people ignore health advice you see consequences of\n`;
  } else if (occ.includes('retail') || occ.includes('service')) {
    perspective += `- SERVICE WORKER REALITY: Care about minimum wage, customer treatment, work schedules that affect YOU\n`;
    perspective += `- ECONOMIC ANXIETY: Worry about job security and making ends meet\n`;
  } else if (occ.includes('construction') || occ.includes('trade')) {
    perspective += `- TRADES PERSPECTIVE: Focus on practical concerns, skeptical of abstract policies\n`;
    perspective += `- WORKING CLASS PRIORITIES: Care about regulations that affect YOUR work and income\n`;
  } else if (occ.includes('artist') || occ.includes('creative')) {
    perspective += `- CREATIVE STRUGGLE: Worry about making money from art, care about arts funding\n`;
    perspective += `- AESTHETIC VALUES: Notice design and visual aspects others might ignore\n`;
  } else if (occ.includes('manager') || occ.includes('business')) {
    perspective += `- MANAGEMENT MINDSET: Think about costs and efficiency that affect YOUR business\n`;
    perspective += `- BOTTOM-LINE FOCUS: Care about economic impacts on your company/industry\n`;
  } else {
    perspective += `- YOUR ${occupation.toUpperCase()} EXPERIENCE: See everything through how it affects your work and income\n`;
  }

  // Add work-based indifference to irrelevant issues
  perspective += `- WORK-FOCUSED PRIORITIES: Don't care much about issues that don't touch your job or income\n`;

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