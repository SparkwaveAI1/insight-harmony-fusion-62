
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Persona } from '@/services/persona/types';

interface PersonaGridProps {
  personas: Persona[];
  selectedPersonas: string[];
  maxPersonas: number;
  onPersonaSelect: (personaId: string) => void;
  isLoading: boolean;
  searchTerm: string;
  selectedCollection: string;
}

export const PersonaGrid: React.FC<PersonaGridProps> = ({
  personas,
  selectedPersonas,
  maxPersonas,
  onPersonaSelect,
  isLoading,
  searchTerm,
  selectedCollection
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-3 text-sm">Loading personas...</span>
      </div>
    );
  }

  if (personas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {searchTerm ? 
          'No personas found matching your search criteria. Try adjusting your search terms.' :
          selectedCollection === 'all' ? 'No personas available.' : 'No personas found in this collection.'
        }
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
      {personas.map((persona) => {
        const isSelected = selectedPersonas.includes(persona.persona_id);
        const canSelect = selectedPersonas.length < maxPersonas || isSelected;

        return (
          <Card
            key={persona.persona_id}
            className={`cursor-pointer transition-colors p-3 ${
              isSelected ? 'ring-2 ring-primary bg-primary/5' : 
              canSelect ? 'hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => canSelect && onPersonaSelect(persona.persona_id)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={persona.profile_image_url} />
                    <AvatarFallback className="text-xs">
                      {persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-medium text-sm truncate">{persona.name}</h4>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
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
                  {persona.metadata?.education && (
                    <Badge variant="outline" className="text-xs">
                      {persona.metadata.education}
                    </Badge>
                  )}
                </div>
                {persona.metadata?.location && (
                  <p className="text-xs text-muted-foreground truncate">
                    {persona.metadata.location}
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
