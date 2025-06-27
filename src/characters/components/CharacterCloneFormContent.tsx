
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CharacterCloneFormValues } from "../schemas/characterCloneSchema";

interface CharacterCloneFormContentProps {
  form: UseFormReturn<CharacterCloneFormValues>;
  onSubmit: (data: CharacterCloneFormValues) => Promise<boolean>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const CharacterCloneFormContent = ({
  form,
  onSubmit,
  isSubmitting,
  onCancel
}: CharacterCloneFormContentProps) => {
  const handleFormSubmit = async (data: CharacterCloneFormValues) => {
    const success = await onSubmit(data);
    if (!success) {
      // Form validation failed or submission failed
      return;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Character Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter a name for your customized character"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customization_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customization Instructions *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe how you want to modify this character. Be specific about personality changes, background adjustments, or trait modifications you'd like to see..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Generating..." : "Generate Character"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CharacterCloneFormContent;
