
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {personas.map((persona) => (
        <Button
          key={persona.persona_id}
          variant="outline"
          onClick={() => onSelect(persona.persona_id)}
          className="h-auto p-4 justify-start hover:bg-primary/5 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-start gap-3 w-full">
            {/* Avatar/Thumbnail */}
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={persona.image_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            {/* Persona Info */}
            <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
              <div className="font-medium text-sm text-left truncate w-full">
                {persona.name}
              </div>
              
              {/* Preview Traits */}
              <div className="flex flex-wrap gap-1">
                {persona.metadata?.occupation && (
                  <Badge variant="secondary" className="text-xs">
                    {persona.metadata.occupation}
                  </Badge>
                )}
                {persona.metadata?.age && (
                  <Badge variant="outline" className="text-xs">
                    Age {persona.metadata.age}
                  </Badge>
                )}
              </div>
              
              {/* Key traits preview */}
              {persona.trait_profile?.personality_traits && (
                <div className="text-xs text-muted-foreground line-clamp-1 w-full text-left">
                  {Object.entries(persona.trait_profile.personality_traits)
                    .slice(0, 2)
                    .map(([trait, score]) => `${trait}: ${score}`)
                    .join(', ')}
                </div>
              )}
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
};
