
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CaregivingQuestionProps {
  form: UseFormReturn<any>;
}

const CaregivingQuestion = ({ form }: CaregivingQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="dailyLife.caregiving"
      render={({ field }) => (
        <FormItem className="space-y-3 mt-6">
          <FormLabel>Do you have caregiving responsibilities (kids, elders, others)?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex space-x-3"
            >
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="yes" />
                </FormControl>
                <FormLabel className="font-normal">Yes</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="no" />
                </FormControl>
                <FormLabel className="font-normal">No</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="prefer_not" />
                </FormControl>
                <FormLabel className="font-normal">Prefer not to say</FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CaregivingQuestion;
