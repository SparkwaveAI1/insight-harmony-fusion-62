
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

interface SpendingSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SpendingSection = ({ form, open, onOpenChange }: SpendingSectionProps) => {
  const worthItOptions = [
    { id: "saves_time", label: "Saves time" },
    { id: "quality", label: "High-quality / durable" },
    { id: "design", label: "Beautiful / well-designed" },
    { id: "joy", label: "Brings joy" },
    { id: "health", label: "Health/wellness" },
    { id: "growth", label: "Growth tools" },
    { id: "experiences", label: "Experiences" },
  ];

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
    <FormSectionWrapper 
      title="🔹 Section 3: Spending, Budgeting & Value" 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <FormField
        control={form.control}
        name="spending.moneyThoughts"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>How do you think about money?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="budget_carefully" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    I budget carefully
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="mindful_flexible" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    I'm mindful but flexible
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="spend_freely" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    I spend freely
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="avoid_thinking" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    I try not to think about it
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

      <FormField
        control={form.control}
        name="spending.impulseBuy"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How often do you impulse buy?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="very_often" />
                  </FormControl>
                  <FormLabel className="font-normal">Very often</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="occasionally" />
                  </FormControl>
                  <FormLabel className="font-normal">Occasionally</FormLabel>
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
    </FormSectionWrapper>
  );
};

export default SpendingSection;
