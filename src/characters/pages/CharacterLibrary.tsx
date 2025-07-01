
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { useCharacters } from '../hooks/useCharacters';
import CharacterAvatar from '../components/CharacterAvatar';
import CharacterIdDisplay from '../components/CharacterIdDisplay';

const CharacterLibrary = () => {
  const { data: characters = [], isLoading, error } = useCharacters();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState<'all' | 'historical' | 'fictional'>('all');

  const filteredCharacters = React.useMemo(() => {
    return characters.filter(character => {
      const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           character.metadata?.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || character.character_type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [characters, searchTerm, filterType]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Section>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading characters...</p>
            </div>
          </div>
        </Section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Section>
          <Card className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Characters</h2>
            <p className="text-muted-foreground">{error.message || 'An error occurred'}</p>
          </Card>
        </Section>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Section>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Character Library</h1>
            <p className="text-muted-foreground">
              Browse and manage your custom characters
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link to="/characters/create/historical">
                <Plus className="h-4 w-4 mr-2" />
                Create Historical
              </Link>
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search characters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'historical' | 'fictional')}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Types</option>
              <option value="historical">Historical</option>
              <option value="fictional">Fictional</option>
            </select>
          </div>
        </div>

        {/* Character Grid */}
        {filteredCharacters.length === 0 ? (
          <Card className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No Characters Found</h2>
            <p className="text-muted-foreground mb-6">
              {characters.length === 0 
                ? "You haven't created any characters yet." 
                : "No characters match your search criteria."
              }
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button asChild>
                <Link to="/characters/create/historical">
                  Create Historical Character
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => (
              <Card key={character.character_id} className="p-4 hover:shadow-md transition-shadow">
                <Link to={`/characters/${character.character_id}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <CharacterAvatar character={character} size="md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{character.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {character.character_type === 'historical' ? 'Historical' : 'Fictional'} Character
                      </p>
                    </div>
                  </div>
                  
                  {character.metadata?.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {character.metadata.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <CharacterIdDisplay characterId={character.character_id} />
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Created {new Date(character.creation_date).toLocaleDateString()}
                      </span>
                      <span className={character.is_public ? 'text-green-600' : 'text-gray-600'}>
                        {character.is_public ? 'Public' : 'Private'}
                      </span>
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

export default CharacterLibrary;
