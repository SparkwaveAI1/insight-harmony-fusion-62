
import React from 'react';
import Card from '@/components/ui-custom/Card';
import { Persona } from '@/services/persona/types';
import PersonaDetailCard from './persona-display/PersonaDetailCard';
import ErrorState from './persona-display/ErrorState';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  // Get initials for avatar fallback
  const getInitials = (name: string | undefined): string => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!personaA || !personaB) {
    return (
      <Card className="mb-6 p-4 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-md p-4 bg-[#F5F5F7]">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{personaA ? getInitials(personaA.name) : "A"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Persona A {personaA ? '(Loaded)' : '(Not Loaded)'}</p>
                <p className="text-sm text-muted-foreground">ID: {personaAId}</p>
              </div>
            </div>
            {!personaA && (
              <div className="mt-2 text-red-500 text-sm">
                Error: Persona could not be loaded. Please check the ID and try again.
              </div>
            )}
          </div>
          <div className="border rounded-md p-4 bg-[#F5F5F7]">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{personaB ? getInitials(personaB.name) : "B"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Persona B {personaB ? '(Loaded)' : '(Not Loaded)'}</p>
                <p className="text-sm text-muted-foreground">ID: {personaBId}</p>
              </div>
            </div>
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
}

export default PersonaDisplay;
