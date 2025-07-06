import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Persona } from "@/services/persona/types";
import { mapDbPersonaToPersona } from "@/services/persona/mappers";

interface AddPersonasToCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  collectionId: string;
  collectionName: string;
  onPersonasAdded: () => void;
}

const AddPersonasToCollectionDialog = ({ 
  isOpen, 
  onClose, 
  collectionId, 
  collectionName,
  onPersonasAdded 
}: AddPersonasToCollectionDialogProps) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchAvailablePersonas();
    }
  }, [isOpen, collectionId]);

  const fetchAvailablePersonas = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all user's personas
      const { data: allPersonas, error: personasError } = await supabase
        .from('personas')
        .select('*')
        .eq('user_id', user.id);

      if (personasError) throw personasError;

      // Get personas already in this collection
      const { data: collectionPersonas, error: collectionError } = await supabase
        .from('collection_personas')
        .select('persona_id')
        .eq('collection_id', collectionId);

      if (collectionError) throw collectionError;

      const existingPersonaIds = new Set(collectionPersonas?.map(cp => cp.persona_id) || []);
      
      // Filter out personas already in collection
      const availablePersonas = (allPersonas || [])
        .filter(persona => !existingPersonaIds.has(persona.persona_id))
        .map(mapDbPersonaToPersona);

      setPersonas(availablePersonas);
    } catch (error) {
      console.error('Error fetching personas:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available personas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaToggle = (personaId: string) => {
    setSelectedPersonas((prevSelected) => {
      if (prevSelected.includes(personaId)) {
        return prevSelected.filter((id) => id !== personaId);
      } else {
        return [...prevSelected, personaId];
      }
    });
  };

  const handleAddPersonas = async () => {
    setSaving(true);
    try {
      const newCollectionPersonas = selectedPersonas.map(personaId => ({
        collection_id: collectionId,
        persona_id: personaId,
      }));

      const { error } = await supabase
        .from('collection_personas')
        .insert(newCollectionPersonas);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully added personas to "${collectionName}"`,
      });
      onPersonasAdded();
      onClose();
    } catch (error) {
      console.error('Error adding personas to collection:', error);
      toast({
        title: "Error",
        description: "Failed to add personas to collection",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add Personas to "{collectionName}"</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="text-center py-4">Loading personas...</div>
        ) : (
          <ScrollArea className="h-[400px] w-full rounded-md border">
            <div className="p-4 space-y-3">
              {personas.length === 0 ? (
                <div className="text-center text-gray-500">No personas available to add.</div>
              ) : (
                personas.map((persona) => (
                  <div key={persona.persona_id} className="flex items-center space-x-2">
                    <Checkbox
                      id={persona.persona_id}
                      checked={selectedPersonas.includes(persona.persona_id)}
                      onCheckedChange={() => handlePersonaToggle(persona.persona_id)}
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
            </div>
          </ScrollArea>
        )}

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleAddPersonas} disabled={saving || selectedPersonas.length === 0}>
            {saving ? 'Adding...' : 'Add Personas'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPersonasToCollectionDialog;
