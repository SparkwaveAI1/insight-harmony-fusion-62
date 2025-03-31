
import React from "react";
import { UseFormReturn } from "react-hook-form";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

// Import question components
import SuccessDefinitionQuestion from "./values/SuccessDefinitionQuestion";
import ImproveLifeAreaQuestion from "./values/ImproveLifeAreaQuestion";
import WorldviewQuestion from "./values/WorldviewQuestion";
import IdentityTiedToWorkQuestion from "./values/IdentityTiedToWorkQuestion";
import WorkVsHomeQuestion from "./values/WorkVsHomeQuestion";

interface ValuesSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ValuesSection = ({ form, open, onOpenChange }: ValuesSectionProps) => {
  return (
    <FormSectionWrapper 
      title="🔹 Section 5: Values, Identity & Mindset" 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <SuccessDefinitionQuestion form={form} />
      <ImproveLifeAreaQuestion form={form} />
      <WorldviewQuestion form={form} />
      <IdentityTiedToWorkQuestion form={form} />
      <WorkVsHomeQuestion form={form} />
    </FormSectionWrapper>
  );
};

export default ValuesSection;
