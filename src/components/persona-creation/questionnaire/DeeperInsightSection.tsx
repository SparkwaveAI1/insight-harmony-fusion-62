
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

interface DeeperInsightSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DeeperInsightSection = ({ form, open, onOpenChange }: DeeperInsightSectionProps) => {
  return (
    <FormSectionWrapper 
      title="🔹 Section 6: Deeper Insight" 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <FormField
        control={form.control}
        name="deeperInsight.decisionConfidence"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>When do you feel most confident in decisions?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="after_research" />
                  </FormControl>
                  <FormLabel className="font-normal">After research</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="gut_instinct" />
                  </FormControl>
                  <FormLabel className="font-normal">Gut instinct</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="group_support" />
                  </FormControl>
                  <FormLabel className="font-normal">Group support</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="values_alignment" />
                  </FormControl>
                  <FormLabel className="font-normal">Values alignment</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="rarely_confident" />
                  </FormControl>
                  <FormLabel className="font-normal">Rarely confident</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="deeperInsight.noveltyPreference"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>Do you seek out new experiences or stick with the familiar?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="seek_novelty" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Actively seek novelty
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="occasionally_try" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Occasionally try new things
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="prefer_known" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Prefer what I know
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="avoid_change" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Avoid change
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
        name="deeperInsight.learningStyle"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How do you usually learn something new?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="hands_on" />
                  </FormControl>
                  <FormLabel className="font-normal">Hands-on</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="tutorials" />
                  </FormControl>
                  <FormLabel className="font-normal">Tutorials / guides</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="someone_shows" />
                  </FormControl>
                  <FormLabel className="font-normal">Someone shows me</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="see_action" />
                  </FormControl>
                  <FormLabel className="font-normal">I need to see it in action</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="struggle" />
                  </FormControl>
                  <FormLabel className="font-normal">I struggle with new things</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="deeperInsight.mindChange"
        render={({ field }) => (
          <FormItem className="mt-6">
            <FormLabel>What's something you've changed your mind about in the last few years?</FormLabel>
            <FormControl>
              <Input placeholder="Your answer" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="deeperInsight.groupBehavior"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How do you act in group settings?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="lead" />
                  </FormControl>
                  <FormLabel className="font-normal">I lead</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="support" />
                  </FormControl>
                  <FormLabel className="font-normal">I support</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="solo" />
                  </FormControl>
                  <FormLabel className="font-normal">I go solo</FormLabel>
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
        name="deeperInsight.stressReaction"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How do you react to stress?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="focused" />
                  </FormControl>
                  <FormLabel className="font-normal">Focused</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="overwhelmed" />
                  </FormControl>
                  <FormLabel className="font-normal">Overwhelmed</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="distracted" />
                  </FormControl>
                  <FormLabel className="font-normal">Distracted</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="quiet" />
                  </FormControl>
                  <FormLabel className="font-normal">Quiet</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="push_through" />
                  </FormControl>
                  <FormLabel className="font-normal">Push through</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="deeperInsight.opinionSharing"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How comfortable are you sharing opinions in public settings?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="very" />
                  </FormControl>
                  <FormLabel className="font-normal">Very</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="somewhat" />
                  </FormControl>
                  <FormLabel className="font-normal">Somewhat</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="trusted_people" />
                  </FormControl>
                  <FormLabel className="font-normal">Only with people I trust</FormLabel>
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
        name="deeperInsight.friendsDescription"
        render={({ field }) => (
          <FormItem className="mt-6">
            <FormLabel>How would close friends describe you in 3 words?</FormLabel>
            <FormControl>
              <Input placeholder="Your answer" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="deeperInsight.industryUnderstanding"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>Do people in your industry or community "get" people like you?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="yes" />
                  </FormControl>
                  <FormLabel className="font-normal">Yes</FormLabel>
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
        name="deeperInsight.misunderstanding"
        render={({ field }) => (
          <FormItem className="mt-6">
            <FormLabel>What do people often misunderstand about you?</FormLabel>
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

export default DeeperInsightSection;
