
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Persona } from "@/services/persona/types";
import { 
  getPersonasNotInCollection, 
  addPersonaToCollection 
} from "@/services/collections/personaCollectionOperations";
import { getAllPersonas } from "@/services/persona/personaService";
import { Skeleton } from "@/components/ui/skeleton";

interface AddPersonasToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  onAddComplete?: () => void;
}

const AddPersonasToCollectionDialog: React.FC<AddPersonasToCollectionDialogProps> = ({
  open,
  onOpenChange,
  collectionId,
  onAddComplete
}) => {
  const [loading, setLoading] = useState(true);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState<Set<string>>(new Set());
  const [addingPersonas, setAddingPersonas] = useState(false);

  // Fetch personas not in the collection when the dialog opens
  useEffect(() => {
    if (open) {
      fetchAvailablePersonas();
    }
  }, [open, collectionId]);

  const fetchAvailablePersonas = async () => {
    setLoading(true);
    try {
      // Get all user personas that are not already in this collection
      const allPersonas = await getAllPersonas();
      const personasInCollection = await getPersonasNotInCollection(collectionId);
      const availablePersonas = allPersonas.filter(
        persona => !personasInCollection.includes(persona.persona_id)
      );
      
      setPersonas(availablePersonas);
      setFilteredPersonas(availablePersonas);
    } catch (error) {
      console.error("Error fetching available personas:", error);
      toast.error("Failed to load personas");
    } finally {
      setLoading(false);
    }
  };

  // Filter personas based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPersonas(personas);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = personas.filter(
        persona => 
          persona.name.toLowerCase().includes(query) || 
          (persona.metadata?.occupation || "").toLowerCase().includes(query) ||
          (persona.metadata?.gender || "").toLowerCase().includes(query) ||
          (persona.metadata?.region || "").toLowerCase().includes(query)
      );
      setFilteredPersonas(filtered);
    }
  }, [searchQuery, personas]);

  const toggleSelectPersona = (personaId: string) => {
    const newSelected = new Set(selectedPersonas);
    if (newSelected.has(personaId)) {
      newSelected.delete(personaId);
    } else {
      newSelected.add(personaId);
    }
    setSelectedPersonas(newSelected);
  };

  const handleAddPersonas = async () => {
    if (selectedPersonas.size === 0) return;
    
    setAddingPersonas(true);
    try {
      const personaIds = Array.from(selectedPersonas);
      let successCount = 0;
      
      // Add each selected persona to the collection
      for (const personaId of personaIds) {
        const result = await addPersonaToCollection(collectionId, personaId);
        if (result) successCount++;
      }
      
      toast.success(`Added ${successCount} persona${successCount !== 1 ? 's' : ''} to collection`);
      onOpenChange(false);
      setSelectedPersonas(new Set());
      if (onAddComplete) onAddComplete();
    } catch (error) {
      console.error("Error adding personas to collection:", error);
      toast.error("Failed to add some personas to collection");
    } finally {
      setAddingPersonas(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Personas to Collection</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {/* Search input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search personas by name, occupation, gender, location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Personas list */}
          <div className="text-sm mb-2">
            {selectedPersonas.size > 0 && (
              <p>{selectedPersonas.size} persona{selectedPersonas.size !== 1 ? 's' : ''} selected</p>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center p-3 space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : filteredPersonas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {personas.length === 0 
                  ? "No available personas found. All personas are already in this collection."
                  : "No personas match your search query."}
              </div>
            ) : (
              filteredPersonas.map(persona => (
                <div
                  key={persona.persona_id}
                  onClick={() => toggleSelectPersona(persona.persona_id)}
                  className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                    selectedPersonas.has(persona.persona_id)
                      ? "bg-primary/10 border-primary/30 border"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {/* Persona info */}
                  <div className="flex-1">
                    <p className="font-medium">{persona.name}</p>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3">
                      {persona.metadata?.age && <span>Age: {persona.metadata.age}</span>}
                      {persona.metadata?.gender && <span>{persona.metadata.gender}</span>}
                      {persona.metadata?.occupation && <span>{persona.metadata.occupation}</span>}
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    selectedPersonas.has(persona.persona_id) 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted border border-muted-foreground/20"
                  }`}>
                    {selectedPersonas.has(persona.persona_id) && <Check className="h-3.5 w-3.5" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={addingPersonas}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddPersonas}
            disabled={selectedPersonas.size === 0 || addingPersonas}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {addingPersonas 
              ? "Adding..." 
              : `Add ${selectedPersonas.size} Persona${selectedPersonas.size !== 1 ? 's' : ''}`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPersonasToCollectionDialog;
