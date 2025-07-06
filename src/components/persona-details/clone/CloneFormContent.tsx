
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
                <FormLabel>Persona Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter name for the customized persona" {...field} />
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
                <FormLabel>Original Foundation</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Original persona generation prompt" 
                    className="min-h-[100px]"
                    {...field} 
                    readOnly
                  />
                </FormControl>
                <FormDescription>
                  This is the foundation that will be preserved. Your customizations will be applied on top of this base.
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
                    placeholder="Examples: 
• Make them more extroverted and social
• Increase their interest in technology and decrease interest in sports
• Make them more politically conservative
• Change their occupation to teacher instead of engineer
• Make them more optimistic and less anxious
• Adjust their communication style to be more formal" 
                    className="min-h-[140px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  <strong>Trait Preservation:</strong> The system will maintain all existing personality traits, demographics, and behavioral patterns unless you specifically request changes. Be clear about what you want to modify while keeping everything else intact.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-900 mb-2">🎯 Customization Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Personality traits:</strong> "Make them more/less [trait]" (e.g., extroverted, anxious, optimistic)</li>
              <li>• <strong>Interests:</strong> "Increase interest in [topic]" or "Change focus from X to Y"</li>
              <li>• <strong>Demographics:</strong> "Change age to X" or "Different occupation"</li>
              <li>• <strong>Values:</strong> "More/less conservative/liberal" or "Different priorities"</li>
              <li>• <strong>Communication:</strong> "More formal/casual style" or "Different vocabulary"</li>
            </ul>
          </div>
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
            {isSubmitting ? "Creating Customized Persona..." : "Create Customized Persona"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CloneFormContent;
