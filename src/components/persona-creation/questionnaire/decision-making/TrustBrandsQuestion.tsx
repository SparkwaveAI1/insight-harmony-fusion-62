
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TrustBrandsQuestionProps {
  form: UseFormReturn<any>;
}

const TrustBrandsQuestion = ({ form }: TrustBrandsQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="decisionMaking.trustBrands"
      render={({ field }) => (
        <FormItem className="space-y-3 mt-6">
          <FormLabel>How much do you trust brands to act in your best interest?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-wrap gap-3"
            >
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="almost_always" />
                </FormControl>
                <FormLabel className="font-normal">Almost always</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="sometimes" />
                </FormControl>
                <FormLabel className="font-normal">Sometimes</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="rarely" />
                </FormControl>
                <FormLabel className="font-normal">Rarely</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="never" />
                </FormControl>
                <FormLabel className="font-normal">Never</FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TrustBrandsQuestion;
