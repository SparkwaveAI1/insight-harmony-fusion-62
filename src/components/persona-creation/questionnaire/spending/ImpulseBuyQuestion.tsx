
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ImpulseBuyQuestionProps {
  form: UseFormReturn<any>;
}

const ImpulseBuyQuestion = ({ form }: ImpulseBuyQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="spending.impulseBuy"
      render={({ field }) => (
        <FormItem className="space-y-3 mt-6">
          <FormLabel>How often do you impulse buy?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-wrap gap-3"
            >
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="very_often" />
                </FormControl>
                <FormLabel className="font-normal">Very often</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="occasionally" />
                </FormControl>
                <FormLabel className="font-normal">Occasionally</FormLabel>
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

export default ImpulseBuyQuestion;
