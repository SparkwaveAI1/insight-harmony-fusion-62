
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ImproveLifeAreaQuestionProps {
  form: UseFormReturn<any>;
}

const ImproveLifeAreaQuestion = ({ form }: ImproveLifeAreaQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="values.improveLifeArea"
      render={({ field }) => (
        <FormItem className="space-y-3 mt-6">
          <FormLabel>If you could instantly improve one area of your life, what would it be?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-wrap gap-3"
            >
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="physical_health" />
                </FormControl>
                <FormLabel className="font-normal">Physical health</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="mental_health" />
                </FormControl>
                <FormLabel className="font-normal">Mental health</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="finances" />
                </FormControl>
                <FormLabel className="font-normal">Finances</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="relationships" />
                </FormControl>
                <FormLabel className="font-normal">Relationships</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="career" />
                </FormControl>
                <FormLabel className="font-normal">Career</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="time_focus" />
                </FormControl>
                <FormLabel className="font-normal">Time/focus</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="creativity" />
                </FormControl>
                <FormLabel className="font-normal">Creativity</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-1 space-y-0">
                <FormControl>
                  <RadioGroupItem value="other" />
                </FormControl>
                <FormLabel className="font-normal">Other</FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ImproveLifeAreaQuestion;
