
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { UseFormReturn } from "react-hook-form";
import { QuestionnaireForm } from "@/pages/PreInterviewQuestionnaire";

interface TimeSpendingSectionProps {
  form: UseFormReturn<QuestionnaireForm>;
}

const TimeSpendingSection = ({ form }: TimeSpendingSectionProps) => {
  return (
    <div className="space-y-6 pt-4">
      <h2 className="text-xl font-semibold">Section 2: How You Spend Your Time</h2>
      <Separator />
      
      <FormField
        control={form.control}
        name="freeTimeActivities"
        render={() => (
          <FormItem>
            <FormLabel>What do you usually do during your free time? (Select all that apply)</FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {[
                "Spend time with friends/family",
                "Watch TV or movies",
                "Play video games",
                "Read",
                "Cook or bake",
                "Play or follow sports",
                "Listen to music",
                "Work on hobbies or creative projects",
                "Other"
              ].map((activity) => (
                <FormItem
                  key={activity}
                  className="flex flex-row items-start space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      onCheckedChange={(checked) => {
                        const currentActivities = form.getValues("freeTimeActivities") || [];
                        if (checked) {
                          form.setValue("freeTimeActivities", [
                            ...currentActivities,
                            activity
                          ]);
                        } else {
                          form.setValue(
                            "freeTimeActivities",
                            currentActivities.filter((a) => a !== activity)
                          );
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">{activity}</FormLabel>
                </FormItem>
              ))}
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="socialFrequency"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>How often do you spend time with others socially (in person or online)?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "Almost every day",
                  "A few times a week",
                  "A few times a month",
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

      <FormField
        control={form.control}
        name="socialPreference"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you prefer:</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "Quiet time alone or with close people",
                  "Being around groups and activity",
                  "A mix of both"
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
    </div>
  );
};

export default TimeSpendingSection;
