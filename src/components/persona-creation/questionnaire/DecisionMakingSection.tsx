
import React from "react";
import { UseFormReturn } from "react-hook-form";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

// Import individual question components
import FinancialRiskQuestion from "./decision-making/FinancialRiskQuestion";
import UncertaintyQuestion from "./decision-making/UncertaintyQuestion";
import NewProductsQuestion from "./decision-making/NewProductsQuestion";
import DecisionStyleQuestion from "./decision-making/DecisionStyleQuestion";
import TrustBrandsQuestion from "./decision-making/TrustBrandsQuestion";

interface DecisionMakingSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DecisionMakingSection = ({ form, open, onOpenChange }: DecisionMakingSectionProps) => {
  return (
    <FormSectionWrapper 
      title="🔹 Section 2: Decision-Making & Risk Style" 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <FinancialRiskQuestion form={form} />
      <UncertaintyQuestion form={form} />
      <NewProductsQuestion form={form} />
      <DecisionStyleQuestion form={form} />
      <TrustBrandsQuestion form={form} />
    </FormSectionWrapper>
  );
};

export default DecisionMakingSection;
