
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

interface FinalSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const FinalSection = ({ form, open, onOpenChange }: FinalSectionProps) => {
  return (
    <FormSectionWrapper 
      title="🔹 Final: Optional" 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <FormField
        control={form.control}
        name="final.additionalInfo"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Is there anything else we should know to better understand your mindset or behavior?</FormLabel>
            <FormControl>
              <Textarea placeholder="Your answer (optional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="final.openToFollowups"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>Would you be open to follow-ups or paid research?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="yes" />
                  </FormControl>
                  <FormLabel className="font-normal">Yes</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="no" />
                  </FormControl>
                  <FormLabel className="font-normal">No</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="final.contactInfo"
        render={({ field }) => (
          <FormItem className="mt-6">
            <FormLabel>(Optional) Email, Telegram, or other contact info</FormLabel>
            <FormControl>
              <Input placeholder="Your contact info" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSectionWrapper>
  );
};

export default FinalSection;
