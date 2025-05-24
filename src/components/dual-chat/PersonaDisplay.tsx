
import React from 'react';
import Card from '@/components/ui-custom/Card';
import { Persona } from '@/services/persona/types';
import PersonaDetailCard from './persona-display/PersonaDetailCard';
import ErrorState from './persona-display/ErrorState';

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
  if (!personaA || !personaB) {
    return (
      <Card className="mb-6 p-4 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-md p-4 bg-[#F5F5F7]">
            <p className="font-semibold">Persona A {personaA ? '(Loaded)' : '(Not Loaded)'}</p>
            <p className="text-sm text-muted-foreground">ID: {personaAId}</p>
            {!personaA && (
              <div className="mt-2 text-red-500 text-sm">
                Error: Persona could not be loaded. Please check the ID and try again.
              </div>
            )}
          </div>
          <div className="border rounded-md p-4 bg-[#F5F5F7]">
            <p className="font-semibold">Persona B {personaB ? '(Loaded)' : '(Not Loaded)'}</p>
            <p className="text-sm text-muted-foreground">ID: {personaBId}</p>
            {!personaB && (
              <div className="mt-2 text-red-500 text-sm">
                Error: Persona could not be loaded. Please check the ID and try again.
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6 p-4 shadow-md">
      <div className="grid md:grid-cols-2 gap-4">
        <PersonaDetailCard persona={personaA} />
        <PersonaDetailCard persona={personaB} />
      </div>
    </Card>
  );
};

export default PersonaDisplay;
