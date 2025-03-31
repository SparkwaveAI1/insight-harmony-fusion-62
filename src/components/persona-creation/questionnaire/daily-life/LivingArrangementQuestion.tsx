
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

interface LivingArrangementQuestionProps {
  form: UseFormReturn<any>;
}

const LivingArrangementQuestion = ({ form }: LivingArrangementQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="dailyLife.livingArrangement"
      render={({ field }) => (
        <FormItem className="space-y-3 mt-6">
          <FormLabel>Who do you live with? (Select all that apply)</FormLabel>
          <div className="space-y-2">
            {[
              { id: "alone", label: "Alone" },
              { id: "partner", label: "With partner/spouse" },
              { id: "children", label: "With children" },
              { id: "parents", label: "With parents/family" },
              { id: "roommates", label: "With roommates or others" }
            ].map((item) => (
              <FormField
                key={item.id}
                control={form.control}
                name={`dailyLife.livingArrangement.${item.id}`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{item.label}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default LivingArrangementQuestion;
