
import { useState, useEffect } from 'react';
import { FlaskConical, Plus, Grid, List, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { getAllCreativeCharacters } from '../services/unifiedCharacterService';
import { Character } from '../types/characterTraitTypes';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const UnifiedCreativeCharacterLibrary = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'humanoid' | 'non_humanoid'>('all');

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    filterCharacters();
  }, [characters, searchQuery, selectedFilter]);

  const loadCharacters = async () => {
    try {
      setIsLoading(true);
      const allCreativeCharacters = await getAllCreativeCharacters();
      console.log('Loaded creative characters:', allCreativeCharacters);
      setCharacters(allCreativeCharacters);
    } catch (error) {
      console.error('Error loading creative characters:', error);
      toast.error('Failed to load creative characters');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCharacters = () => {
    let filtered = characters;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(char => 
        char.name.toLowerCase().includes(query) ||
        char.metadata?.description?.toLowerCase().includes(query) ||
        char.metadata?.narrative_domain?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(char => {
        if (selectedFilter === 'humanoid') {
          return char.character_type === 'fictional';
        } else if (selectedFilter === 'non_humanoid') {
          return char.character_type === 'multi_species';
        }
        return true;
      });
    }

    setFilteredCharacters(filtered);
  };

  const getCharacterTypeLabel = (character: Character) => {
    if (character.character_type === 'multi_species') {
      return character.species_type || 'Non-Humanoid';
    }
    return 'Humanoid';
  };

  const getCharacterDescription = (character: Character) => {
    return character.metadata?.description || 
           character.metadata?.backstory || 
           `A ${getCharacterTypeLabel(character).toLowerCase()} character`;
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 md:px-8 py-8">
        <Section>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 py-8">
      <Section>
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <div>
                <h1 className="text-xl md:text-3xl font-bold">Creative Character Library</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  All your creative characters in one unified space
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/characters/create/creative">
                <Plus className="h-4 w-4 mr-2" />
                Create Character
              </Link>
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={selectedFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedFilter === 'humanoid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('humanoid')}
                >
                  Humanoid
                </Button>
                <Button
                  variant={selectedFilter === 'non_humanoid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('non_humanoid')}
                >
                  Non-Humanoid
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Character Grid/List */}
        {filteredCharacters.length === 0 ? (
          <Card className="text-center py-12">
            <FlaskConical className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || selectedFilter !== 'all' ? 'No characters found' : 'No creative characters yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first creative character to get started'
              }
            </p>
            {!searchQuery && selectedFilter === 'all' && (
              <Button asChild>
                <Link to="/characters/create/creative">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Character
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredCharacters.map((character) => (
              <Card key={character.character_id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{character.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {getCharacterDescription(character)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {getCharacterTypeLabel(character)}
                    </Badge>
                    {character.metadata?.narrative_domain && (
                      <Badge variant="outline">
                        {character.metadata.narrative_domain}
                      </Badge>
                    )}
                    {character.metadata?.functional_role && (
                      <Badge variant="outline">
                        {character.metadata.functional_role}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      Chat
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default UnifiedCreativeCharacterLibrary;
