import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Folder, Globe, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Persona } from '@/services/persona/types';
import { dbPersonaToPersona } from '@/services/persona/mappers';
import { getProjectCollections } from '@/services/collections/projectCollectionOperations';
import { getPersonasByCollection } from '@/services/persona/operations/getPersonas';
import { Collection } from '@/services/collections/types';

interface PersonaSourceSelectorProps {
  projectId?: string;
  selectedPersonas: string[];
  onPersonaSelectionChange: (personaIds: string[]) => void;
  maxPersonas?: number;
}

type PersonaSource = 'project-collections' | 'my-personas' | 'public-personas';

interface PersonaSourceOption {
  id: PersonaSource;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const PERSONA_SOURCE_OPTIONS: PersonaSourceOption[] = [
  {
    id: 'project-collections',
    label: 'Project Collections',
    icon: <Folder className="w-4 h-4" />,
    description: 'Choose from collections linked to this project'
  },
  {
    id: 'my-personas',
    label: 'My Personas',
    icon: <Users className="w-4 h-4" />,
    description: 'Choose from your own personas'
  },
  {
    id: 'public-personas',
    label: 'Public Personas',
    icon: <Globe className="w-4 h-4" />,
    description: 'Choose from publicly available personas'
  }
];

export const PersonaSourceSelector: React.FC<PersonaSourceSelectorProps> = ({
  projectId,
  selectedPersonas,
  onPersonaSelectionChange,
  maxPersonas = 10
}) => {
  const [selectedSource, setSelectedSource] = useState<PersonaSource | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [projectCollections, setProjectCollections] = useState<Collection[]>([]);
  const [availablePersonas, setAvailablePersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load project collections when component mounts
  useEffect(() => {
    if (projectId) {
      loadProjectCollections();
    }
  }, [projectId]);

  // Load personas when source changes
  useEffect(() => {
    if (selectedSource) {
      loadPersonasForSource();
    }
  }, [selectedSource, selectedCollection]);

  const loadProjectCollections = async () => {
    if (!projectId) return;
    
    try {
      const collections = await getProjectCollections(projectId);
      setProjectCollections(collections);
    } catch (error) {
      console.error('Error loading project collections:', error);
    }
  };

  const loadPersonasForSource = async () => {
    if (!selectedSource) return;
    
    setIsLoading(true);
    try {
      let personas: Persona[] = [];
      
      switch (selectedSource) {
        case 'project-collections':
          if (selectedCollection) {
            personas = await getPersonasByCollection(selectedCollection);
          }
          break;
          
        case 'my-personas':
          const { data: myPersonasData, error: myError } = await supabase
            .from('personas')
            .select('*')
            .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
            .order('created_at', { ascending: false });
          
          if (myError) throw myError;
          personas = myPersonasData ? myPersonasData.map(dbPersonaToPersona) : [];
          break;
          
        case 'public-personas':
          const { data: publicPersonasData, error: publicError } = await supabase
            .from('personas')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false });
          
          if (publicError) throw publicError;
          personas = publicPersonasData ? publicPersonasData.map(dbPersonaToPersona) : [];
          break;
      }
      
      setAvailablePersonas(personas);
    } catch (error) {
      console.error('Error loading personas:', error);
      setAvailablePersonas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceSelect = (source: PersonaSource) => {
    setSelectedSource(source);
    setSelectedCollection('');
    setAvailablePersonas([]);
    onPersonaSelectionChange([]); // Clear current selection
  };

  const togglePersonaSelection = (personaId: string) => {
    const isSelected = selectedPersonas.includes(personaId);
    let newSelection: string[];
    
    if (isSelected) {
      newSelection = selectedPersonas.filter(id => id !== personaId);
    } else if (selectedPersonas.length < maxPersonas) {
      newSelection = [...selectedPersonas, personaId];
    } else {
      return; // Don't add if max reached
    }
    
    onPersonaSelectionChange(newSelection);
  };

  const getSourceOptionsToShow = () => {
    const options = [...PERSONA_SOURCE_OPTIONS];
    
    // If no project or no collections in project, filter out project-collections option
    if (!projectId || projectCollections.length === 0) {
      return options.filter(opt => opt.id !== 'project-collections');
    }
    
    return options;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Select Personas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose up to {maxPersonas} personas from different sources
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source Selection */}
        <div>
          <h4 className="text-sm font-medium mb-2">Choose Persona Source</h4>
          <div className="grid grid-cols-1 gap-2">
            {getSourceOptionsToShow().map((option) => (
              <Button
                key={option.id}
                variant={selectedSource === option.id ? "default" : "outline"}
                onClick={() => handleSourceSelect(option.id)}
                className="justify-start h-auto p-3"
              >
                <div className="flex items-start gap-3 text-left">
                  {option.icon}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </div>
                  </div>
                  {selectedSource === option.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Collection Selection (for project collections) */}
        {selectedSource === 'project-collections' && projectCollections.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Choose Collection</h4>
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger>
                <SelectValue placeholder="Select a collection..." />
              </SelectTrigger>
              <SelectContent>
                {projectCollections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{collection.name}</span>
                      {collection.description && (
                        <span className="text-xs text-muted-foreground">
                          {collection.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Persona List */}
        {selectedSource && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Available Personas</h4>
              <Badge variant="secondary">
                {selectedPersonas.length}/{maxPersonas} selected
              </Badge>
            </div>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Loading personas...</p>
              </div>
            ) : availablePersonas.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {selectedSource === 'project-collections' && !selectedCollection
                    ? 'Please select a collection first'
                    : 'No personas found for this source'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availablePersonas.map((persona) => {
                  const isSelected = selectedPersonas.includes(persona.persona_id);
                  const canSelect = selectedPersonas.length < maxPersonas || isSelected;
                  
                  return (
                    <div
                      key={persona.persona_id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : canSelect
                          ? 'border-border hover:border-primary/50'
                          : 'border-border opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => canSelect && togglePersonaSelection(persona.persona_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{persona.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {persona.description || 'No description'}
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'border-border'
                        }`}>
                          {isSelected && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};