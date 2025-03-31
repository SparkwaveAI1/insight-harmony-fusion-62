
import React from "react";
import { Form } from "@/components/ui/form";
import { usePersonaQuestionnaire } from "@/hooks/usePersonaQuestionnaire";

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

// Import new components
import QuestionnaireHeader from "@/components/persona-creation/questionnaire/QuestionnaireHeader";
import QuestionnaireProgress from "@/components/persona-creation/questionnaire/QuestionnaireProgress";
import QuestionnaireNavigation from "@/components/persona-creation/questionnaire/QuestionnaireNavigation";

const PersonaCreationQuestionnaire = () => {
  const { 
    form, 
    activeSection, 
    setActiveSection, 
    isSubmitting, 
    onSubmit 
  } = usePersonaQuestionnaire();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <QuestionnaireHeader />
      <QuestionnaireProgress activeSection={activeSection} setActiveSection={setActiveSection} />

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

          <QuestionnaireNavigation isSubmitting={isSubmitting} />
        </form>
      </Form>
    </div>
  );
};

export default PersonaCreationQuestionnaire;
