
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

interface ValuesSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ValuesSection = ({ form, open, onOpenChange }: ValuesSectionProps) => {
  return (
    <FormSectionWrapper 
      title="🔹 Section 5: Values, Identity & Mindset" 
      open={open} 
      onOpenChange={onOpenChange}
    >
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

      <FormField
        control={form.control}
        name="values.improveLifeArea"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>If you could instantly improve one area of your life, what would it be?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="physical_health" />
                  </FormControl>
                  <FormLabel className="font-normal">Physical health</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="mental_health" />
                  </FormControl>
                  <FormLabel className="font-normal">Mental health</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="finances" />
                  </FormControl>
                  <FormLabel className="font-normal">Finances</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="relationships" />
                  </FormControl>
                  <FormLabel className="font-normal">Relationships</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="career" />
                  </FormControl>
                  <FormLabel className="font-normal">Career</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="time_focus" />
                  </FormControl>
                  <FormLabel className="font-normal">Time/focus</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="creativity" />
                  </FormControl>
                  <FormLabel className="font-normal">Creativity</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="other" />
                  </FormControl>
                  <FormLabel className="font-normal">Other</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="values.worldview"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>Which of these worldviews resonates most with you?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="work_hard" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    "Work hard, play hard"
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="do_no_harm" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    "Do no harm, take no shit"
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="everything_happens" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    "Everything happens for a reason"
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="make_meaning" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    "We make our own meaning"
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="dont_trust" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    "Don't trust the system"
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="keep_moving" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    "Just keep moving forward"
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="other" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Other / None
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="values.identityTiedToWork"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How much is your identity tied to your work?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="very_much" />
                  </FormControl>
                  <FormLabel className="font-normal">Very much</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="somewhat" />
                  </FormControl>
                  <FormLabel className="font-normal">Somewhat</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="not_much" />
                  </FormControl>
                  <FormLabel className="font-normal">Not much</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="not_at_all" />
                  </FormControl>
                  <FormLabel className="font-normal">Not at all</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="values.workVsHome"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How different are you at work vs. at home?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="same_person" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Same person
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="more_formal" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    More formal at work
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="more_relaxed" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    More relaxed at work
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="completely_different" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Completely different
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSectionWrapper>
  );
};

export default ValuesSection;
