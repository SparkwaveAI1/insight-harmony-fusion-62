
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FinancialRiskQuestionProps {
  form: UseFormReturn<any>;
}

const FinancialRiskQuestion = ({ form }: FinancialRiskQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="decisionMaking.financialRisk"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>How do you approach financial risk?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="avoid" />
                </FormControl>
                <FormLabel className="font-normal">
                  I avoid it
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="calculated" />
                </FormControl>
                <FormLabel className="font-normal">
                  I take calculated risks
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="bold" />
                </FormControl>
                <FormLabel className="font-normal">
                  I like bold bets
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="dont_think" />
                </FormControl>
                <FormLabel className="font-normal">
                  I don't think much about risk
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FinancialRiskQuestion;
