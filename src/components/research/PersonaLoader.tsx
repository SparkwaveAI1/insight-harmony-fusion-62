
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
  onStartSession: (selectedPersonas: string[]) => Promise<boolean>;
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
  const [isStartingSession, setIsStartingSession] = useState(false);

  // Fetch collections on component mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoadingCollections(true);
        console.log('PersonaLoader: Fetching collections for research session');
        const allCollections = await getUserCollections();
        console.log(`PersonaLoader: Loaded ${allCollections.length} collections`);
        setCollections(allCollections);
      } catch (error) {
        console.error('PersonaLoader: Error fetching collections:', error);
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
        console.log('PersonaLoader: Fetching personas for collection:', selectedCollection);
        
        let allPersonas: Persona[] = [];
        
        if (selectedCollection === 'all') {
          // Fetch all personas
          allPersonas = await getAllPersonas();
          console.log(`PersonaLoader: Loaded ${allPersonas.length} personas (all)`);
        } else {
          // Fetch personas from selected collection
          allPersonas = await getPersonasByCollection(selectedCollection);
          console.log(`PersonaLoader: Loaded ${allPersonas.length} personas from collection ${selectedCollection}`);
        }
        
        setPersonas(allPersonas);
        // Clear selected personas when collection changes
        setSelectedPersonas([]);
      } catch (error) {
        console.error('PersonaLoader: Error fetching personas:', error);
      } finally {
        setIsLoadingPersonas(false);
      }
    };

    // Only fetch if collections have loaded or if "all" is selected
    if (!isLoadingCollections || selectedCollection === 'all') {
      fetchPersonas();
    }
  }, [selectedCollection, isLoadingCollections]);

  // Enhanced search function that searches across multiple demographic fields
  const searchPersonas = (personas: Persona[], searchTerm: string): Persona[] => {
    if (!searchTerm.trim()) return personas;

    const searchLower = searchTerm.toLowerCase();
    
    return personas.filter(persona => {
      // Search in name
      if (persona.name.toLowerCase().includes(searchLower)) return true;
      
      // Search in demographics
      const metadata = persona.metadata;
      if (!metadata) return false;
      
      // Age search
      if (metadata.age && metadata.age.toLowerCase().includes(searchLower)) return true;
      
      // Gender search
      if (metadata.gender && metadata.gender.toLowerCase().includes(searchLower)) return true;
      
      // Occupation search
      if (metadata.occupation && metadata.occupation.toLowerCase().includes(searchLower)) return true;
      
      // Location/Region search
      if (metadata.region && metadata.region.toLowerCase().includes(searchLower)) return true;
      if (metadata.location_history?.current_residence && 
          metadata.location_history.current_residence.toLowerCase().includes(searchLower)) return true;
      
      // Education search
      if (metadata.education_level && metadata.education_level.toLowerCase().includes(searchLower)) return true;
      
      // Income search
      if (metadata.income_level && metadata.income_level.toLowerCase().includes(searchLower)) return true;
      
      // Race/Ethnicity search
      if (metadata.race_ethnicity && metadata.race_ethnicity.toLowerCase().includes(searchLower)) return true;
      
      // Tags search
      if (persona.preinterview_tags && Array.isArray(persona.preinterview_tags)) {
        return persona.preinterview_tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        );
      }
      
      return false;
    });
  };

  const filteredPersonas = searchPersonas(personas, searchTerm);

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

  const handleStartSession = async () => {
    if (selectedPersonas.length === 0) {
      console.warn('PersonaLoader: No personas selected');
      return;
    }

    console.log('PersonaLoader: Starting session with personas:', selectedPersonas);
    setIsStartingSession(true);
    
    try {
      const success = await onStartSession(selectedPersonas);
      console.log('PersonaLoader: Session start result:', success);
      
      if (!success) {
        console.error('PersonaLoader: Session creation failed');
        setIsStartingSession(false);
      }
      // If successful, the parent component will handle navigation
      // so we don't reset isStartingSession here
    } catch (error) {
      console.error('PersonaLoader: Error starting session:', error);
      setIsStartingSession(false);
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

  const isSessionLoading = isLoading || isStartingSession;

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

        {/* Enhanced Search */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, demographics, occupation, location, education..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Search across name, age, gender, occupation, location, education, income, ethnicity, and tags
          </p>
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
              const metadata = persona.metadata || {};

              return (
                <Card
                  key={persona.persona_id}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : 
                    canSelect ? 'hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => canSelect && !isSessionLoading && handlePersonaSelect(persona.persona_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                        isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{persona.name}</h3>
                        
                        {/* Enhanced Demographics Display */}
                        <div className="space-y-1 mt-2">
                          {/* Primary Demographics */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            {metadata.age && (
                              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                Age: {metadata.age}
                              </span>
                            )}
                            {metadata.gender && (
                              <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                                {metadata.gender}
                              </span>
                            )}
                          </div>
                          
                          {/* Occupation */}
                          {metadata.occupation && (
                            <p className="text-xs text-muted-foreground font-medium">
                              {metadata.occupation}
                            </p>
                          )}
                          
                          {/* Secondary Demographics */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            {metadata.education_level && (
                              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">
                                {metadata.education_level}
                              </span>
                            )}
                            {metadata.income_level && (
                              <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">
                                {metadata.income_level}
                              </span>
                            )}
                          </div>
                          
                          {/* Location */}
                          {(metadata.region || metadata.location_history?.current_residence) && (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {metadata.region || metadata.location_history?.current_residence}
                              </Badge>
                            </div>
                          )}
                          
                          {/* Ethnicity */}
                          {metadata.race_ethnicity && (
                            <p className="text-xs text-muted-foreground">
                              {metadata.race_ethnicity}
                            </p>
                          )}
                        </div>
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
            {searchTerm ? 
              `No personas found matching "${searchTerm}".` :
              selectedCollection === 'all' ? 
                'No personas found.' :
                'No personas found in this collection.'
            }
          </div>
        )}

        {/* Start Session Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleStartSession}
            disabled={selectedPersonas.length === 0 || isSessionLoading}
            size="lg"
          >
            {isSessionLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Starting Session...
              </div>
            ) : selectedPersonas.length > 0 ? (
              `Start Research Session with ${selectedPersonas.length} Persona${selectedPersonas.length > 1 ? 's' : ''}`
            ) : (
              'Select at least 1 Persona to Continue'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
