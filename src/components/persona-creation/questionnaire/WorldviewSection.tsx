
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

interface WorldviewSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const WorldviewSection = ({ form, open, onOpenChange }: WorldviewSectionProps) => {
  const politicalExpressionOptions = [
    { id: "voting", label: "Voting" },
    { id: "posting", label: "Posting online" },
    { id: "conversations", label: "Conversations" },
    { id: "protests", label: "Protests / activism" },
    { id: "financial", label: "Financial choices" },
    { id: "creative", label: "Creative work" },
    { id: "private", label: "Keep views private" },
  ];

  return (
    <FormSectionWrapper 
      title="🔹 Section 7: Worldview & Politics" 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <FormField
        control={form.control}
        name="worldview.politicalWorldview"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Which statement best reflects your political worldview?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="system_works" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    The system mostly works, but needs fixing
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="system_broken" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    The system is broken and needs rebuilding
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="serves_some" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    It serves some and ignores others
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="distraction" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Politics is a distraction
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="dont_think" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    I don't think about politics much
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="other" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Other: 
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
        name="worldview.politicalWorldviewOther"
        render={({ field }) => (
          <FormItem className="mt-2">
            <FormControl>
              <Input 
                placeholder="Please specify" 
                {...field} 
                disabled={form.watch("worldview.politicalWorldview") !== "other"} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="worldview.politicalRelation"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How do you relate to political groups or parties?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="strongly_identify" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Strongly identify with one
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="lean" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Lean toward one, but flexible
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="dont_trust" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Don't trust parties
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="stay_independent" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Stay independent
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="avoid_politics" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Avoid politics
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
        name="worldview.trustInstitutions"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How much trust do you have in major institutions?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="high" />
                  </FormControl>
                  <FormLabel className="font-normal">High</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="moderate" />
                  </FormControl>
                  <FormLabel className="font-normal">Moderate</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="low" />
                  </FormControl>
                  <FormLabel className="font-normal">Low</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="none" />
                  </FormControl>
                  <FormLabel className="font-normal">None</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="dont_think" />
                  </FormControl>
                  <FormLabel className="font-normal">Don't think about it</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="worldview.politicalExpression"
        render={() => (
          <FormItem className="space-y-3 mt-6">
            <div className="mb-4">
              <FormLabel>How do you express your political/social values? (Pick up to 2)</FormLabel>
            </div>
            {politicalExpressionOptions.map((option) => (
              <FormField
                key={option.id}
                control={form.control}
                name={`worldview.politicalExpression.${option.id}`}
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
        name="worldview.politicalStance"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>Which label best matches your social/political stance?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="progressive" />
                  </FormControl>
                  <FormLabel className="font-normal">Progressive</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="libertarian" />
                  </FormControl>
                  <FormLabel className="font-normal">Libertarian</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="conservative" />
                  </FormControl>
                  <FormLabel className="font-normal">Conservative</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="anti_establishment" />
                  </FormControl>
                  <FormLabel className="font-normal">Anti-establishment</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="centrist" />
                  </FormControl>
                  <FormLabel className="font-normal">Centrist</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="apolitical" />
                  </FormControl>
                  <FormLabel className="font-normal">Apolitical</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="other" />
                  </FormControl>
                  <FormLabel className="font-normal">Other:</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="worldview.politicalStanceOther"
        render={({ field }) => (
          <FormItem className="mt-2">
            <FormControl>
              <Input 
                placeholder="Please specify" 
                {...field} 
                disabled={form.watch("worldview.politicalStance") !== "other"} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="worldview.politicalRepresentation"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>Do you feel represented in mainstream politics?</FormLabel>
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
                    <RadioGroupItem value="somewhat" />
                  </FormControl>
                  <FormLabel className="font-normal">Somewhat</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="rarely" />
                  </FormControl>
                  <FormLabel className="font-normal">Rarely</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="no" />
                  </FormControl>
                  <FormLabel className="font-normal">No</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="not_sure" />
                  </FormControl>
                  <FormLabel className="font-normal">Not sure</FormLabel>
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

export default WorldviewSection;
