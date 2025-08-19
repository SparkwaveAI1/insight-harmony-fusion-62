import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

const SocialCognitionForm = () => {
  const { control } = useFormContext();

  return (
    <FormSectionWrapper title="Social Cognition & Relationships">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="social_cognition.empathy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empathy Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select empathy level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="social_cognition.theory_of_mind"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theory of Mind</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theory of mind level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="social_cognition.trust_baseline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trust Baseline</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trust level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low - Generally distrustful</SelectItem>
                  <SelectItem value="medium">Medium - Cautiously trusting</SelectItem>
                  <SelectItem value="high">High - Readily trusting</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="social_cognition.conflict_orientation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conflict Orientation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select conflict style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="avoidant">Avoidant</SelectItem>
                  <SelectItem value="collaborative">Collaborative</SelectItem>
                  <SelectItem value="confrontational">Confrontational</SelectItem>
                  <SelectItem value="competitive">Competitive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="social_cognition.persuasion_style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persuasion Style</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select persuasion style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="story-led">Story-led</SelectItem>
                  <SelectItem value="evidence-led">Evidence-led</SelectItem>
                  <SelectItem value="authority-led">Authority-led</SelectItem>
                  <SelectItem value="reciprocity-led">Reciprocity-led</SelectItem>
                  <SelectItem value="status-led">Status-led</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="social_cognition.attachment_style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attachment Style</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select attachment style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="secure">Secure</SelectItem>
                  <SelectItem value="anxious">Anxious</SelectItem>
                  <SelectItem value="avoidant">Avoidant</SelectItem>
                  <SelectItem value="disorganized">Disorganized</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="social_cognition.ingroup_outgroup_sensitivity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>In-group/Out-group Sensitivity</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sensitivity level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low - Inclusive</SelectItem>
                  <SelectItem value="medium">Medium - Moderately tribal</SelectItem>
                  <SelectItem value="high">High - Strongly tribal</SelectItem>
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

export default SocialCognitionForm;