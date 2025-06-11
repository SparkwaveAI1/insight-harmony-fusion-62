
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Filter, CheckCircle2 } from 'lucide-react';
import { PersonaGrid } from './audience/PersonaGrid';
import { PersonaSelectionFilters } from './audience/PersonaSelectionFilters';
import { SelectedPersonasPreview } from './audience/SelectedPersonasPreview';
import { useAudienceData } from './audience/useAudienceData';
import { AudienceFilters } from './audience/types';

export interface AudienceDefinition {
  target_demographics: string;
  psychographics: string;
  behavioral_patterns: string;
  selection_criteria: string;
  selected_personas?: string[];
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
  initialAudience,
  hidePersonaSelection = false,
  personaSelectionOnly = false,
  selectedPersonas = []
}) => {
  const [audienceData, setAudienceData] = useState<AudienceDefinition>({
    target_demographics: initialAudience?.target_demographics || '',
    psychographics: initialAudience?.psychographics || '',
    behavioral_patterns: initialAudience?.behavioral_patterns || '',
    selection_criteria: initialAudience?.selection_criteria || '',
    selected_personas: selectedPersonas
  });

  const [currentSelectedPersonas, setCurrentSelectedPersonas] = useState<string[]>(selectedPersonas);
  const [filters, setFilters] = useState<AudienceFilters>({
    age_range: '',
    gender: '',
    occupation: '',
    region: '',
    education: ''
  });

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

  const handleSubmit = () => {
    if (personaSelectionOnly) {
      onAudienceDefined(currentSelectedPersonas);
    } else {
      const finalAudienceData = {
        ...audienceData,
        selected_personas: hidePersonaSelection ? [] : currentSelectedPersonas
      };
      onAudienceDefined(finalAudienceData);
    }
  };

  const canProceed = personaSelectionOnly 
    ? currentSelectedPersonas.length > 0
    : audienceData.target_demographics.trim() !== '' && 
      audienceData.selection_criteria.trim() !== '';

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
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search personas by name, occupation, or traits..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Collections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Collections</SelectItem>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <PersonaSelectionFilters 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCollection={selectedCollection}
              onCollectionChange={setSelectedCollection}
              collections={collections}
              isLoadingCollections={isLoadingCollections}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Selected Personas Preview */}
          {currentSelectedPersonas.length > 0 && (
            <SelectedPersonasPreview
              selectedPersonas={currentSelectedPersonas}
              personas={filteredPersonas}
              maxPersonas={maxPersonas}
              onPersonaRemove={(personaId) => {
                setCurrentSelectedPersonas(prev => prev.filter(id => id !== personaId));
              }}
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
            <Label htmlFor="demographics">Target Demographics *</Label>
            <Textarea
              id="demographics"
              placeholder="e.g., Adults aged 25-45, urban professionals, household income $50K-$100K"
              value={audienceData.target_demographics}
              onChange={(e) => setAudienceData(prev => ({ ...prev, target_demographics: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="psychographics">Psychographics</Label>
            <Textarea
              id="psychographics"
              placeholder="e.g., Health-conscious, environmentally aware, values convenience"
              value={audienceData.psychographics}
              onChange={(e) => setAudienceData(prev => ({ ...prev, psychographics: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="behavioral">Behavioral Patterns</Label>
          <Textarea
            id="behavioral"
            placeholder="e.g., Shops online frequently, uses mobile apps for daily tasks, early technology adopters"
            value={audienceData.behavioral_patterns}
            onChange={(e) => setAudienceData(prev => ({ ...prev, behavioral_patterns: e.target.value }))}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="criteria">Selection Criteria *</Label>
          <Textarea
            id="criteria"
            placeholder="e.g., Must have purchased similar products in the last 6 months, active on social media"
            value={audienceData.selection_criteria}
            onChange={(e) => setAudienceData(prev => ({ ...prev, selection_criteria: e.target.value }))}
            rows={2}
          />
        </div>

        {!hidePersonaSelection && (
          <>
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Select Study Participants</h3>
              
              {/* Search and Filters */}
              <div className="space-y-4 mb-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search personas by name, occupation, or traits..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Collections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Collections</SelectItem>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <PersonaSelectionFilters 
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedCollection={selectedCollection}
                  onCollectionChange={setSelectedCollection}
                  collections={collections}
                  isLoadingCollections={isLoadingCollections}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>

              {/* Selected Personas Preview */}
              {currentSelectedPersonas.length > 0 && (
                <SelectedPersonasPreview
                  selectedPersonas={currentSelectedPersonas}
                  personas={filteredPersonas}
                  maxPersonas={maxPersonas}
                  onPersonaRemove={(personaId) => {
                    setCurrentSelectedPersonas(prev => prev.filter(id => id !== personaId));
                  }}
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
          </>
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
