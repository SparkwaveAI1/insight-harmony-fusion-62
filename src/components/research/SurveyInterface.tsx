
import React, { useState } from 'react';
import UnifiedSurveyInterface from './UnifiedSurveyInterface';

interface SurveyInterfaceProps {
  onBack?: () => void;
}

const SurveyInterface: React.FC<SurveyInterfaceProps> = ({ onBack }) => {
  return <UnifiedSurveyInterface onBack={onBack} />;
};

export default SurveyInterface;
