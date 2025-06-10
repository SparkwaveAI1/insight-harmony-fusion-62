
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, X, FolderOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllPersonas } from '@/services/persona';
import { getUserCollections, getPersonasInCollection } from '@/services/collections';
import { Persona } from '@/services/persona/types';
import { Collection } from '@/services/collections/types';
import { toast } from 'sonner';

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
  onAudienceDefined: (audience: AudienceDefinition) => void;
  maxPersonas?: number;
  initialAudience?: AudienceDefinition | null;
}

// Helper function to create searchable text from persona data
const createSearchableText = (persona: Persona): string => {
  const searchTerms: string[] = [];
  
  // Basic info
  searchTerms.push(persona.name);
  if (persona.prompt) searchTerms.push(persona.prompt);
  
  // Demographics from metadata
  if (persona.metadata) {
    const meta = persona.metadata;
    
    // Age-related terms
    if (meta.age) {
      const age = typeof meta.age === 'string' ? parseInt(meta.age) : meta.age;
      searchTerms.push(`age ${age}`);
      searchTerms.push(`${age} years old`);
      
      // Age ranges
      if (age >= 18 && age <= 25) searchTerms.push('gen z', 'young adult', '18-25');
      if (age >= 26 && age <= 35) searchTerms.push('millennial', 'young professional', '26-35');
      if (age >= 36 && age <= 45) searchTerms.push('middle aged', 'established professional', '36-45');
      if (age >= 46 && age <= 55) searchTerms.push('mature professional', '46-55');
      if (age >= 56) searchTerms.push('senior', 'older adult', '56+', 'baby boomer');
    }
    
    // Occupation and employment
    if (meta.occupation) {
      searchTerms.push(meta.occupation);
      
      // Add employment type synonyms
      const occupation = meta.occupation.toLowerCase();
      if (occupation.includes('manager') || occupation.includes('director') || occupation.includes('executive')) {
        searchTerms.push('management', 'leadership', 'executive');
      }
      if (occupation.includes('engineer') || occupation.includes('developer') || occupation.includes('programmer')) {
        searchTerms.push('tech', 'technology', 'IT', 'software', 'technical');
      }
      if (occupation.includes('teacher') || occupation.includes('professor') || occupation.includes('educator')) {
        searchTerms.push('education', 'academic', 'teaching');
      }
      if (occupation.includes('doctor') || occupation.includes('nurse') || occupation.includes('medical')) {
        searchTerms.push('healthcare', 'medical', 'health');
      }
      if (occupation.includes('sales') || occupation.includes('marketing')) {
        searchTerms.push('business', 'commercial', 'sales');
      }
    }
    
    // Location and geography
    if (meta.location) searchTerms.push(meta.location);
    if (meta.region) searchTerms.push(meta.region);
    
    // Income and education
    if (meta.income_level) {
      searchTerms.push(meta.income_level);
      const income = meta.income_level.toLowerCase();
      if (income.includes('high') || income.includes('wealthy') || income.includes('affluent')) {
        searchTerms.push('high income', 'wealthy', 'affluent', 'upper class');
      }
      if (income.includes('middle') || income.includes('moderate')) {
        searchTerms.push('middle class', 'moderate income');
      }
      if (income.includes('low') || income.includes('budget')) {
        searchTerms.push('low income', 'budget conscious', 'price sensitive');
      }
    }
    
    if (meta.education) {
      searchTerms.push(meta.education);
      const education = meta.education.toLowerCase();
      if (education.includes('college') || education.includes('university') || education.includes('bachelor')) {
        searchTerms.push('college educated', 'university graduate', 'degree holder');
      }
      if (education.includes('master') || education.includes('mba') || education.includes('graduate')) {
        searchTerms.push('advanced degree', 'graduate education', 'postgraduate');
      }
      if (education.includes('phd') || education.includes('doctorate')) {
        searchTerms.push('doctoral', 'academic', 'researcher');
      }
    }
    
    // Gender
    if (meta.gender) searchTerms.push(meta.gender);
    
    // Add any other metadata fields
    Object.entries(meta).forEach(([key, value]) => {
      if (value && typeof value === 'string' && !['age', 'occupation', 'location', 'region', 'income_level', 'education', 'gender'].includes(key)) {
        searchTerms.push(value);
      }
    });
  }
  
  return searchTerms.join(' ').toLowerCase();
};

// Enhanced search function
const searchPersonas = (personas: Persona[], searchTerm: string): Persona[] => {
  if (!searchTerm.trim()) {
    return personas;
  }
  
  const searchLower = searchTerm.toLowerCase().trim();
  return personas.filter(persona => {
    const searchableText = createSearchableText(persona);
    return searchableText.includes(searchLower);
  });
};

export const DefineAudience: React.FC<DefineAudienceProps> = ({ 
  onAudienceDefined, 
  maxPersonas = 6,
  initialAudience
}) => {
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(initialAudience?.selected_personas || []);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(true);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoadingCollections(true);
        console.log('Fetching user collections...');
        const userCollections = await getUserCollections();
        console.log('Fetched collections:', userCollections.length);
        setCollections(userCollections);
      } catch (error) {
        console.error('Error fetching collections:', error);
        toast.error('Failed to load collections');
      } finally {
        setIsLoadingCollections(false);
      }
    };

    fetchCollections();
  }, []);

  // Fetch personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setIsLoadingPersonas(true);
        console.log('Fetching personas for collection:', selectedCollection);
        
        let allPersonas: Persona[] = [];
        
        if (selectedCollection === 'all') {
          // Fetch all personas
          allPersonas = await getAllPersonas();
        } else {
          // Fetch personas from selected collection
          const collectionPersonas = await getPersonasInCollection(selectedCollection);
          allPersonas = collectionPersonas.map(cp => cp.personas).filter(Boolean) as Persona[];
        }
        
        console.log('Fetched personas:', allPersonas.length);
        setPersonas(allPersonas);
      } catch (error) {
        console.error('Error fetching personas:', error);
        toast.error('Failed to load personas');
      } finally {
        setIsLoadingPersonas(false);
      }
    };

    fetchPersonas();
  }, [selectedCollection]);

  // Apply search when search term or personas change
  useEffect(() => {
    console.log('Search term changed:', searchTerm);
    const filtered = searchPersonas(personas, searchTerm);
    console.log('Filtered personas count:', filtered.length);
    setFilteredPersonas(filtered);
  }, [searchTerm, personas]);

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
    if (selectedPersonas.length === 0) return;

    const audience: AudienceDefinition = {
      selected_personas: selectedPersonas,
      demographics: {}
    };

    onAudienceDefined(audience);
  };

  const getSelectedPersonaDetails = () => {
    return selectedPersonas.map(id => personas.find(p => p.persona_id === id)).filter(Boolean) as Persona[];
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Collections Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Collection</label>
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      All Personas
                    </div>
                  </SelectItem>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        {collection.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Personas</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by demographics: age, occupation, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Try: "millennial", "tech", "high income", "college", "manager", "urban", "25-35"
              </div>
            </div>
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
                      <AvatarImage src={persona.profile_image_url} />
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
          {isLoadingPersonas || isLoadingCollections ? (
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
                            <AvatarImage src={persona.profile_image_url} />
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
                          {persona.metadata?.education && (
                            <Badge variant="outline" className="text-xs">
                              {persona.metadata.education}
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

          {filteredPersonas.length === 0 && !isLoadingPersonas && !isLoadingCollections && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 
                'No personas found matching your search criteria. Try adjusting your search terms.' :
                selectedCollection === 'all' ? 'No personas available.' : 'No personas found in this collection.'
              }
            </div>
          )}
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
