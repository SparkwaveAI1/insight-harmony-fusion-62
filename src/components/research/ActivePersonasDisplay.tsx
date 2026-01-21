
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Persona } from '@/services/persona/types';

interface ActivePersonasDisplayProps {
  loadedPersonas: Persona[];
}

export const ActivePersonasDisplay: React.FC<ActivePersonasDisplayProps> = ({
  loadedPersonas
}) => {
  return (
    <Card className="flex-shrink-0 mt-6 p-4 bg-muted/30">
      <h4 className="font-medium mb-3 text-sm text-muted-foreground">Active Personas:</h4>
      <div className="flex flex-wrap gap-3">
        {loadedPersonas.map((persona) => (
          <div key={persona.persona_id} className="flex items-center gap-2 bg-background rounded-lg p-2 border">
            <Avatar className="h-6 w-6">
              <AvatarImage src={persona.profile_thumbnail_url || persona.profile_image_url} className="object-top" />
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
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Active" />
          </div>
        ))}
      </div>
    </Card>
  );
};
