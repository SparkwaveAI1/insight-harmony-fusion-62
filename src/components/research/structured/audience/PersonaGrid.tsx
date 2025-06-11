
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, User } from 'lucide-react';
import { Persona } from '@/services/persona/types';

interface PersonaGridProps {
  personas: Persona[];
  selectedPersonas: string[];
  maxPersonas: number;
  onPersonaSelect: (personaId: string) => void;
  isLoading: boolean;
  searchTerm: string;
}

export const PersonaGrid: React.FC<PersonaGridProps> = ({
  personas,
  selectedPersonas,
  maxPersonas,
  onPersonaSelect,
  isLoading,
  searchTerm
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="p-4 animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-3 bg-muted rounded mb-1"></div>
            <div className="h-3 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (personas.length === 0) {
    return (
      <Card className="p-8 text-center">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No personas found</h3>
        <p className="text-muted-foreground">
          {searchTerm 
            ? `No personas match your search for "${searchTerm}"`
            : "No personas available. Create some personas first."
          }
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {personas.map((persona) => {
        const isSelected = selectedPersonas.includes(persona.id);
        const canSelect = !isSelected && selectedPersonas.length < maxPersonas;
        
        return (
          <Card 
            key={persona.id} 
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              isSelected 
                ? 'ring-2 ring-primary bg-primary/5' 
                : canSelect 
                ? 'hover:border-primary/50' 
                : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => canSelect || isSelected ? onPersonaSelect(persona.id) : null}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-1">{persona.name}</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {persona.demographics?.age && (
                    <Badge variant="secondary" className="text-xs">
                      {persona.demographics.age}
                    </Badge>
                  )}
                  {persona.demographics?.occupation && (
                    <Badge variant="secondary" className="text-xs">
                      {persona.demographics.occupation}
                    </Badge>
                  )}
                </div>
              </div>
              {isSelected && (
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              )}
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2">
              {persona.demographics?.location && `📍 ${persona.demographics.location}`}
              {persona.demographics?.income_level && ` • ${persona.demographics.income_level}`}
            </p>
          </Card>
        );
      })}
    </div>
  );
};
