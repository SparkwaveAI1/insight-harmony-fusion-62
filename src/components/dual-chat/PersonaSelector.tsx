
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
  
  // Fetch all personas from the library
  const { data: allPersonas = [], isLoading: isLoadingPersonas } = useQuery({
    queryKey: ['allPersonas'],
    queryFn: async () => {
      const personas = await getAllPersonas();
      return personas.map(p => ({ id: p.persona_id, name: p.name }));
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
  
  // Get persona name by ID
  const getPersonaNameById = (id: string): string => {
    const persona = allPersonas.find(p => p.id === id);
    return persona ? persona.name : id;
  };
  
  return (
    <Card className="mb-6">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Select Personas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Persona A</label>
            <div className="flex flex-col space-y-2">
              <Input 
                placeholder="Search personas..."
                value={searchTermA}
                onChange={(e) => setSearchTermA(e.target.value)}
                disabled={autoChatActive || isLoading}
                className="mb-2"
              />
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
          
          <div>
            <label className="block text-sm font-medium mb-1">Persona B</label>
            <div className="flex flex-col space-y-2">
              <Input 
                placeholder="Search personas..."
                value={searchTermB}
                onChange={(e) => setSearchTermB(e.target.value)}
                disabled={autoChatActive || isLoading}
                className="mb-2"
              />
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
    </Card>
  );
};

export default PersonaSelector;
