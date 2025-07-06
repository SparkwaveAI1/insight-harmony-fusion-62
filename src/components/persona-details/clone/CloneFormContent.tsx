
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
import { UseFormReturn } from "react-hook-form";

interface CloneFormContentProps {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => Promise<boolean>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const CloneFormContent = ({ 
  form, 
  onSubmit, 
  isSubmitting, 
  onCancel 
}: CloneFormContentProps) => {
  
  const handleFormSubmit = async (data: any) => {
    console.log("Form submitted with data:", data);
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Persona Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter name for the new persona" {...field} />
                </FormControl>
                <FormDescription>
                  Give your customized persona a unique name to distinguish it from the original.
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
                    placeholder="Original persona generation prompt" 
                    className="min-h-[100px]"
                    {...field} 
                    readOnly
                  />
                </FormControl>
                <FormDescription>
                  This base prompt will be used with your customizations to generate the new persona.
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
                    placeholder="Examples: Make this persona more extroverted, add stronger political opinions, increase interest in technology, make them more environmentally conscious..." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Specify how this new persona should differ from the original. Be specific about the traits you want to modify while preserving the core characteristics you want to keep.
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
            {isSubmitting ? "Generating..." : "Generate Customized Persona"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CloneFormContent;
