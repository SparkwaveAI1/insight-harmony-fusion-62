
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { UseFormReturn } from "react-hook-form";
import { QuestionnaireForm } from "@/pages/PreInterviewQuestionnaire";

interface InterestsPreferencesSectionProps {
  form: UseFormReturn<QuestionnaireForm>;
  watchesMedia: string;
}

const InterestsPreferencesSection = ({ form, watchesMedia }: InterestsPreferencesSectionProps) => {
  return (
    <div className="space-y-6 pt-4">
      <h2 className="text-xl font-semibold">Section 5: Interests and Preferences</h2>
      <Separator />
      
      <FormField
        control={form.control}
        name="musicTastes"
        render={() => (
          <FormItem>
            <FormLabel>What types of music do you enjoy? (Select all that apply)</FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {[
                "Pop",
                "Rock",
                "Hip-Hop/Rap",
                "Classical",
                "Jazz",
                "Country",
                "Electronic",
                "I don't really listen to music",
                "Other"
              ].map((genre) => (
                <FormItem
                  key={genre}
                  className="flex flex-row items-start space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      onCheckedChange={(checked) => {
                        const currentGenres = form.getValues("musicTastes") || [];
                        if (checked) {
                          form.setValue("musicTastes", [
                            ...currentGenres,
                            genre
                          ]);
                        } else {
                          form.setValue(
                            "musicTastes",
                            currentGenres.filter((g) => g !== genre)
                          );
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">{genre}</FormLabel>
                </FormItem>
              ))}
            </div>
          </FormItem>
        )}
      />

      {form.watch("musicTastes")?.includes("Other") && (
        <FormField
          control={form.control}
          name="otherMusicTastes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please specify other music genres:</FormLabel>
              <FormControl>
                <Input placeholder="Other music genres you enjoy" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="watchesMedia"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you watch TV shows or movies regularly?</FormLabel>
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

      {watchesMedia === "Yes" && (
        <FormField
          control={form.control}
          name="favoriteGenres"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Favorite types or genres:</FormLabel>
              <FormControl>
                <Input placeholder="Your favorite genres" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="sportInterest"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you follow or play sports?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "Yes, follow as a fan",
                  "Yes, I play",
                  "Both",
                  "Not really interested in sports"
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
        name="cookingInterest"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you enjoy cooking or baking?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                {[
                  "Yes, I enjoy it",
                  "Sometimes",
                  "Not really"
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

export default InterestsPreferencesSection;
