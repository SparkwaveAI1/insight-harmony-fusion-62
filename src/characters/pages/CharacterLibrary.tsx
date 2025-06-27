import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { Character } from '../types/characterTraitTypes';
import { useCharacters } from '../hooks/useCharacters';
import CharacterActionButtons from '../components/CharacterActionButtons';

const CharacterLibrary = () => {
  const { data: characters = [], isLoading, error, refetch } = useCharacters();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (character.metadata?.description && 
     character.metadata.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleChatClick = (characterId: string) => {
    navigate(`/characters/${characterId}/chat`);
  };

  // Auto-refresh when component mounts or when navigating back
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Section>
            <Card className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Characters</h2>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            </Card>
          </Section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Character Library</h1>
                <p className="text-muted-foreground">Browse and manage your characters</p>
              </div>
            </div>
            
            <Button asChild>
              <Link to="/characters/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Character
              </Link>
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search characters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <Card className="mt-4 p-4">
                <div className="text-sm text-muted-foreground">
                  Filter options will be implemented here
                </div>
              </Card>
            )}
          </div>

          {/* Characters Grid */}
          {filteredCharacters.length === 0 ? (
            <Card className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No Characters Found' : characters.length === 0 ? 'No Characters Yet' : 'No Matching Characters'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : characters.length === 0 
                    ? 'Create your first character to get started'
                    : 'No characters match your current search'
                }
              </p>
              {!searchQuery && characters.length === 0 && (
                <Button asChild>
                  <Link to="/characters/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Character
                  </Link>
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharacters.map((character) => (
                <Card key={character.character_id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">{character.name}</h3>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {character.character_type}
                    </span>
                  </div>
                  
                  {character.metadata?.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {character.metadata.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>Created {new Date(character.created_at || character.creation_date).toLocaleDateString()}</span>
                    {character.is_public && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Public
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <CharacterActionButtons 
                      characterId={character.character_id}
                      character={character}
                      onChatClick={handleChatClick}
                    />
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" asChild>
                        <Link to={`/characters/${character.character_id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/characters/${character.character_id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

export default CharacterLibrary;
