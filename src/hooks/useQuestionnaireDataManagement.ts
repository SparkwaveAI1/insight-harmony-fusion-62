
import { FormSchema } from "@/schemas/personaQuestionnaireSchema";
import { useToast } from "@/hooks/use-toast";
import { getParticipantById, updateParticipantQuestionnaireById } from "@/services/supabase/supabaseService";
import { UseFormReturn } from "react-hook-form";
import { Json } from "@/integrations/supabase/types";

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
        // Convert the Json type to the FormSchema type as needed
        const existingData = participant.questionnaire_data as unknown as FormSchema;
        
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
      
      // Convert to Json type when saving to database
      await updateParticipantQuestionnaireById(participantId, currentValues as unknown as Record<string, any>);
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
