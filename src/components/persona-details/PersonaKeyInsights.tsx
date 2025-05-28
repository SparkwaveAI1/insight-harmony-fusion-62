
import React from "react";
import { Brain, Target, Users } from "lucide-react";

interface PersonaKeyInsightsProps {
  metadata: any;
}

const PersonaKeyInsights = ({ metadata }: PersonaKeyInsightsProps) => {
  // Add debugging to see what data we're working with
  console.log("PersonaKeyInsights received metadata:", metadata);
  console.log("Persona ID:", metadata?.persona_id);
  console.log("Trait profile:", metadata?.trait_profile);

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
      // Ray Wv2 persona: ee23e252
      "ee23e252": {
        decisions: [
          "Makes decisions based on practical experience and proven methods",
          "Considers long-term consequences before committing to major changes"
        ],
        drivers: [
          "Motivated by achieving measurable results and tangible outcomes",
          "Values consistency and reliability in both work and relationships"
        ],
        persuasion: [
          "Responds to straightforward communication with clear benefits",
          "Prefers evidence-based arguments over theoretical concepts"
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
      console.log(`Using custom insights for persona: ${personaId}`);
      return customPersonas[personaId];
    }

    console.log(`Generating dynamic insights for persona: ${personaId}`);
    
    // Generate more accurate insights based on the actual trait data
    const generateDecisions = () => {
      const decisions = [];
      const traitProfile = metadata?.trait_profile || {};
      
      // More robust trait value parsing
      const getTraitValue = (path: string): number => {
        const parts = path.split('.');
        let value = traitProfile;
        
        for (const part of parts) {
          value = value?.[part];
          if (value === undefined || value === null) break;
        }
        
        if (typeof value === 'number') return Math.max(0, Math.min(1, value));
        if (typeof value === 'string') {
          const parsed = parseFloat(value);
          if (!isNaN(parsed)) return Math.max(0, Math.min(1, parsed));
          
          // Handle descriptive values
          const lowerValue = value.toLowerCase();
          if (lowerValue.includes('very high') || lowerValue.includes('high')) return 0.8;
          if (lowerValue.includes('moderate') || lowerValue.includes('medium')) return 0.5;
          if (lowerValue.includes('low') || lowerValue.includes('very low')) return 0.2;
        }
        
        return 0.5; // Default fallback
      };

      const conscientiousness = getTraitValue('big_five.conscientiousness');
      const openness = getTraitValue('big_five.openness');
      const riskSensitivity = getTraitValue('behavioral_economics.risk_sensitivity');
      const neuroticism = getTraitValue('big_five.neuroticism');
      
      console.log('Decision traits:', { conscientiousness, openness, riskSensitivity, neuroticism });

      // Primary decision-making style
      if (conscientiousness > 0.7) {
        decisions.push("Follows systematic decision-making processes with thorough evaluation of options");
      } else if (openness > 0.7) {
        decisions.push("Values innovative approaches and considers unconventional alternatives");
      } else if (riskSensitivity > 0.7) {
        decisions.push("Takes a cautious approach to decision-making, carefully weighing potential downsides");
      } else if (riskSensitivity < 0.3) {
        decisions.push("Embraces calculated risks in decision-making, focusing on potential opportunities");
      } else {
        decisions.push("Combines practical experience with thoughtful analysis when making choices");
      }

      // Secondary decision factor
      if (neuroticism > 0.6) {
        decisions.push("May seek additional validation or reassurance for important decisions");
      } else if (conscientiousness > 0.6) {
        decisions.push("Adapts decision approach based on the specific context and stakes involved");
      } else {
        decisions.push("Balances intuition with analytical thinking in decision processes");
      }

      return decisions;
    };
    
    const generateDrivers = () => {
      const drivers = [];
      const traitProfile = metadata?.trait_profile || {};
      
      const getTraitValue = (path: string): number => {
        const parts = path.split('.');
        let value = traitProfile;
        
        for (const part of parts) {
          value = value?.[part];
          if (value === undefined || value === null) break;
        }
        
        if (typeof value === 'number') return Math.max(0, Math.min(1, value));
        if (typeof value === 'string') {
          const parsed = parseFloat(value);
          if (!isNaN(parsed)) return Math.max(0, Math.min(1, parsed));
          
          const lowerValue = value.toLowerCase();
          if (lowerValue.includes('very high') || lowerValue.includes('high')) return 0.8;
          if (lowerValue.includes('moderate') || lowerValue.includes('medium')) return 0.5;
          if (lowerValue.includes('low') || lowerValue.includes('very low')) return 0.2;
        }
        
        return 0.5;
      };

      const achievement = getTraitValue('extended_traits.achievement');
      const care = getTraitValue('moral_foundations.care');
      const fairness = getTraitValue('moral_foundations.fairness');
      const extraversion = getTraitValue('big_five.extraversion');
      
      console.log('Driver traits:', { achievement, care, fairness, extraversion });

      // Primary motivation
      if (achievement > 0.7) {
        drivers.push("Driven by personal achievement and setting challenging goals");
      } else if (care > 0.7) {
        drivers.push("Strongly motivated by opportunities to care for and support others");
      } else if (fairness > 0.7) {
        drivers.push("Values equity and fairness in systems and relationships");
      } else {
        drivers.push("Motivated by a combination of professional growth and personal fulfillment");
      }

      // Secondary motivation
      if (extraversion > 0.7) {
        drivers.push("Energized by social recognition and collaborative achievements");
      } else if (metadata?.age && parseInt(metadata.age) < 30) {
        drivers.push("Motivated by building skills and establishing professional identity");
      } else if (metadata?.age && parseInt(metadata.age) > 50) {
        drivers.push("Drawn to meaningful work that aligns with personal values and legacy");
      } else {
        drivers.push("Balances material security with opportunities for meaningful experiences");
      }

      return drivers;
    };
    
    const generatePersuasion = () => {
      const persuasion = [];
      const traitProfile = metadata?.trait_profile || {};
      
      const getTraitValue = (path: string): number => {
        const parts = path.split('.');
        let value = traitProfile;
        
        for (const part of parts) {
          value = value?.[part];
          if (value === undefined || value === null) break;
        }
        
        if (typeof value === 'number') return Math.max(0, Math.min(1, value));
        if (typeof value === 'string') {
          const parsed = parseFloat(value);
          if (!isNaN(parsed)) return Math.max(0, Math.min(1, parsed));
          
          const lowerValue = value.toLowerCase();
          if (lowerValue.includes('very high') || lowerValue.includes('high')) return 0.8;
          if (lowerValue.includes('moderate') || lowerValue.includes('medium')) return 0.5;
          if (lowerValue.includes('low') || lowerValue.includes('very low')) return 0.2;
        }
        
        return 0.5;
      };

      const openness = getTraitValue('big_five.openness');
      const agreeableness = getTraitValue('big_five.agreeableness');
      const conscientiousness = getTraitValue('big_five.conscientiousness');
      const truthOrientation = getTraitValue('extended_traits.truth_orientation');
      
      console.log('Persuasion traits:', { openness, agreeableness, conscientiousness, truthOrientation });

      // Communication preference
      if (openness < 0.4) {
        persuasion.push("Responds best to practical, straightforward communication with clear benefits");
      } else if (truthOrientation > 0.7) {
        persuasion.push("Appreciates honest, direct communication even when messages are challenging");
      } else if (openness > 0.7) {
        persuasion.push("Values well-researched arguments that acknowledge complexity and nuance");
      } else {
        persuasion.push("Responds to balanced communication that addresses both logic and values");
      }

      // Trust-building preference
      if (agreeableness > 0.7) {
        persuasion.push("Builds trust through warm, collaborative communication styles");
      } else if (conscientiousness > 0.7) {
        persuasion.push("Appreciates thorough preparation and attention to detail in presentations");
      } else {
        persuasion.push("Evaluates both emotional resonance and factual accuracy when forming opinions");
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
  
  console.log("Generated insights:", insights);
  
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
