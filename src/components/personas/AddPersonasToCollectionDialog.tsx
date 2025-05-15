import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getAllPersonas } from "@/services/persona"; // Updated import path
import { Persona } from "@/services/persona/types";
import { addPersonasToCollection } from "@/services/collections";

interface AddPersonasToCollectionDialogProps {
  collectionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonasAdded: () => void;
}

const AddPersonasToCollectionDialog: React.FC<AddPersonasToCollectionDialogProps> = ({
  collectionId,
  open,
  onOpenChange,
  onPersonasAdded,
}) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPersonas = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          console.error("User not authenticated");
          toast.error("You must be logged in to add personas to a collection.");
          return;
        }

        const allPersonas = await getAllPersonas();
        const userPersonas = allPersonas.filter((persona) => persona.user_id === user.id);
        setPersonas(userPersonas);
      } catch (error) {
        console.error("Error fetching personas:", error);
        toast.error("Failed to load personas.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonas();
  }, [user]);

  const handleCheckboxChange = (personaId: string) => {
    setSelectedPersonaIds((prevSelected) => {
      if (prevSelected.includes(personaId)) {
        return prevSelected.filter((id) => id !== personaId);
      } else {
        return [...prevSelected, personaId];
      }
    });
  };

  const handleAddPersonas = async () => {
    try {
      const success = await addPersonasToCollection(collectionId, selectedPersonaIds);
      if (success) {
        toast.success("Personas added to collection successfully!");
        onPersonasAdded();
        onOpenChange(false); // Close the dialog
      } else {
        toast.error("Failed to add personas to collection.");
      }
    } catch (error) {
      console.error("Error adding personas to collection:", error);
      toast.error("Failed to add personas to collection.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Personas to Collection</DialogTitle>
          <DialogDescription>
            Choose the personas you want to add to this collection.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ScrollArea className="h-[300px] w-full rounded-md border">
            {isLoading ? (
              <div className="p-4">Loading personas...</div>
            ) : (
              personas.map((persona) => (
                <div key={persona.persona_id} className="flex items-center space-x-2 p-2">
                  <Checkbox
                    id={persona.persona_id}
                    checked={selectedPersonaIds.includes(persona.persona_id)}
                    onCheckedChange={() => handleCheckboxChange(persona.persona_id)}
                  />
                  <label
                    htmlFor={persona.persona_id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {persona.name}
                  </label>
                </div>
              ))
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddPersonas} disabled={selectedPersonaIds.length === 0}>
            Add Personas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPersonasToCollectionDialog;
