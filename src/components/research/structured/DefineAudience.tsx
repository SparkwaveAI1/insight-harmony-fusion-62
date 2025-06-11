
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { PersonaGrid } from './audience/PersonaGrid';
import { PersonaSelectionFilters } from './audience/PersonaSelectionFilters';
import { SelectedPersonasPreview } from './audience/SelectedPersonasPreview';
import { useAudienceData } from './audience/useAudienceData';

export interface AudienceDefinition {
  selected_personas: string[];
  demographics: {
    age_range?: string;
    income_level?: string;
    location?: string;
    occupation?: string;
  };
}

interface DefineAudienceProps {
  onAudienceDefined: (audience: string[]) => void;
  selectedPersonas?: string[];
}

export const DefineAudience: React.FC<DefineAudienceProps> = ({
  onAudienceDefined,
  selectedPersonas = []
}) => {
  const [currentSelectedPersonas, setCurrentSelectedPersonas] = useState<string[]>(selectedPersonas);
  const maxPersonas = 4;

  const {
    personas,
    filteredPersonas,
    searchTerm,
    setSearchTerm,
    isLoadingPersonas
  } = useAudienceData();

  // Auto-launch when personas are selected
  useEffect(() => {
    if (currentSelectedPersonas.length > 0) {
      // Small delay to allow user to see selection
      const timer = setTimeout(() => {
        onAudienceDefined(currentSelectedPersonas);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentSelectedPersonas, onAudienceDefined]);

  const handlePersonaSelect = (personaId: string) => {
    setCurrentSelectedPersonas(prev => {
      const isSelected = prev.includes(personaId);
      if (isSelected) {
        return prev.filter(id => id !== personaId);
      } else if (prev.length < maxPersonas) {
        return [...prev, personaId];
      }
      return prev;
    });
  };

  const handlePersonaRemove = (personaId: string) => {
    setCurrentSelectedPersonas(prev => prev.filter(id => id !== personaId));
  };

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <Users className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Select Study Participants</h2>
        <p className="text-muted-foreground">
          Choose up to {maxPersonas} personas to participate in your group discussion
        </p>
        {currentSelectedPersonas.length > 0 && (
          <p className="text-sm text-primary mt-2 font-medium">
            Starting group discussion in a moment...
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Search Filters */}
        <PersonaSelectionFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Selected Personas Preview */}
        {currentSelectedPersonas.length > 0 && (
          <SelectedPersonasPreview
            selectedPersonas={currentSelectedPersonas}
            personas={filteredPersonas}
            maxPersonas={maxPersonas}
            onPersonaRemove={handlePersonaRemove}
          />
        )}

        {/* Persona Grid */}
        <PersonaGrid
          personas={filteredPersonas}
          selectedPersonas={currentSelectedPersonas}
          maxPersonas={maxPersonas}
          onPersonaSelect={handlePersonaSelect}
          isLoading={isLoadingPersonas}
          searchTerm={searchTerm}
        />
      </div>
    </Card>
  );
};
