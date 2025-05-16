
import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Persona } from "@/services/persona";
import { usePersonaClone } from "./clone/usePersonaClone";
import CloneFormContent from "./clone/CloneFormContent";
import { CloneFormValues } from "./clone/cloneFormSchema";
import { toast } from "sonner";

interface PersonaCloneFormProps {
  persona: Persona;
}

const PersonaCloneForm = ({ persona }: PersonaCloneFormProps) => {
  const [open, setOpen] = useState(false);
  const { form, onSubmit, isSubmitting } = usePersonaClone(persona);

  const handleSubmit = async (data: CloneFormValues) => {
    try {
      if (!data.customization_notes || data.customization_notes.trim() === '') {
        toast.warning("Please provide customization instructions to make your new persona unique");
        return false;
      }
      
      const success = await onSubmit(data);
      if (success) {
        setOpen(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Failed to generate new persona");
      return false;
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
          <DialogTitle className="text-xl">Generate Customized Persona</DialogTitle>
          <DialogDescription>
            Create a modified version of this persona with customized traits and characteristics.
            The more specific your customization instructions, the better the results will be.
          </DialogDescription>
        </DialogHeader>
        <CloneFormContent 
          form={form} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
          onCancel={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default PersonaCloneForm;
