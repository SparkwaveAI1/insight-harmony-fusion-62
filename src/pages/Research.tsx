
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PersonaProvider } from '@/context/PersonaProvider';
import { Toaster } from 'sonner';
import Header from '@/components/layout/Header';
import ResearchModeSelector from '@/components/research/ResearchModeSelector';
import InterviewMode from '@/components/research/modes/InterviewMode';
import FocusGroupMode from '@/components/research/modes/FocusGroupMode';
import SurveyMode from '@/components/research/modes/SurveyMode';

type ResearchMode = 'selector' | 'interview' | 'focus-group' | 'survey';

const Research: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [currentMode, setCurrentMode] = useState<ResearchMode>('selector');

  const handleModeSelect = (mode: 'interview' | 'focus-group' | 'survey') => {
    setCurrentMode(mode);
  };

  const handleBackToSelector = () => {
    setCurrentMode('selector');
  };

  const renderCurrentMode = () => {
    switch (currentMode) {
      case 'interview':
        return <InterviewMode onBack={handleBackToSelector} />;
      case 'focus-group':
        return <FocusGroupMode onBack={handleBackToSelector} />;
      case 'survey':
        return <SurveyMode onBack={handleBackToSelector} />;
      default:
        return <ResearchModeSelector onSelectMode={handleModeSelect} />;
    }
  };

  return (
    <PersonaProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow pt-20">
          {renderCurrentMode()}
        </main>
        <Toaster />
      </div>
    </PersonaProvider>
  );
};

export default Research;
