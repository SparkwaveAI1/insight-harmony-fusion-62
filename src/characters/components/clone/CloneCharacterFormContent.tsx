
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CloneCharacterFormValues } from "./cloneCharacterFormSchema";
import { UseFormReturn } from "react-hook-form";

interface CloneCharacterFormContentProps {
  form: UseFormReturn<CloneCharacterFormValues>;
  onSubmit: (data: CloneCharacterFormValues) => Promise<boolean>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const CloneCharacterFormContent = ({ 
  form, 
  onSubmit, 
  isSubmitting, 
  onCancel 
}: CloneCharacterFormContentProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Character Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter name for the new character" {...field} />
                </FormControl>
                <FormDescription>
                  Give your customized character a unique name to distinguish it from the original.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Prompt</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Original character generation prompt" 
                    className="min-h-[100px]"
                    {...field} 
                    readOnly
                  />
                </FormControl>
                <FormDescription>
                  This base prompt will be used with your customizations to generate the new character.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="customization_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customization Instructions <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Examples: Make this character more extroverted, give them a different occupation, change their historical period, make them have stronger opinions about political issues..." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Specify how this new character should differ from the original one. Be specific and detailed in your instructions.
                  The AI will integrate these customizations into all aspects of the character.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {isSubmitting ? "Generating..." : "Generate Customized Character"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CloneCharacterFormContent;
