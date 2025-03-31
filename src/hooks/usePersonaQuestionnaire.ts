
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formSchema, defaultFormValues } from "@/schemas/personaQuestionnaireSchema";
import { getParticipantById, updateParticipantQuestionnaireById } from "@/services/supabase/supabaseService";
import { sections } from "@/constants/personaQuestionnaireSections";

export const usePersonaQuestionnaire = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeSection, setActiveSection] = useState<string>("identification");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantEmail, setParticipantEmail] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  // Determine if current section is first or last
  const currentSectionIndex = sections.findIndex(section => section.id === activeSection);
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sections.length - 1;

  // Handle next section navigation
  const handleNext = () => {
    // Validate current section fields before proceeding
    const currentSection = sections[currentSectionIndex];
    
    // If not last section, move to next section
    if (!isLastSection) {
      const nextSection = sections[currentSectionIndex + 1];
      setActiveSection(nextSection.id);
      // Auto-save progress when moving to next section
      saveProgress();
    }
  };

  // Handle previous section navigation
  const handlePrevious = () => {
    if (!isFirstSection) {
      const prevSection = sections[currentSectionIndex - 1];
      setActiveSection(prevSection.id);
    }
  };

  // Save progress without submitting the form
  const saveProgress = async () => {
    if (!participantId) return;
    
    try {
      const currentValues = form.getValues();
      console.log("Questionnaire - Auto-saving progress for participant ID:", participantId);
      await updateParticipantQuestionnaireById(participantId, currentValues);
      console.log("Questionnaire - Progress auto-saved");
    } catch (error) {
      console.error("Error auto-saving progress:", error);
    }
  };

  useEffect(() => {
    // Get participant ID from session storage
    const id = sessionStorage.getItem("participant_id");
    const email = sessionStorage.getItem("participant_email");
    
    console.log("Questionnaire - Retrieved from session storage:", { id, email });
    
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
    console.log("Questionnaire - Set participant ID:", id);

    // Try to load existing data if available
    const loadExistingData = async () => {
      try {
        console.log("Questionnaire - Attempting to load existing data for participant ID:", id);
        const participant = await getParticipantById(id);
        console.log("Questionnaire - Retrieved participant data:", participant);
        
        if (participant && participant.questionnaire_data) {
          // Merge existing questionnaire data with form defaults
          const existingData = participant.questionnaire_data;
          if (existingData.identification) {
            form.reset({
              ...defaultFormValues,
              ...existingData,
            });
            toast({
              title: "Data Loaded",
              description: "We've loaded your previous responses.",
            });
            console.log("Questionnaire - Loaded existing data successfully");
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
    console.log("Questionnaire - Submitting form for participant ID:", participantId);

    try {
      // Save questionnaire data to Supabase using participant ID
      const updated = await updateParticipantQuestionnaireById(participantId, data);
      
      if (updated) {
        toast({
          title: "Questionnaire Completed",
          description: "Thank you for completing the questionnaire! We will be in touch within 24 hours with information about your Conversational Interview, the final step in creating your persona.",
          duration: 10000, // Longer duration so they can read the full message
        });
        
        // Clear session storage
        sessionStorage.removeItem("participant_email");
        
        // Navigate to the next step - if we had an interview page, we'd go there
        navigate("/persona-creation/consent");
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
    onSubmit,
    isFirstSection,
    isLastSection,
    handleNext,
    handlePrevious
  };
};
