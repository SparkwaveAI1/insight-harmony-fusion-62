
import { useEffect } from "react";
import { useQuestionnaireForm } from "./useQuestionnaireForm";
import { useQuestionnaireNavigation } from "./useQuestionnaireNavigation";
import { useQuestionnaireSession } from "./useQuestionnaireSession";
import { useQuestionnaireDataManagement } from "./useQuestionnaireDataManagement";
import { useQuestionnaireSubmission } from "./useQuestionnaireSubmission";

export const usePersonaQuestionnaire = () => {
  const { form } = useQuestionnaireForm();
  const { participantId, participantEmail, participantIdentifier } = useQuestionnaireSession();
  const { loadExistingData, saveProgress } = useQuestionnaireDataManagement(form, participantId, participantIdentifier);
  const { activeSection, setActiveSection, isFirstSection, isLastSection, handleNext, handlePrevious } = 
    useQuestionnaireNavigation(saveProgress);
  const { isSubmitting, onSubmit } = useQuestionnaireSubmission(form, participantId, participantIdentifier);

  // Set participant ID in form if available
  useEffect(() => {
    if (participantIdentifier) {
      form.setValue("identification.participantId", participantIdentifier);
    }
  }, [participantIdentifier, form]);

  // Load existing data when participantId is available
  useEffect(() => {
    if (participantId) {
      loadExistingData();
    }
  }, [participantId]);

  return {
    form,
    activeSection,
    setActiveSection,
    isSubmitting,
    participantId,
    participantIdentifier,
    onSubmit,
    isFirstSection,
    isLastSection,
    handleNext,
    handlePrevious
  };
};
