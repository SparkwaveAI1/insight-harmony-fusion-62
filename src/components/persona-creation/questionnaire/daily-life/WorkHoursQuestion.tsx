
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WorkHoursQuestionProps {
  form: UseFormReturn<any>;
}

const WorkHoursQuestion = ({ form }: WorkHoursQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="dailyLife.workHours"
      render={({ field }) => (
        <FormItem className="space-y-3 mt-6">
          <FormLabel>How many hours do you work per week (on average)?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex space-x-3"
            >
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="under_10" />
                </FormControl>
                <FormLabel className="font-normal">Under 10</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="10_25" />
                </FormControl>
                <FormLabel className="font-normal">10–25</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="26_40" />
                </FormControl>
                <FormLabel className="font-normal">26–40</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="41_60" />
                </FormControl>
                <FormLabel className="font-normal">41–60</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="60_plus" />
                </FormControl>
                <FormLabel className="font-normal">60+</FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default WorkHoursQuestion;
