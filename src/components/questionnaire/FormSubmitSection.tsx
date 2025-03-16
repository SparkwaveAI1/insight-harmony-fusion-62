
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface FormSubmitSectionProps {
  isSubmitting: boolean;
  email?: string;
}

const FormSubmitSection = ({ isSubmitting, email }: FormSubmitSectionProps) => {
  return (
    <div className="pt-6">
      <p className="text-center text-muted-foreground mb-8">
        This helps us build a realistic, thoughtful AI version of you for research purposes. 
        The next step is a fully interactive voice interview—you'll speak directly with our AI interviewer to explore your perspectives in more depth.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link 
          to="/ai-voice-interview" 
          state={{ email }} 
          className="w-full sm:w-auto"
        >
          <Button 
            type="button" 
            variant="outline" 
            size="lg" 
            className="group w-full sm:w-auto"
            disabled={isSubmitting}
          >
            Continue to Voice Interview
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        
        <Button 
          type="submit" 
          size="lg" 
          className="group w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>Submitting...</>
          ) : (
            <>
              Submit Questionnaire
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FormSubmitSection;
