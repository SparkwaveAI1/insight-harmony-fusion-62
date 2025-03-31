
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { sections } from "@/constants/personaQuestionnaireSections";
import { FormSchema } from "@/schemas/personaQuestionnaireSchema";

export const useQuestionnaireNavigation = (
  saveProgress: () => Promise<void>,
  form: UseFormReturn<FormSchema>
) => {
  const [activeSection, setActiveSection] = useState<string>("identification");
  
  const currentSectionIndex = sections.findIndex(section => section.id === activeSection);
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;

  // Validate current section fields
  const validateSection = async (sectionId: string): Promise<boolean> => {
    let isValid = true;
    
    switch (sectionId) {
      case "identification":
        // Check required fields in identification section
        await form.trigger(["identification.name", "identification.email"]);
        isValid = !form.formState.errors.identification?.name && 
                  !form.formState.errors.identification?.email;
        break;
      
      // Add validation for other required sections as needed
      // Optional sections like "final" don't need validation
        
      default:
        isValid = true;
    }
    
    return isValid;
  };

  const handleNext = async () => {
    if (!isLastSection) {
      const isValid = await validateSection(activeSection);
      
      if (isValid) {
        const nextSection = sections[currentSectionIndex + 1];
        setActiveSection(nextSection.id);
        saveProgress();
      } else {
        // Fields are invalid, form will display error messages
        console.log("Please complete all required fields before proceeding.");
      }
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
