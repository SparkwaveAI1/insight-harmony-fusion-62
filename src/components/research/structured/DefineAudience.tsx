
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getAllPersonas } from '@/services/persona';
import { Persona } from '@/services/persona/types';
import { generateSearchCriteria, SearchCriteria } from '@/services/research/audienceCriteriaService';
import { toast } from 'sonner';

export interface AudienceDefinition {
  target_description: string;
  demographics: {
    age_range?: string;
    income_level?: string;
    location?: string;
    occupation?: string;
  };
  selected_personas: string[];
  custom_criteria?: string;
  search_criteria?: SearchCriteria;
}

interface DefineAudienceProps {
  onAudienceDefined: (audience: AudienceDefinition) => void;
  maxPersonas?: number;
}

export const DefineAudience: React.FC<DefineAudienceProps> = ({ 
  onAudienceDefined, 
  maxPersonas = 6 
}) => {
  const [targetDescription, setTargetDescription] = useState('');
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [customCriteria, setCustomCriteria] = useState('');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(true);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);

  // Fetch personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setIsLoadingPersonas(true);
        const allPersonas = await getAllPersonas();
        setPersonas(allPersonas);
        setFilteredPersonas(allPersonas);
      } catch (error) {
        console.error('Error fetching personas:', error);
        toast.error('Failed to load personas');
      } finally {
        setIsLoadingPersonas(false);
      }
    };

    fetchPersonas();
  }, []);

  // Generate search criteria when target description changes
  const handleGenerateCriteria = async () => {
    if (!targetDescription.trim()) {
      toast.error('Please enter a target audience description first');
      return;
    }

    setIsGeneratingCriteria(true);
    try {
      const criteria = await generateSearchCriteria(targetDescription.trim());
      setSearchCriteria(criteria);
      applySearchCriteria(criteria);
      toast.success('Search criteria generated successfully!');
    } catch (error) {
      console.error('Error generating criteria:', error);
      toast.error('Failed to generate search criteria');
    } finally {
      setIsGeneratingCriteria(false);
    }
  };

  // Apply search criteria to filter personas
  const applySearchCriteria = (criteria: SearchCriteria) => {
    const filtered = personas.filter(persona => {
      // Check keywords against name, occupation, and other text fields
      const keywordMatch = criteria.keywords.some(keyword => 
        persona.name.toLowerCase().includes(keyword.toLowerCase()) ||
        persona.metadata?.occupation?.toLowerCase().includes(keyword.toLowerCase()) ||
        persona.prompt?.toLowerCase().includes(keyword.toLowerCase())
      );

      // Check demographic criteria
      let demographicMatch = true;

      if (criteria.demographics.age_ranges && criteria.demographics.age_ranges.length > 0) {
        const personaAge = persona.metadata?.age;
        if (personaAge) {
          const ageMatch = criteria.demographics.age_ranges.some(range => {
            const [min, max] = range.split('-').map(n => n === '65+' ? 100 : parseInt(n));
            return personaAge >= min && personaAge <= max;
          });
          if (!ageMatch) demographicMatch = false;
        }
      }

      if (criteria.demographics.occupations && criteria.demographics.occupations.length > 0) {
        const personaOccupation = persona.metadata?.occupation;
        if (personaOccupation) {
          const occupationMatch = criteria.demographics.occupations.some(occ =>
            personaOccupation.toLowerCase().includes(occ.toLowerCase())
          );
          if (!occupationMatch) demographicMatch = false;
        }
      }

      if (criteria.demographics.locations && criteria.demographics.locations.length > 0) {
        const personaLocation = persona.metadata?.location || persona.metadata?.region;
        if (personaLocation) {
          const locationMatch = criteria.demographics.locations.some(loc =>
            personaLocation.toLowerCase().includes(loc.toLowerCase())
          );
          if (!locationMatch) demographicMatch = false;
        }
      }

      // Check use cases and interests
      let interestMatch = true;
      if (criteria.use_cases && criteria.use_cases.length > 0) {
        const personaText = `${persona.name} ${persona.prompt || ''} ${JSON.stringify(persona.metadata || {})}`.toLowerCase();
        interestMatch = criteria.use_cases.some(useCase =>
          personaText.includes(useCase.toLowerCase())
        );
      }

      return keywordMatch || (demographicMatch && interestMatch);
    });

    setFilteredPersonas(filtered);
  };

  // Apply manual search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      if (searchCriteria) {
        applySearchCriteria(searchCriteria);
      } else {
        setFilteredPersonas(personas);
      }
      return;
    }

    const basePersonas = searchCriteria ? filteredPersonas : personas;
    const searched = basePersonas.filter(persona =>
      persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.metadata?.occupation?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPersonas(searched);
  }, [searchTerm, personas, searchCriteria]);

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

  const handleContinue = () => {
    if (!targetDescription.trim() || selectedPersonas.length === 0) return;

    const audience: AudienceDefinition = {
      target_description: targetDescription.trim(),
      demographics: {},
      selected_personas: selectedPersonas,
      custom_criteria: customCriteria.trim() || undefined,
      search_criteria: searchCriteria || undefined
    };

    onAudienceDefined(audience);
  };

  const getSelectedPersonaDetails = () => {
    return selectedPersonas.map(id => personas.find(p => p.persona_id === id)).filter(Boolean) as Persona[];
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Define Your Target Audience</h2>
        <p className="text-muted-foreground">
          Describe your target audience and select personas that represent them
        </p>
      </div>

      {/* Target Audience Description */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="target-description" className="text-base font-medium">
              Target Audience Description
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Describe who you want to research (e.g., "Young professionals aged 25-35 who use mobile apps for banking")
            </p>
            <Textarea
              id="target-description"
              placeholder="Describe your target audience..."
              value={targetDescription}
              onChange={(e) => setTargetDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Generate Criteria Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleGenerateCriteria}
              disabled={!targetDescription.trim() || isGeneratingCriteria}
              className="gap-2"
            >
              {isGeneratingCriteria ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGeneratingCriteria ? 'Generating Criteria...' : 'Generate Search Criteria with AI'}
            </Button>
          </div>

          {/* Display Generated Criteria */}
          {searchCriteria && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">AI-Generated Search Criteria</h4>
              <div className="space-y-2 text-sm">
                {searchCriteria.keywords.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-700">Keywords: </span>
                    <span className="text-blue-600">{searchCriteria.keywords.join(', ')}</span>
                  </div>
                )}
                {searchCriteria.demographics.occupations && (
                  <div>
                    <span className="font-medium text-blue-700">Occupations: </span>
                    <span className="text-blue-600">{searchCriteria.demographics.occupations.join(', ')}</span>
                  </div>
                )}
                {searchCriteria.demographics.age_ranges && (
                  <div>
                    <span className="font-medium text-blue-700">Age Ranges: </span>
                    <span className="text-blue-600">{searchCriteria.demographics.age_ranges.join(', ')}</span>
                  </div>
                )}
                {searchCriteria.use_cases && (
                  <div>
                    <span className="font-medium text-blue-700">Use Cases: </span>
                    <span className="text-blue-600">{searchCriteria.use_cases.join(', ')}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Showing {filteredPersonas.length} personas matching these criteria
              </p>
            </div>
          )}

          {/* Optional Custom Criteria */}
          <div>
            <Label htmlFor="custom-criteria" className="text-base font-medium">
              Additional Criteria (Optional)
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Any specific behaviors, preferences, or characteristics to focus on
            </p>
            <Textarea
              id="custom-criteria"
              placeholder="e.g., Must have experience with online shopping, prefer mobile over desktop..."
              value={customCriteria}
              onChange={(e) => setCustomCriteria(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>
      </Card>

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

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search personas by name or occupation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Personas Preview */}
          {selectedPersonas.length > 0 && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Selected Personas
              </h4>
              <div className="flex flex-wrap gap-2">
                {getSelectedPersonaDetails().map((persona) => (
                  <div key={persona.persona_id} className="flex items-center gap-2 bg-background rounded-lg p-2 border">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={persona.image_url} />
                      <AvatarFallback className="text-xs">
                        {persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{persona.name}</span>
                    {persona.metadata?.occupation && (
                      <Badge variant="outline" className="text-xs">
                        {persona.metadata.occupation}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePersonaSelect(persona.persona_id)}
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Persona List */}
          {isLoadingPersonas ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-3 text-sm">Loading personas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredPersonas.map((persona) => {
                const isSelected = selectedPersonas.includes(persona.persona_id);
                const canSelect = selectedPersonas.length < maxPersonas || isSelected;

                return (
                  <Card
                    key={persona.persona_id}
                    className={`cursor-pointer transition-colors p-3 ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : 
                      canSelect ? 'hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => canSelect && handlePersonaSelect(persona.persona_id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                        isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={persona.image_url} />
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
          )}

          {filteredPersonas.length === 0 && !isLoadingPersonas && (
            <div className="text-center py-8 text-muted-foreground">
              {searchCriteria ? 
                'No personas found matching the AI-generated criteria. Try refining your target audience description.' :
                'No personas found matching your search.'
              }
            </div>
          )}
        </div>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleContinue}
          disabled={!targetDescription.trim() || selectedPersonas.length === 0}
          size="lg"
          className="px-8"
        >
          Continue with {selectedPersonas.length} Persona{selectedPersonas.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
};
