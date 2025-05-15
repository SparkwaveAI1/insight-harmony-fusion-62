
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Persona } from "@/services/persona/types";
import { clonePersona } from "@/services/persona/personaService";

// Define the form schema for the basic persona info
const cloneFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
  customization_notes: z.string().optional(),
});

type CloneFormValues = z.infer<typeof cloneFormSchema>;

interface PersonaCloneFormProps {
  persona: Persona;
}

const PersonaCloneForm = ({ persona }: PersonaCloneFormProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Initialize form with current persona data
  const form = useForm<CloneFormValues>({
    resolver: zodResolver(cloneFormSchema),
    defaultValues: {
      name: `${persona.name} (Clone)`,
      prompt: persona.prompt || "",
      customization_notes: "",
    },
  });

  const onSubmit = async (data: CloneFormValues) => {
    setIsSubmitting(true);
    try {
      // Create a simplified clone of the persona with just the basic information
      const customizedPersona: Partial<Persona> = {
        name: data.name,
        prompt: data.prompt,
        metadata: persona.metadata,
        interview_sections: persona.interview_sections,
        trait_profile: persona.trait_profile,
        linguistic_profile: persona.linguistic_profile,
        // Reset the persona_id and creation_date for the clone
        persona_id: "", // Will be generated on the server
        creation_date: new Date().toISOString().split('T')[0],
      };

      // Append customization notes to the prompt if provided
      if (data.customization_notes) {
        customizedPersona.prompt = `${customizedPersona.prompt}\n\nCustomization Notes: ${data.customization_notes}`;
      }

      // Save the cloned persona
      const clonedPersona = await clonePersona(customizedPersona as Persona);
      
      if (clonedPersona) {
        toast.success("Persona cloned successfully!");
        setOpen(false);
        // Navigate to the new persona detail page
        navigate(`/persona/${clonedPersona.persona_id}`);
      } else {
        toast.error("Failed to clone persona");
      }
    } catch (error) {
      console.error("Error cloning persona:", error);
      toast.error("An error occurred while cloning the persona");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Clone & Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Clone & Customize Persona</DialogTitle>
        </DialogHeader>
        
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
                onClick={() => setOpen(false)}
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
      </DialogContent>
    </Dialog>
  );
};

export default PersonaCloneForm;
