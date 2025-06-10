
import React from 'react';
import { Users, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Persona } from '@/services/persona/types';

interface SelectedPersonasPreviewProps {
  selectedPersonas: string[];
  personas: Persona[];
  onPersonaRemove: (personaId: string) => void;
}

export const SelectedPersonasPreview: React.FC<SelectedPersonasPreviewProps> = ({
  selectedPersonas,
  personas,
  onPersonaRemove
}) => {
  const getSelectedPersonaDetails = () => {
    return selectedPersonas.map(id => personas.find(p => p.persona_id === id)).filter(Boolean) as Persona[];
  };

  if (selectedPersonas.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <h4 className="font-medium mb-3 flex items-center gap-2">
        <Users className="h-4 w-4" />
        Selected Personas
      </h4>
      <div className="flex flex-wrap gap-2">
        {getSelectedPersonaDetails().map((persona) => (
          <div key={persona.persona_id} className="flex items-center gap-2 bg-background rounded-lg p-2 border">
            <Avatar className="h-6 w-6">
              <AvatarImage src={persona.profile_image_url} />
              <AvatarFallback className="text-xs">
                {persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{persona.name}</span>
            {persona.metadata?.occupation && (
              <Badge variant="outline" className="text-xs">
                {persona.metadata.occupation}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPersonaRemove(persona.persona_id)}
              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
