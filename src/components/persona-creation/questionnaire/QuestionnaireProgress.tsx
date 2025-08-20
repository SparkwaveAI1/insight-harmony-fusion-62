
import React from "react";
import { sections } from "@/constants/personaQuestionnaireSections";

interface QuestionnaireProgressProps {
  activeSection: string;
}

const QuestionnaireProgress: React.FC<QuestionnaireProgressProps> = ({ 
  activeSection
}) => {
  // Find current section index
  const currentSectionIndex = sections.findIndex(section => section.id === activeSection);
  const totalSections = sections.length;
  
  // Get current section
  const currentSection = sections[currentSectionIndex];
  
  // Calculate progress percentage
  const progressPercent = ((currentSectionIndex + 1) / totalSections) * 100;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium">
          Section {currentSectionIndex + 1} of {totalSections}: {currentSection.label}
        </h2>
        <span className="text-sm text-muted-foreground">
          {Math.round(progressPercent)}% complete
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

export default QuestionnaireProgress;
