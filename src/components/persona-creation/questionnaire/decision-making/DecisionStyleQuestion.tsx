
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DecisionStyleQuestionProps {
  form: UseFormReturn<any>;
}

const DecisionStyleQuestion = ({ form }: DecisionStyleQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="decisionMaking.style"
      render={({ field }) => (
        <FormItem className="space-y-3 mt-6">
          <FormLabel>What's your decision-making style?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-wrap gap-3"
            >
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="logical" />
                </FormControl>
                <FormLabel className="font-normal">Logical</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="intuitive" />
                </FormControl>
                <FormLabel className="font-normal">Intuitive</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="fast" />
                </FormControl>
                <FormLabel className="font-normal">Fast</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="methodical" />
                </FormControl>
                <FormLabel className="font-normal">Methodical</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="depends" />
                </FormControl>
                <FormLabel className="font-normal">Depends</FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DecisionStyleQuestion;
