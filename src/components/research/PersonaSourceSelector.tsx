import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Folder, Globe, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Persona } from '@/services/persona/types';
import { dbPersonaToPersona } from '@/services/persona/mappers';
import { getProjectCollections } from '@/services/collections/projectCollectionOperations';
import { getPersonasInCollectionWithDetails } from '@/services/collections/personaCollectionOperations';
import { getPersonasForListing } from '@/services/persona/operations/getPersonas';
import { Collection } from '@/services/collections/types';
import { getV4Personas } from '@/services/v4-persona/getV4Personas';

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
  const { user, session } = useAuth();
  const [selectedSource, setSelectedSource] = useState<PersonaSource | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [projectCollections, setProjectCollections] = useState<Collection[]>([]);
  const [availablePersonas, setAvailablePersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

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
    if (!projectId) {
      console.log('PersonaSourceSelector: No projectId provided');
      return;
    }
    
    if (!user || !session) {
      console.log('PersonaSourceSelector: No authenticated user/session');
      setCollectionsError('Authentication required to load project collections');
      return;
    }
    
    console.log('PersonaSourceSelector: Loading project collections for projectId:', projectId);
    setCollectionsLoading(true);
    setCollectionsError(null);
    
    try {
      const collections = await getProjectCollections(projectId);
      console.log('PersonaSourceSelector: Loaded collections:', collections);
      setProjectCollections(collections);
      if (collections.length === 0) {
        setCollectionsError('No collections found for this project');
      }
    } catch (error) {
      console.error('PersonaSourceSelector: Error loading project collections:', error);
      setCollectionsError('Failed to load project collections');
    } finally {
      setCollectionsLoading(false);
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
            // Get V4 personas from collection
            const v4PersonasData = await getPersonasInCollectionWithDetails(selectedCollection);
            const v4Personas = v4PersonasData.map(v4Persona => ({
              id: v4Persona.id,
              persona_id: v4Persona.persona_id,
              name: v4Persona.name,
              description: `V4 Persona - Created on ${new Date(v4Persona.created_at || '').toLocaleDateString()}`,
              user_id: v4Persona.user_id,
              is_public: false,
              created_at: v4Persona.created_at || '',
              metadata: {},
              trait_profile: {},
              behavioral_modulation: {},
              linguistic_profile: {},
              emotional_triggers: null,
              preinterview_tags: [],
              simulation_directives: {},
              interview_sections: [],
              prompt: null
            } as Persona));
            
            // Sort by creation date
            personas = v4Personas.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          }
          break;
          
        case 'my-personas':
          if (!user?.id) {
            throw new Error('User authentication required');
          }
          
          // No more legacy personas - only V4 personas exist now
          const legacyPersonas: Persona[] = [];
          
          // Get V4 personas
          const v4PersonasData = await getV4Personas(user.id);
          const v4Personas = v4PersonasData.map(v4Persona => ({
            id: v4Persona.id,
            persona_id: v4Persona.persona_id,
            name: v4Persona.name,
            description: `V4 Persona - Created on ${new Date(v4Persona.created_at || '').toLocaleDateString()}`,
            user_id: v4Persona.user_id,
            is_public: false,
            created_at: v4Persona.created_at || '',
            metadata: {},
            trait_profile: {},
            behavioral_modulation: {},
            linguistic_profile: {},
            emotional_triggers: null,
            preinterview_tags: [],
            simulation_directives: {},
            interview_sections: [],
            prompt: null
          } as Persona));
          
          // Combine both types and sort by creation date
          personas = [...legacyPersonas, ...v4Personas].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          break;
          
        case 'public-personas':
          // Get legacy public personas
          const legacyPublicPersonas = await getPersonasForListing();
          
          // For now, V4 personas are not public, but we could add them here in the future
          // when V4 personas support public sharing
          personas = legacyPublicPersonas;
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
    // Always show all options, but we'll handle disabled state in the UI
    return [...PERSONA_SOURCE_OPTIONS];
  };

  const isProjectCollectionsDisabled = () => {
    return !projectId || collectionsError !== null || (projectCollections.length === 0 && !collectionsLoading);
  };

  const getProjectCollectionsDescription = () => {
    if (!projectId) return 'No project selected';
    if (collectionsLoading) return 'Loading collections...';
    if (collectionsError) return collectionsError;
    if (projectCollections.length === 0) return 'No collections found for this project';
    return 'Choose from collections linked to this project';
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
            {getSourceOptionsToShow().map((option) => {
              const isDisabled = option.id === 'project-collections' && isProjectCollectionsDisabled();
              const description = option.id === 'project-collections' 
                ? getProjectCollectionsDescription()
                : option.description;
              
              return (
                <Button
                  key={option.id}
                  variant={selectedSource === option.id ? "default" : "outline"}
                  onClick={() => !isDisabled && handleSourceSelect(option.id)}
                  disabled={isDisabled}
                  className="justify-start h-auto p-3"
                >
                  <div className="flex items-start gap-3 text-left">
                    {option.id === 'project-collections' && collectionsError ? (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    ) : (
                      option.icon
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {description}
                      </div>
                    </div>
                    {selectedSource === option.id && !isDisabled && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                    {option.id === 'project-collections' && collectionsLoading && (
                      <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Collection Selection (for project collections) */}
        {selectedSource === 'project-collections' && projectCollections.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Choose Collection</h4>
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select a collection..." />
              </SelectTrigger>
              <SelectContent>
                 {projectCollections.map((collection) => (
                   <SelectItem key={collection.id} value={collection.id}>
                     {collection.name}
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