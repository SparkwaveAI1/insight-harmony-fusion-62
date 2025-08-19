import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

const LifeContextForm = () => {
  const { control } = useFormContext();
  
  const {
    fields: stressorFields,
    append: appendStressor,
    remove: removeStressor,
  } = useFieldArray({
    control,
    name: "life_context.stressors",
  });

  const {
    fields: supportFields,
    append: appendSupport,
    remove: removeSupport,
  } = useFieldArray({
    control,
    name: "life_context.supports",
  });

  return (
    <FormSectionWrapper title="Life Context & Background">
      <div className="space-y-6">
        <FormField
          control={control}
          name="life_context.background_narrative"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Narrative</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe this persona's background, upbringing, and key life experiences that shaped them..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="life_context.current_situation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Situation</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe their current life circumstances, challenges, and context..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="life_context.daily_routine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daily Routine</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe a typical day in their life..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Stressors</FormLabel>
          <div className="space-y-2 mt-2">
            {stressorFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <FormField
                  control={control}
                  name={`life_context.stressors.${index}`}
                  render={({ field: inputField }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Enter a stressor"
                          {...inputField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {stressorFields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeStressor(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendStressor("")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Stressor
            </Button>
          </div>
        </div>

        <div>
          <FormLabel>Support Systems</FormLabel>
          <div className="space-y-2 mt-2">
            {supportFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <FormField
                  control={control}
                  name={`life_context.supports.${index}`}
                  render={({ field: inputField }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Enter a support system"
                          {...inputField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {supportFields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeSupport(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendSupport("")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Support
            </Button>
          </div>
        </div>

        <FormField
          control={control}
          name="life_context.life_stage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Life Stage</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select life stage" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="emerging_adult">Emerging Adult (18-25)</SelectItem>
                  <SelectItem value="early_career">Early Career (25-35)</SelectItem>
                  <SelectItem value="midlife">Midlife (35-55)</SelectItem>
                  <SelectItem value="late_career">Late Career (55-65)</SelectItem>
                  <SelectItem value="retired">Retired (65+)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSectionWrapper>
  );
};

export default LifeContextForm;