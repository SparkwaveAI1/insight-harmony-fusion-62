
import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Persona } from "@/services/persona/types";
import { usePersonaCustomization } from "@/hooks/usePersonaCustomization";
import CloneFormContent from "./clone/CloneFormContent";

interface PersonaCloneFormProps {
  persona: Persona;
}

const PersonaCloneForm = ({ persona }: PersonaCloneFormProps) => {
  const [open, setOpen] = useState(false);
  const { form, onSubmit, isSubmitting } = usePersonaCustomization(persona);

  const handleSubmit = async (data: any) => {
    try {
      console.log("Submitting customization form with data:", data);
      const success = await onSubmit(data);
      if (success) {
        setOpen(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      return false;
    }
  };

  return (
    <div className="w-full">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="default" 
            className="w-full flex items-center justify-center gap-2"
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
    </div>
  );
};

export default PersonaCloneForm;
