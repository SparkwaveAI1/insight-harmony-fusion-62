
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface UncertaintyQuestionProps {
  form: UseFormReturn<any>;
}

const UncertaintyQuestion = ({ form }: UncertaintyQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="decisionMaking.uncertainty"
      render={({ field }) => (
        <FormItem className="space-y-3 mt-6">
          <FormLabel>When you're unsure about something, what's your first move?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="research" />
                </FormControl>
                <FormLabel className="font-normal">
                  Research it
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="ask" />
                </FormControl>
                <FormLabel className="font-normal">
                  Ask someone I trust
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="try" />
                </FormControl>
                <FormLabel className="font-normal">
                  Try it and see
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="avoid" />
                </FormControl>
                <FormLabel className="font-normal">
                  Avoid it or wait
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

export default UncertaintyQuestion;
