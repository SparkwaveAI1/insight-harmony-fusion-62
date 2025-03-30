
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

interface DecisionMakingSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DecisionMakingSection = ({ form, open, onOpenChange }: DecisionMakingSectionProps) => {
  return (
    <FormSectionWrapper 
      title="🔹 Section 2: Decision-Making & Risk Style" 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <FormField
        control={form.control}
        name="decisionMaking.financialRisk"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>How do you approach financial risk?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="avoid" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    I avoid it
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="calculated" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    I take calculated risks
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="bold" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    I like bold bets
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="dont_think" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    I don't think much about risk
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
        name="decisionMaking.uncertainty"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>When you're unsure about something, what's your first move?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="research" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Research it
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="ask" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Ask someone I trust
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="try" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Try it and see
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="avoid" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Avoid it or wait
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Add remaining questions for this section */}
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

      <FormField
        control={form.control}
        name="decisionMaking.style"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>What's your decision-making style?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="logical" />
                  </FormControl>
                  <FormLabel className="font-normal">Logical</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="intuitive" />
                  </FormControl>
                  <FormLabel className="font-normal">Intuitive</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="fast" />
                  </FormControl>
                  <FormLabel className="font-normal">Fast</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="methodical" />
                  </FormControl>
                  <FormLabel className="font-normal">Methodical</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="depends" />
                  </FormControl>
                  <FormLabel className="font-normal">Depends</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="decisionMaking.trustBrands"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How much do you trust brands to act in your best interest?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="almost_always" />
                  </FormControl>
                  <FormLabel className="font-normal">Almost always</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="sometimes" />
                  </FormControl>
                  <FormLabel className="font-normal">Sometimes</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="rarely" />
                  </FormControl>
                  <FormLabel className="font-normal">Rarely</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="never" />
                  </FormControl>
                  <FormLabel className="font-normal">Never</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="decisionMaking.trustFactor"
        render={({ field }) => (
          <FormItem className="mt-6">
            <FormLabel>What makes you instantly trust or distrust a product or brand?</FormLabel>
            <FormControl>
              <Input placeholder="Your answer" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSectionWrapper>
  );
};

export default DecisionMakingSection;
