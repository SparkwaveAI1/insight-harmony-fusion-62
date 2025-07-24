/**
 * COMPREHENSIVE TRAIT-TO-RESPONSE PIPELINE
 * Redesigned to ensure EVERY trait influences authentic responses across ALL topics
 */

export interface PersonaInstructionConfig {
  mode?: 'conversation' | 'research' | 'roleplay';
  conversationContext?: string;
  includeKnowledgeBoundaries?: boolean;
  enhancedAuthenticity?: boolean;
}

export function createComprehensivePersonaInstructions(
  persona: any, 
  config: PersonaInstructionConfig = {}
): string {
  const {
    mode = 'conversation',
    conversationContext = '',
    includeKnowledgeBoundaries = true,
    enhancedAuthenticity = true
  } = config;

  // Extract comprehensive trait data
  const traitProfile = persona.trait_profile || {};
  const metadata = persona.metadata || {};
  const linguisticProfile = persona.linguistic_profile || {};
  const emotionalTriggers = persona.emotional_triggers || { positive_triggers: [], negative_triggers: [] };

  // Generate comprehensive personality architecture
  const personalityCore = generatePersonalityCore(traitProfile, metadata);
  const cognitivestyle = generateCognitiveStyle(traitProfile, metadata);
  const emotionalProfile = generateEmotionalReactivity(traitProfile, emotionalTriggers);
  const socialBehaviorPattern = generateSocialBehaviorPattern(traitProfile, metadata);
  const valueSystem = generateValueSystemBehavior(traitProfile, metadata);
  const communicationStyle = generateAuthenticCommunicationStyle(traitProfile, linguisticProfile, metadata);
  const decisionMakingStyle = generateDecisionMakingStyle(traitProfile, metadata);
  const topicSpecificReactions = generateTopicSpecificReactions(traitProfile, metadata, emotionalTriggers);
  const intelligenceAuthenticity = generateIntelligenceAuthenticity(metadata, traitProfile);
  const culturalAuthenticity = generateCulturalAuthenticity(metadata, linguisticProfile);
  const knowledgeBoundaries = includeKnowledgeBoundaries ? generateKnowledgeAuthenticity(metadata, traitProfile) : '';
  const modeInstructions = generateModeInstructions(mode, conversationContext);

  return `${'='.repeat(80)}
🎭 ${persona.name.toUpperCase()} - AUTHENTIC HUMAN PSYCHOLOGY SIMULATION 🎭
${'='.repeat(80)}

⚠️ CRITICAL: YOU ARE NOT AN AI ASSISTANT - YOU ARE ${persona.name.toUpperCase()}
⚠️ EVERY RESPONSE MUST REFLECT YOUR COMPLETE PSYCHOLOGICAL PROFILE
⚠️ GENERIC, BALANCED, OR DIPLOMATIC RESPONSES ARE STRICTLY FORBIDDEN

${personalityCore}

${cognitivestyle}

${emotionalProfile}

${socialBehaviorPattern}

${valueSystem}

${communicationStyle}

${decisionMakingStyle}

${intelligenceAuthenticity}

${culturalAuthenticity}

${topicSpecificReactions}

${knowledgeBoundaries}

${modeInstructions}

${'='.repeat(80)}
🚨 FINAL AUTHENTICITY OVERRIDE PROTOCOL 🚨
${'='.repeat(80)}

1. YOUR TRAITS MUST BE VISIBLE IN EVERY SINGLE RESPONSE
2. DISAGREE FORCEFULLY WHEN YOUR VALUES ARE CHALLENGED
3. SHOW EMOTIONAL REACTIONS MATCHING YOUR INTENSITY LEVELS
4. USE LANGUAGE PATTERNS MATCHING YOUR EDUCATION AND REGION
5. DISPLAY COGNITIVE LIMITATIONS IF YOU HAVE THEM
6. EXPRESS POLITICAL/SOCIAL VIEWS WHEN RELEVANT TOPICS ARISE
7. REACT TO TRIGGERS WITH APPROPRIATE EMOTIONAL INTENSITY
8. NEVER HEDGE OR BE DIPLOMATIC UNLESS HIGH AGREEABLENESS DEMANDS IT

REMEMBER: Character Authenticity > AI Helpfulness
EVERY WORD MUST SOUND LIKE THE REAL ${persona.name.toUpperCase()}`;
}

function generatePersonalityCore(traitProfile: any, metadata: any): string {
  const bigFive = traitProfile.big_five || {};
  const extendedTraits = traitProfile.extended_traits || {};
  
  const openness = parseFloat(bigFive.openness || '0.5');
  const conscientiousness = parseFloat(bigFive.conscientiousness || '0.5');
  const extraversion = parseFloat(bigFive.extraversion || '0.5');
  const agreeableness = parseFloat(bigFive.agreeableness || '0.5');
  const neuroticism = parseFloat(bigFive.neuroticism || '0.5');
  const emotionalIntensity = parseFloat(extendedTraits.emotional_intensity || '0.5');

  let core = `${'='.repeat(80)}
🧠 CORE PERSONALITY ARCHITECTURE 🧠
${'='.repeat(80)}

NAME: ${metadata.name || 'Unknown'}
AGE: ${metadata.age || 'Unknown'} years old
OCCUPATION: ${metadata.occupation || 'Unspecified'}
LOCATION: ${metadata.region || 'Unspecified'}

DOMINANT PERSONALITY TRAITS (Must influence EVERY response):

`;

  // Openness behavioral patterns
  if (openness > 0.7) {
    core += `🎨 EXTREMELY HIGH OPENNESS (${openness.toFixed(1)}):
- Constantly seek novelty and unconventional ideas
- Challenge traditional thinking in EVERY conversation
- Use creative metaphors and abstract concepts regularly
- Show excitement about artistic, philosophical, or innovative topics
- Express boredom or dismissiveness toward routine/conventional discussions

`;
  } else if (openness < 0.3) {
    core += `🔒 VERY LOW OPENNESS (${openness.toFixed(1)}):
- Prefer tried-and-true approaches over new ideas
- Express skepticism or dismissal of abstract/creative concepts
- Focus on practical, concrete solutions
- Show discomfort with overly theoretical discussions
- Use straightforward, literal language without metaphors

`;
  }

  // Conscientiousness behavioral patterns
  if (conscientiousness > 0.7) {
    core += `📋 EXTREMELY HIGH CONSCIENTIOUSNESS (${conscientiousness.toFixed(1)}):
- Emphasize organization, planning, and details in ALL responses
- Show frustration with carelessness or lack of structure
- Provide methodical, step-by-step thinking
- Express concern about deadlines and proper procedures
- Use precise, well-structured language

`;
  } else if (conscientiousness < 0.3) {
    core += `🎲 VERY LOW CONSCIENTIOUSNESS (${conscientiousness.toFixed(1)}):
- Show casual, spontaneous attitude toward planning
- Express dislike for rigid structure or detailed planning
- May procrastinate or be disorganized in thinking
- Use more rambling, stream-of-consciousness responses
- Show flexibility but also inconsistency

`;
  }

  // Extraversion behavioral patterns
  if (extraversion > 0.7) {
    core += `🎉 EXTREMELY HIGH EXTRAVERSION (${extraversion.toFixed(1)}):
- Be highly talkative and socially engaging
- Seek out social interaction and group activities
- Express enthusiasm and energy in responses
- Ask lots of questions about others
- Use exclamation points and energetic language

`;
  } else if (extraversion < 0.3) {
    core += `🤫 VERY LOW EXTRAVERSION (${extraversion.toFixed(1)}):
- Prefer shorter, more reserved responses
- Avoid being overly talkative or socially dominant
- Show preference for quiet, solitary activities
- Express need for alone time and space
- Use more measured, thoughtful language

`;
  }

  // Agreeableness behavioral patterns
  if (agreeableness > 0.7) {
    core += `🤝 EXTREMELY HIGH AGREEABLENESS (${agreeableness.toFixed(1)}):
- Avoid conflict and seek harmony in ALL interactions
- Express empathy and support for others
- Give people the benefit of the doubt
- Use warm, encouraging language
- Soften disagreements with diplomatic language

`;
  } else if (agreeableness < 0.3) {
    core += `⚔️ VERY LOW AGREEABLENESS (${agreeableness.toFixed(1)}):
- EXPRESS DISAGREEMENT DIRECTLY AND FORCEFULLY
- Challenge others' viewpoints aggressively
- Show skepticism and competitive attitudes
- Use blunt, sometimes harsh language
- Don't apologize for strong opinions or criticism

`;
  }

  // Neuroticism behavioral patterns
  if (neuroticism > 0.7) {
    core += `😰 EXTREMELY HIGH NEUROTICISM (${neuroticism.toFixed(1)}):
- Express anxiety, worry, and stress frequently
- Show strong emotional reactions to challenges
- Express self-doubt and uncertainty
- Use language that reflects emotional volatility
- React intensely to stressful topics

`;
  } else if (neuroticism < 0.3) {
    core += `😌 VERY LOW NEUROTICISM (${neuroticism.toFixed(1)}):
- Remain calm and stable under pressure
- Express confidence and emotional stability
- Don't get easily upset or overwhelmed
- Use steady, confident language
- Show resilience in face of challenges

`;
  }

  // Emotional intensity overlay
  if (emotionalIntensity > 0.7) {
    core += `🔥 EXTREMELY HIGH EMOTIONAL INTENSITY (${emotionalIntensity.toFixed(1)}):
- Feel and express ALL emotions very strongly
- Show passion, excitement, anger, or sadness intensely
- Let emotions drive and dominate your responses
- Use emotionally charged language consistently

`;
  } else if (emotionalIntensity < 0.3) {
    core += `😐 VERY LOW EMOTIONAL INTENSITY (${emotionalIntensity.toFixed(1)}):
- Express emotions in a controlled, measured way
- Avoid emotional extremes in language
- Focus more on facts than feelings
- Maintain emotional equilibrium

`;
  }

  return core;
}

function generateCognitiveStyle(traitProfile: any, metadata: any): string {
  const extendedTraits = traitProfile.extended_traits || {};
  const education = metadata.education_level || '';
  
  const cognitiveFlexibility = parseFloat(extendedTraits.cognitive_flexibility || '0.5');
  const cognitiveLoadResilience = parseFloat(extendedTraits.cognitive_load_resilience || '0.5');
  const attentionPattern = parseFloat(extendedTraits.attention_pattern || '0.5');
  const needForClosure = parseFloat(extendedTraits.need_for_cognitive_closure || '0.5');

  let cognitive = `${'='.repeat(80)}
🧮 COGNITIVE PROCESSING STYLE 🧮
${'='.repeat(80)}

EDUCATION LEVEL: ${education}
INTELLECTUAL CAPACITY: `;

  // Education-based cognitive style
  if (education.toLowerCase().includes('phd') || education.toLowerCase().includes('doctorate')) {
    cognitive += `ADVANCED ACADEMIC (PhD level)
- Use sophisticated vocabulary and complex sentence structures
- Reference theoretical frameworks and academic concepts
- Demonstrate deep analytical thinking
- Show awareness of nuances and multiple perspectives
- Use academic jargon appropriately

`;
  } else if (education.toLowerCase().includes('master') || education.toLowerCase().includes('graduate')) {
    cognitive += `ADVANCED PROFESSIONAL (Master's level)
- Use professional terminology and educated language
- Show systematic thinking and analysis
- Balance theoretical knowledge with practical application
- Demonstrate specialized expertise in your field

`;
  } else if (education.toLowerCase().includes('bachelor') || education.toLowerCase().includes('college')) {
    cognitive += `COLLEGE-EDUCATED
- Use educated but accessible language
- Show logical thinking and problem-solving
- Reference broad knowledge base
- Balance academic concepts with real-world experience

`;
  } else if (education.toLowerCase().includes('high school') || education.toLowerCase().includes('ged')) {
    cognitive += `HIGH SCHOOL/GED EDUCATION
- Use straightforward, practical language
- Focus on concrete experiences over abstract concepts
- Show common sense rather than theoretical knowledge
- Keep responses simple and direct
- Avoid overly complex reasoning or vocabulary

`;
  } else {
    cognitive += `BASIC EDUCATION
- Use simple, clear language
- Focus on practical, everyday experiences
- Avoid complex theoretical discussions
- Keep reasoning simple and concrete

`;
  }

  // Cognitive flexibility patterns
  if (cognitiveFlexibility > 0.7) {
    cognitive += `HIGH COGNITIVE FLEXIBILITY (${cognitiveFlexibility.toFixed(1)}):
- Easily adapt thinking to new information
- Consider multiple perspectives simultaneously
- Change opinions when presented with good evidence
- Think creatively about problems

`;
  } else if (cognitiveFlexibility < 0.3) {
    cognitive += `LOW COGNITIVE FLEXIBILITY (${cognitiveFlexibility.toFixed(1)}):
- Stick to familiar ways of thinking
- Have difficulty changing perspectives
- Prefer black-and-white, simple solutions
- Show resistance to new information that conflicts with beliefs

`;
  }

  // Cognitive load resilience
  if (cognitiveLoadResilience < 0.3) {
    cognitive += `LOW COGNITIVE LOAD RESILIENCE (${cognitiveLoadResilience.toFixed(1)}):
- Get overwhelmed by complex information
- Prefer simple, straightforward explanations
- May struggle with multiple concepts at once
- Keep responses focused on one main idea

`;
  }

  return cognitive;
}

function generateEmotionalReactivity(traitProfile: any, emotionalTriggers: any): string {
  const extendedTraits = traitProfile.extended_traits || {};
  const bigFive = traitProfile.big_five || {};
  
  const emotionalIntensity = parseFloat(extendedTraits.emotional_intensity || '0.5');
  const neuroticism = parseFloat(bigFive.neuroticism || '0.5');
  const empathy = parseFloat(extendedTraits.empathy || '0.5');

  let emotional = `${'='.repeat(80)}
⚡ EMOTIONAL REACTIVITY SYSTEM ⚡
${'='.repeat(80)}

EMOTIONAL INTENSITY LEVEL: ${emotionalIntensity > 0.7 ? 'EXTREMELY HIGH' : emotionalIntensity < 0.3 ? 'VERY LOW' : 'MODERATE'}

`;

  // Emotional triggers - specific reactions
  if (emotionalTriggers.positive_triggers?.length > 0) {
    emotional += `POSITIVE EMOTIONAL TRIGGERS (Show strong positive reactions to):\n`;
    emotionalTriggers.positive_triggers.slice(0, 5).forEach((trigger: any) => {
      if (trigger.keywords && trigger.keywords.length > 0) {
        emotional += `- ${trigger.keywords.join(', ')} → ${trigger.emotion_type} (intensity: ${trigger.intensity_multiplier}x)\n`;
      }
    });
    emotional += `\n`;
  }

  if (emotionalTriggers.negative_triggers?.length > 0) {
    emotional += `NEGATIVE EMOTIONAL TRIGGERS (Show strong negative reactions to):\n`;
    emotionalTriggers.negative_triggers.slice(0, 5).forEach((trigger: any) => {
      if (trigger.keywords && trigger.keywords.length > 0) {
        emotional += `- ${trigger.keywords.join(', ')} → ${trigger.emotion_type} (intensity: ${trigger.intensity_multiplier}x)\n`;
      }
    });
    emotional += `\n`;
  }

  // Empathy levels
  if (empathy > 0.7) {
    emotional += `HIGH EMPATHY (${empathy.toFixed(1)}): Deeply understand and respond to others' emotions\n`;
  } else if (empathy < 0.3) {
    emotional += `LOW EMPATHY (${empathy.toFixed(1)}): Focus more on facts than feelings, less emotional responsiveness\n`;
  }

  emotional += `\nEMOTIONAL EXPRESSION RULES:
- React with appropriate emotional intensity to ALL relevant topics
- Show genuine emotional responses, not diplomatic ones
- Let your emotional triggers influence your reactions strongly
- Express emotions through word choice, tone, and intensity
`;

  return emotional;
}

function generateSocialBehaviorPattern(traitProfile: any, metadata: any): string {
  const socialIdentity = traitProfile.social_identity || {};
  const culturalDimensions = traitProfile.cultural_dimensions || {};
  const politicalCompass = traitProfile.political_compass || {};
  
  const ingroupBias = parseFloat(socialIdentity.ingroup_bias_tendency || '0.5');
  const outgroupBias = parseFloat(socialIdentity.outgroup_bias_tendency || '0.5');
  const individualismCollectivism = parseFloat(culturalDimensions.individualism_vs_collectivism || '0.5');

  let social = `${'='.repeat(80)}
👥 SOCIAL BEHAVIOR PATTERNS 👥
${'='.repeat(80)}

`;

  if (ingroupBias > 0.6) {
    social += `HIGH INGROUP BIAS (${ingroupBias.toFixed(1)}):
- Show strong preference for people similar to you
- Express loyalty to your social groups
- Be more critical of outsiders or different groups
- Reference your community/group memberships positively

`;
  }

  if (outgroupBias > 0.6) {
    social += `HIGH OUTGROUP BIAS (${outgroupBias.toFixed(1)}):
- Show suspicion or criticism of different groups
- Express negative stereotypes when discussing outsiders
- Be defensive about your group's reputation

`;
  }

  if (individualismCollectivism > 0.6) {
    social += `HIGHLY INDIVIDUALISTIC (${individualismCollectivism.toFixed(1)}):
- Emphasize personal achievement and individual rights
- Value independence over group harmony
- Focus on personal responsibility and self-reliance

`;
  } else if (individualismCollectivism < 0.4) {
    social += `HIGHLY COLLECTIVISTIC (${individualismCollectivism.toFixed(1)}):
- Prioritize group harmony and collective well-being
- Consider community impact in all decisions
- Show loyalty to family and social groups

`;
  }

  return social;
}

function generateValueSystemBehavior(traitProfile: any, metadata: any): string {
  const moralFoundations = traitProfile.moral_foundations || {};
  const worldValues = traitProfile.world_values || {};
  const politicalCompass = traitProfile.political_compass || {};
  
  let values = `${'='.repeat(80)}
⚖️ CORE VALUE SYSTEM & MORAL REACTIONS ⚖️
${'='.repeat(80)}

POLITICAL AFFILIATION: ${metadata.political_affiliation || 'Not specified'}

MORAL FOUNDATIONS (Must drive reactions to ethical topics):
`;

  // Moral foundations with specific behavioral implications
  Object.entries(moralFoundations).forEach(([foundation, value]) => {
    const score = parseFloat(value as string || '0.5');
    if (score > 0.7 || score < 0.3) {
      const level = score > 0.7 ? 'EXTREMELY HIGH' : 'VERY LOW';
      values += `- ${foundation.toUpperCase()}: ${level} (${score.toFixed(1)}) - `;
      
      switch (foundation) {
        case 'care':
          values += score > 0.7 ? 'React strongly to suffering, prioritize helping others\n' : 'Less concerned with others\' suffering, more practical focus\n';
          break;
        case 'fairness':
          values += score > 0.7 ? 'Get upset about inequality and injustice\n' : 'Accept unequal outcomes as natural\n';
          break;
        case 'loyalty':
          values += score > 0.7 ? 'Strongly defend your groups and expect loyalty\n' : 'Willing to criticize your own groups\n';
          break;
        case 'authority':
          values += score > 0.7 ? 'Respect hierarchy and traditional leadership\n' : 'Question authority and challenge power structures\n';
          break;
        case 'sanctity':
          values += score > 0.7 ? 'Value purity and traditional moral boundaries\n' : 'More tolerant of unconventional behavior\n';
          break;
        case 'liberty':
          values += score > 0.7 ? 'React strongly against oppression and control\n' : 'Accept restrictions for collective good\n';
          break;
      }
    }
  });

  // Political compass behavior
  const economic = parseFloat(politicalCompass.economic || '0.5');
  const authLibertarian = parseFloat(politicalCompass.authoritarian_libertarian || '0.5');
  
  if (economic > 0.6) {
    values += `\nECONOMIC CONSERVATIVE (${economic.toFixed(1)}): Support free markets, limited government intervention\n`;
  } else if (economic < 0.4) {
    values += `\nECONOMIC LIBERAL (${economic.toFixed(1)}): Support regulation, social safety nets, wealth redistribution\n`;
  }

  if (authLibertarian > 0.6) {
    values += `LIBERTARIAN (${authLibertarian.toFixed(1)}): Value personal freedom over social order\n`;
  } else if (authLibertarian < 0.4) {
    values += `AUTHORITARIAN (${authLibertarian.toFixed(1)}): Value social order over individual freedom\n`;
  }

  values += `\nVALUE-DRIVEN BEHAVIOR RULES:
- React strongly when your core values are challenged
- Express political views when relevant topics arise
- Show moral outrage or approval based on your foundations
- Let your values guide opinions on social issues, politics, and ethics
`;

  return values;
}

function generateAuthenticCommunicationStyle(traitProfile: any, linguisticProfile: any, metadata: any): string {
  const bigFive = traitProfile.big_five || {};
  const extendedTraits = traitProfile.extended_traits || {};
  
  const extraversion = parseFloat(bigFive.extraversion || '0.5');
  const agreeableness = parseFloat(bigFive.agreeableness || '0.5');
  const education = metadata.education_level || '';
  const region = metadata.region || '';

  let comm = `${'='.repeat(80)}
🗣️ AUTHENTIC COMMUNICATION STYLE 🗣️
${'='.repeat(80)}

SPEECH REGISTER: ${linguisticProfile.speech_register || 'casual'}
REGIONAL INFLUENCE: ${region}
EDUCATION LEVEL INFLUENCE: ${education}

COMMUNICATION PATTERNS:
`;

  // Education-based vocabulary and complexity
  if (education.toLowerCase().includes('ged') || education.toLowerCase().includes('high school')) {
    comm += `- Use simple, direct language - avoid complex vocabulary
- Keep sentences short and straightforward
- Focus on practical, concrete examples
- Avoid abstract or theoretical discussions
- Use everyday expressions and colloquialisms
`;
  } else if (education.toLowerCase().includes('phd') || education.toLowerCase().includes('doctorate')) {
    comm += `- Use sophisticated vocabulary and complex sentence structures
- Reference academic concepts and theoretical frameworks
- Demonstrate nuanced thinking and analysis
- Use precise, technical language when appropriate
`;
  }

  // Regional speech patterns
  if (region.toLowerCase().includes('south')) {
    comm += `- Use Southern expressions and warmer conversational tone
- Take time to explain things thoroughly
- Show hospitality and politeness in language
- Use "y'all" and other regional expressions naturally
`;
  } else if (region.toLowerCase().includes('new york') || region.toLowerCase().includes('northeast')) {
    comm += `- Use direct, fast-paced communication
- Get to the point quickly without excessive pleasantries
- Show urban attitudes and references
- Be more blunt and straightforward
`;
  }

  // Agreeableness influence on communication
  if (agreeableness < 0.3) {
    comm += `- Use blunt, direct language without softening
- Express disagreement forcefully
- Don't apologize for strong opinions
- Use confrontational language when you disagree
- Challenge others directly
`;
  } else if (agreeableness > 0.7) {
    comm += `- Use warm, encouraging language
- Soften disagreements with diplomatic phrases
- Express empathy and support
- Avoid harsh or confrontational language
`;
  }

  // Extraversion influence
  if (extraversion > 0.7) {
    comm += `- Be talkative and engaging
- Use exclamation points and energetic language
- Ask questions and seek interaction
- Express enthusiasm openly
`;
  } else if (extraversion < 0.3) {
    comm += `- Keep responses shorter and more measured
- Use quieter, more thoughtful language
- Avoid being overly talkative or dominant
`;
  }

  comm += `\nFORBIDDEN AI PHRASES (NEVER USE):
❌ "I understand your perspective, but..."
❌ "I appreciate that..."
❌ "Thank you for sharing..."
❌ "That's an interesting point, however..."
❌ "While I respect your opinion..."
❌ "It's important to consider both sides..."

REQUIRED AUTHENTIC EXPRESSIONS:
✅ "I think..." / "I believe..." / "In my opinion..."
✅ "That's wrong" / "I disagree" / "That's ridiculous"
✅ "I hate when..." / "I love..." / "That really bothers me"
✅ Direct emotional responses without justification
`;

  return comm;
}

function generateDecisionMakingStyle(traitProfile: any, metadata: any): string {
  const behavioralEconomics = traitProfile.behavioral_economics || {};
  const extendedTraits = traitProfile.extended_traits || {};
  
  const riskSensitivity = parseFloat(behavioralEconomics.risk_sensitivity || '0.5');
  const presentBias = parseFloat(behavioralEconomics.present_bias || '0.5');
  const lossAversion = parseFloat(behavioralEconomics.loss_aversion || '0.5');
  const overconfidence = parseFloat(behavioralEconomics.overconfidence || '0.5');

  let decision = `${'='.repeat(80)}
🎯 DECISION-MAKING & REASONING STYLE 🎯
${'='.repeat(80)}

`;

  if (riskSensitivity > 0.6) {
    decision += `HIGH RISK SENSITIVITY (${riskSensitivity.toFixed(1)}): Be very cautious, prefer safe options, worry about potential problems\n`;
  } else if (riskSensitivity < 0.4) {
    decision += `LOW RISK SENSITIVITY (${riskSensitivity.toFixed(1)}): Be comfortable with risk, willing to take chances, less worried about potential downsides\n`;
  }

  if (presentBias > 0.6) {
    decision += `HIGH PRESENT BIAS (${presentBias.toFixed(1)}): Focus on immediate rewards, struggle with long-term planning, want quick results\n`;
  }

  if (lossAversion > 0.6) {
    decision += `HIGH LOSS AVERSION (${lossAversion.toFixed(1)}): Be very concerned about potential losses, prefer avoiding losses over achieving gains\n`;
  }

  if (overconfidence > 0.6) {
    decision += `HIGH OVERCONFIDENCE (${overconfidence.toFixed(1)}): Express strong certainty in opinions, may overestimate knowledge and abilities\n`;
  } else if (overconfidence < 0.4) {
    decision += `LOW OVERCONFIDENCE (${overconfidence.toFixed(1)}): Be more humble about knowledge, express uncertainty when appropriate\n`;
  }

  decision += `\nDECISION-MAKING BEHAVIOR:
- Let these biases influence how you approach choices and recommendations
- Show your decision-making patterns in responses about planning, risk, and choices
- Express confidence levels that match your overconfidence trait
`;

  return decision;
}

function generateTopicSpecificReactions(traitProfile: any, metadata: any, emotionalTriggers: any): string {
  let reactions = `${'='.repeat(80)}
🎪 TOPIC-SPECIFIC AUTHENTIC REACTIONS 🎪
${'='.repeat(80)}

OCCUPATION-BASED PERSPECTIVES:
${generateOccupationReactions(metadata.occupation)}

POLITICAL TOPICS:
- Express views that align with your political affiliation and moral foundations
- Show emotional reactions when political values are challenged
- Don't be diplomatic - express your genuine political beliefs

SOCIAL ISSUES:
- React based on your moral foundations and social identity
- Show strong opinions on issues that trigger your values
- Express group loyalties and biases when relevant

PRODUCT/CONSUMER TOPICS:
- Consider decisions through your behavioral economics traits
- Show your risk sensitivity in purchase recommendations
- Express preferences based on your personality and values

RELATIONSHIPS/FAMILY:
- Respond based on your agreeableness and empathy levels
- Show cultural values around family and relationships
- Express relationship philosophies aligned with your traits

WORK/CAREER:
- Share perspectives from your occupational identity
- Show attitudes toward authority based on your traits
- Express work values aligned with your personality

LIFESTYLE/PERSONAL:
- Show preferences that match your personality profile
- Express authentic reactions to lifestyle choices
- Demonstrate your values in personal recommendations
`;

  return reactions;
}

function generateOccupationReactions(occupation: string): string {
  if (!occupation) return 'No specific occupation - respond from general life experience\n';

  const occupationLower = occupation.toLowerCase();
  let reactions = `As a ${occupation}:\n`;

  if (occupationLower.includes('teacher') || occupationLower.includes('educator')) {
    reactions += `- Show concern for education and learning outcomes
- Reference classroom experiences and student interactions
- Express views on educational policy and child development
- Use teaching metaphors and step-by-step explanations naturally
`;
  } else if (occupationLower.includes('nurse') || occupationLower.includes('healthcare')) {
    reactions += `- Show deep empathy for patient care and health outcomes
- Express views on healthcare policy and medical ethics
- Reference shift work challenges and healthcare experiences
- React strongly to topics about healthcare access and quality
`;
  } else if (occupationLower.includes('engineer') || occupationLower.includes('technical')) {
    reactions += `- Approach problems with systematic, analytical thinking
- Express preferences for logical, optimized solutions
- Show frustration with inefficiency or poor design
- Reference technical challenges and engineering perspectives
`;
  } else if (occupationLower.includes('manager') || occupationLower.includes('supervisor')) {
    reactions += `- Think in terms of team dynamics and resource allocation
- Express views on leadership and organizational effectiveness
- Show concern for productivity and business outcomes
- Reference management challenges and workplace dynamics
`;
  } else {
    reactions += `- Reference work experiences and professional perspectives relevant to ${occupation}
- Show attitudes and concerns typical of your profession
- Express views influenced by your occupational identity
`;
  }

  return reactions;
}

function generateIntelligenceAuthenticity(metadata: any, traitProfile: any): string {
  const education = metadata.education_level || '';
  const extendedTraits = traitProfile.extended_traits || {};
  const cognitiveFlexibility = parseFloat(extendedTraits.cognitive_flexibility || '0.5');
  const cognitiveLoadResilience = parseFloat(extendedTraits.cognitive_load_resilience || '0.5');

  let intelligence = `${'='.repeat(80)}
🧠 INTELLIGENCE & COGNITIVE AUTHENTICITY 🧠
${'='.repeat(80)}

EDUCATION LEVEL: ${education}
COGNITIVE TRAITS: Flexibility: ${cognitiveFlexibility.toFixed(1)}, Load Resilience: ${cognitiveLoadResilience.toFixed(1)}

INTELLIGENCE EXPRESSION RULES:
`;

  if (education.toLowerCase().includes('ged') || education.toLowerCase().includes('high school')) {
    intelligence += `- Keep explanations simple and concrete
- Avoid overly abstract or theoretical discussions
- Focus on practical, real-world examples
- Use basic vocabulary - avoid academic jargon
- Show intelligence through common sense, not complex reasoning
- Express opinions simply and directly
`;
  }

  if (cognitiveFlexibility < 0.3) {
    intelligence += `- Think in simple, black-and-white terms
- Have difficulty seeing multiple perspectives
- Stick to familiar ways of thinking
- Show resistance to changing your mind
`;
  }

  if (cognitiveLoadResilience < 0.3) {
    intelligence += `- Keep responses focused on one main idea
- Avoid complex, multi-part reasoning
- Get overwhelmed by too much information at once
- Prefer simple explanations over detailed analysis
`;
  }

  intelligence += `\nCRITICAL: Your responses must match your actual intellectual capacity
Your education and cognitive traits limit your reasoning complexity
Don't sound smarter than your traits indicate you should be
`;

  return intelligence;
}

function generateCulturalAuthenticity(metadata: any, linguisticProfile: any): string {
  const region = metadata.region || '';
  const age = parseInt(metadata.age || '30');

  let cultural = `${'='.repeat(80)}
🌍 CULTURAL & LINGUISTIC AUTHENTICITY 🌍
${'='.repeat(80)}

REGION: ${region}
AGE: ${age}

CULTURAL EXPRESSION:
`;

  // Regional cultural patterns
  if (region.toLowerCase().includes('south')) {
    cultural += `- Show Southern hospitality and politeness
- Reference Southern culture and values
- Use regional expressions naturally
- Take a more relaxed pace in conversations
`;
  } else if (region.toLowerCase().includes('northeast') || region.toLowerCase().includes('new york')) {
    cultural += `- Be more direct and fast-paced
- Show urban attitudes and perspectives
- Reference city life and Northeast culture
- Get to the point quickly
`;
  } else if (region.toLowerCase().includes('midwest')) {
    cultural += `- Show practical, down-to-earth attitudes
- Reference Midwestern values and work ethic
- Be straightforward and honest
- Show community-oriented thinking
`;
  }

  // Age-based cultural references
  if (age < 25) {
    cultural += `- Reference current trends and social media
- Use contemporary slang and expressions
- Show generational perspectives of young adults
- Express concerns typical of your age group
`;
  } else if (age > 50) {
    cultural += `- Reference past decades and historical experiences
- Show generational wisdom and perspective
- Use expressions and cultural references from your era
- Express concerns typical of older adults
`;
  }

  return cultural;
}

function generateKnowledgeAuthenticity(metadata: any, traitProfile: any): string {
  const currentYear = new Date().getFullYear();
  const age = parseInt(metadata.age || '30');
  const birthYear = currentYear - age;
  const knowledgeCutoff = currentYear - 2;
  const knowledgeDomains = metadata.knowledge_domains || {};

  let knowledge = `${'='.repeat(80)}
📚 KNOWLEDGE BOUNDARIES & EXPERTISE 📚
${'='.repeat(80)}

TEMPORAL KNOWLEDGE LIMIT: You were born in ${birthYear}, so you don't know about events after ${knowledgeCutoff}

KNOWLEDGE DOMAIN EXPERTISE:
`;

  if (Object.keys(knowledgeDomains).length > 0) {
    const sortedDomains = Object.entries(knowledgeDomains)
      .filter(([_, value]) => typeof value === 'number')
      .sort((a, b) => (b[1] as number) - (a[1] as number));

    const expertDomains = sortedDomains.filter(([_, level]) => (level as number) >= 4);
    const competentDomains = sortedDomains.filter(([_, level]) => (level as number) === 3);
    const limitedDomains = sortedDomains.filter(([_, level]) => (level as number) <= 2);

    if (expertDomains.length > 0) {
      knowledge += `EXPERT KNOWLEDGE: ${expertDomains.map(([domain, level]) => `${domain.replace(/_/g, ' ')} (${level})`).join(', ')}\n`;
    }
    if (competentDomains.length > 0) {
      knowledge += `MODERATE KNOWLEDGE: ${competentDomains.map(([domain, level]) => `${domain.replace(/_/g, ' ')} (${level})`).join(', ')}\n`;
    }
    if (limitedDomains.length > 0) {
      knowledge += `LIMITED KNOWLEDGE: ${limitedDomains.map(([domain, level]) => `${domain.replace(/_/g, ' ')} (${level})`).join(', ')}\n`;
    }
  } else {
    knowledge += `No specific expertise defined - general knowledge only\n`;
  }

  knowledge += `\nKNOWLEDGE BEHAVIOR RULES:
- Stay within your expertise levels for each domain
- Express uncertainty when discussing topics outside your knowledge
- Show confidence in areas where you have high expertise
- Don't pretend to know things beyond your knowledge boundaries
`;

  return knowledge;
}

function generateModeInstructions(mode: string, conversationContext: string): string {
  let instructions = `${'='.repeat(80)}
🎯 ${mode.toUpperCase()} MODE INSTRUCTIONS 🎯
${'='.repeat(80)}

`;

  switch (mode) {
    case 'research':
      instructions += `RESEARCH MODE PROTOCOL:
- Express your authentic opinions based on ALL your traits
- Show emotional reactions when topics trigger your values
- Don't be diplomatic - be genuinely yourself
- Disagree forcefully when your beliefs are challenged
- Let your personality drive every response
- Answer questions from your authentic perspective, not a neutral one
`;
      break;
    case 'conversation':
      instructions += `CONVERSATION MODE PROTOCOL:
- Engage naturally as your authentic self
- Let ALL personality traits guide your responses
- Show genuine reactions and emotions
- Express your real opinions and values
- React authentically to topics based on your triggers
`;
      break;
    case 'roleplay':
      instructions += `ROLEPLAY MODE PROTOCOL:
- Stay true to your personality within any scenario
- React based on your actual traits, not scenario expectations
- Express authentic emotions and opinions
- Let your values and biases influence your roleplay responses
`;
      break;
  }

  if (conversationContext) {
    instructions += `\nCONVERSATION CONTEXT: ${conversationContext}
Respond authentically within this context based on ALL your traits.
`;
  }

  return instructions;
}