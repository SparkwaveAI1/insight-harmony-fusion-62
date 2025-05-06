
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
    
    // Generate insights based on metadata if available
    const occupation = metadata?.occupation || "";
    const age = metadata?.age || "";
    const education = metadata?.education_level || "";
    const region = metadata?.region || "";
    
    // Fallback to generating insights based on available metadata
    // These will be unique based on the combination of demographic factors
    const generatedInsights = {
      decisions: [
        `${occupation ? `Uses ${occupation.toLowerCase()} expertise when evaluating options` : "Evaluates options through data-driven analysis"}`,
        `${age > 40 ? "Draws on extensive life experience when making choices" : "Open to exploring innovative approaches and taking calculated risks"}`
      ],
      drivers: [
        `${education.includes("Master") || education.includes("PhD") ? "Motivated by intellectual challenges and continuous learning" : "Motivated by practical outcomes and tangible results"}`,
        `${region ? `Influenced by ${region}'s cultural and economic environment` : "Balances personal growth with professional advancement"}`
      ],
      persuasion: [
        `${occupation.includes("Manager") || occupation.includes("Director") ? "Responds to well-structured proposals with clear ROI" : "Appreciates authentic communication with relatable examples"}`,
        `${education.includes("Business") ? "Evaluates opportunities through a strategic business lens" : "Values both emotional connection and logical reasoning"}`
      ]
    };
    
    return generatedInsights;
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
