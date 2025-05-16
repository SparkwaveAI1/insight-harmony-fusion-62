
import React from 'react';
import { Brain, Target, Users, Sparkles, LineChart } from 'lucide-react';
import { SpeedInsight } from './PersonaInsightUtils';

interface PersonaInsightsProps {
  insights: SpeedInsight[];
}

const PersonaInsights: React.FC<PersonaInsightsProps> = ({ insights }) => {
  // Extract insights for each category
  const communicationInsight = insights.find(i => i.category === 'communication') || { value: 'Not available', speed: 'slow' };
  const decisionInsight = insights.find(i => i.category === 'decision') || { value: 'Not available', speed: 'slow' };
  const learningInsight = insights.find(i => i.category === 'learning') || { value: 'Not available', speed: 'slow' };
  const workEthicInsight = insights.find(i => i.category === 'workEthic') || { value: 'Not available', speed: 'slow' };
  const conflictInsight = insights.find(i => i.category === 'conflict') || { value: 'Not available', speed: 'slow' };

  return (
    <>
      {/* Decisions section */}
      <div className="mt-3 bg-blue-50/30 p-2 rounded">
        <div className="flex items-center gap-1 mb-1">
          <Brain className="h-3 w-3 text-primary" />
          <h4 className="text-sm font-medium">Decisions</h4>
        </div>
        <p className="text-xs">{decisionInsight.value}</p>
      </div>
      
      {/* Drivers section */}
      <div className="mt-3 bg-green-50/30 p-2 rounded">
        <div className="flex items-center gap-1 mb-1">
          <Target className="h-3 w-3 text-primary" />
          <h4 className="text-sm font-medium">Communication</h4>
        </div>
        <p className="text-xs">{communicationInsight.value}</p>
      </div>
      
      {/* Learning section */}
      <div className="mt-3 bg-purple-50/30 p-2 rounded">
        <div className="flex items-center gap-1 mb-1">
          <Users className="h-3 w-3 text-primary" />
          <h4 className="text-sm font-medium">Learning Style</h4>
        </div>
        <p className="text-xs">{learningInsight.value}</p>
      </div>
      
      {/* Work Ethic section */}
      <div className="mt-3 bg-amber-50/30 p-2 rounded">
        <div className="flex items-center gap-1 mb-1">
          <Sparkles className="h-3 w-3 text-primary" />
          <h4 className="text-sm font-medium">Work Ethic</h4>
        </div>
        <p className="text-xs">{workEthicInsight.value}</p>
      </div>
      
      {/* Conflict Resolution section */}
      <div className="mt-3 bg-cyan-50/30 p-2 rounded">
        <div className="flex items-center gap-1 mb-1">
          <LineChart className="h-3 w-3 text-primary" />
          <h4 className="text-sm font-medium">Conflict Resolution</h4>
        </div>
        <p className="text-xs">{conflictInsight.value}</p>
      </div>
    </>
  );
};

export default PersonaInsights;
