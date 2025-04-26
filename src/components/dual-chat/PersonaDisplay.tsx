
import React from 'react';
import Card from '@/components/ui-custom/Card';
import { Persona } from '@/services/persona/types';

interface PersonaDisplayProps {
  personaA: Persona | null;
  personaB: Persona | null;
  personaAId: string;
  personaBId: string;
}

const PersonaDisplay: React.FC<PersonaDisplayProps> = ({
  personaA,
  personaB,
  personaAId,
  personaBId
}) => {
  if (!personaA || !personaB) return null;
  
  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-muted/20 rounded-lg">
            <h3 className="font-semibold">Persona A: {personaA?.name}</h3>
            <p className="text-sm text-muted-foreground">ID: {personaAId}</p>
          </div>
          <div className="p-3 bg-muted/20 rounded-lg">
            <h3 className="font-semibold">Persona B: {personaB?.name}</h3>
            <p className="text-sm text-muted-foreground">ID: {personaBId}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonaDisplay;
