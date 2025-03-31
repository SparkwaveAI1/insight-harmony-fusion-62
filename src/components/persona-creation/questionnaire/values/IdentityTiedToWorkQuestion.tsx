
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface IdentityTiedToWorkQuestionProps {
  form: UseFormReturn<any>;
}

const IdentityTiedToWorkQuestion = ({ form }: IdentityTiedToWorkQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="values.identityTiedToWork"
      render={({ field }) => (
        <FormItem className="space-y-3 mt-6">
          <FormLabel>How much is your identity tied to your work?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-wrap gap-3"
            >
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="very_much" />
                </FormControl>
                <FormLabel className="font-normal">Very much</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="somewhat" />
                </FormControl>
                <FormLabel className="font-normal">Somewhat</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="not_much" />
                </FormControl>
                <FormLabel className="font-normal">Not much</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="not_at_all" />
                </FormControl>
                <FormLabel className="font-normal">Not at all</FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default IdentityTiedToWorkQuestion;
