
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuestionnaireNavigationProps {
  isSubmitting: boolean;
  activeSection: string;
  setActiveSection: (section: string) => void;
  isLastSection: boolean;
  isFirstSection: boolean;
  handleNext: () => void;
  handlePrevious: () => void;
}

const QuestionnaireNavigation: React.FC<QuestionnaireNavigationProps> = ({ 
  isSubmitting,
  activeSection,
  isLastSection,
  isFirstSection,
  handleNext,
  handlePrevious
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between pt-6">
      {isFirstSection ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/persona-creation/consent-form")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Consent
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
      )}
      
      {isLastSection ? (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Complete Questionnaire"
          )}
        </Button>
      ) : (
        <Button type="button" onClick={handleNext}>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default QuestionnaireNavigation;
