
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
  if (!personaA || !personaB) {
    return (
      <Card className="mb-6 p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-md p-4 bg-muted/20">
            <p className="font-semibold">Persona A {personaA ? '(Loaded)' : '(Not Loaded)'}</p>
            <p className="text-sm text-muted-foreground">ID: {personaAId}</p>
            {!personaA && (
              <div className="mt-2 text-red-500 text-sm">
                Error: Persona could not be loaded. Please check the ID and try again.
              </div>
            )}
          </div>
          <div className="border rounded-md p-4 bg-muted/20">
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
    <Card className="mb-6 p-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold">{personaA.name}</h3>
          <p className="text-sm text-muted-foreground">ID: {personaA.persona_id}</p>
          <div className="mt-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Age</p>
                <p>{personaA.metadata?.age || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Gender</p>
                <p>{personaA.metadata?.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Occupation</p>
                <p>{personaA.metadata?.occupation || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Region</p>
                <p>{personaA.metadata?.region || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">{personaB.name}</h3>
          <p className="text-sm text-muted-foreground">ID: {personaB.persona_id}</p>
          <div className="mt-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Age</p>
                <p>{personaB.metadata?.age || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Gender</p>
                <p>{personaB.metadata?.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Occupation</p>
                <p>{personaB.metadata?.occupation || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium">Region</p>
                <p>{personaB.metadata?.region || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonaDisplay;
