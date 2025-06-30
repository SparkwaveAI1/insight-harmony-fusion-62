
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { useNonHumanoidCharacters } from '../hooks/useNonHumanoidCharacters';
import { Badge } from '@/components/ui/badge';
import CharacterIdDisplay from '../components/CharacterIdDisplay';

const NonHumanoidCharacterLibrary = () => {
  const { data: characters, isLoading } = useNonHumanoidCharacters();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <Section>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Character Library</h1>
            <p className="text-muted-foreground">
              Browse and manage your lab characters
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link to="/characters/lab/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Character
              </Link>
            </Button>
          </div>
        </div>

        {/* Characters Grid */}
        {characters && characters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <Card key={character.character_id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Character Avatar/Icon */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                      {character.profile_image_url ? (
                        <img 
                          src={character.profile_image_url} 
                          alt={character.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Zap className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{character.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {character.species_type || 'Lab Character'}
                      </div>
                    </div>
                  </div>

                  {/* Character Details */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {character.prompt || character.metadata?.description || 'No description available'}
                    </p>
                    
                    {character.origin_universe && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>🌌</span>
                        <span>{character.origin_universe}</span>
                      </div>
                    )}

                    {character.form_factor && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>⚡</span>
                        <span>{character.form_factor}</span>
                      </div>
                    )}
                  </div>

                  {/* Character ID */}
                  <CharacterIdDisplay characterId={character.character_id} />

                  {/* Tags/Badges */}
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Lab
                    </Badge>
                    {character.species_type && (
                      <Badge variant="outline" className="text-xs">
                        {character.species_type}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link to={`/characters/${character.character_id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/characters/${character.character_id}/chat`}>
                        Chat
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="text-center py-12">
            <Zap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Characters Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start creating your first character with unique traits and behaviors.
            </p>
            <Button asChild>
              <Link to="/characters/lab/create">
                <Sparkles className="h-4 w-4 mr-2" />
                Create Your First Character
              </Link>
            </Button>
          </Card>
        )}
      </Section>
    </div>
  );
};

export default NonHumanoidCharacterLibrary;
