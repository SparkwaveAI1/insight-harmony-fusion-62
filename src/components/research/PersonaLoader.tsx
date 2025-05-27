
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  maxPersonas,
  onStartSession,
  isLoading
}) => {
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { personas } = usePersona();

  const filteredPersonas = (personas || []).filter(persona =>
    persona.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePersonaToggle = (personaId: string) => {
    setSelectedPersonas(prev => {
      if (prev.includes(personaId)) {
        return prev.filter(id => id !== personaId);
      } else if (prev.length < maxPersonas) {
        return [...prev, personaId];
      }
      return prev;
    });
  };

  const handleStartSession = () => {
    if (selectedPersonas.length > 0) {
      onStartSession(selectedPersonas);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Select Personas for Research Session
          <Badge variant="secondary">
            {selectedPersonas.length}/{maxPersonas} selected
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
            const isSelected = selectedPersonas.includes(persona.persona_id);
            const isDisabled = !isSelected && selectedPersonas.length >= maxPersonas;

            return (
              <Card
                key={persona.persona_id}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'ring-2 ring-primary' : ''
                } ${isDisabled ? 'opacity-50' : ''}`}
                onClick={() => !isDisabled && handlePersonaToggle(persona.persona_id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      className="mt-1"
                    />
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
            disabled={selectedPersonas.length === 0 || isLoading}
            size="lg"
          >
            {isLoading ? 'Starting Session...' : `Start Research Session with ${selectedPersonas.length} Persona${selectedPersonas.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
