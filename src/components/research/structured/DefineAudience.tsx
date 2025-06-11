
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle2 } from 'lucide-react';
import { PersonaGrid } from './audience/PersonaGrid';
import { PersonaSelectionFilters } from './audience/PersonaSelectionFilters';
import { SelectedPersonasPreview } from './audience/SelectedPersonasPreview';
import { useAudienceData } from './audience/useAudienceData';

// Export the type that's needed by StructuredStudySetup
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
  onAudienceDefined: (audience: AudienceDefinition | string[]) => void;
  initialAudience?: AudienceDefinition | null;
  hidePersonaSelection?: boolean;
  personaSelectionOnly?: boolean;
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

  const handleSubmit = () => {
    onAudienceDefined(currentSelectedPersonas);
  };

  const canProceed = currentSelectedPersonas.length > 0;

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <Users className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Select Study Participants</h2>
        <p className="text-muted-foreground">
          Choose up to {maxPersonas} personas to participate in your group discussion
        </p>
      </div>

      <div className="space-y-6">
        {/* Search and Filters */}
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

        {/* Continue Button */}
        <div className="text-center pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!canProceed}
            size="lg"
            className="px-8"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Start Group Discussion with {currentSelectedPersonas.length} Persona{currentSelectedPersonas.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Card>
  );
};
