
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

interface WorthItPurchasesQuestionProps {
  form: UseFormReturn<any>;
}

const WorthItPurchasesQuestion = ({ form }: WorthItPurchasesQuestionProps) => {
  const worthItOptions = [
    { id: "saves_time", label: "Saves time" },
    { id: "quality", label: "High-quality / durable" },
    { id: "design", label: "Beautiful / well-designed" },
    { id: "joy", label: "Brings joy" },
    { id: "health", label: "Health/wellness" },
    { id: "growth", label: "Growth tools" },
    { id: "experiences", label: "Experiences" },
  ];

  return (
    <FormField
      control={form.control}
      name="spending.worthItPurchases"
      render={() => (
        <FormItem className="space-y-3 mt-6">
          <div className="mb-4">
            <FormLabel>Which purchases do you consider "worth it"? (Pick up to 3)</FormLabel>
          </div>
          {worthItOptions.map((option) => (
            <FormField
              key={option.id}
              control={form.control}
              name={`spending.worthItPurchases.${option.id}`}
              render={({ field }) => (
                <FormItem
                  key={option.id}
                  className="flex flex-row items-start space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {option.label}
                  </FormLabel>
                </FormItem>
              )}
            />
          ))}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default WorthItPurchasesQuestion;
