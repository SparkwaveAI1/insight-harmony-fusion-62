
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";

interface NoRegretPurchaseQuestionProps {
  form: UseFormReturn<any>;
}

const NoRegretPurchaseQuestion = ({ form }: NoRegretPurchaseQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="spending.noRegretPurchase"
      render={({ field }) => (
        <FormItem className="mt-6">
          <FormLabel>What's one recent purchase you don't regret at all? Why?</FormLabel>
          <FormControl>
            <Input placeholder="Your answer" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NoRegretPurchaseQuestion;
