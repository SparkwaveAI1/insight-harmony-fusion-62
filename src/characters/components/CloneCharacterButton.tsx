
import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Character } from "../types/characterTraitTypes";
import { NonHumanoidCharacter } from "../types/nonHumanoidTypes";
import { CloneCharacterFormContent } from "./clone/CloneCharacterFormContent";
import { useCharacterClone } from "./clone/useCharacterClone";

interface CloneCharacterButtonProps {
  character: Character | NonHumanoidCharacter;
  className?: string;
}

const CloneCharacterButton = ({ character, className }: CloneCharacterButtonProps) => {
  const [open, setOpen] = useState(false);
  const { form, onSubmit, isSubmitting } = useCharacterClone(character);

  const handleSubmit = async (data: any) => {
    const success = await onSubmit(data);
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Copy className="h-4 w-4 mr-2" />
          Clone & Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Clone & Customize Character</DialogTitle>
          <DialogDescription>
            Create your own version of this character with custom modifications.
            You'll be able to generate images for your cloned character.
          </DialogDescription>
        </DialogHeader>
        <CloneCharacterFormContent 
          form={form} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
          character={character}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CloneCharacterButton;
