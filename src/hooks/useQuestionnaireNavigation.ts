
import { useState } from "react";
import { sections } from "@/constants/personaQuestionnaireSections";

export const useQuestionnaireNavigation = (saveProgress: () => Promise<void>) => {
  const [activeSection, setActiveSection] = useState<string>("identification");
  
  const currentSectionIndex = sections.findIndex(section => section.id === activeSection);
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;

  const handleNext = () => {
    if (!isLastSection) {
      const nextSection = sections[currentSectionIndex + 1];
      setActiveSection(nextSection.id);
      saveProgress();
    }
  };

  const handlePrevious = () => {
    if (!isFirstSection) {
      const prevSection = sections[currentSectionIndex - 1];
      setActiveSection(prevSection.id);
    }
  };

  return {
    activeSection,
    setActiveSection,
    isFirstSection,
    isLastSection,
    handleNext,
    handlePrevious
  };
};
