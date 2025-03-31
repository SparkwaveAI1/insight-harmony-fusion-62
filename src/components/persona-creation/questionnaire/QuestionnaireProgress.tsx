
import React from "react";
import { Button } from "@/components/ui/button";
import { sections } from "@/constants/personaQuestionnaireSections";

interface QuestionnaireProgressProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const QuestionnaireProgress: React.FC<QuestionnaireProgressProps> = ({ 
  activeSection, 
  setActiveSection 
}) => {
  return (
    <div className="mb-8 bg-muted/30 p-4 rounded-lg">
      <h2 className="text-lg font-medium mb-3">Progress</h2>
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuestionnaireProgress;
