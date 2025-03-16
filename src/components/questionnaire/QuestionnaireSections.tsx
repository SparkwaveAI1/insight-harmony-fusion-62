
import AboutYouSection from "./AboutYouSection";
import TimeSpendingSection from "./TimeSpendingSection";
import OpinionsDecisionMakingSection from "./OpinionsDecisionMakingSection";
import PoliticalSocialSection from "./PoliticalSocialSection";
import InterestsPreferencesSection from "./InterestsPreferencesSection";
import InformationMediaSection from "./InformationMediaSection";
import LifePerspectiveSection from "./LifePerspectiveSection";
import FormSubmitSection from "./FormSubmitSection";
import { UseFormReturn } from "react-hook-form";
import { QuestionnaireForm } from "@/pages/PreInterviewQuestionnaire";

interface QuestionnaireSectionsProps {
  form: UseFormReturn<QuestionnaireForm>;
  isSubmitting: boolean;
  hasChildren: string;
  watchesMedia: string;
  travelFrequency: string;
}

const QuestionnaireSections = ({ 
  form, 
  isSubmitting, 
  hasChildren, 
  watchesMedia, 
  travelFrequency 
}: QuestionnaireSectionsProps) => {
  return (
    <>
      <AboutYouSection form={form} hasChildren={hasChildren} />
      <TimeSpendingSection form={form} />
      <OpinionsDecisionMakingSection form={form} />
      <PoliticalSocialSection form={form} />
      <InterestsPreferencesSection form={form} watchesMedia={watchesMedia} />
      <InformationMediaSection form={form} />
      <LifePerspectiveSection form={form} travelFrequency={travelFrequency} />
      <FormSubmitSection isSubmitting={isSubmitting} />
    </>
  );
};

export default QuestionnaireSections;
