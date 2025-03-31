
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Import schema and sections
import { formSchema, defaultFormValues } from "@/schemas/personaQuestionnaireSchema";
import { sections } from "@/constants/personaQuestionnaireSections";
import { getParticipantById, getParticipantByEmail, updateParticipantQuestionnaireById } from "@/services/supabase/supabaseService";

// Import section components
import IdentificationSection from "@/components/persona-creation/questionnaire/IdentificationSection";
import DailyLifeSection from "@/components/persona-creation/questionnaire/DailyLifeSection";
import DecisionMakingSection from "@/components/persona-creation/questionnaire/DecisionMakingSection";
import SpendingSection from "@/components/persona-creation/questionnaire/SpendingSection";
import InformationSection from "@/components/persona-creation/questionnaire/InformationSection";
import ValuesSection from "@/components/persona-creation/questionnaire/ValuesSection";
import DeeperInsightSection from "@/components/persona-creation/questionnaire/DeeperInsightSection";
import WorldviewSection from "@/components/persona-creation/questionnaire/WorldviewSection";
import BackgroundSection from "@/components/persona-creation/questionnaire/BackgroundSection";
import FinalSection from "@/components/persona-creation/questionnaire/FinalSection";

const PersonaCreationQuestionnaire = () => {
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

  useEffect(() => {
    // Get participant ID from session storage
    const id = sessionStorage.getItem("participant_id");
    const email = sessionStorage.getItem("participant_email");
    
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

    // Try to load existing data if available
    const loadExistingData = async () => {
      try {
        const participant = await getParticipantById(id);
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
        
        // Navigate to the next step
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

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">✅ Persona Pre-Interview Questionnaire</h1>
        <p className="text-gray-600 mb-2"><strong>Estimated time:</strong> 15–20 minutes</p>
        <p className="text-gray-600 mb-2"><strong>Format:</strong> Mostly multiple choice + a few short fill-ins</p>
        <p className="text-gray-600">
          <strong>Purpose:</strong> Capture foundational data to build deep, behaviorally accurate AI personas
        </p>
      </div>

      <div className="mb-8 bg-muted/30 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-3">Progress</h2>
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </Button>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section components */}
          <IdentificationSection 
            form={form} 
            open={activeSection === "identification"}
            onOpenChange={(open) => open && setActiveSection("identification")} 
          />
          
          <DailyLifeSection 
            form={form} 
            open={activeSection === "dailyLife"}
            onOpenChange={(open) => open && setActiveSection("dailyLife")}
          />
          
          <DecisionMakingSection 
            form={form} 
            open={activeSection === "decisionMaking"}
            onOpenChange={(open) => open && setActiveSection("decisionMaking")} 
          />
          
          <SpendingSection 
            form={form}
            open={activeSection === "spending"}
            onOpenChange={(open) => open && setActiveSection("spending")}
          />
          
          <InformationSection 
            form={form}
            open={activeSection === "information"} 
            onOpenChange={(open) => open && setActiveSection("information")}
          />
          
          <ValuesSection 
            form={form}
            open={activeSection === "values"}
            onOpenChange={(open) => open && setActiveSection("values")} 
          />
          
          <DeeperInsightSection 
            form={form}
            open={activeSection === "deeperInsight"} 
            onOpenChange={(open) => open && setActiveSection("deeperInsight")}
          />
          
          <BackgroundSection 
            form={form}
            open={activeSection === "background"} 
            onOpenChange={(open) => open && setActiveSection("background")}
          />
          
          <WorldviewSection 
            form={form}
            open={activeSection === "worldview"}
            onOpenChange={(open) => open && setActiveSection("worldview")} 
          />
          
          <FinalSection 
            form={form}
            open={activeSection === "final"} 
            onOpenChange={(open) => open && setActiveSection("final")}
          />

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
        </form>
      </Form>
    </div>
  );
};

export default PersonaCreationQuestionnaire;
