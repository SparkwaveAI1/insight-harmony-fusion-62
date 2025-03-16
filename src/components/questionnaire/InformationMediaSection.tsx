
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { UseFormReturn } from "react-hook-form";
import { QuestionnaireForm } from "@/pages/PreInterviewQuestionnaire";

interface InformationMediaSectionProps {
  form: UseFormReturn<QuestionnaireForm>;
}

const InformationMediaSection = ({ form }: InformationMediaSectionProps) => {
  return (
    <div className="space-y-6 pt-4">
      <h2 className="text-xl font-semibold">Section 6: Information & Media Habits</h2>
      <Separator />
      
      <FormField
        control={form.control}
        name="informationSources"
        render={() => (
          <FormItem>
            <FormLabel>Where do you usually get information about news or topics you care about? (Select all that apply)</FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {[
                "Television",
                "Newspapers or magazines",
                "News websites (e.g., BBC, CNN, local news, etc.)",
                "Social media (e.g., Facebook, Twitter, TikTok)",
                "YouTube or podcasts",
                "Friends or family",
                "I don't follow news or information sources regularly"
              ].map((source) => (
                <FormItem
                  key={source}
                  className="flex flex-row items-start space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      onCheckedChange={(checked) => {
                        const currentSources = form.getValues("informationSources") || [];
                        if (checked) {
                          form.setValue("informationSources", [
                            ...currentSources,
                            source
                          ]);
                        } else {
                          form.setValue(
                            "informationSources",
                            currentSources.filter((s) => s !== source)
                          );
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">{source}</FormLabel>
                </FormItem>
              ))}
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="trustInformation"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you trust most information you come across online?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "Yes, most of it",
                  "I'm cautious and double-check things",
                  "I rarely trust online information",
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
    </div>
  );
};

export default InformationMediaSection;
