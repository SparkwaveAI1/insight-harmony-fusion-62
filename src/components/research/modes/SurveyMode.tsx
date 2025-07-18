
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import UnifiedSurveyInterface from '@/components/research/UnifiedSurveyInterface';

interface SurveyModeProps {
  onBack: () => void;
}

const SurveyMode: React.FC<SurveyModeProps> = ({ onBack }) => {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Research Modes
        </Button>
        <h2 className="text-2xl font-bold mb-2">Survey Study</h2>
        <p className="text-muted-foreground">Create and run structured surveys with multiple personas</p>
      </div>
      
      <UnifiedSurveyInterface onBack={onBack} />
    </div>
  );
};

export default SurveyMode;
