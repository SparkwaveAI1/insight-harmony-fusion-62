
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { mapDbPersonaToPersona } from '@/services/persona/mappers';

interface AddPersonasToCollectionDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  collectionId: string;
  onPersonasAdded: () => void;
}

const AddPersonasToCollectionDialog = ({ 
  open = false, 
  onOpenChange, 
  collectionId, 
  onPersonasAdded 
}: AddPersonasToCollectionDialogProps) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPersonas();
    }
  }, [open]);

  const fetchPersonas = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      const mappedPersonas = data.map(mapDbPersonaToPersona);
      setPersonas(mappedPersonas);
    } catch (error) {
      console.error('Error fetching personas:', error);
      toast({
        title: "Error",
        description: "Failed to load personas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      toast({
        title: "No Selection",
        description: "Please select at least one persona to add",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const insertData = selectedPersonaIds.map(personaId => ({
        collection_id: collectionId,
        persona_id: personaId,
      }));

      const { error } = await supabase
        .from('collection_personas')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added ${selectedPersonaIds.length} persona(s) to collection`,
      });

      onPersonasAdded();
      onOpenChange?.(false);
      setSelectedPersonaIds([]);
    } catch (error) {
      console.error('Error adding personas to collection:', error);
      toast({
        title: "Error",
        description: "Failed to add personas to collection",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Personas to Collection</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {personas.map((persona) => (
                  <div key={persona.persona_id} className="flex items-center space-x-2">
                    <Checkbox
                      id={persona.persona_id}
                      checked={selectedPersonaIds.includes(persona.persona_id)}
                      onCheckedChange={() => handlePersonaToggle(persona.persona_id)}
                    />
                    <label
                      htmlFor={persona.persona_id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {persona.name}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddPersonas} 
            disabled={isAdding || selectedPersonaIds.length === 0}
          >
            {isAdding ? 'Adding...' : `Add ${selectedPersonaIds.length} Persona(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPersonasToCollectionDialog;
