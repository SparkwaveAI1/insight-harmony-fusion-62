
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

interface SuccessDefinitionQuestionProps {
  form: UseFormReturn<any>;
}

const SuccessDefinitionQuestion = ({ form }: SuccessDefinitionQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="values.successDefinition"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>How do you define success for yourself right now?</FormLabel>
          <FormControl>
            <Textarea placeholder="Your definition of success" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SuccessDefinitionQuestion;
