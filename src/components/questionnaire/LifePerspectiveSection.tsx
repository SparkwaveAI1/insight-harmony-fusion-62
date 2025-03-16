
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { UseFormReturn } from "react-hook-form";
import { QuestionnaireForm } from "@/pages/PreInterviewQuestionnaire";

interface LifePerspectiveSectionProps {
  form: UseFormReturn<QuestionnaireForm>;
  travelFrequency: string;
}

const LifePerspectiveSection = ({ form, travelFrequency }: LifePerspectiveSectionProps) => {
  return (
    <div className="space-y-6 pt-4">
      <h2 className="text-xl font-semibold">Section 7: Life Perspective Snapshot</h2>
      <Separator />
      
      <FormField
        control={form.control}
        name="futureOutlook"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>How do you feel about the future?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "Mostly optimistic",
                  "A mix of hope and concern",
                  "Mostly pessimistic",
                  "I don't think about it much"
                ].map((option) => (
                  <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={option} />
                    </FormControl>
                    <FormLabel className="font-normal">{option}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="currentFocus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Describe one thing that's important to you right now, or that you're focused on.</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Share what's important to you..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="noveltyPreference"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you usually try new things, or stick with what you know?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "I enjoy trying new things",
                  "I stick with what I know",
                  "Depends on the situation"
                ].map((option) => (
                  <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={option} />
                    </FormControl>
                    <FormLabel className="font-normal">{option}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="travelFrequency"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you travel for leisure?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "Yes, regularly",
                  "Occasionally",
                  "Rarely",
                  "Never"
                ].map((option) => (
                  <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={option} />
                    </FormControl>
                    <FormLabel className="font-normal">{option}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />

      {travelFrequency && travelFrequency !== "Never" && (
        <FormField
          control={form.control}
          name="travelPreference"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>(If you travel) How do you usually choose where to go?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {[
                    "I look for new and exciting places",
                    "I return to familiar spots",
                    "I decide based on deals or affordability",
                    "Other / It depends"
                  ].map((option) => (
                    <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={option} />
                      </FormControl>
                      <FormLabel className="font-normal">{option}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default LifePerspectiveSection;
