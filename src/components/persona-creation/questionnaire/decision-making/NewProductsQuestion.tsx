
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface NewProductsQuestionProps {
  form: UseFormReturn<any>;
}

const NewProductsQuestion = ({ form }: NewProductsQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="decisionMaking.newProducts"
      render={({ field }) => (
        <FormItem className="space-y-3 mt-6">
          <FormLabel>How often do you try new products or tools?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="very_frequently" />
                </FormControl>
                <FormLabel className="font-normal">
                  Very frequently
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="occasionally" />
                </FormControl>
                <FormLabel className="font-normal">
                  Occasionally
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="rarely" />
                </FormControl>
                <FormLabel className="font-normal">
                  Rarely
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="almost_never" />
                </FormControl>
                <FormLabel className="font-normal">
                  Almost never
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

export default NewProductsQuestion;
