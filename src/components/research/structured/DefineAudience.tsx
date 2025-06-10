
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AudienceDefinition, DefineAudienceProps } from './audience/types';
import { PersonaSelectionFilters } from './audience/PersonaSelectionFilters';
import { SelectedPersonasPreview } from './audience/SelectedPersonasPreview';
import { PersonaGrid } from './audience/PersonaGrid';
import { useAudienceData } from './audience/useAudienceData';

export const DefineAudience: React.FC<DefineAudienceProps> = ({ 
  onAudienceDefined, 
  maxPersonas = 6,
  initialAudience
}) => {
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(initialAudience?.selected_personas || []);
  
  const {
    personas,
    filteredPersonas,
    collections,
    searchTerm,
    setSearchTerm,
    selectedCollection,
    setSelectedCollection,
    isLoadingPersonas,
    isLoadingCollections
  } = useAudienceData();

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersonas(prev => {
      if (prev.includes(personaId)) {
        return prev.filter(id => id !== personaId);
      } else if (prev.length < maxPersonas) {
        return [...prev, personaId];
      }
      return prev;
    });
  };

  const handlePersonaRemove = (personaId: string) => {
    setSelectedPersonas(prev => prev.filter(id => id !== personaId));
  };

  const handleContinue = () => {
    if (selectedPersonas.length === 0) return;

    const audience: AudienceDefinition = {
      selected_personas: selectedPersonas,
      demographics: {}
    };

    onAudienceDefined(audience);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Select Your Target Audience</h2>
        <p className="text-muted-foreground">
          Choose personas that represent your target audience for this research study
        </p>
      </div>

      {/* Persona Selection */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Select Personas</h3>
              <p className="text-sm text-muted-foreground">
                Choose up to {maxPersonas} personas that represent your target audience
              </p>
            </div>
            <Badge variant="secondary">
              {selectedPersonas.length}/{maxPersonas} selected
            </Badge>
          </div>

          {/* Collection Filter and Search */}
          <PersonaSelectionFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCollection={selectedCollection}
            onCollectionChange={setSelectedCollection}
            collections={collections}
            isLoadingCollections={isLoadingCollections}
          />

          {/* Selected Personas Preview */}
          <SelectedPersonasPreview
            selectedPersonas={selectedPersonas}
            personas={personas}
            onPersonaRemove={handlePersonaRemove}
          />

          {/* Persona List */}
          <PersonaGrid
            personas={filteredPersonas}
            selectedPersonas={selectedPersonas}
            maxPersonas={maxPersonas}
            onPersonaSelect={handlePersonaSelect}
            isLoading={isLoadingPersonas || isLoadingCollections}
            searchTerm={searchTerm}
            selectedCollection={selectedCollection}
          />
        </div>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleContinue}
          disabled={selectedPersonas.length === 0}
          size="lg"
          className="px-8"
        >
          Continue with {selectedPersonas.length} Persona{selectedPersonas.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
};

export type { AudienceDefinition };
