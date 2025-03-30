
import React from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

interface IdentificationSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const IdentificationSection = ({ form, open, onOpenChange }: IdentificationSectionProps) => {
  return (
    <FormSectionWrapper 
      title="🧾 Identification" 
      open={open} 
      onOpenChange={onOpenChange}
    >
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
    </FormSectionWrapper>
  );
};

export default IdentificationSection;
