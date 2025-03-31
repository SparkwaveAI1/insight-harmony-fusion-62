
import React from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";

interface IdentificationSectionProps {
  form: UseFormReturn<any>;
}

const IdentificationSection = ({ form }: IdentificationSectionProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-medium mb-6">🧾 Identification</h3>
      
      <FormField
        control={form.control}
        name="identification.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First name + last initial</FormLabel>
            <FormDescription>e.g., Dana M.</FormDescription>
            <FormControl>
              <Input placeholder="Your name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="identification.email"
        render={({ field }) => (
          <FormItem className="mt-6">
            <FormLabel>Email address</FormLabel>
            <FormDescription>We need your email to contact you to schedule the conversational interview</FormDescription>
            <FormControl>
              <Input type="email" placeholder="Your email address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Card>
  );
};

export default IdentificationSection;
