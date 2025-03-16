
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { UseFormReturn } from "react-hook-form";
import { QuestionnaireForm } from "@/pages/PreInterviewQuestionnaire";

interface AboutYouSectionProps {
  form: UseFormReturn<QuestionnaireForm>;
  hasChildren: string;
}

const AboutYouSection = ({ form, hasChildren }: AboutYouSectionProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Section 1: About You</h2>
      <Separator />
      
      <FormField
        control={form.control}
        name="age"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How old are you?</FormLabel>
            <FormControl>
              <Input placeholder="Your age" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City/Town</FormLabel>
              <FormControl>
                <Input placeholder="Your city or town" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="Your country" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="workSituation"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>What's your current work situation?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "Working full-time",
                  "Working part-time",
                  "Self-employed",
                  "Not working",
                  "Retired",
                  "Student"
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
        name="occupation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What do you do for work (or what field are you in)?</FormLabel>
            <FormControl>
              <Input placeholder="Your occupation or field" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="education"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>What's your highest level of education completed?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "No formal education",
                  "High school",
                  "Some college",
                  "College degree",
                  "Graduate degree"
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
        name="livingArrangement"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Who do you live with right now?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "I live alone",
                  "With partner/spouse",
                  "With family (kids, parents, etc.)",
                  "Shared housing (roommates, friends, etc.)"
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
        name="hasChildren"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you have children?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="Yes" />
                  </FormControl>
                  <FormLabel className="font-normal">Yes</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="No" />
                  </FormControl>
                  <FormLabel className="font-normal">No</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />

      {hasChildren === "Yes" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numberOfChildren"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How many children?</FormLabel>
                <FormControl>
                  <Input placeholder="Number of children" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="childrenAges"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Children's ages</FormLabel>
                <FormControl>
                  <Input placeholder="Ages (e.g., 2, 5, 10)" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default AboutYouSection;
