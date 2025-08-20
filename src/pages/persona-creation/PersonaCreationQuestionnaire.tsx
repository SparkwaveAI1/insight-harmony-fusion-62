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
    onSubmit,
    isFirstSection,
    isLastSection,
    handleNext,
    handlePrevious,
    participantIdentifier
  } = usePersonaQuestionnaire();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <QuestionnaireHeader />
      <QuestionnaireProgress activeSection={activeSection} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Only render the active section */}
          {activeSection === "identification" && (
            <IdentificationSection form={form} participantIdentifier={participantIdentifier} />
          )}
          
          {activeSection === "dailyLife" && (
            <DailyLifeSection form={form} />
          )}
          
          {activeSection === "decisionMaking" && (
            <DecisionMakingSection form={form} />
          )}
          
          {activeSection === "spending" && (
            <SpendingSection form={form} />
          )}
          
          {activeSection === "information" && (
            <InformationSection form={form} />
          )}
          
          {activeSection === "values" && (
            <ValuesSection form={form} />
          )}
          
          {activeSection === "deeperInsight" && (
            <DeeperInsightSection form={form} />
          )}
          
          {activeSection === "background" && (
            <BackgroundSection form={form} />
          )}
          
          {activeSection === "worldview" && (
            <WorldviewSection form={form} />
          )}
          
          {activeSection === "final" && (
            <FinalSection form={form} />
          )}

          <QuestionnaireNavigation 
            isSubmitting={isSubmitting}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isFirstSection={isFirstSection}
            isLastSection={isLastSection}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
          />
        </form>
      </Form>
    </div>
  );
};

export default PersonaCreationQuestionnaire;
