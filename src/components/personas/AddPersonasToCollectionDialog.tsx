
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Plus } from "lucide-react";
import { getPersonasNotInCollection, addPersonasToCollection } from "@/services/collections";
import { toast } from "sonner";

interface Persona {
  persona_id: string;
  name: string;
  metadata?: {
    occupation?: string;
    age?: string;
    region?: string;
  };
}

interface AddPersonasToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  onPersonasAdded: () => void;
}

const AddPersonasToCollectionDialog = ({
  open,
  onOpenChange,
  collectionId,
  onPersonasAdded
}: AddPersonasToCollectionDialogProps) => {
  const [availablePersonas, setAvailablePersonas] = useState<Persona[]>([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (open) {
      loadAvailablePersonas();
    }
  }, [open, collectionId]);

  const loadAvailablePersonas = async () => {
    setIsLoading(true);
    try {
      const personas = await getPersonasNotInCollection(collectionId);
      setAvailablePersonas(personas);
    } catch (error) {
      console.error("Error loading available personas:", error);
      toast.error("Failed to load available personas");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPersonas = availablePersonas.filter(persona =>
    persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    persona.metadata?.occupation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePersonaToggle = (personaId: string) => {
    setSelectedPersonaIds(prev =>
      prev.includes(personaId)
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    );
  };

  const handleAddPersonas = async () => {
    if (selectedPersonaIds.length === 0) {
      toast.error("Please select at least one persona");
      return;
    }

    setIsAdding(true);
    try {
      const success = await addPersonasToCollection(collectionId, selectedPersonaIds);
      
      if (success) {
        toast.success(`Added ${selectedPersonaIds.length} persona${selectedPersonaIds.length === 1 ? '' : 's'} to collection`);
        onPersonasAdded();
        onOpenChange(false);
        setSelectedPersonaIds([]);
      }
    } catch (error) {
      console.error("Error adding personas to collection:", error);
      toast.error("Failed to add personas to collection");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Personas to Collection</DialogTitle>
          <DialogDescription>
            Select personas to add to this collection. Only personas not already in the collection are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search personas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading personas...</span>
            </div>
          ) : filteredPersonas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No personas found matching your search." : "All personas are already in this collection."}
            </div>
          ) : (
            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="p-4 space-y-3">
                {filteredPersonas.map((persona) => (
                  <div key={persona.persona_id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <Checkbox
                      id={persona.persona_id}
                      checked={selectedPersonaIds.includes(persona.persona_id)}
                      onCheckedChange={() => handlePersonaToggle(persona.persona_id)}
                    />
                    <div className="flex-1 min-w-0">
                      <label 
                        htmlFor={persona.persona_id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {persona.name}
                      </label>
                      {persona.metadata && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {persona.metadata.occupation && (
                            <span>{persona.metadata.occupation}</span>
                          )}
                          {persona.metadata.age && (
                            <span> • Age {persona.metadata.age}</span>
                          )}
                          {persona.metadata.region && (
                            <span> • {persona.metadata.region}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {selectedPersonaIds.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedPersonaIds.length} persona{selectedPersonaIds.length === 1 ? '' : 's'} selected
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddPersonas}
            disabled={isAdding || selectedPersonaIds.length === 0}
          >
            {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Plus className="h-4 w-4 mr-2" />
            Add {selectedPersonaIds.length > 0 ? selectedPersonaIds.length : ''} Persona{selectedPersonaIds.length === 1 ? '' : 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPersonasToCollectionDialog;
