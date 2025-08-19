import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

const HealthProfileForm = () => {
  const { control, watch, setValue } = useFormContext();

  const mentalHealth = watch("health_profile.mental_health");
  const physicalHealth = watch("health_profile.physical_health");
  const substanceUse = watch("health_profile.substance_use");

  const handleArrayFieldChange = (fieldName: string, value: string, checked: boolean) => {
    const currentValues = watch(fieldName) || [];
    
    if (checked) {
      // If checking "none", uncheck all others
      if (value === "none") {
        setValue(fieldName, ["none"]);
      } else {
        // If checking something else, remove "none" and add the new value
        const filteredValues = currentValues.filter((v: string) => v !== "none");
        setValue(fieldName, [...filteredValues, value]);
      }
    } else {
      // If unchecking, just remove the value
      const newValues = currentValues.filter((v: string) => v !== value);
      // If no values left, add "none"
      if (newValues.length === 0) {
        setValue(fieldName, ["none"]);
      } else {
        setValue(fieldName, newValues);
      }
    }
  };

  return (
    <FormSectionWrapper title="Health Profile">
      <div className="space-y-8">
        {/* Mental Health */}
        <div>
          <FormLabel className="text-base font-medium">Mental Health Conditions</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {["none", "anxiety", "depression", "adhd", "ptsd", "bipolar", "other"].map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={`mental-${condition}`}
                  checked={mentalHealth?.includes(condition) || false}
                  onCheckedChange={(checked) => 
                    handleArrayFieldChange("health_profile.mental_health", condition, checked as boolean)
                  }
                />
                <label
                  htmlFor={`mental-${condition}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  {condition === "adhd" ? "ADHD" : condition === "ptsd" ? "PTSD" : condition}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Physical Health */}
        <div>
          <FormLabel className="text-base font-medium">Physical Health Status</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            {["healthy", "chronic_illness", "disabled"].map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`physical-${status}`}
                  checked={physicalHealth?.includes(status) || false}
                  onCheckedChange={(checked) => 
                    handleArrayFieldChange("health_profile.physical_health", status, checked as boolean)
                  }
                />
                <label
                  htmlFor={`physical-${status}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Substance Use */}
        <div>
          <FormLabel className="text-base font-medium">Substance Use</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {["none", "alcohol", "tobacco", "cannabis", "stimulants", "opioids", "other"].map((substance) => (
              <div key={substance} className="flex items-center space-x-2">
                <Checkbox
                  id={`substance-${substance}`}
                  checked={substanceUse?.includes(substance) || false}
                  onCheckedChange={(checked) => 
                    handleArrayFieldChange("health_profile.substance_use", substance, checked as boolean)
                  }
                />
                <label
                  htmlFor={`substance-${substance}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  {substance}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Energy and Circadian Rhythm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="health_profile.energy_baseline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Energy Baseline</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select energy level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low Energy</SelectItem>
                    <SelectItem value="medium">Medium Energy</SelectItem>
                    <SelectItem value="high">High Energy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="health_profile.circadian_rhythm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Circadian Rhythm</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select circadian type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="morning">Morning Person</SelectItem>
                    <SelectItem value="evening">Evening Person</SelectItem>
                    <SelectItem value="irregular">Irregular Schedule</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </FormSectionWrapper>
  );
};

export default HealthProfileForm;