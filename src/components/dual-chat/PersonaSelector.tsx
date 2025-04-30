
import React, { useState, useEffect } from 'react';
import Card from '@/components/ui-custom/Card';
import Button from '@/components/ui-custom/Button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PersonaOption } from '@/components/persona-chat/types';
import { useQuery } from '@tanstack/react-query';
import { getAllPersonas } from '@/services/persona/personaService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, LibraryIcon, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PersonaSelectorProps {
  personaAId: string;
  personaBId: string;
  setPersonaAId: (id: string) => void;
  setPersonaBId: (id: string) => void;
  handleLoadPersonas: () => void;
  autoChatActive: boolean;
  isLoading: boolean;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  personaAId,
  personaBId,
  setPersonaAId,
  setPersonaBId,
  handleLoadPersonas,
  autoChatActive,
  isLoading
}) => {
  const [searchTermA, setSearchTermA] = useState('');
  const [searchTermB, setSearchTermB] = useState('');
  const [browseDialogOpen, setBrowseDialogOpen] = useState(false);
  const [currentSelectionTarget, setCurrentSelectionTarget] = useState<'A' | 'B' | null>(null);
  
  // Fetch all personas from the library
  const { data: allPersonas = [], isLoading: isLoadingPersonas } = useQuery({
    queryKey: ['allPersonas'],
    queryFn: async () => {
      const personas = await getAllPersonas();
      return personas.map(p => ({ id: p.persona_id, name: p.name, metadata: p.metadata }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Filter personas based on search term
  const filteredPersonasA = allPersonas.filter(persona => 
    persona.name.toLowerCase().includes(searchTermA.toLowerCase())
  );
  
  const filteredPersonasB = allPersonas.filter(persona => 
    persona.name.toLowerCase().includes(searchTermB.toLowerCase())
  );
  
  // Filter personas for the browse dialog
  const [browseSearchTerm, setBrowseSearchTerm] = useState('');
  const filteredBrowsePersonas = allPersonas.filter(persona => 
    persona.name.toLowerCase().includes(browseSearchTerm.toLowerCase()) ||
    (persona.metadata?.occupation || "").toLowerCase().includes(browseSearchTerm.toLowerCase())
  );
  
  // Get persona name by ID
  const getPersonaNameById = (id: string): string => {
    const persona = allPersonas.find(p => p.id === id);
    return persona ? persona.name : id;
  };
  
  const handleOpenBrowseDialog = (target: 'A' | 'B') => {
    setCurrentSelectionTarget(target);
    setBrowseSearchTerm('');
    setBrowseDialogOpen(true);
  };
  
  const handleSelectPersona = (personaId: string) => {
    if (currentSelectionTarget === 'A') {
      setPersonaAId(personaId);
    } else if (currentSelectionTarget === 'B') {
      setPersonaBId(personaId);
    }
    setBrowseDialogOpen(false);
  };
  
  return (
    <Card className="mb-6">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Select Personas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Persona A Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Persona A</label>
            <div className="flex flex-col space-y-2">
              <div className="flex gap-2">
                <Input 
                  placeholder="Search personas..."
                  value={searchTermA}
                  onChange={(e) => setSearchTermA(e.target.value)}
                  disabled={autoChatActive || isLoading}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={() => handleOpenBrowseDialog('A')}
                  disabled={autoChatActive || isLoading}
                  title="Browse Persona Library"
                >
                  <LibraryIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <Select
                value={personaAId}
                onValueChange={setPersonaAId}
                disabled={autoChatActive || isLoading || isLoadingPersonas}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a persona">
                    {personaAId ? getPersonaNameById(personaAId) : "Select a persona"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectGroup>
                    {filteredPersonasA.map((persona) => (
                      <SelectItem key={persona.id} value={persona.id}>
                        {persona.name}
                      </SelectItem>
                    ))}
                    {filteredPersonasA.length === 0 && (
                      <div className="py-2 px-2 text-sm text-muted-foreground">
                        {isLoadingPersonas ? "Loading..." : "No personas found"}
                      </div>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input 
                value={personaAId} 
                onChange={(e) => setPersonaAId(e.target.value)}
                placeholder="Or enter Persona ID directly"
                disabled={autoChatActive || isLoading}
                className="text-xs"
              />
            </div>
          </div>
          
          {/* Persona B Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Persona B</label>
            <div className="flex flex-col space-y-2">
              <div className="flex gap-2">
                <Input 
                  placeholder="Search personas..."
                  value={searchTermB}
                  onChange={(e) => setSearchTermB(e.target.value)}
                  disabled={autoChatActive || isLoading}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={() => handleOpenBrowseDialog('B')}
                  disabled={autoChatActive || isLoading}
                  title="Browse Persona Library"
                >
                  <LibraryIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <Select
                value={personaBId}
                onValueChange={setPersonaBId}
                disabled={autoChatActive || isLoading || isLoadingPersonas}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a persona">
                    {personaBId ? getPersonaNameById(personaBId) : "Select a persona"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectGroup>
                    {filteredPersonasB.map((persona) => (
                      <SelectItem key={persona.id} value={persona.id}>
                        {persona.name}
                      </SelectItem>
                    ))}
                    {filteredPersonasB.length === 0 && (
                      <div className="py-2 px-2 text-sm text-muted-foreground">
                        {isLoadingPersonas ? "Loading..." : "No personas found"}
                      </div>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input 
                value={personaBId} 
                onChange={(e) => setPersonaBId(e.target.value)}
                placeholder="Or enter Persona ID directly"
                disabled={autoChatActive || isLoading}
                className="text-xs"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleLoadPersonas} 
            disabled={!personaAId || !personaBId || autoChatActive || isLoading}
          >
            Load Personas
          </Button>
        </div>
      </div>
      
      {/* Browse Persona Library Dialog */}
      <Dialog open={browseDialogOpen} onOpenChange={setBrowseDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Browse Persona Library</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {/* Search input */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search personas by name, occupation..."
                className="pl-10"
                value={browseSearchTerm}
                onChange={(e) => setBrowseSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Personas list */}
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
              {isLoadingPersonas ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center p-3 space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : filteredBrowsePersonas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No personas match your search query.
                </div>
              ) : (
                filteredBrowsePersonas.map((persona) => (
                  <div
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona.id)}
                    className="flex items-center p-3 rounded-md cursor-pointer transition-colors hover:bg-muted/50"
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
                    
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PersonaSelector;
