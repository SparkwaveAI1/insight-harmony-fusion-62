
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PersonaLoader } from '../PersonaLoader';
import { getAllPersonas } from '@/services/persona';
import { Persona } from '@/services/persona/types';
import { useEffect } from 'react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(true);

  // Fetch personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setIsLoadingPersonas(true);
        const allPersonas = await getAllPersonas();
        setPersonas(allPersonas);
      } catch (error) {
        console.error('Error fetching personas:', error);
      } finally {
        setIsLoadingPersonas(false);
      }
    };

    fetchPersonas();
  }, []);

  const filteredPersonas = personas.filter(persona =>
    persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    persona.metadata?.occupation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      custom_criteria: customCriteria.trim() || undefined
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
              No personas found matching your search.
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
