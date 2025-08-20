
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import FormSectionWrapper from "@/components/ui-custom/FormSectionWrapper";

interface InformationSectionProps {
  form: UseFormReturn<any>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const InformationSection = ({ form, open, onOpenChange }: InformationSectionProps) => {
  const newsSourcesOptions = [
    { id: "twitter", label: "Twitter / X" },
    { id: "podcasts", label: "Podcasts" },
    { id: "reddit", label: "Reddit / Discord" },
    { id: "news_apps", label: "News apps" },
    { id: "youtube", label: "YouTube" },
    { id: "newsletters", label: "Newsletters" },
    { id: "tv_radio", label: "TV / Radio" },
    { id: "group_chats", label: "Group chats" },
    { id: "dont_follow", label: "I don't follow news" },
  ];

  const contentFormatOptions = [
    { id: "video", label: "Video" },
    { id: "podcasts", label: "Podcasts" },
    { id: "articles", label: "Articles" },
    { id: "visual_posts", label: "Visual posts" },
    { id: "threads", label: "Threads/comments" },
  ];

  return (
    <FormSectionWrapper 
      title="🔹 Section 4: Information & Content Habits" 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <FormField
        control={form.control}
        name="information.newsSources"
        render={() => (
          <FormItem className="space-y-3">
            <div className="mb-4">
              <FormLabel>Where do you get news and updates? (Pick up to 3)</FormLabel>
            </div>
            {newsSourcesOptions.map((option) => (
              <FormField
                key={option.id}
                control={form.control}
                name={`information.newsSources.${option.id}`}
                render={({ field }) => (
                  <FormItem
                    key={option.id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {option.label}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="information.contentFormats"
        render={() => (
          <FormItem className="space-y-3 mt-6">
            <div className="mb-4">
              <FormLabel>Which content formats do you enjoy most? (Pick up to 2)</FormLabel>
            </div>
            {contentFormatOptions.map((option) => (
              <FormField
                key={option.id}
                control={form.control}
                name={`information.contentFormats.${option.id}`}
                render={({ field }) => (
                  <FormItem
                    key={option.id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {option.label}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="information.contentTime"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>How much non-work content do you consume daily?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-3"
              >
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="less_than_1" />
                  </FormControl>
                  <FormLabel className="font-normal">&lt;1hr</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="1_2" />
                  </FormControl>
                  <FormLabel className="font-normal">1–2hrs</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="3_4" />
                  </FormControl>
                  <FormLabel className="font-normal">3–4hrs</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-1 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="5_plus" />
                  </FormControl>
                  <FormLabel className="font-normal">5+hrs</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="information.followInfluencers"
        render={({ field }) => (
          <FormItem className="space-y-3 mt-6">
            <FormLabel>Do you follow any influencers or thought leaders?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="closely" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Yes – closely
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="casually" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Yes – casually
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="no" />
                  </FormControl>
                  <FormLabel className="font-normal">
                    No
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="information.trustForAdvice"
        render={({ field }) => (
          <FormItem className="mt-6">
            <FormLabel>Who do you trust most for advice or insight?</FormLabel>
            <FormControl>
              <Input placeholder="Your answer" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSectionWrapper>
  );
};

export default InformationSection;
