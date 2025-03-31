
import React from "react";
import { UseFormReturn } from "react-hook-form";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

// Import the smaller component questions
import MoneyThoughtsQuestion from "./spending/MoneyThoughtsQuestion";
import WorthItPurchasesQuestion from "./spending/WorthItPurchasesQuestion";
import ImpulseBuyQuestion from "./spending/ImpulseBuyQuestion";
import NoRegretPurchaseQuestion from "./spending/NoRegretPurchaseQuestion";
import ProductFrustrationsQuestion from "./spending/ProductFrustrationsQuestion";

interface SpendingSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SpendingSection = ({ form, open, onOpenChange }: SpendingSectionProps) => {
  return (
    <FormSectionWrapper 
      title="🔹 Section 3: Spending, Budgeting & Value" 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <MoneyThoughtsQuestion form={form} />
      <WorthItPurchasesQuestion form={form} />
      <ImpulseBuyQuestion form={form} />
      <NoRegretPurchaseQuestion form={form} />
      <ProductFrustrationsQuestion form={form} />
    </FormSectionWrapper>
  );
};

export default SpendingSection;
