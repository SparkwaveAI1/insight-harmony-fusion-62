
import { Persona } from '@/services/persona/types';

export interface PersonaInsight {
  decision: string;
  driver: string;
  persuasion: string;
  bias: string;
  cognitive: string;
}

// Helper function to get unique persona insights
export const getPersonaInsights = (persona: Persona): PersonaInsight => {
  // Custom insights for specific personas
  const customPersonas: Record<string, PersonaInsight> = {
    // First persona: 5e22fdc2
    "5e22fdc2": {
      decision: "Approaches decisions with careful research and data analysis. Prefers structured evaluation frameworks to reduce uncertainty.",
      driver: "Motivated by professional recognition and intellectual growth. Values stability and predictable outcomes over high-risk ventures.",
      persuasion: "Responds best to logical arguments backed by credible evidence. Values detailed explanations over emotional appeals.",
      bias: "Tends to favor established sources and conventional wisdom. May discount anecdotal evidence even when relevant.",
      cognitive: "Analytical thinker who excels at breaking down complex problems but may sometimes miss intuitive solutions."
    },
    // Second persona: c69eb1eb
    "c69eb1eb": {
      decision: "Makes quick, intuitive decisions based on past experiences. Comfortable taking calculated risks when potential rewards are clear.",
      driver: "Motivated primarily by creative freedom and autonomy. Seeks opportunities for self-expression and innovation.",
      persuasion: "Persuaded by stories and real-world examples rather than statistics. Appreciates authentic communication with emotional resonance.",
      bias: "Overvalues personal experience and may discount expert opinion that contradicts lived experience.",
      cognitive: "Divergent thinker who generates many possibilities before converging on a solution."
    },
    // Third persona: 4f7b9e3c
    "4f7b9e3c": {
      decision: "Balances intuition with collaborative input from trusted peers. Considers social and ethical implications before taking action.",
      driver: "Motivated by creating positive social impact through their work. Values community connection and shared accomplishments.",
      persuasion: "Responds to inclusive language and community-focused messaging. Prefers solutions that benefit multiple stakeholders.",
      bias: "May prioritize group harmony over critical assessment of ideas. Tends to seek consensus even when disagreement would be productive.",
      cognitive: "Integrative thinker who naturally synthesizes multiple perspectives into a cohesive view."
    },
    // Alina R persona
    "9f8540fa": {
      decision: "Relies on data visualization tools for complex financial decisions. Balances risk and reward through multi-scenario modeling.",
      driver: "Motivated by sustainable growth and ethical investing principles. Values work-life integration and financial security.",
      persuasion: "Responds to evidence-based arguments with practical applications. Appreciates detailed analysis backed by real-world examples.",
      bias: "May over-index on quantifiable metrics while undervaluing qualitative factors that resist measurement.",
      cognitive: "Structured problem-solver who excels at identifying patterns in complex datasets."
    }
  };
  
  // Check if this is a persona with custom insights
  if (persona.persona_id && customPersonas[persona.persona_id]) {
    return customPersonas[persona.persona_id];
  }
  
  // Check if this is Alina R
  const isAlinaR = persona.persona_id === '9f8540fa' || 
                  (persona.name?.includes('Alina') && persona.metadata?.occupation === 'Financial Analyst');
  
  if (isAlinaR) {
    return customPersonas["9f8540fa"];
  }
  
  // Generate more varied insights based on persona traits
  
  // Extract key traits with fallbacks
  const traits = persona.trait_profile || {};
  const bigFive = traits.big_five || {};
  const extendedTraits = traits.extended_traits || {};
  const behEcon = traits.behavioral_economics || {};
  const moralFoundations = traits.moral_foundations || {};
  
  // Parse trait values
  const risk = parseFloat(behEcon.risk_sensitivity as string) || 0.5;
  const openness = parseFloat(bigFive.openness as string) || 0.5;
  const conscientiousness = parseFloat(bigFive.conscientiousness as string) || 0.5;
  const extraversion = parseFloat(bigFive.extraversion as string) || 0.5;
  const agreeableness = parseFloat(bigFive.agreeableness as string) || 0.5;
  const neuroticism = parseFloat(bigFive.neuroticism as string) || 0.5;
  const selfAwareness = parseFloat(extendedTraits.self_awareness as string) || 0.5;
  const truthOrientation = parseFloat(extendedTraits.truth_orientation as string) || 0.5;
  const cognitiveFlexibility = parseFloat(extendedTraits.cognitive_flexibility as string) || 0.5;
  const needForClosure = parseFloat(extendedTraits.need_for_cognitive_closure as string) || 0.5;
  const conformity = parseFloat(extendedTraits.conformity_tendency as string) || 0.5;
  
  // Get metadata values
  const occupation = persona.metadata?.occupation || "";
  const age = parseInt(persona.metadata?.age as string) || 30;
  const education = persona.metadata?.education_level || "";
  const region = persona.metadata?.region || "";
  
  // Generate decision insight based on multiple factors
  let decisionInsight = "";
  if (conscientiousness > 0.7) {
    decisionInsight = "Methodical decision-maker who carefully researches options before committing. Prefers having complete information and clear processes.";
  } else if (openness > 0.7) {
    decisionInsight = "Creative decision-maker who considers unconventional options and innovative approaches. Comfortable with ambiguity and experimentation.";
  } else if (risk < 0.3) {
    decisionInsight = "Cautious decision-maker who prioritizes stability and predictability. Carefully weighs potential downsides before acting.";
  } else if (risk > 0.7) {
    decisionInsight = "Bold decision-maker willing to embrace uncertainty for potential high rewards. Comfortable pivoting quickly when circumstances change.";
  } else if (needForClosure > 0.7) {
    decisionInsight = "Decisive and quick to form judgments. Prefers closure and certainty over extended deliberation and ambiguity.";
  } else if (education.includes("MBA") || education.includes("Business")) {
    decisionInsight = "Strategic decision-maker who weighs competitive factors and market dynamics. Balances analytical frameworks with practical considerations.";
  } else if (occupation.includes("Teacher") || occupation.includes("Healthcare")) {
    decisionInsight = "People-centered decision-maker who considers human impacts alongside pragmatic factors. Values both short-term needs and long-term development.";
  } else {
    decisionInsight = "Balanced decision-maker who adapts approach based on the situation. Combines analytical thinking with practical experience.";
  }
  
  // Generate driver insight based on different factors
  let driverInsight = "";
  if (moralFoundations?.care > 0.7) {
    driverInsight = "Deeply motivated by opportunities to help others and prevent harm. Finds purpose in work that supports community welfare and wellbeing.";
  } else if (extraversion > 0.7 && age < 35) {
    driverInsight = "Energized by social recognition and collaborative environments. Seeks opportunities to connect with others and build professional networks.";
  } else if (openness > 0.7 && conscientiousness > 0.6) {
    driverInsight = "Driven by intellectual growth and mastery of complex skills. Values structured environments that still allow for creativity and innovation.";
  } else if (neuroticism > 0.7) {
    driverInsight = "Motivated by creating security and stability. Works diligently to prevent negative outcomes and establish reliable systems.";
  } else if (region && region.includes("East Coast") || region.includes("New York")) {
    driverInsight = "Influenced by fast-paced professional environments that reward ambition and results. Values efficiency and direct communication.";
  } else if (region && (region.includes("West Coast") || region.includes("California"))) {
    driverInsight = "Shaped by innovation-focused culture that values work-life balance. Appreciates flexible environments that support both career and personal goals.";
  } else if (occupation.includes("Artist") || occupation.includes("Creator") || occupation.includes("Writer")) {
    driverInsight = "Motivated by authentic self-expression and creating meaningful work. Values autonomy and opportunities for creative control.";
  } else {
    driverInsight = "Balances professional advancement with personal fulfillment. Seeks environments that provide both practical rewards and meaningful engagement.";
  }
  
  // Generate persuasion insight based on different factors
  let persuasionInsight = "";
  if (truthOrientation > 0.7) {
    persuasionInsight = "Responds best to factually accurate, evidence-based arguments. Values honesty and directness even when messages are challenging.";
  } else if (agreeableness > 0.7) {
    persuasionInsight = "Appreciates collaborative, inclusive communication approaches. Builds trust through warm interactions and consensus-building.";
  } else if (openness < 0.3) {
    persuasionInsight = "Responds to practical, straightforward communication with clear benefits. Prefers familiar concepts over novel or abstract ideas.";
  } else if (cognitiveFlexibility > 0.7) {
    persuasionInsight = "Open to considering multiple perspectives and changing views when presented with compelling evidence. Values intellectual exchange.";
  } else if (education.includes("Science") || education.includes("Engineering")) {
    persuasionInsight = "Persuaded by logical arguments with clear supporting evidence. Appreciates precision and technical accuracy in communication.";
  } else if (occupation.includes("Sales") || occupation.includes("Marketing")) {
    persuasionInsight = "Responsive to both emotional appeals and practical benefits. Evaluates ideas through both analytical and intuitive lenses.";
  } else {
    persuasionInsight = "Balances consideration of facts with personal values when forming opinions. Appreciates authentic communication that acknowledges complexity.";
  }
  
  // Generate bias insight based on different factors  
  let biasInsight = "";
  if (truthOrientation < 0.4) {
    biasInsight = "May prioritize social harmony or self-interest over factual accuracy. Tends to engage in motivated reasoning when challenged.";
  } else if (conformity > 0.7) {
    biasInsight = "Strongly influenced by social norms and group consensus. May discount contradictory evidence that challenges established views.";
  } else if (needForClosure > 0.7) {
    biasInsight = "Tends to form quick judgments and resist changing them. May selectively seek information that confirms existing beliefs.";
  } else if (cognitiveFlexibility < 0.3) {
    biasInsight = "Hesitant to reconsider established viewpoints even when presented with new evidence. Prefers familiar frameworks and explanations.";
  } else if (selfAwareness < 0.4) {
    biasInsight = "Limited recognition of personal biases and blind spots. May overestimate objectivity of own thinking process.";
  } else {
    biasInsight = "Generally balanced in evaluating information, though may show some preference for data that aligns with existing beliefs and values.";
  }
  
  // Generate cognitive style insight based on different factors
  let cognitiveInsight = "";
  if (openness > 0.7 && cognitiveFlexibility > 0.7) {
    cognitiveInsight = "Divergent thinker who readily explores multiple interpretations and possibilities before converging on solutions.";
  } else if (conscientiousness > 0.7 && needForClosure > 0.6) {
    cognitiveInsight = "Structured, sequential thinker who prefers clearly defined problems and methodical problem-solving approaches.";
  } else if (agreeableness > 0.7 && extraversion > 0.6) {
    cognitiveInsight = "Collaborative thinker who naturally integrates multiple perspectives and values group consensus in problem solving.";
  } else if (neuroticism > 0.7) {
    cognitiveInsight = "Detail-oriented thinker with strong anticipation of potential problems. May sometimes focus too much on what could go wrong.";
  } else if (education.includes("PhD") || education.includes("Research")) {
    cognitiveInsight = "Analytical thinker trained to examine problems systematically and consider evidence from multiple angles before drawing conclusions.";
  } else {
    cognitiveInsight = "Pragmatic thinker who balances consideration of details with the bigger picture. Adapts thinking style based on context and needs.";
  }
  
  // Return varied and nuanced insights
  return {
    decision: decisionInsight,
    driver: driverInsight,
    persuasion: persuasionInsight,
    bias: biasInsight,
    cognitive: cognitiveInsight
  };
};

// Utility function to parse trait values
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
