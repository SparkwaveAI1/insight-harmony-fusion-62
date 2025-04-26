
import React from 'react';
import Card from '@/components/ui-custom/Card';
import Button from '@/components/ui-custom/Button';
import { Input } from '@/components/ui/input';

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
  return (
    <Card className="mb-6">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Select Personas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Persona A ID</label>
            <Input 
              value={personaAId} 
              onChange={(e) => setPersonaAId(e.target.value)}
              placeholder="Enter Persona ID"
              disabled={autoChatActive || isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Persona B ID</label>
            <Input 
              value={personaBId} 
              onChange={(e) => setPersonaBId(e.target.value)}
              placeholder="Enter Persona ID"
              disabled={autoChatActive || isLoading}
            />
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
