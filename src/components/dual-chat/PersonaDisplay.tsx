
import React from 'react';
import Card from '@/components/ui-custom/Card';
import { Persona } from '@/services/persona/types';
import { Brain, Target, Users, Sparkles, LineChart } from 'lucide-react';

interface PersonaDisplayProps {
  personaA: Persona | null;
  personaB: Persona | null;
  personaAId: string;
  personaBId: string;
}

const PersonaDisplay: React.FC<PersonaDisplayProps> = ({
  personaA,
  personaB,
  personaAId,
  personaBId
}) => {
  if (!personaA || !personaB) {
    return (
      <Card className="mb-6 p-4 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-md p-4 bg-[#F5F5F7]">
            <p className="font-semibold">Persona A {personaA ? '(Loaded)' : '(Not Loaded)'}</p>
            <p className="text-sm text-muted-foreground">ID: {personaAId}</p>
            {!personaA && (
              <div className="mt-2 text-red-500 text-sm">
                Error: Persona could not be loaded. Please check the ID and try again.
              </div>
            )}
          </div>
          <div className="border rounded-md p-4 bg-[#F5F5F7]">
            <p className="font-semibold">Persona B {personaB ? '(Loaded)' : '(Not Loaded)'}</p>
            <p className="text-sm text-muted-foreground">ID: {personaBId}</p>
            {!personaB && (
              <div className="mt-2 text-red-500 text-sm">
                Error: Persona could not be loaded. Please check the ID and try again.
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Helper function to get unique persona insights
  const getPersonaInsights = (persona: Persona) => {
    // Custom insights for specific personas
    const customPersonas: Record<string, {
      decision: string;
      driver: string;
      persuasion: string;
      bias: string;
      cognitive: string;
    }> = {
      // First persona: 5e22fdc2
      "5e22fdc2": {
        decision: "Approaches decisions with careful research and data analysis. Prefers structured evaluation frameworks to reduce uncertainty.",
        driver: "Motivated by professional recognition and intellectual growth. Values stability and predictable outcomes over high-risk ventures.",
        persuasion: "Responds best to logical arguments backed by credible evidence. Values detailed explanations over emotional appeals."
      },
      // Second persona: c69eb1eb
      "c69eb1eb": {
        decision: "Makes quick, intuitive decisions based on past experiences. Comfortable taking calculated risks when potential rewards are clear.",
        driver: "Motivated primarily by creative freedom and autonomy. Seeks opportunities for self-expression and innovation.",
        persuasion: "Persuaded by stories and real-world examples rather than statistics. Appreciates authentic communication with emotional resonance."
      },
      // Third persona: 4f7b9e3c
      "4f7b9e3c": {
        decision: "Balances intuition with collaborative input from trusted peers. Considers social and ethical implications before taking action.",
        driver: "Motivated by creating positive social impact through their work. Values community connection and shared accomplishments.",
        persuasion: "Responds to inclusive language and community-focused messaging. Prefers solutions that benefit multiple stakeholders."
      },
      // Alina R persona
      "9f8540fa": {
        decision: "Relies on data visualization tools for complex financial decisions. Balances risk and reward through multi-scenario modeling.",
        driver: "Motivated by sustainable growth and ethical investing principles. Values work-life integration and financial security.",
        persuasion: "Responds to evidence-based arguments with practical applications. Appreciates detailed analysis backed by real-world examples."
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

  // Helper function to render persona details with unique insights
  const renderPersonaDetails = (persona: Persona) => {
    const insights = getPersonaInsights(persona);
    
    return (
      <>
        <h3 className="text-lg font-semibold">{persona.name}</h3>
        <p className="text-sm text-muted-foreground">ID: {persona.persona_id}</p>
        
        {/* Demographics */}
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-1">Demographics</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-medium">Age</p>
              <p>{persona.metadata?.age || 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium">Gender</p>
              <p>{persona.metadata?.gender || 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium">Occupation</p>
              <p>{persona.metadata?.occupation || 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium">Region</p>
              <p>{persona.metadata?.region || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Decisions section */}
        <div className="mt-3 bg-blue-50/30 p-2 rounded">
          <div className="flex items-center gap-1 mb-1">
            <Brain className="h-3 w-3 text-primary" />
            <h4 className="text-sm font-medium">Decisions</h4>
          </div>
          <p className="text-xs">{insights.decision}</p>
        </div>
        
        {/* Drivers section */}
        <div className="mt-3 bg-green-50/30 p-2 rounded">
          <div className="flex items-center gap-1 mb-1">
            <Target className="h-3 w-3 text-primary" />
            <h4 className="text-sm font-medium">Drivers</h4>
          </div>
          <p className="text-xs">{insights.driver}</p>
        </div>
        
        {/* Persuasion section */}
        <div className="mt-3 bg-purple-50/30 p-2 rounded">
          <div className="flex items-center gap-1 mb-1">
            <Users className="h-3 w-3 text-primary" />
            <h4 className="text-sm font-medium">Discussion & Persuasion</h4>
          </div>
          <p className="text-xs">{insights.persuasion}</p>
        </div>
        
        {/* Bias section */}
        <div className="mt-3 bg-amber-50/30 p-2 rounded">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <h4 className="text-sm font-medium">Biases & Beliefs</h4>
          </div>
          <p className="text-xs">{insights.bias}</p>
        </div>
        
        {/* Cognitive style section */}
        <div className="mt-3 bg-cyan-50/30 p-2 rounded">
          <div className="flex items-center gap-1 mb-1">
            <LineChart className="h-3 w-3 text-primary" />
            <h4 className="text-sm font-medium">Cognitive Style</h4>
          </div>
          <p className="text-xs">{insights.cognitive}</p>
        </div>
      </>
    );
  };

  return (
    <Card className="mb-6 p-4 shadow-md">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-md p-4 bg-[#F8F9FA]">
          {renderPersonaDetails(personaA)}
        </div>
        
        <div className="border rounded-md p-4 bg-[#F8F9FA]">
          {renderPersonaDetails(personaB)}
        </div>
      </div>
    </Card>
  );
};

export default PersonaDisplay;
