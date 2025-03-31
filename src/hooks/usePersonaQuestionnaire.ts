import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formSchema, defaultFormValues, FormSchema } from "@/schemas/personaQuestionnaireSchema";
import { getParticipantById, updateParticipantQuestionnaireById, updateParticipantInterview } from "@/services/supabase/supabaseService";
import { sections } from "@/constants/personaQuestionnaireSections";

export const usePersonaQuestionnaire = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeSection, setActiveSection] = useState<string>("identification");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantEmail, setParticipantEmail] = useState<string | null>(null);
  const [participantIdentifier, setParticipantIdentifier] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  const currentSectionIndex = sections.findIndex(section => section.id === activeSection);
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;

  const handleNext = () => {
    const currentSection = sections[currentSectionIndex];
    
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

  const saveProgress = async () => {
    if (!participantId) return;
    
    try {
      const currentValues = form.getValues();
      
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

  useEffect(() => {
    const id = sessionStorage.getItem("participant_id");
    const email = sessionStorage.getItem("participant_email");
    const identifier = sessionStorage.getItem("participant_identifier");
    
    if (!id || !email) {
      toast({
        title: "Session Error",
        description: "Your session information is missing. Please start from the screener.",
        variant: "destructive",
      });
      navigate("/persona-creation/screener");
      return;
    }

    setParticipantId(id);
    setParticipantEmail(email);
    setParticipantIdentifier(identifier);

    if (identifier) {
      form.setValue("identification.participantId", identifier);
    }

    const loadExistingData = async () => {
      try {
        const participant = await getParticipantById(id);
        if (participant && participant.questionnaire_data) {
          const existingData = participant.questionnaire_data;
          
          const valuesObj = existingData.values as FormSchema['values'] | undefined;
          if (valuesObj && valuesObj.worldview === "Do no harm, take no shit") {
            valuesObj.worldview = "Respect others, stand your ground";
          }
          
          if (existingData.identification) {
            form.reset({
              ...defaultFormValues,
              ...existingData,
              identification: {
                ...existingData.identification,
                participantId: identifier || existingData.identification.participantId,
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

    loadExistingData();
  }, [navigate, toast, form]);

  const onSubmit = async (data: typeof defaultFormValues) => {
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
        
        navigate("/persona-creation/complete");
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
