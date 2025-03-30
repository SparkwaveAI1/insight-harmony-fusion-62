
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

interface DailyLifeSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DailyLifeSection = ({ form, open, onOpenChange }: DailyLifeSectionProps) => {
  return (
    <FormSectionWrapper 
      title="🔹 Section 1: Daily Life & Environment" 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <FormField
        control={form.control}
        name="dailyLife.dayStructure"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>How structured is your typical day?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="highly_structured" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Highly structured – I follow a clear routine
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="somewhat_structured" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Somewhat structured – a few key routines
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="flexible" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Flexible – I adjust as needed
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="unstructured" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Unstructured – every day is different
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
        name="dailyLife.weekPlanning"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How do you usually plan your week?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="calendar_todo" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Calendar + to-do lists
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="mental_notes" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Mental notes
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="apps" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Apps or software
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="no_plan" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    I don't plan ahead much
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
        name="dailyLife.location"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>Where do you spend most of your daytime hours?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="home" />
                  </FormControl>
                  <FormLabel className="font-normal">Home</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="office" />
                  </FormControl>
                  <FormLabel className="font-normal">Office / workplace</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="road" />
                  </FormControl>
                  <FormLabel className="font-normal">On the road</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="mixed" />
                  </FormControl>
                  <FormLabel className="font-normal">Mixed or remote</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dailyLife.workHours"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How many hours do you work per week (on average)?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="under_10" />
                  </FormControl>
                  <FormLabel className="font-normal">Under 10</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="10_25" />
                  </FormControl>
                  <FormLabel className="font-normal">10–25</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="26_40" />
                  </FormControl>
                  <FormLabel className="font-normal">26–40</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="41_60" />
                  </FormControl>
                  <FormLabel className="font-normal">41–60</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="60_plus" />
                  </FormControl>
                  <FormLabel className="font-normal">60+</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dailyLife.caregiving"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>Do you have caregiving responsibilities (kids, elders, others)?</FormLabel>
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
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="prefer_not" />
                  </FormControl>
                  <FormLabel className="font-normal">Prefer not to say</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dailyLife.livingArrangement"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>Who do you live with?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="alone" />
                  </FormControl>
                  <FormLabel className="font-normal">Alone</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="partner" />
                  </FormControl>
                  <FormLabel className="font-normal">With partner/spouse</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="children" />
                  </FormControl>
                  <FormLabel className="font-normal">With children</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="parents" />
                  </FormControl>
                  <FormLabel className="font-normal">With parents/family</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="roommates" />
                  </FormControl>
                  <FormLabel className="font-normal">With roommates or others</FormLabel>
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

export default DailyLifeSection;
