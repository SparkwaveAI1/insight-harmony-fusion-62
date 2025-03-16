
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { UseFormReturn } from "react-hook-form";
import { QuestionnaireForm } from "@/pages/PreInterviewQuestionnaire";

interface OpinionsDecisionMakingSectionProps {
  form: UseFormReturn<QuestionnaireForm>;
}

const OpinionsDecisionMakingSection = ({ form }: OpinionsDecisionMakingSectionProps) => {
  return (
    <div className="space-y-6 pt-4">
      <h2 className="text-xl font-semibold">Section 3: Opinions & Decision-Making</h2>
      <Separator />
      
      <FormField
        control={form.control}
        name="decisionMakingStyle"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>When making important decisions, you tend to:</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "Think through the pros and cons carefully",
                  "Go with your gut or feelings",
                  "Talk it through with others first",
                  "It depends"
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
        name="planningStyle"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Which sounds more like you?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "I like to plan things ahead of time",
                  "I prefer to stay flexible and see what happens"
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
        name="jobPreference"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Imagine you were offered two jobs. Which would you choose?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "Higher pay, but more stress and longer hours",
                  "Lower pay, but flexible and less stressful",
                  "Depends on details / Not sure"
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
        name="newsFollowing"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you follow news or current events?</FormLabel>
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

      <FormField
        control={form.control}
        name="politicalDiscussions"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you enjoy discussing social or political topics?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "Yes, often",
                  "Sometimes",
                  "Rarely",
                  "I prefer to avoid those topics"
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

export default OpinionsDecisionMakingSection;
