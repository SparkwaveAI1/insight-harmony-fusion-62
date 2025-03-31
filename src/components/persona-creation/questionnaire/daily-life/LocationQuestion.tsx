
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface LocationQuestionProps {
  form: UseFormReturn<any>;
}

const LocationQuestion = ({ form }: LocationQuestionProps) => {
  return (
    <FormField
      control={form.control}
      name="dailyLife.location"
      render={({ field }) => (
        <FormItem className="space-y-3 mt-6">
          <FormLabel>Where do you spend most of your daytime hours?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="home" />
                </FormControl>
                <FormLabel className="font-normal">Home</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="office" />
                </FormControl>
                <FormLabel className="font-normal">Office / workplace</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="road" />
                </FormControl>
                <FormLabel className="font-normal">On the road</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="mixed" />
                </FormControl>
                <FormLabel className="font-normal">Mixed or remote</FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default LocationQuestion;
