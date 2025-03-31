
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WorldviewQuestionProps {
  form: UseFormReturn<any>;
}

const WorldviewQuestion = ({ form }: WorldviewQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="values.worldview"
      render={({ field }) => (
        <FormItem className="space-y-3 mt-6">
          <FormLabel>Which of these worldviews resonates most with you?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="work_hard" />
                </FormControl>
                <FormLabel className="font-normal">
                  "Work hard, play hard"
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="do_no_harm" />
                </FormControl>
                <FormLabel className="font-normal">
                  "Do no harm, take no shit"
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="everything_happens" />
                </FormControl>
                <FormLabel className="font-normal">
                  "Everything happens for a reason"
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="make_meaning" />
                </FormControl>
                <FormLabel className="font-normal">
                  "We make our own meaning"
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="dont_trust" />
                </FormControl>
                <FormLabel className="font-normal">
                  "Don't trust the system"
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="keep_moving" />
                </FormControl>
                <FormLabel className="font-normal">
                  "Just keep moving forward"
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="other" />
                </FormControl>
                <FormLabel className="font-normal">
                  Other / None
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default WorldviewQuestion;
