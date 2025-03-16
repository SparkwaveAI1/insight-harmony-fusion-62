
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { UseFormReturn } from "react-hook-form";
import { QuestionnaireForm } from "@/pages/PreInterviewQuestionnaire";

interface PoliticalSocialSectionProps {
  form: UseFormReturn<QuestionnaireForm>;
}

const PoliticalSocialSection = ({ form }: PoliticalSocialSectionProps) => {
  return (
    <div className="space-y-6 pt-4">
      <h2 className="text-xl font-semibold">Section 4: Political & Social Perspective</h2>
      <Separator />
      
      <FormField
        control={form.control}
        name="politicalEngagement"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you consider yourself politically engaged?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "Very engaged",
                  "Somewhat engaged",
                  "Not engaged",
                  "Prefer not to say"
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
        name="politicalViews"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Which of these best matches your general political views?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "Progressive / Left-leaning",
                  "Moderate / In the middle",
                  "Conservative / Right-leaning",
                  "I don't think in political terms",
                  "Other / Not sure"
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
        name="countrySatisfaction"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>In your country, how satisfied are you with the direction things are going overall?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "Very satisfied",
                  "Somewhat satisfied",
                  "Somewhat dissatisfied",
                  "Very dissatisfied",
                  "I don't have strong feelings"
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

export default PoliticalSocialSection;
