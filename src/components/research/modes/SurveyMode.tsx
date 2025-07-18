
import React from 'react';
import UnifiedSurveyInterface from '../UnifiedSurveyInterface';

interface SurveyModeProps {
  onBack: () => void;
}

const SurveyMode: React.FC<SurveyModeProps> = ({ onBack }) => {
  return <UnifiedSurveyInterface onBack={onBack} />;
};

export default SurveyMode;
