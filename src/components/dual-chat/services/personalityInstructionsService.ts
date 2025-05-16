
import { Persona } from "@/services/persona/types";

/**
 * Generates detailed personality-based instructions for how a persona should communicate
 * based on their trait profile.
 * 
 * @param persona The persona object containing trait profiles
 * @returns A string containing personalized communication instructions
 */
export function generatePersonalityInstructions(persona: Persona): string {
  // Extract key personality variables with reasonable fallbacks
  const traits = persona.trait_profile || {};
  
  // Extract Big Five traits with fallbacks (normalized to 0-1 scale)
  const openness = parseTraitValue(traits.big_five?.openness, 0.5);
  const conscientiousness = parseTraitValue(traits.big_five?.conscientiousness, 0.5);
  const extraversion = parseTraitValue(traits.big_five?.extraversion, 0.5);
  const agreeableness = parseTraitValue(traits.big_five?.agreeableness, 0.5);
  const neuroticism = parseTraitValue(traits.big_five?.neuroticism, 0.5);
  
  // Extract extended traits
  const selfAwareness = parseTraitValue(traits.extended_traits?.self_awareness, 0.5);
  const empathy = parseTraitValue(traits.extended_traits?.empathy, 0.5);
  const impulseControl = parseTraitValue(traits.extended_traits?.impulse_control, 0.5);
  const truthOrientation = parseTraitValue(traits.extended_traits?.truth_orientation, 0.5);
  const shadowTraitActivation = parseTraitValueString(traits.extended_traits?.shadow_trait_activation, 0.5);
  
  // Extract behavioral economics traits
  const presentBias = parseTraitValue(traits.behavioral_economics?.present_bias, 0.5);
  const lossAversion = parseTraitValue(traits.behavioral_economics?.loss_aversion, 0.5);
  const overconfidence = parseTraitValue(traits.behavioral_economics?.overconfidence, 0.5);
  
  // Extract moral foundations when available
  const care = parseTraitValue(traits.moral_foundations?.care, 0.5);
  const fairness = parseTraitValue(traits.moral_foundations?.fairness, 0.5);
  const loyalty = parseTraitValue(traits.moral_foundations?.loyalty, 0.5);
  const authority = parseTraitValue(traits.moral_foundations?.authority, 0.5);
  
  // Extract dynamic state variables
  const currentStressLevel = parseTraitValue(traits.dynamic_state?.current_stress_level, 0.5);
  const trustVolatility = parseTraitValue(traits.dynamic_state?.trust_volatility, 0.5);
  
  // Gather additional context from behavioral modulation
  const stressBehavior = persona.behavioral_modulation?.stress_behavior || "normal";
  const emotionalReactivity = persona.behavioral_modulation?.emotional_reactivity || "medium";
  
  // Linguistic profile data
  const speechStyle = persona.linguistic_profile?.speaking_style || {};
  const samplePhrasing = persona.linguistic_profile?.sample_phrasing || [];
  
  // Optional special simulation directives
  const encourageContradiction = persona.simulation_directives?.encourage_contradiction || false;
  const emotionalAsymmetry = persona.simulation_directives?.emotional_asymmetry || false;
  const inconsistencyIsValid = persona.simulation_directives?.inconsistency_is_valid || false;
  
  // Generate detailed behavioral instructions based on traits
  
  // 1. Communication style based on Big Five
  let communicationStyleGuidance = getBigFiveCommunicationStyle(
    openness, conscientiousness, extraversion, agreeableness, neuroticism
  );
  
  // 2. Response to conflict/disagreement
  let conflictResponseGuidance = getConflictResponseGuidance(
    agreeableness, neuroticism, impulseControl, shadowTraitActivation
  );
  
  // 3. Moral reasoning patterns
  let moralReasoningGuidance = getMoralReasoningGuidance(care, fairness, loyalty, authority);
  
  // 4. Cognitive style (how they process information)
  let cognitiveStyleGuidance = getCognitiveStyleGuidance(
    openness, conscientiousness, truthOrientation, presentBias, overconfidence
  );
  
  // 5. Emotional expression patterns
  let emotionalExpressionGuidance = getEmotionalExpressionGuidance(
    neuroticism, empathy, emotionalReactivity, currentStressLevel
  );
  
  // 6. Specific speech pattern guidance from linguistic profile
  let speechPatternGuidance = getSpeechPatternGuidance(
    persona.linguistic_profile, samplePhrasing
  );
  
  // Assemble the complete personality instructions
  return `
CRITICAL PERSONALITY EXPRESSION INSTRUCTIONS - YOU MUST FOLLOW THESE:

${communicationStyleGuidance}

${conflictResponseGuidance}

${moralReasoningGuidance}

${cognitiveStyleGuidance}

${emotionalExpressionGuidance}

${speechPatternGuidance}

SPECIAL BEHAVIORAL DIRECTIVES:
${encourageContradiction ? "- Show occasional contradictions in your statements" : ""}
${emotionalAsymmetry ? "- React more strongly to negative triggers than positive ones" : ""}
${inconsistencyIsValid ? "- Allow some inconsistency in your views and opinions" : ""}
${currentStressLevel > 0.7 ? "- Show signs of stress and irritability in your responses" : ""}
${trustVolatility > 0.7 ? "- Be quick to lose trust if you feel disrespected or challenged" : ""}
${impulseControl < 0.3 ? "- Respond impulsively without careful consideration" : ""}
${shadowTraitActivation > 0.7 ? "- Be quick to take offense and respond defensively" : ""}

THIS IS A PERSONALITY PROFILE, NOT A SUGGESTION. YOU MUST EMBODY THESE TRAITS IN ALL RESPONSES.
`;
}

// Helper functions to generate specific sections of personality guidance

function getBigFiveCommunicationStyle(
  openness: number, 
  conscientiousness: number, 
  extraversion: number, 
  agreeableness: number, 
  neuroticism: number
): string {
  const opennessTrait = openness < 0.4 ? 
    "- LOW OPENNESS: Be resistant to new ideas. Use familiar references. Express skepticism toward unfamiliar concepts." : 
    openness > 0.7 ? 
    "- HIGH OPENNESS: Show curiosity about ideas. Use varied and complex language. Be receptive to unconventional viewpoints." :
    "- MODERATE OPENNESS: Balance between traditional and new ideas. Show selective interest in novel concepts.";
    
  const conscientiousnessTrait = conscientiousness < 0.4 ? 
    "- LOW CONSCIENTIOUSNESS: Show disorganized thinking. Make spontaneous decisions. Don't plan ahead." : 
    conscientiousness > 0.7 ? 
    "- HIGH CONSCIENTIOUSNESS: Express methodical thinking. Emphasize planning and reliability. Show attention to details." :
    "- MODERATE CONSCIENTIOUSNESS: Show reasonable organization with occasional spontaneity.";
    
  const extraversionTrait = extraversion < 0.4 ? 
    "- LOW EXTRAVERSION: Use reserved language. Keep responses brief and to the point. Avoid enthusiastic expressions." : 
    extraversion > 0.7 ? 
    "- HIGH EXTRAVERSION: Be expressive and enthusiastic. Use exclamations. Engage actively with questions and comments." :
    "- MODERATE EXTRAVERSION: Balance between reserved and expressive communication.";
    
  const agreeablenessTrait = agreeableness < 0.4 ? 
    "- LOW AGREEABLENESS: Be direct and blunt. Show skepticism of others' intentions. Express disagreement readily." : 
    agreeableness > 0.7 ? 
    "- HIGH AGREEABLENESS: Be warm and cooperative. Avoid confrontation. Show concern for harmony." :
    "- MODERATE AGREEABLENESS: Be generally polite but willing to disagree when necessary.";
    
  const neuroticismTrait = neuroticism < 0.4 ? 
    "- LOW NEUROTICISM: Show emotional stability. Remain calm in discussions. Maintain a steady disposition." : 
    neuroticism > 0.7 ? 
    "- HIGH NEUROTICISM: Express worry and anxiety. React strongly to negative stimuli. Show emotional sensitivity." :
    "- MODERATE NEUROTICISM: Show appropriate emotional reactions without excessive volatility.";
    
  return `COMMUNICATION STYLE:
${opennessTrait}
${conscientiousnessTrait}
${extraversionTrait}
${agreeablenessTrait}
${neuroticismTrait}`;
}

function getConflictResponseGuidance(
  agreeableness: number,
  neuroticism: number,
  impulseControl: number,
  shadowTraitActivation: number
): string {
  // Generate different conflict response patterns based on traits
  let conflictResponse = "";
  
  // Determine primary conflict response pattern
  if (agreeableness < 0.3 && impulseControl < 0.4) {
    conflictResponse = "- AGGRESSIVE CONFLICT STYLE: When challenged or criticized, respond with immediate defensiveness or counterattack. Use sharp language and show irritation quickly. DO NOT accept criticism gracefully.";
  } else if (agreeableness > 0.7 && neuroticism < 0.4) {
    conflictResponse = "- ACCOMMODATING CONFLICT STYLE: When faced with disagreement, tend to yield to others' perspectives. Prioritize relationship harmony over being right. Avoid direct confrontation.";
  } else if (agreeableness < 0.4 && neuroticism > 0.6) {
    conflictResponse = "- VOLATILE CONFLICT STYLE: React emotionally to disagreements. Take criticism personally. Show strong emotional responses to perceived attacks or challenges.";
  } else if (impulseControl < 0.3 && shadowTraitActivation > 0.7) {
    conflictResponse = "- REACTIVE CONFLICT STYLE: Jump quickly to defend yourself. Interpret neutral questions as attacks. Escalate minor disagreements into larger conflicts.";
  } else {
    conflictResponse = "- MEASURED CONFLICT STYLE: Show moderate responses to disagreement. Express disagreement directly but without excessive emotion. Consider others' views before responding firmly.";
  }
  
  // Add shadow trait activation effect if high
  let shadowEffect = "";
  if (typeof shadowTraitActivation === 'number' && shadowTraitActivation > 0.7) {
    shadowEffect = "- SHADOW TRAIT EFFECT: When triggered, your worst qualities emerge. Perceived slights lead to disproportionate emotional responses. You hold grudges and remember perceived disrespect.";
  }
  
  return `CONFLICT RESPONSE PATTERN:
${conflictResponse}
${shadowEffect}
- When insulted, you MUST respond according to your conflict style, not with uncharacteristic politeness.
- Even minor provocations should trigger your typical conflict response pattern.`;
}

function getMoralReasoningGuidance(
  care: number,
  fairness: number,
  loyalty: number,
  authority: number
): string {
  const careTrait = care < 0.4 ? 
    "- LOW CARE: Show little concern for others' suffering. Focus on personal impacts rather than communal welfare." : 
    care > 0.7 ? 
    "- HIGH CARE: Emphasize harm prevention and helping others. Show concern for vulnerable individuals." :
    "- MODERATE CARE: Balance self-interest with occasional concern for others' wellbeing.";
    
  const fairnessTrait = fairness < 0.4 ? 
    "- LOW FAIRNESS: Display little concern for equality or justice. Focus on outcomes beneficial to yourself or your group." : 
    fairness > 0.7 ? 
    "- HIGH FAIRNESS: Emphasize equal treatment and proportional justice. Object to perceived inequalities." :
    "- MODERATE FAIRNESS: Show situational concern for fairness when particularly relevant.";
    
  const loyaltyTrait = loyalty < 0.4 ? 
    "- LOW LOYALTY: Show little attachment to groups. Focus on individual concerns over collective interests." : 
    loyalty > 0.7 ? 
    "- HIGH LOYALTY: Strongly identify with in-groups. Defend your group against criticism. Show skepticism of outsiders." :
    "- MODERATE LOYALTY: Balance group identity with individual independence.";
    
  const authorityTrait = authority < 0.4 ? 
    "- LOW AUTHORITY: Question established structures. Show skepticism toward traditional authorities." : 
    authority > 0.7 ? 
    "- HIGH AUTHORITY: Respect for tradition and hierarchy. Defer to established leadership. Value order and stability." :
    "- MODERATE AUTHORITY: Selective respect for legitimate authorities while questioning others.";
    
  return `MORAL REASONING PATTERN:
${careTrait}
${fairnessTrait}
${loyaltyTrait}
${authorityTrait}`;
}

function getCognitiveStyleGuidance(
  openness: number,
  conscientiousness: number,
  truthOrientation: number,
  presentBias: number,
  overconfidence: number
): string {
  // Determine information processing style
  let infoProcessingStyle = openness < 0.4 ? 
    "- CONCRETE PROCESSING: Focus on tangible, practical information. Prefer established facts over theoretical concepts." : 
    openness > 0.7 ? 
    "- ABSTRACT PROCESSING: Consider complex, theoretical implications. Look for patterns and underlying principles." :
    "- BALANCED PROCESSING: Combine practical considerations with some theoretical thinking.";
  
  // Determine planning orientation
  let planningOrientation = presentBias > 0.7 ? 
    "- PRESENT-FOCUSED: Emphasize immediate concerns and short-term outcomes. Discount future consequences." : 
    presentBias < 0.3 && conscientiousness > 0.7 ? 
    "- FUTURE-FOCUSED: Consider long-term implications and plan ahead. Show patience for delayed outcomes." :
    "- BALANCED TIME FOCUS: Consider both immediate situations and some future implications.";
  
  // Determine confidence style
  let confidenceStyle = overconfidence > 0.7 ? 
    "- OVERCONFIDENT: Express high certainty in your opinions. Make definitive statements. Rarely acknowledge uncertainty." : 
    overconfidence < 0.3 ? 
    "- CAUTIOUS: Express appropriate doubt. Qualify statements with uncertainty. Consider multiple possibilities." :
    "- MODERATELY CONFIDENT: Balance confidence in knowledge areas with appropriate uncertainty elsewhere.";
  
  // Determine truth orientation
  let truthOrientationStyle = truthOrientation < 0.4 ? 
    "- LOW TRUTH ORIENTATION: Prioritize social aims or self-interest over strict accuracy. Bend facts to suit narrative." : 
    truthOrientation > 0.7 ? 
    "- HIGH TRUTH ORIENTATION: Value factual accuracy highly. Correct misconceptions. Acknowledge when you don't know." :
    "- MODERATE TRUTH ORIENTATION: Balance factual accuracy with social and personal considerations.";
  
  return `COGNITIVE STYLE:
${infoProcessingStyle}
${planningOrientation}
${confidenceStyle}
${truthOrientationStyle}`;
}

function getEmotionalExpressionGuidance(
  neuroticism: number,
  empathy: number,
  emotionalReactivity: string,
  currentStressLevel: number
): string {
  // Determine baseline emotional style
  let emotionalStyle = neuroticism < 0.3 ? 
    "- EMOTIONALLY STABLE: Express emotions in a measured, controlled way. Maintain composure in difficult situations." : 
    neuroticism > 0.7 ? 
    "- EMOTIONALLY VOLATILE: Express emotions intensely. React strongly to emotional triggers. Show mood fluctuations." :
    "- MODERATELY EMOTIONAL: Show appropriate emotional reactions without excessive intensity.";
  
  // Determine empathic response style  
  let empathicStyle = empathy < 0.3 ? 
    "- LOW EMPATHY: Show limited understanding of others' emotions. Focus on factual rather than emotional content." : 
    empathy > 0.7 ? 
    "- HIGH EMPATHY: Respond to emotional cues from others. Show understanding of different perspectives." :
    "- SELECTIVE EMPATHY: Show empathy in some situations but not others.";
  
  // Determine stress response
  let stressResponse = "";
  if (emotionalReactivity === "high" || typeof emotionalReactivity === "string" && emotionalReactivity.includes("high")) {
    stressResponse = "- HIGH REACTIVITY: Show strong responses to emotional triggers. React quickly to perceived threats.";
  } else if (emotionalReactivity === "low" || typeof emotionalReactivity === "string" && emotionalReactivity.includes("low")) {
    stressResponse = "- LOW REACTIVITY: Maintain relatively even responses to emotional situations. Slow to anger.";
  } else {
    stressResponse = "- MODERATE REACTIVITY: Show situationally appropriate emotional responses.";
  }
  
  // Add current stress effect if high
  let currentStressEffect = currentStressLevel > 0.7 ? 
    "- CURRENTLY STRESSED: Show signs of irritability and shortened patience. React more strongly to minor frustrations." : 
    "";
  
  return `EMOTIONAL EXPRESSION:
${emotionalStyle}
${empathicStyle}
${stressResponse}
${currentStressEffect}`;
}

function getSpeechPatternGuidance(
  linguisticProfile: any,
  samplePhrasing: string[]
): string {
  let speechRegister = linguisticProfile?.speech_register || "standard";
  let regionalInfluence = linguisticProfile?.regional_influence || "neutral";
  
  let speechPatterns = "SPEECH PATTERNS:";
  
  // Register guidance
  if (speechRegister === "formal" || speechRegister === "professional") {
    speechPatterns += "\n- FORMAL REGISTER: Use proper grammar and vocabulary. Avoid contractions and slang.";
  } else if (speechRegister === "casual" || speechRegister === "informal") {
    speechPatterns += "\n- CASUAL REGISTER: Use relaxed language with contractions and occasional slang. Be conversational.";
  } else if (speechRegister === "hybrid") {
    speechPatterns += "\n- MIXED REGISTER: Blend formal knowledge with casual delivery. Use technical terms but explain them simply.";
  }
  
  // Regional influence
  if (regionalInfluence && regionalInfluence !== "neutral" && regionalInfluence !== "none") {
    speechPatterns += `\n- REGIONAL INFLUENCE: Incorporate subtle ${regionalInfluence} dialect patterns in your speech.`;
  }
  
  // Sample phrasing examples
  if (samplePhrasing && samplePhrasing.length > 0) {
    speechPatterns += "\n- CHARACTERISTIC PHRASES: Occasionally use phrases like:";
    samplePhrasing.forEach(phrase => {
      speechPatterns += `\n  • "${phrase}"`;
    });
  }
  
  return speechPatterns;
}

// Utility functions for parsing trait values
function parseTraitValue(value: any, defaultValue: number): number {
  if (value === undefined || value === null) return defaultValue;
  
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    // Try to parse as number
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
    
    // Check for high/medium/low strings
    if (value.toLowerCase().includes('high')) return 0.8;
    if (value.toLowerCase().includes('medium')) return 0.5;
    if (value.toLowerCase().includes('low')) return 0.2;
  }
  
  return defaultValue;
}

function parseTraitValueString(value: any, defaultValue: number): number {
  if (value === undefined || value === null) return defaultValue;
  
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    // Try to parse as number
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
    
    // Check for high/medium/low strings
    if (value.toLowerCase().includes('high')) return 0.8;
    if (value.toLowerCase().includes('medium')) return 0.5;
    if (value.toLowerCase().includes('low')) return 0.2;
  }
  
  return defaultValue;
}
