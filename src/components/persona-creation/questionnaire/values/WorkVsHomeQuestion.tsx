
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WorkVsHomeQuestionProps {
  form: UseFormReturn<any>;
}

const WorkVsHomeQuestion = ({ form }: WorkVsHomeQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="values.workVsHome"
      render={({ field }) => (
        <FormItem className="space-y-3 mt-6">
          <FormLabel>How different are you at work vs. at home?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="same_person" />
                </FormControl>
                <FormLabel className="font-normal">
                  Same person
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="more_formal" />
                </FormControl>
                <FormLabel className="font-normal">
                  More formal at work
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="more_relaxed" />
                </FormControl>
                <FormLabel className="font-normal">
                  More relaxed at work
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="completely_different" />
                </FormControl>
                <FormLabel className="font-normal">
                  Completely different
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

export default WorkVsHomeQuestion;
