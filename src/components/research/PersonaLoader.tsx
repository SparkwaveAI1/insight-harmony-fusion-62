
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllPersonas, getPersonasByCollection } from '@/services/persona';
import { getUserCollections } from '@/services/collections';
import { Persona } from '@/services/persona/types';
import { Collection } from '@/services/collections/types';

interface PersonaLoaderProps {
  maxPersonas: number;
  onStartSession: (selectedPersonas: string[]) => void;
  isLoading: boolean;
}

export const PersonaLoader: React.FC<PersonaLoaderProps> = ({
  maxPersonas = 4,
  onStartSession,
  isLoading
}) => {
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(true);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);

  // Fetch collections on component mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoadingCollections(true);
        console.log('Fetching collections for research session');
        const allCollections = await getUserCollections();
        console.log(`Loaded ${allCollections.length} collections`);
        setCollections(allCollections);
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setIsLoadingCollections(false);
      }
    };

    fetchCollections();
  }, []);

  // Fetch personas based on selected collection
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setIsLoadingPersonas(true);
        console.log('Fetching personas for collection:', selectedCollection);
        
        let allPersonas: Persona[] = [];
        
        if (selectedCollection === 'all') {
          // Fetch all personas
          allPersonas = await getAllPersonas();
          console.log(`Loaded ${allPersonas.length} personas (all)`);
        } else {
          // Fetch personas from selected collection
          allPersonas = await getPersonasByCollection(selectedCollection);
          console.log(`Loaded ${allPersonas.length} personas from collection ${selectedCollection}`);
        }
        
        setPersonas(allPersonas);
        // Clear selected personas when collection changes
        setSelectedPersonas([]);
      } catch (error) {
        console.error('Error fetching personas:', error);
      } finally {
        setIsLoadingPersonas(false);
      }
    };

    // Only fetch if collections have loaded or if "all" is selected
    if (!isLoadingCollections || selectedCollection === 'all') {
      fetchPersonas();
    }
  }, [selectedCollection, isLoadingCollections]);

  const filteredPersonas = personas.filter(persona =>
    persona.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersonas(prev => {
      if (prev.includes(personaId)) {
        // Remove if already selected
        return prev.filter(id => id !== personaId);
      } else if (prev.length < maxPersonas) {
        // Add if under limit
        return [...prev, personaId];
      }
      // If at limit, don't add
      return prev;
    });
  };

  const handleStartSession = () => {
    if (selectedPersonas.length > 0) {
      onStartSession(selectedPersonas);
    }
  };

  if (isLoadingCollections) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading collections...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Select Personas for Research Session (Up to {maxPersonas})
          <Badge variant="secondary">
            {selectedPersonas.length}/{maxPersonas} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Collection Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Filter by Collection</label>
          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
            <SelectTrigger>
              <SelectValue placeholder="Select a collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Personas</SelectItem>
              {collections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
        {isLoadingPersonas ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading personas...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredPersonas.map((persona) => {
              const isSelected = selectedPersonas.includes(persona.persona_id);
              const canSelect = selectedPersonas.length < maxPersonas || isSelected;

              return (
                <Card
                  key={persona.persona_id}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : 
                    canSelect ? 'hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => canSelect && handlePersonaSelect(persona.persona_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                        isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                      }`} />
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
        )}

        {filteredPersonas.length === 0 && !isLoadingPersonas && (
          <div className="text-center py-8 text-muted-foreground">
            {selectedCollection === 'all' ? 
              'No personas found matching your search.' :
              'No personas found in this collection.'
            }
          </div>
        )}

        {/* Start Session Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleStartSession}
            disabled={selectedPersonas.length === 0 || isLoading}
            size="lg"
          >
            {isLoading ? 'Starting Session...' : 
             selectedPersonas.length > 0 ? `Start Research Session with ${selectedPersonas.length} Persona${selectedPersonas.length > 1 ? 's' : ''}` : 
             'Select at least 1 Persona to Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
