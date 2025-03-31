
import React from "react";
import { UseFormReturn } from "react-hook-form";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

// Import the smaller component questions
import DayStructureQuestion from "./daily-life/DayStructureQuestion";
import WeekPlanningQuestion from "./daily-life/WeekPlanningQuestion";
import LocationQuestion from "./daily-life/LocationQuestion";
import WorkHoursQuestion from "./daily-life/WorkHoursQuestion";
import CaregivingQuestion from "./daily-life/CaregivingQuestion";
import LivingArrangementQuestion from "./daily-life/LivingArrangementQuestion";

interface DailyLifeSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DailyLifeSection = ({ form, open, onOpenChange }: DailyLifeSectionProps) => {
  return (
    <FormSectionWrapper 
      title="🔹 Section 1: Daily Life & Environment" 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DayStructureQuestion form={form} />
      <WeekPlanningQuestion form={form} />
      <LocationQuestion form={form} />
      <WorkHoursQuestion form={form} />
      <CaregivingQuestion form={form} />
      <LivingArrangementQuestion form={form} />
    </FormSectionWrapper>
  );
};

export default DailyLifeSection;
