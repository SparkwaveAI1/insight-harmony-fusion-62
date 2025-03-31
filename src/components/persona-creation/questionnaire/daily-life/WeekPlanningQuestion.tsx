
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WeekPlanningQuestionProps {
  form: UseFormReturn<any>;
}

const WeekPlanningQuestion = ({ form }: WeekPlanningQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="dailyLife.weekPlanning"
      render={({ field }) => (
        <FormItem className="space-y-3 mt-6">
          <FormLabel>How do you usually plan your week?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="calendar_todo" />
                </FormControl>
                <FormLabel className="font-normal">
                  Calendar + to-do lists
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="mental_notes" />
                </FormControl>
                <FormLabel className="font-normal">
                  Mental notes
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="apps" />
                </FormControl>
                <FormLabel className="font-normal">
                  Apps or software
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="no_plan" />
                </FormControl>
                <FormLabel className="font-normal">
                  I don't plan ahead much
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

export default WeekPlanningQuestion;
