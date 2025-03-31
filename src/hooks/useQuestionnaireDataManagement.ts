
import { FormSchema } from "@/schemas/personaQuestionnaireSchema";
import { useToast } from "@/hooks/use-toast";
import { getParticipantById, updateParticipantQuestionnaireById } from "@/services/supabase/supabaseService";
import { UseFormReturn } from "react-hook-form";

export const useQuestionnaireDataManagement = (
  form: UseFormReturn<FormSchema>,
  participantId: string | null,
  participantIdentifier: string | null
) => {
  const { toast } = useToast();

  const loadExistingData = async () => {
    if (!participantId) return;
    
    try {
      const participant = await getParticipantById(participantId);
      if (participant && participant.questionnaire_data) {
        const existingData = participant.questionnaire_data;
        
        // Check if values exists and handle the worldview text replacement
        const valuesObj = existingData.values as FormSchema['values'] | undefined;
        if (valuesObj && valuesObj.worldview === "Do no harm, take no shit") {
          valuesObj.worldview = "Respect others, stand your ground";
        }
        
        if (existingData.identification) {
          form.reset({
            ...existingData,
            identification: {
              ...existingData.identification,
              participantId: participantIdentifier || existingData.identification.participantId,
            }
          });
          toast({
            title: "Data Loaded",
            description: "We've loaded your previous responses.",
          });
        }
      }
    } catch (error) {
      console.error("Error loading participant data:", error);
    }
  };

  const saveProgress = async () => {
    if (!participantId) return;
    
    try {
      const currentValues = form.getValues();
      
      // Check if values exists and handle the worldview text replacement
      const valuesObj = currentValues.values as FormSchema['values'] | undefined;
      if (valuesObj && valuesObj.worldview === "Do no harm, take no shit") {
        valuesObj.worldview = "Respect others, stand your ground";
      }
      
      await updateParticipantQuestionnaireById(participantId, currentValues);
      console.log("Progress auto-saved");
    } catch (error) {
      console.error("Error auto-saving progress:", error);
    }
  };

  return {
    loadExistingData,
    saveProgress
  };
};
