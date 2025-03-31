
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
  const [participantIdentifier, setParticipantIdentifier] = useState<string | null>(null);

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
      
      // Replace "Do no harm, take no shit" with "Respect others, stand your ground" if present
      if (currentValues.values?.worldview === "Do no harm, take no shit") {
        currentValues.values.worldview = "Respect others, stand your ground";
      }
      
      await updateParticipantQuestionnaireById(participantId, currentValues);
      console.log("Progress auto-saved");
    } catch (error) {
      console.error("Error auto-saving progress:", error);
    }
  };

  useEffect(() => {
    // Get participant information from session storage
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

    // Pre-fill the identifier in the form if available
    if (identifier) {
      form.setValue("identification.participantId", identifier);
    }

    // Try to load existing data if available
    const loadExistingData = async () => {
      try {
        const participant = await getParticipantById(id);
        if (participant && participant.questionnaire_data) {
          // Merge existing questionnaire data with form defaults
          const existingData = participant.questionnaire_data;
          
          // Replace "Do no harm, take no shit" with "Respect others, stand your ground" if present
          if (existingData.values?.worldview === "Do no harm, take no shit") {
            existingData.values.worldview = "Respect others, stand your ground";
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
      // Make sure the participant ID is included in the submitted data
      const dataWithId = {
        ...data,
        identification: {
          ...data.identification,
          participantId: participantIdentifier || data.identification.participantId,
        }
      };
      
      // Replace "Do no harm, take no shit" with "Respect others, stand your ground" if present
      if (dataWithId.values?.worldview === "Do no harm, take no shit") {
        dataWithId.values.worldview = "Respect others, stand your ground";
      }

      // Save questionnaire data to Supabase using participant ID
      const updated = await updateParticipantQuestionnaireById(participantId, dataWithId);
      
      if (updated) {
        toast({
          title: "Questionnaire Completed",
          description: "Thank you for completing the questionnaire! We will be in touch within 24 hours with information about your Conversational Interview, the final step in creating your persona.",
          duration: 10000, // Longer duration so they can read the full message
        });
        
        // Clear session storage
        sessionStorage.removeItem("participant_email");
        
        // Navigate to the completion page instead of consent
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
