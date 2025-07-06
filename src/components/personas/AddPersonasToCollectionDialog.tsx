
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Plus } from "lucide-react";
import { getAllPersonas } from "@/services/persona";
import { addPersonasToCollection } from "@/services/collections";
import { Persona } from "@/services/persona/types";
import { toast } from "sonner";
import { getMetadataField } from "@/services/persona/utils/metadataUtils";

interface AddPersonasToCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: string;
  onPersonasAdded: () => void;
}

const AddPersonasToCollectionDialog = ({ 
  isOpen, 
  onClose, 
  collectionId, 
  onPersonasAdded 
}: AddPersonasToCollectionDialogProps) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPersonas();
    }
  }, [isOpen]);

  const loadPersonas = async () => {
    setLoading(true);
    try {
      const allPersonas = await getAllPersonas();
      setPersonas(allPersonas);
    } catch (error) {
      console.error('Error loading personas:', error);
      toast.error('Failed to load personas');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaToggle = (personaId: string) => {
    setSelectedPersonaIds(prev => 
      prev.includes(personaId)
        ? prev.filter(id => id !== personaId)
        : [...prev, personaId]
    );
  };

  const handleAddPersonas = async () => {
    if (selectedPersonaIds.length === 0) {
      toast.error('Please select at least one persona');
      return;
    }

    setAdding(true);
    try {
      await addPersonasToCollection(collectionId, selectedPersonaIds);
      toast.success(`Added ${selectedPersonaIds.length} persona(s) to collection`);
      onPersonasAdded();
      onClose();
      setSelectedPersonaIds([]);
    } catch (error) {
      console.error('Error adding personas to collection:', error);
      toast.error('Failed to add personas to collection');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Personas to Collection</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading personas...</div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {personas.map((persona) => {
                  const age = getMetadataField(persona.metadata, 'age', 'N/A');
                  const occupation = getMetadataField(persona.metadata, 'occupation', 'N/A');
                  const isSelected = selectedPersonaIds.includes(persona.persona_id);

                  return (
                    <div
                      key={persona.persona_id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handlePersonaToggle(persona.persona_id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handlePersonaToggle(persona.persona_id)}
                      />
                      
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={persona.profile_image_url} alt={persona.name} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{persona.name}</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {age} • {occupation}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddPersonas}
              disabled={selectedPersonaIds.length === 0 || adding}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {adding ? 'Adding...' : `Add ${selectedPersonaIds.length} Persona(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPersonasToCollectionDialog;
