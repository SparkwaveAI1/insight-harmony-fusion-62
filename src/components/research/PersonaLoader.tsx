
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, X } from 'lucide-react';
import { usePersona } from '@/hooks/usePersona';
import { Persona } from '@/services/persona/types';

interface PersonaLoaderProps {
  maxPersonas?: number;
  onStartSession: (selectedPersonas: string[]) => Promise<boolean>;
  isLoading: boolean;
}

export const PersonaLoader: React.FC<PersonaLoaderProps> = ({
  maxPersonas = 4,
  onStartSession,
  isLoading
}) => {
  const { personas } = usePersona();
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);

  const togglePersonaSelection = (personaId: string) => {
    setSelectedPersonas(prev => {
      if (prev.includes(personaId)) {
        return prev.filter(id => id !== personaId);
      } else if (prev.length < maxPersonas) {
        return [...prev, personaId];
      }
      return prev;
    });
  };

  const getSelectedPersonaData = () => {
    return (personas || []).filter(p => selectedPersonas.includes(p.persona_id));
  };

  const handleStartSession = async () => {
    if (selectedPersonas.length === 0) return;
    await onStartSession(selectedPersonas);
  };

  if (!personas || personas.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No personas available. Create some personas first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Personas Display */}
      {selectedPersonas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Selected Personas ({selectedPersonas.length}/{maxPersonas})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {getSelectedPersonaData().map((persona, index) => (
                <div key={persona.persona_id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                  <Badge variant="outline" className="text-xs">
                    Persona {index + 1}
                  </Badge>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={persona.image_url} />
                    <AvatarFallback className="text-xs">
                      {persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <span className="font-medium text-sm">{persona.name}</span>
                    {persona.metadata?.occupation && (
                      <p className="text-xs text-muted-foreground">{persona.metadata.occupation}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePersonaSelection(persona.persona_id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              onClick={handleStartSession}
              disabled={isLoading || selectedPersonas.length === 0}
              className="w-full"
            >
              {isLoading ? 'Starting Session...' : `Start Research Session with ${selectedPersonas.length} Persona${selectedPersonas.length !== 1 ? 's' : ''}`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Available Personas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Personas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select up to {maxPersonas} personas for your research session
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personas.map((persona) => {
              const isSelected = selectedPersonas.includes(persona.persona_id);
              const canSelect = selectedPersonas.length < maxPersonas;
              
              return (
                <div
                  key={persona.persona_id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : canSelect 
                        ? 'border-border hover:border-primary/50' 
                        : 'border-border opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => (isSelected || canSelect) && togglePersonaSelection(persona.persona_id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={persona.image_url} />
                      <AvatarFallback>
                        {persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{persona.name}</h4>
                        {isSelected && (
                          <Badge variant="default" className="text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                      {persona.metadata?.occupation && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {persona.metadata.occupation}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <X className="h-4 w-4 text-primary" />
                      ) : canSelect ? (
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
