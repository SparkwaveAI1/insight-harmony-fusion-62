
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MoneyThoughtsQuestionProps {
  form: UseFormReturn<any>;
}

const MoneyThoughtsQuestion = ({ form }: MoneyThoughtsQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="spending.moneyThoughts"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>How do you think about money?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="budget_carefully" />
                </FormControl>
                <FormLabel className="font-normal">
                  I budget carefully
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="mindful_flexible" />
                </FormControl>
                <FormLabel className="font-normal">
                  I'm mindful but flexible
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="spend_freely" />
                </FormControl>
                <FormLabel className="font-normal">
                  I spend freely
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="avoid_thinking" />
                </FormControl>
                <FormLabel className="font-normal">
                  I try not to think about it
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

export default MoneyThoughtsQuestion;
