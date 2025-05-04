
import React from "react";
import { Brain, Target, Users } from "lucide-react";

interface PersonaKeyInsightsProps {
  metadata: any;
}

const PersonaKeyInsights = ({ metadata }: PersonaKeyInsightsProps) => {
  // Determine if this is Alina R's persona by checking ID or unique characteristics
  const isAlinaR = metadata?.persona_id === '9f8540fa' || 
                  (metadata?.name?.includes('Alina') && metadata?.occupation === 'Financial Analyst');
  
  // Define custom insights for Alina R
  const alinaDecisions = [
    "Relies on data visualization tools for complex financial decisions",
    "Balances risk and reward through multi-scenario modeling"
  ];
  
  const alinaDrivers = [
    "Motivated by sustainable growth and ethical investing principles",
    "Values work-life integration and financial security"
  ];
  
  const alinaPersuasion = [
    "Responds to evidence-based arguments with practical applications",
    "Appreciates detailed analysis backed by real-world examples"
  ];
  
  // Extract the appropriate insights based on the persona
  const decisions = isAlinaR ? 
    alinaDecisions : 
    metadata?.decision_making_style || [
      "Evaluates options through data-driven analysis",
      "Takes calculated risks after thorough research"
    ];
  
  const drivers = isAlinaR ? 
    alinaDrivers : 
    metadata?.motivational_drivers || [
      "Motivated by long-term financial independence",
      "Values innovation and sustainable business practices"
    ];
  
  const persuasion = isAlinaR ? 
    alinaPersuasion : 
    metadata?.persuasion_approach || [
      "Receptive to peer recommendations and trends",
      "Persuaded by evidence and social proof"
    ];

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
