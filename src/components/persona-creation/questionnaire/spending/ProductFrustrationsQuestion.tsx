
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface ProductFrustrationsQuestionProps {
  form: UseFormReturn<any>;
}

const ProductFrustrationsQuestion = ({ form }: ProductFrustrationsQuestionProps) => {
  const frustrationOptions = [
    { id: "pricing", label: "Unclear pricing" },
    { id: "onboarding", label: "Bad onboarding" },
    { id: "support", label: "Poor support" },
    { id: "bugs", label: "Buggy features" },
    { id: "ui", label: "Overcomplicated UI" },
    { id: "marketing", label: "Pushy marketing" },
    { id: "transparency", label: "Lack of transparency" },
    { id: "other", label: "Other" },
  ];

  return (
    <FormField
      control={form.control}
      name="spending.productFrustrations"
      render={() => (
        <FormItem className="space-y-3 mt-6">
          <div className="mb-4">
            <FormLabel>What frustrates you most in a product or platform? (Pick up to 3)</FormLabel>
          </div>
          {frustrationOptions.map((option) => (
            <FormField
              key={option.id}
              control={form.control}
              name={`spending.productFrustrations.${option.id}`}
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
          
          <FormField
            control={form.control}
            name="spending.productFrustrations.otherText"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormControl>
                  <Input placeholder="Other frustration" {...field} 
                    disabled={!form.watch("spending.productFrustrations.other")} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProductFrustrationsQuestion;
