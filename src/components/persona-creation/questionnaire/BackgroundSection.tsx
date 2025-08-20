
import React from "react";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

interface BackgroundSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const BackgroundSection = ({ form, open, onOpenChange }: BackgroundSectionProps) => {
  return (
    <FormSectionWrapper 
      title="🧩 Background & Identity" 
      open={open} 
      onOpenChange={onOpenChange}
    >
      {/* Disability & Health Status */}
      <div className="mb-8">
        <h3 className="font-medium mb-4">Disability & Health Status</h3>
        
        <FormField
          control={form.control}
          name="background.disability"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>1. Do you consider yourself to have a disability or chronic health condition?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="physical" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes – physical</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="mental" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes – mental / cognitive</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="both" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes – both</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="prefer_not_say" />
                    </FormControl>
                    <FormLabel className="font-normal">Prefer not to say</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="background.healthImpact"
          render={({ field }) => (
            <FormItem className="space-y-3 mt-6">
              <FormLabel>2. Has your health status ever significantly shaped how you live, work, or make decisions?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="regularly" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes – regularly</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="occasionally" />
                    </FormControl>
                    <FormLabel className="font-normal">Occasionally</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="rarely" />
                    </FormControl>
                    <FormLabel className="font-normal">Rarely</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="prefer_not_say" />
                    </FormControl>
                    <FormLabel className="font-normal">Prefer not to say</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Mental Health & Emotional Resilience */}
      <div className="mb-8">
        <h3 className="font-medium mb-4">🧠 Mental Health & Emotional Resilience</h3>
        
        <FormField
          control={form.control}
          name="background.mentalHealth"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>3. How would you describe your relationship with mental health or emotional wellbeing?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="actively_manage" />
                    </FormControl>
                    <FormLabel className="font-normal">Actively manage it</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="sometimes_struggle" />
                    </FormControl>
                    <FormLabel className="font-normal">Sometimes struggle</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="mostly_stable" />
                    </FormControl>
                    <FormLabel className="font-normal">Mostly stable</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="dont_think_about" />
                    </FormControl>
                    <FormLabel className="font-normal">It's not something I think about</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="prefer_not_say" />
                    </FormControl>
                    <FormLabel className="font-normal">Prefer not to say</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="background.mentalHealthInfluence"
          render={({ field }) => (
            <FormItem className="space-y-3 mt-6">
              <FormLabel>4. Have mental health experiences influenced how you relate to others or to yourself?</FormLabel>
              <FormDescription>Short fill-in (optional)</FormDescription>
              <FormControl>
                <Textarea placeholder="Your answer (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Cultural Identity & Migration */}
      <div className="mb-8">
        <h3 className="font-medium mb-4">🌍 Cultural Identity & Migration</h3>
        
        <FormField
          control={form.control}
          name="background.bornInCurrentCountry"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>5. Were you born in the country where you currently live?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-3"
                >
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="yes" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="background.multipleCultures"
          render={({ field }) => (
            <FormItem className="space-y-3 mt-6">
              <FormLabel>6. Do you identify with more than one culture or nationality?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-3"
                >
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="yes" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="prefer_not_say" />
                    </FormControl>
                    <FormLabel className="font-normal">Prefer not to say</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="background.immigrationExperience"
          render={({ field }) => (
            <FormItem className="space-y-3 mt-6">
              <FormLabel>7. Has immigration, cultural difference, or language been a meaningful part of your life experience?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="personally" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes – personally</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="through_family" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes – through family</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="prefer_not_say" />
                    </FormControl>
                    <FormLabel className="font-normal">Prefer not to say</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Class & Financial Background */}
      <div className="mb-8">
        <h3 className="font-medium mb-4">💼 Class & Financial Background</h3>
        
        <FormField
          control={form.control}
          name="background.financialBackground"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>8. How would you describe your financial background growing up?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="lower_income" />
                    </FormControl>
                    <FormLabel className="font-normal">Lower income</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="working_class" />
                    </FormControl>
                    <FormLabel className="font-normal">Working class</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="middle_class" />
                    </FormControl>
                    <FormLabel className="font-normal">Middle class</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="upper_middle" />
                    </FormControl>
                    <FormLabel className="font-normal">Upper-middle or affluent</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="changed_alot" />
                    </FormControl>
                    <FormLabel className="font-normal">It changed a lot</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="prefer_not_say" />
                    </FormControl>
                    <FormLabel className="font-normal">Prefer not to say</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="background.backgroundInfluence"
          render={({ field }) => (
            <FormItem className="space-y-3 mt-6">
              <FormLabel>9. Do you feel your background still affects how you think about money or opportunity?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-3"
                >
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="yes" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="somewhat" />
                    </FormControl>
                    <FormLabel className="font-normal">Somewhat</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Gender, Sexuality, and Identity */}
      <div className="mb-8">
        <h3 className="font-medium mb-4">🧑🏽‍🤝‍🧑🏽 Gender, Sexuality, and Identity</h3>
        
        <FormField
          control={form.control}
          name="background.lgbtqia"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>10. Do you identify as LGBTQIA+?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-3"
                >
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="yes" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="prefer_not_say" />
                    </FormControl>
                    <FormLabel className="font-normal">Prefer not to say</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="background.identityImpact"
          render={({ field }) => (
            <FormItem className="space-y-3 mt-6">
              <FormLabel>11. Do you feel your gender or sexual identity has shaped how others treat you or how you move through the world?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="frequently" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes – frequently</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="sometimes" />
                    </FormControl>
                    <FormLabel className="font-normal">Sometimes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="rarely" />
                    </FormControl>
                    <FormLabel className="font-normal">Rarely</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="prefer_not_say" />
                    </FormControl>
                    <FormLabel className="font-normal">Prefer not to say</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Discrimination & Power Dynamics */}
      <div>
        <h3 className="font-medium mb-4">✊ Discrimination & Power Dynamics</h3>
        
        <FormField
          control={form.control}
          name="background.discrimination"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>12. Have you experienced discrimination or bias that shaped your worldview?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="frequently" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes – frequently</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="occasionally" />
                    </FormControl>
                    <FormLabel className="font-normal">Occasionally</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="rarely" />
                    </FormControl>
                    <FormLabel className="font-normal">Rarely</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="no" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="prefer_not_say" />
                    </FormControl>
                    <FormLabel className="font-normal">Prefer not to say</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="background.invisibilityContext"
          render={({ field }) => (
            <FormItem className="space-y-3 mt-6">
              <FormLabel>13. In what context have you felt most invisible, excluded, or underestimated?</FormLabel>
              <FormDescription>Short fill-in (optional)</FormDescription>
              <FormControl>
                <Textarea placeholder="Your answer (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSectionWrapper>
  );
};

export default BackgroundSection;
