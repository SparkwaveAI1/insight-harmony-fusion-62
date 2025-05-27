
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePersona } from '@/hooks/usePersona';
import { Persona } from '@/services/persona/types';

interface PersonaLoaderProps {
  maxPersonas: number;
  onStartSession: (selectedPersonas: string[]) => void;
  isLoading: boolean;
}

export const PersonaLoader: React.FC<PersonaLoaderProps> = ({
  maxPersonas = 1, // Default to 1 for single persona selection
  onStartSession,
  isLoading
}) => {
  const [selectedPersona, setSelectedPersona] = useState<string>(''); // Single persona selection
  const [searchTerm, setSearchTerm] = useState('');
  const { personas } = usePersona();

  const filteredPersonas = (personas || []).filter(persona =>
    persona.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersona(personaId);
  };

  const handleStartSession = () => {
    if (selectedPersona) {
      onStartSession([selectedPersona]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Select a Persona for Research Session
          <Badge variant="secondary">
            {selectedPersona ? '1' : '0'}/1 selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search personas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Persona List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredPersonas.map((persona) => {
            const isSelected = selectedPersona === persona.persona_id;

            return (
              <Card
                key={persona.persona_id}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => handlePersonaSelect(persona.persona_id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                      isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{persona.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {persona.metadata?.age && `Age: ${persona.metadata.age} • `}
                        {persona.metadata?.occupation || 'No description available'}
                      </p>
                      {persona.metadata?.location && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {persona.metadata.location}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredPersonas.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No personas found matching your search.
          </div>
        )}

        {/* Start Session Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleStartSession}
            disabled={!selectedPersona || isLoading}
            size="lg"
          >
            {isLoading ? 'Starting Session...' : selectedPersona ? `Start Research Session with 1 Persona` : 'Select a Persona to Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
