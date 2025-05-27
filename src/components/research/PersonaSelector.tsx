
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Persona } from '@/services/persona/types';

interface PersonaSelectorProps {
  personas: Persona[];
  onSelect: (personaId: string) => void;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  personas,
  onSelect
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {personas.map((persona) => (
        <Button
          key={persona.persona_id}
          variant="outline"
          onClick={() => onSelect(persona.persona_id)}
          className="h-auto p-3 justify-start"
        >
          <div className="flex flex-col items-start gap-1 w-full">
            <div className="font-medium text-sm">{persona.name}</div>
            {persona.metadata?.occupation && (
              <Badge variant="secondary" className="text-xs">
                {persona.metadata.occupation}
              </Badge>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
};
