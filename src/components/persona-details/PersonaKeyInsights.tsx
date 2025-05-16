
import React from "react";
import { Brain, Target, Users } from "lucide-react";

interface PersonaKeyInsightsProps {
  metadata: any;
}

const PersonaKeyInsights = ({ metadata }: PersonaKeyInsightsProps) => {
  // Generate unique insights based on persona ID
  const generateUniqueInsights = (personaId: string, metadata: any) => {
    // Personas we're specifically customizing
    const customPersonas: Record<string, {
      decisions: string[];
      drivers: string[];
      persuasion: string[];
    }> = {
      // First persona: 5e22fdc2
      "5e22fdc2": {
        decisions: [
          "Approaches decisions with careful research and data analysis",
          "Prefers structured evaluation frameworks to reduce uncertainty"
        ],
        drivers: [
          "Motivated by professional recognition and intellectual growth",
          "Values stability and predictable outcomes over high-risk ventures"
        ],
        persuasion: [
          "Responds best to logical arguments backed by credible evidence",
          "Values detailed explanations over emotional appeals"
        ]
      },
      // Second persona: c69eb1eb
      "c69eb1eb": {
        decisions: [
          "Makes quick, intuitive decisions based on past experiences",
          "Comfortable taking calculated risks when potential rewards are clear"
        ],
        drivers: [
          "Motivated primarily by creative freedom and autonomy",
          "Seeks opportunities for self-expression and innovation"
        ],
        persuasion: [
          "Persuaded by stories and real-world examples rather than statistics",
          "Appreciates authentic communication with emotional resonance"
        ]
      },
      // Third persona: 4f7b9e3c
      "4f7b9e3c": {
        decisions: [
          "Balances intuition with collaborative input from trusted peers",
          "Considers social and ethical implications before taking action"
        ],
        drivers: [
          "Motivated by creating positive social impact through their work",
          "Values community connection and shared accomplishments"
        ],
        persuasion: [
          "Responds to inclusive language and community-focused messaging",
          "Prefers solutions that benefit multiple stakeholders"
        ]
      },
      // The existing Alina R profile
      "9f8540fa": {
        decisions: [
          "Relies on data visualization tools for complex financial decisions",
          "Balances risk and reward through multi-scenario modeling"
        ],
        drivers: [
          "Motivated by sustainable growth and ethical investing principles",
          "Values work-life integration and financial security"
        ],
        persuasion: [
          "Responds to evidence-based arguments with practical applications",
          "Appreciates detailed analysis backed by real-world examples"
        ]
      }
    };

    // First check if we have a custom persona by ID
    if (personaId && customPersonas[personaId]) {
      return customPersonas[personaId];
    }

    // If no match by ID, check if it's Alina by name/occupation (maintain backward compatibility)
    const isAlinaR = metadata?.persona_id === '9f8540fa' || 
                    (metadata?.name?.includes('Alina') && metadata?.occupation === 'Financial Analyst');
    
    if (isAlinaR) {
      return customPersonas['9f8540fa'];
    }
    
    // Generate more nuanced insights based on multiple data points
    const generateDecisions = () => {
      const bigFive = metadata?.trait_profile?.big_five || {};
      const occupation = metadata?.occupation || "";
      const education = metadata?.education_level || "";
      const riskSensitivity = metadata?.trait_profile?.behavioral_economics?.risk_sensitivity || 0.5;
      
      // Use multiple factors for decisions
      const decisions = [];
      
      if (parseFloat(riskSensitivity) > 0.7) {
        decisions.push(`Takes a cautious approach to decision-making, carefully weighing potential downsides`);
      } else if (parseFloat(riskSensitivity) < 0.3) {
        decisions.push(`Embraces risk in decision-making, focusing on potential opportunities over threats`);
      } else if (parseFloat(bigFive?.conscientiousness) > 0.7) {
        decisions.push(`Follows systematic decision-making processes with thorough evaluation of options`);
      } else if (parseFloat(bigFive?.openness) > 0.7) {
        decisions.push(`Values innovative approaches and considers unconventional alternatives`);
      } else if (education?.includes("PhD") || education?.includes("Doctorate")) {
        decisions.push(`Applies rigorous analytical frameworks from academic training to complex decisions`);
      } else if (occupation?.includes("Manager") || occupation?.includes("Executive") || occupation?.includes("Director")) {
        decisions.push(`Balances analytical thinking with practical business considerations`);
      } else if (occupation?.includes("Artist") || occupation?.includes("Creative") || occupation?.includes("Designer")) {
        decisions.push(`Leads with intuition and creative vision when evaluating options`);
      } else {
        decisions.push(`Combines practical experience with thoughtful analysis when making choices`);
      }
      
      // Add a second insight based on different factors
      if (parseFloat(bigFive?.neuroticism) > 0.6) {
        decisions.push(`May second-guess decisions or seek reassurance after committing to a course of action`);
      } else if (parseFloat(bigFive?.extraversion) > 0.6 && parseFloat(bigFive?.openness) > 0.5) {
        decisions.push(`Often gathers input from others before finalizing important decisions`);
      } else if (parseFloat(bigFive?.agreeableness) > 0.7) {
        decisions.push(`Considers how decisions will impact relationships and group harmony`);
      } else if (occupation?.includes("Analyst") || occupation?.includes("Engineer") || occupation?.includes("Scientist")) {
        decisions.push(`Prioritizes objective data and measurable outcomes in decision processes`);
      } else if (occupation?.includes("Teacher") || occupation?.includes("Healthcare")) {
        decisions.push(`Weighs both immediate needs and long-term development in decision-making`);
      } else {
        decisions.push(`Adapts decision approach based on the specific context and stakes involved`);
      }
      
      return decisions;
    };
    
    const generateDrivers = () => {
      const bigFive = metadata?.trait_profile?.big_five || {};
      const extended = metadata?.trait_profile?.extended_traits || {};
      const moralFoundations = metadata?.trait_profile?.moral_foundations || {};
      const age = metadata?.age ? parseInt(metadata.age) : 35;
      const region = metadata?.region || "";
      
      const drivers = [];
      
      // Primary motivation
      if (parseFloat(moralFoundations?.care) > 0.7) {
        drivers.push(`Strongly motivated by opportunities to care for and support others`);
      } else if (parseFloat(bigFive?.achievement) > 0.7 || parseFloat(extended?.self_efficacy) > 0.7) {
        drivers.push(`Driven by personal achievement and setting challenging goals`);
      } else if (parseFloat(bigFive?.openness) > 0.7) {
        drivers.push(`Energized by intellectual exploration and creative possibilities`);
      } else if (age < 30) {
        drivers.push(`Motivated by building skills and establishing professional identity`);
      } else if (age > 50) {
        drivers.push(`Drawn to meaningful work that aligns with personal values and legacy`);
      } else if (region) {
        drivers.push(`Balances career ambitions with cultural values common in ${region}`);
      } else {
        drivers.push(`Motivated by a combination of professional growth and personal fulfillment`);
      }
      
      // Secondary values
      if (parseFloat(moralFoundations?.fairness) > 0.7) {
        drivers.push(`Values equity and fairness in systems and relationships`);
      } else if (parseFloat(bigFive?.extraversion) > 0.7) {
        drivers.push(`Energized by social recognition and collaborative achievements`);
      } else if (parseFloat(bigFive?.conscientiousness) > 0.7) {
        drivers.push(`Values structure, organization, and following through on commitments`);
      } else if (parseFloat(extended?.self_awareness) > 0.7) {
        drivers.push(`Prioritizes authentic self-expression and personal growth`);
      } else {
        drivers.push(`Balances material security with opportunities for meaningful experiences`);
      }
      
      return drivers;
    };
    
    const generatePersuasion = () => {
      const bigFive = metadata?.trait_profile?.big_five || {};
      const extended = metadata?.trait_profile?.extended_traits || {};
      const worldValues = metadata?.trait_profile?.world_values || {};
      const occupation = metadata?.occupation || "";
      const education = metadata?.education_level || "";
      
      const persuasion = [];
      
      // Response to communication style
      if (parseFloat(bigFive?.openness) < 0.4) {
        persuasion.push(`Responds best to practical, straightforward communication with clear benefits`);
      } else if (parseFloat(worldValues?.traditional_vs_secular) < 0.3) {
        persuasion.push(`Receptive to messages that respect tradition and established values`);
      } else if (education?.includes("Graduate") || education?.includes("Master") || education?.includes("PhD")) {
        persuasion.push(`Values well-researched arguments that acknowledge complexity and nuance`);
      } else if (parseFloat(extended?.truth_orientation) > 0.7) {
        persuasion.push(`Appreciates honest, direct communication even when messages are challenging`);
      } else if (occupation?.includes("Creative") || occupation?.includes("Marketing")) {
        persuasion.push(`Resonates with visually engaging content and narrative-driven approaches`);
      } else {
        persuasion.push(`Responds to balanced communication that addresses both logic and values`);
      }
      
      // Trust-building factors
      if (parseFloat(bigFive?.agreeableness) > 0.7) {
        persuasion.push(`Builds trust through warm, collaborative communication styles`);
      } else if (parseFloat(extended?.institutional_trust) < 0.4) {
        persuasion.push(`Values transparency and proof when evaluating claims from organizations`);
      } else if (parseFloat(bigFive?.conscientiousness) > 0.7) {
        persuasion.push(`Appreciates thorough preparation and attention to detail in presentations`);
      } else if (parseFloat(extended?.cognitive_flexibility) > 0.7) {
        persuasion.push(`Open to reconsidering positions when presented with compelling new evidence`);
      } else {
        persuasion.push(`Evaluates both emotional resonance and factual accuracy when forming opinions`);
      }
      
      return persuasion;
    };
    
    // Return dynamically generated insights
    return {
      decisions: generateDecisions(),
      drivers: generateDrivers(),
      persuasion: generatePersuasion()
    };
  };
  
  // Get the personalized insights
  const personaId = metadata?.persona_id;
  const insights = generateUniqueInsights(personaId, metadata);
  
  // Extract the appropriate insights
  const decisions = insights.decisions;
  const drivers = insights.drivers;
  const persuasion = insights.persuasion;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
        Key Insights
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Decisions section */}
        <div className="bg-white/60 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Decisions</h3>
          </div>
          <ul className="space-y-2 text-sm pl-1">
            {Array.isArray(decisions) 
              ? decisions.map((item, idx) => <li key={idx}>{item}</li>)
              : <li>{String(decisions)}</li>
            }
          </ul>
        </div>
        
        {/* Drivers section */}
        <div className="bg-white/60 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Drivers</h3>
          </div>
          <ul className="space-y-2 text-sm pl-1">
            {Array.isArray(drivers) 
              ? drivers.map((item, idx) => <li key={idx}>{item}</li>)
              : <li>{String(drivers)}</li>
            }
          </ul>
        </div>
        
        {/* Persuasion section */}
        <div className="bg-white/60 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">Discussion & Persuasion</h3>
          </div>
          <ul className="space-y-2 text-sm pl-1">
            {Array.isArray(persuasion) 
              ? persuasion.map((item, idx) => <li key={idx}>{item}</li>)
              : <li>{String(persuasion)}</li>
            }
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PersonaKeyInsights;
