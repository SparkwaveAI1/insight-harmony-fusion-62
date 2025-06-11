
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, CheckCircle2 } from 'lucide-react';
import { PersonaGrid } from './audience/PersonaGrid';
import { PersonaSelectionFilters } from './audience/PersonaSelectionFilters';
import { SelectedPersonasPreview } from './audience/SelectedPersonasPreview';
import { useAudienceData } from './audience/useAudienceData';
import { AudienceDefinition } from './audience/types';

interface DefineAudienceProps {
  onAudienceDefined: (audience: AudienceDefinition | string[]) => void;
  initialAudience?: AudienceDefinition | null;
  hidePersonaSelection?: boolean;
  personaSelectionOnly?: boolean;
  selectedPersonas?: string[];
}

export const DefineAudience: React.FC<DefineAudienceProps> = ({
  onAudienceDefined,
  initialAudience,
  hidePersonaSelection = false,
  personaSelectionOnly = false,
  selectedPersonas = []
}) => {
  const [audienceData, setAudienceData] = useState<AudienceDefinition>({
    demographics: {
      age_range: initialAudience?.demographics?.age_range || '',
      income_level: initialAudience?.demographics?.income_level || '',
      location: initialAudience?.demographics?.location || '',
      occupation: initialAudience?.demographics?.occupation || '',
    },
    selected_personas: selectedPersonas
  });

  const [currentSelectedPersonas, setCurrentSelectedPersonas] = useState<string[]>(selectedPersonas);
  const maxPersonas = 4;

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
    if (personaSelectionOnly) {
      onAudienceDefined(currentSelectedPersonas);
    } else {
      const updatedAudience = {
        ...audienceData,
        selected_personas: hidePersonaSelection ? [] : currentSelectedPersonas,
      };
      onAudienceDefined(updatedAudience);
    }
  };

  const canProceed = personaSelectionOnly 
    ? currentSelectedPersonas.length > 0
    : true;

  if (personaSelectionOnly) {
    return (
      <Card className="p-6">
        <div className="text-center mb-6">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Select Study Participants</h2>
          <p className="text-muted-foreground">
            Choose up to {maxPersonas} personas to participate in your research study
          </p>
        </div>

        <div className="space-y-6">
          {/* Search and Filters */}
          <PersonaSelectionFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCollection={selectedCollection}
            onCollectionChange={setSelectedCollection}
            collections={collections}
            isLoadingCollections={isLoadingCollections}
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
            selectedCollection={selectedCollection}
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
              Continue with {currentSelectedPersonas.length} Persona{currentSelectedPersonas.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Regular audience definition mode
  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <Users className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Define Your Target Audience</h2>
        <p className="text-muted-foreground">
          Describe the specific audience you want to research for this study
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="demographics-age">Age Range</Label>
            <Textarea
              id="demographics-age"
              placeholder="e.g., 25-45, young adults, seniors"
              value={audienceData.demographics.age_range || ''}
              onChange={(e) => setAudienceData(prev => ({
                ...prev,
                demographics: { ...prev.demographics, age_range: e.target.value }
              }))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="demographics-income">Income Level</Label>
            <Textarea
              id="demographics-income"
              placeholder="e.g., middle-income, high-income"
              value={audienceData.demographics.income_level || ''}
              onChange={(e) => setAudienceData(prev => ({
                ...prev, 
                demographics: { ...prev.demographics, income_level: e.target.value }
              }))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="demographics-location">Location</Label>
            <Textarea
              id="demographics-location"
              placeholder="e.g., urban areas, suburban, rural"
              value={audienceData.demographics.location || ''}
              onChange={(e) => setAudienceData(prev => ({
                ...prev,
                demographics: { ...prev.demographics, location: e.target.value }
              }))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="demographics-occupation">Occupation</Label>
            <Textarea
              id="demographics-occupation"
              placeholder="e.g., professionals, students, retirees"
              value={audienceData.demographics.occupation || ''}
              onChange={(e) => setAudienceData(prev => ({
                ...prev,
                demographics: { ...prev.demographics, occupation: e.target.value }
              }))}
              rows={2}
            />
          </div>
        </div>

        {!hidePersonaSelection && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Select Study Participants</h3>
            
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <PersonaSelectionFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCollection={selectedCollection}
                onCollectionChange={setSelectedCollection}
                collections={collections}
                isLoadingCollections={isLoadingCollections}
              />
            </div>

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
              selectedCollection={selectedCollection}
            />
          </div>
        )}

        <div className="text-center pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!canProceed}
            size="lg"
            className="px-8"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Continue with Audience Definition
          </Button>
        </div>
      </div>
    </Card>
  );
};
