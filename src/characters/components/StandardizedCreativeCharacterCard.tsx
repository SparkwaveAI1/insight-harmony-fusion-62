
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import CharacterAvatar from './CharacterAvatar';
import CloneCharacterButton from './CloneCharacterButton';
import { CharacterCardData } from '../types/cardTypes';
import { creativeCharacterToCharacter } from '../services/creativeCharacterTypeMappers';
import { useAuth } from '@/context/AuthContext';

interface StandardizedCreativeCharacterCardProps {
  character: CharacterCardData;
  viewMode: 'grid' | 'list';
}

const StandardizedCreativeCharacterCard = React.memo(({ character, viewMode }: StandardizedCreativeCharacterCardProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === character.user_id;

  // Truncate description for card display
  const getCardDescription = (description: string) => {
    if (!description) return 'A creative character from Character Lab';
    return description.length > 120 ? description.substring(0, 120) + '...' : description;
  };

  // Convert to legacy format for CloneCharacterButton compatibility
  const characterForCloning = React.useMemo(() => creativeCharacterToCharacter({
    character_id: character.character_id,
    name: character.name,
    user_id: character.user_id,
    is_public: character.is_public,
    profile_image_url: character.profile_image_url,
    created_at: character.created_at,
    character_type: 'fictional',
    creation_source: 'creative',
    creation_date: character.created_at,
    trait_profile: {
      description: character.description,
      narrative_domain: character.narrative_domain,
      functional_role: character.functional_role
    },
    metadata: {},
    behavioral_modulation: {},
    interview_sections: [],
    linguistic_profile: {},
    preinterview_tags: [],
    simulation_directives: {},
    enhanced_metadata_version: 2
  }), [character]);

  return (
    <Card className={`hover:shadow-lg transition-shadow ${
      viewMode === 'grid' ? 'flex flex-col h-full max-w-sm w-full' : 'h-32'
    }`}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
              {character.profile_image_url ? (
                <img 
                  src={character.profile_image_url} 
                  alt={character.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-primary">
                  {character.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold line-clamp-2 break-words">{character.name}</h3>
              {!isOwner && (
                <Badge variant="outline" className="ml-2 text-xs flex-shrink-0">
                  Public
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pb-3 overflow-hidden">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 break-words">
          {getCardDescription(character.description)}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {character.narrative_domain && (
            <Badge variant="outline" className="text-xs">
              {character.narrative_domain}
            </Badge>
          )}
          {character.functional_role && (
            <Badge variant="outline" className="text-xs">
              {character.functional_role}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex-shrink-0">
        {isOwner ? (
          <Link to={`/characters/${character.character_id}`} className="w-full">
            <Button size="sm" className="w-full text-xs">
              View Details
            </Button>
          </Link>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <Link to={`/characters/${character.character_id}`} className="w-full">
              <Button size="sm" variant="outline" className="w-full text-xs">
                View Details
              </Button>
            </Link>
            <CloneCharacterButton 
              character={characterForCloning} 
              className="w-full text-xs"
            />
          </div>
        )}
      </CardFooter>
    </Card>
  );
});

StandardizedCreativeCharacterCard.displayName = 'StandardizedCreativeCharacterCard';

export default StandardizedCreativeCharacterCard;
