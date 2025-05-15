
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
  
  // Generate insights based on traits if available
  const risk = persona.trait_profile?.behavioral_economics?.risk_sensitivity 
    ? parseFloat(persona.trait_profile.behavioral_economics.risk_sensitivity) 
    : 0.5;
  
  const openness = persona.trait_profile?.big_five?.openness
    ? parseFloat(persona.trait_profile.big_five.openness)
    : 0.5;
  
  const agreeableness = persona.trait_profile?.big_five?.agreeableness
    ? parseFloat(persona.trait_profile.big_five.agreeableness)
    : 0.5;
    
  // New trait analysis
  const truthOrientation = persona.trait_profile?.extended_traits?.truth_orientation
    ? parseFloat(persona.trait_profile.extended_traits.truth_orientation)
    : 0.5;
    
  const cognitiveFlexibility = persona.trait_profile?.extended_traits?.cognitive_flexibility
    ? parseFloat(persona.trait_profile.extended_traits.cognitive_flexibility)
    : 0.5;
  
  const needForClosure = persona.trait_profile?.extended_traits?.need_for_cognitive_closure
    ? parseFloat(persona.trait_profile.extended_traits.need_for_cognitive_closure)
    : 0.5;
    
  const conformity = persona.trait_profile?.extended_traits?.conformity_tendency
    ? parseFloat(persona.trait_profile.extended_traits.conformity_tendency)
    : 0.5;
    
  // Create personalized insights based on the persona's traits
  const occupation = persona.metadata?.occupation || "";
  const age = persona.metadata?.age ? parseInt(persona.metadata.age as string) : 30;
  const education = persona.metadata?.education_level || "";
  
  // Generate unique insights for this persona based on their traits and demographics
  return {
    decision: risk > 0.6 
      ? "Cautious decision-maker who thoroughly evaluates options before acting. Prefers established solutions with proven track records."
      : "Comfortable with ambiguity and quick to make decisions with incomplete information. Willing to pivot when circumstances change.",
    
    driver: openness > 0.6
      ? `${age > 40 ? "Experienced explorer who" : "Young innovator who"} seeks novel experiences and intellectual challenges. Values creative expression and autonomy.`
      : `${occupation ? `Practical ${occupation.toLowerCase()} who` : "Pragmatic individual who"} prioritizes tangible results and proven methods. Values consistency and reliability.`,
    
    persuasion: agreeableness > 0.6
      ? `${education.includes("Social") ? "Socially-minded communicator who" : "Collaborative thinker who"} values harmony in discussions and responds to cooperative approaches.`
      : `${education.includes("Business") || education.includes("Economics") ? "Strategic thinker who" : "Direct communicator who"} focuses on facts, logic, and bottom-line results.`,
      
    bias: truthOrientation < 0.4
      ? "May prioritize social harmony or self-interest over factual accuracy. Tends to engage in motivated reasoning when challenged."
      : conformity > 0.7
      ? "Strongly influenced by social norms and group consensus. May discount contradictory evidence that challenges established views."
      : "Generally balanced in evaluating information, though may show some preference for data that confirms existing beliefs.",
      
    cognitive: cognitiveFlexibility > 0.7 && needForClosure < 0.4
      ? "Highly adaptive thinker comfortable with ambiguity. Open to revising beliefs when presented with new information."
      : cognitiveFlexibility < 0.4 && needForClosure > 0.7
      ? "Prefers clear answers and structured thinking. May resist changing established views even when confronted with contradictory evidence."
      : "Balances between structure and flexibility in thinking. Can adapt to new information but values some consistency in beliefs."
  };
};
