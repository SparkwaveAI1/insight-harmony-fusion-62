
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { useCharacters } from '../hooks/useCharacters';
import { Badge } from '@/components/ui/badge';

const CreativeCharacterLibrary = () => {
  const { data: characters, isLoading } = useCharacters();
  
  // Filter characters that were created through Creative Genesis (source field or specific markers)
  const creativeCharacters = characters?.filter(character => 
    character.metadata?.source === 'creative-genesis' || 
    character.prompt?.includes('Creative Character Genesis') ||
    character.prompt?.includes('Character Context:')
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Section>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading creative characters...</p>
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
            <h1 className="text-3xl font-bold">Creative Character Library</h1>
            <p className="text-muted-foreground">
              Browse and manage your original creative characters
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link to="/characters/create/creative">
                <Plus className="h-4 w-4 mr-2" />
                Create Creative Character
              </Link>
            </Button>
          </div>
        </div>

        {/* Characters Grid */}
        {creativeCharacters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creativeCharacters.map((character) => (
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
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{character.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {character.historical_period || character.metadata?.era || 'Unknown Era'}
                      </div>
                    </div>
                  </div>

                  {/* Character Details */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {character.prompt || character.metadata?.description || 'No description available'}
                    </p>
                    
                    {(character.region || character.metadata?.location) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>📍</span>
                        <span>{character.region || character.metadata?.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags/Badges */}
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Creative Genesis
                    </Badge>
                    {(character.metadata?.occupation || character.social_class) && (
                      <Badge variant="outline" className="text-xs">
                        {character.metadata?.occupation || character.social_class}
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
            <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Creative Characters Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start creating your first original creative character with custom traits and personalities.
            </p>
            <Button asChild>
              <Link to="/characters/create/creative">
                <Sparkles className="h-4 w-4 mr-2" />
                Create Your First Creative Character
              </Link>
            </Button>
          </Card>
        )}
      </Section>
    </div>
  );
};

export default CreativeCharacterLibrary;
