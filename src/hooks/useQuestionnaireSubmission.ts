
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { updateParticipantQuestionnaireById, updateParticipantInterview } from "@/services/supabase/supabaseService";
import { FormSchema } from "@/schemas/personaQuestionnaireSchema";
import { UseFormReturn } from "react-hook-form";

export const useQuestionnaireSubmission = (
  form: UseFormReturn<FormSchema>,
  participantId: string | null,
  participantIdentifier: string | null
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormSchema) => {
    if (!participantId) {
      toast({
        title: "Session Error",
        description: "Your session information is missing. Please start from the screener.",
        variant: "destructive",
      });
      navigate("/persona-creation/screener");
      return;
    }

    setIsSubmitting(true);

    try {
      const dataWithId = {
        ...data,
        identification: {
          ...data.identification,
          participantId: participantIdentifier || data.identification.participantId,
        }
      };
      
      const valuesObj = dataWithId.values as FormSchema['values'] | undefined;
      if (valuesObj && valuesObj.worldview === "Do no harm, take no shit") {
        valuesObj.worldview = "Respect others, stand your ground";
      }

      const updated = await updateParticipantQuestionnaireById(participantId, dataWithId);
      
      if (updated) {
        await updateParticipantInterview(participantId, { interview_completed: true });
        
        toast({
          title: "Questionnaire Completed",
          description: "Thank you for completing the questionnaire! We will be in touch within 24 hours with information about your Conversational Interview, the final step in creating your persona.",
          duration: 10000,
        });
        
        sessionStorage.removeItem("participant_email");
        
        // Use navigate with replace option to prevent back navigation
        navigate("/persona-creation/complete", { replace: true });
      } else {
        throw new Error("Failed to save questionnaire data");
      }
    } catch (error) {
      console.error("Error saving questionnaire data:", error);
      toast({
        title: "Submission Error",
        description: "There was an error saving your responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    onSubmit
  };
};
