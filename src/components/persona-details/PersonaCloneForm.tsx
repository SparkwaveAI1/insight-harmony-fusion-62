import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Persona } from "@/services/persona";
import { usePersonaClone } from "./clone/usePersonaClone";
import CloneFormContent from "./clone/CloneFormContent";
import { CloneFormValues } from "./clone/cloneFormSchema";

interface PersonaCloneFormProps {
  persona: Persona;
}

const PersonaCloneForm = ({ persona }: PersonaCloneFormProps) => {
  const [open, setOpen] = useState(false);
  const { form, onSubmit, isSubmitting } = usePersonaClone(persona);

  const handleSubmit = async (data: CloneFormValues): Promise<boolean> => {
    const success = await onSubmit(data);
    if (success) {
      setOpen(false);
    }
    return success;
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
