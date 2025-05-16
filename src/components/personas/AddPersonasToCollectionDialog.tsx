
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Persona } from "@/services/persona/types";
import { addPersonasToCollection, getPersonasNotInCollection } from "@/services/collections";

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
    if (open && user) {
      fetchAvailablePersonas();
    }
  }, [open, user, collectionId]);

  const fetchAvailablePersonas = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        console.error("User not authenticated");
        toast.error("You must be logged in to add personas to a collection.");
        return;
      }

      const availablePersonas = await getPersonasNotInCollection(collectionId, user.id);
      setPersonas(availablePersonas);
    } catch (error) {
      console.error("Error fetching personas not in collection:", error);
      toast.error("Failed to load available personas.");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (selectedPersonaIds.length === 0) {
      toast.info("Please select at least one persona to add");
      return;
    }

    try {
      const success = await addPersonasToCollection(collectionId, selectedPersonaIds);
      if (success) {
        toast.success("Personas added to collection successfully!");
        onPersonasAdded();
        onOpenChange(false); // Close the dialog
        setSelectedPersonaIds([]); // Reset selection
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
            ) : personas.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-muted-foreground">No available personas to add</p>
                <p className="text-sm">All your personas are already in this collection</p>
              </div>
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
          <Button onClick={handleAddPersonas} disabled={selectedPersonaIds.length === 0 || isLoading}>
            Add Selected Personas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPersonasToCollectionDialog;
