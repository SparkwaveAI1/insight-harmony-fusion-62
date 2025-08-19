import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

const CognitiveProfileForm = () => {
  const { control, watch, setValue } = useFormContext();

  const bigFiveValues = watch("cognitive_profile.big_five");
  const intelligenceTypes = watch("cognitive_profile.intelligence.type");
  const moralFoundations = watch("cognitive_profile.moral_foundations");

  const handleIntelligenceTypeChange = (type: string, checked: boolean) => {
    const currentTypes = intelligenceTypes || [];
    if (checked) {
      setValue("cognitive_profile.intelligence.type", [...currentTypes, type]);
    } else {
      setValue("cognitive_profile.intelligence.type", currentTypes.filter((t: string) => t !== type));
    }
  };

  return (
    <FormSectionWrapper title="Cognitive Profile & Personality">
      <div className="space-y-8">
        {/* Big Five Personality Traits */}
        <div>
          <h4 className="text-lg font-medium mb-4">Big Five Personality Traits</h4>
          <div className="space-y-6">
            {Object.entries({
              openness: "Openness to Experience",
              conscientiousness: "Conscientiousness",
              extraversion: "Extraversion",
              agreeableness: "Agreeableness",
              neuroticism: "Neuroticism"
            }).map(([key, label]) => (
              <FormField
                key={key}
                control={control}
                name={`cognitive_profile.big_five.${key}`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>{label}</FormLabel>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((bigFiveValues?.[key] || 0.5) * 100)}%
                      </span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[field.value || 0.5]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* Intelligence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="cognitive_profile.intelligence.level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intelligence Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select intelligence level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="gifted">Gifted</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Intelligence Types</FormLabel>
            <div className="space-y-2 mt-2">
              {["analytical", "creative", "practical", "emotional"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`intelligence-${type}`}
                    checked={intelligenceTypes?.includes(type) || false}
                    onCheckedChange={(checked) => handleIntelligenceTypeChange(type, checked as boolean)}
                  />
                  <label
                    htmlFor={`intelligence-${type}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decision Style */}
        <FormField
          control={control}
          name="cognitive_profile.decision_style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decision Making Style</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select decision style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="logical">Logical</SelectItem>
                  <SelectItem value="emotional">Emotional</SelectItem>
                  <SelectItem value="impulsive">Impulsive</SelectItem>
                  <SelectItem value="risk-averse">Risk Averse</SelectItem>
                  <SelectItem value="risk-seeking">Risk Seeking</SelectItem>
                  <SelectItem value="procedural">Procedural</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Moral Foundations */}
        <div>
          <h4 className="text-lg font-medium mb-4">Moral Foundations</h4>
          <div className="space-y-6">
            {Object.entries({
              care_harm: "Care vs. Harm",
              fairness_cheating: "Fairness vs. Cheating",
              loyalty_betrayal: "Loyalty vs. Betrayal",
              authority_subversion: "Authority vs. Subversion",
              sanctity_degradation: "Sanctity vs. Degradation",
              liberty_oppression: "Liberty vs. Oppression"
            }).map(([key, label]) => (
              <FormField
                key={key}
                control={control}
                name={`cognitive_profile.moral_foundations.${key}`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>{label}</FormLabel>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((moralFoundations?.[key] || 0.5) * 100)}%
                      </span>
                    </div>
                    <FormControl>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[field.value || 0.5]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* Temporal Orientation */}
        <FormField
          control={control}
          name="cognitive_profile.temporal_orientation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Temporal Orientation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select temporal orientation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="past">Past-focused</SelectItem>
                  <SelectItem value="present">Present-focused</SelectItem>
                  <SelectItem value="future">Future-focused</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Worldview Summary */}
        <FormField
          control={control}
          name="cognitive_profile.worldview_summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Worldview Summary</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe this persona's overall worldview, beliefs, and philosophy..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSectionWrapper>
  );
};

export default CognitiveProfileForm;