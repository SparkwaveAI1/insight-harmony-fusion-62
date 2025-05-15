
import React from 'react';
import { Brain, Target, Users, Sparkles, LineChart } from 'lucide-react';

interface PersonaInsight {
  decision: string;
  driver: string;
  persuasion: string;
  bias: string;
  cognitive: string;
}

interface PersonaInsightsProps {
  insights: PersonaInsight;
}

const PersonaInsights: React.FC<PersonaInsightsProps> = ({ insights }) => {
  return (
    <>
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

export default PersonaInsights;
