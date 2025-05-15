
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
import { CloneFormValues } from "./cloneFormSchema";
import { UseFormReturn } from "react-hook-form";

interface CloneFormContentProps {
  form: UseFormReturn<CloneFormValues>;
  onSubmit: (data: CloneFormValues) => Promise<boolean>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const CloneFormContent = ({ 
  form, 
  onSubmit, 
  isSubmitting, 
  onCancel 
}: CloneFormContentProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Persona Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name for the cloned persona" {...field} />
                </FormControl>
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
                    placeholder="Original persona generation prompt" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  This is the original prompt used to generate this persona.
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
                <FormLabel>Customization Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="e.g., Make this persona more funny, more prone to anger, or more politically aligned with..." 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Add specific instructions on how to modify this persona.
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
            {isSubmitting ? "Creating..." : "Create Clone"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CloneFormContent;
