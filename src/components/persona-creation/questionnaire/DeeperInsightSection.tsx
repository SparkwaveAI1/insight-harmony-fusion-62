
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

interface DeeperInsightSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DeeperInsightSection = ({ form, open, onOpenChange }: DeeperInsightSectionProps) => {
  const personalityTraits = [
    { id: "reliable", label: "Reliable" },
    { id: "driven", label: "Driven" },
    { id: "funny", label: "Funny" },
    { id: "honest", label: "Honest" },
    { id: "chill", label: "Chill" },
    { id: "smart", label: "Smart" },
    { id: "creative", label: "Creative" },
    { id: "empathetic", label: "Empathetic" },
    { id: "independent", label: "Independent" },
    { id: "reserved", label: "Reserved" },
  ];
  
  const misunderstandingReasons = [
    { id: "communication_style", label: "My tone or communication style" },
    { id: "assumptions", label: "People make assumptions" },
    { id: "dont_explain", label: "I don't explain myself" },
    { id: "not_misunderstood", label: "I don't usually feel misunderstood" },
  ];

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
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How open are you to changing your mind about important topics?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="very_open" />
                  </FormControl>
                  <FormLabel className="font-normal">Very open – I welcome new perspectives</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="somewhat_open" />
                  </FormControl>
                  <FormLabel className="font-normal">Somewhat open – I'll listen</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="evidence_based" />
                  </FormControl>
                  <FormLabel className="font-normal">It depends – only if the evidence is strong</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="not_open" />
                  </FormControl>
                  <FormLabel className="font-normal">Not very open – I stick to my views</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="not_sure" />
                  </FormControl>
                  <FormLabel className="font-normal">I'm not sure</FormLabel>
                </FormItem>
              </RadioGroup>
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
        render={() => (
          <FormItem className="space-y-3 mt-6">
            <div className="mb-4">
              <FormLabel>Which of these words do you think people would use to describe you? (Pick up to 3)</FormLabel>
            </div>
            {personalityTraits.map((trait) => (
              <FormField
                key={trait.id}
                control={form.control}
                name={`deeperInsight.friendsDescription.${trait.id}`}
                render={({ field }) => (
                  <FormItem
                    key={trait.id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {trait.label}
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
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How often do you feel misunderstood?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="often" />
                  </FormControl>
                  <FormLabel className="font-normal">Often</FormLabel>
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
                    <RadioGroupItem value="almost_never" />
                  </FormControl>
                  <FormLabel className="font-normal">Almost never</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="deeperInsight.misunderstandingReason"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>If people do misunderstand you, what do you think causes it?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {misunderstandingReasons.map((reason) => (
                  <FormItem key={reason.id} className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={reason.id} />
                    </FormControl>
                    <FormLabel className="font-normal">{reason.label}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="deeperInsight.invisibilityContext"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>Have you ever felt underestimated or overlooked in a group or setting?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="yes_often" />
                  </FormControl>
                  <FormLabel className="font-normal">Yes – often</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="yes_occasionally" />
                  </FormControl>
                  <FormLabel className="font-normal">Yes – occasionally</FormLabel>
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
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="prefer_not_to_say" />
                  </FormControl>
                  <FormLabel className="font-normal">Prefer not to say</FormLabel>
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

export default DeeperInsightSection;
