
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DayStructureQuestionProps {
  form: UseFormReturn<any>;
}

const DayStructureQuestion = ({ form }: DayStructureQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="dailyLife.dayStructure"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>How structured is your typical day?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="highly_structured" />
                </FormControl>
                <FormLabel className="font-normal">
                  Highly structured – I follow a clear routine
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="somewhat_structured" />
                </FormControl>
                <FormLabel className="font-normal">
                  Somewhat structured – a few key routines
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="flexible" />
                </FormControl>
                <FormLabel className="font-normal">
                  Flexible – I adjust as needed
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="unstructured" />
                </FormControl>
                <FormLabel className="font-normal">
                  Unstructured – every day is different
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

export default DayStructureQuestion;
