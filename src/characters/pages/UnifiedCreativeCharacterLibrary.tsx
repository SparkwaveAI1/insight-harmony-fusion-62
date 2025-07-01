import { useState, useEffect } from 'react';
import { FlaskConical, Plus, Grid, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { useCreativeCharactersFixed } from '../hooks/useCreativeCharactersFixed';
import { Character } from '../types/characterTraitTypes';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import CharacterAvatar from '../components/CharacterAvatar';

const UnifiedCreativeCharacterLibrary = () => {
  const { data: characters = [], isLoading, error } = useCreativeCharactersFixed();
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    filterCharacters();
  }, [characters, searchQuery]);

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

    setFilteredCharacters(filtered);
  };

  const getCharacterTypeLabel = (character: Character) => {
    if (character.character_type === 'multi_species') {
      return character.species_type || 'Non-Humanoid';
    }
    return 'Humanoid';
  };

  const getCharacterDescription = (character: Character) => {
    const description = character.metadata?.description || 
                       character.metadata?.backstory || 
                       `A ${getCharacterTypeLabel(character).toLowerCase()} character`;
    
    // Truncate description to ensure consistent card heights
    return description.length > 120 ? description.substring(0, 120) + '...' : description;
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 md:px-8 py-8">
        <Section>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading creative characters...</p>
            </div>
          </div>
        </Section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 md:px-8 py-8">
        <Section>
          <Card className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Creative Characters</h2>
            <p className="text-muted-foreground">{error.message || 'An error occurred'}</p>
          </Card>
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
                <h1 className="text-xl md:text-3xl font-bold">Character Lab Library</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  All your creative characters from the Character Lab
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

          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search Character Lab..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
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
              {searchQuery ? 'No characters found' : 'No creative characters yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? 'Try adjusting your search'
                : 'Create your first creative character to get started'
              }
            </p>
            {!searchQuery && (
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
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {filteredCharacters.map((character) => (
              <Card key={character.character_id} className={`hover:shadow-lg transition-shadow ${
                viewMode === 'grid' ? 'h-80 flex flex-col' : 'h-32'
              }`}>
                <Link to={`/characters/${character.character_id}`} className="flex flex-col h-full p-6">
                  <div className="flex flex-col flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <CharacterAvatar 
                        character={{
                          name: character.name,
                          profile_image_url: character.profile_image_url
                        }}
                        size="md"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{character.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
                          {getCharacterDescription(character)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
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
                    
                    <div className="flex gap-2 mt-auto">
                      <Button size="sm" className="flex-1" onClick={(e) => e.preventDefault()}>
                        Chat
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default UnifiedCreativeCharacterLibrary;
