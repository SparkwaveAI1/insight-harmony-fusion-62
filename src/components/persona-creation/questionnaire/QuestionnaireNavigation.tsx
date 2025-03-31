
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuestionnaireNavigationProps {
  isSubmitting: boolean;
}

const QuestionnaireNavigation: React.FC<QuestionnaireNavigationProps> = ({ isSubmitting }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate("/persona-creation/screener")}
      >
        Back
      </Button>
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
    </div>
  );
};

export default QuestionnaireNavigation;
