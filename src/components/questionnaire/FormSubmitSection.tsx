
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FormSubmitSectionProps {
  isSubmitting: boolean;
}

const FormSubmitSection = ({ isSubmitting }: FormSubmitSectionProps) => {
  return (
    <div className="pt-6">
      <p className="text-center text-muted-foreground mb-8">
        This helps us build a realistic, thoughtful AI version of you for research purposes. 
        The next step is a guided interview—focused on your experiences, insights, and unique perspective.
      </p>
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          size="lg" 
          className="group"
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
