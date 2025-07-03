
import React, { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Eye, User, Globe, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CharacterSummary {
  character_id: string;
  name: string;
  created_at: string;
  user_id: string;
  is_public: boolean;
  profile_image_url: string;
  description: string;
  entity_type: string;
  narrative_domain: string;
}

interface OptimizedCharacterCardProps {
  character: CharacterSummary;
  viewMode: 'grid' | 'list';
  currentUserId?: string;
}

const OptimizedCharacterCard = memo(({ character, viewMode, currentUserId }: OptimizedCharacterCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isOwner = currentUserId === character.user_id;
  const displayName = character.name || 'Unnamed Character';
  const shortDescription = character.description.length > 100 
    ? character.description.substring(0, 100) + '...'
    : character.description;

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 flex-shrink-0">
              {character.profile_image_url && !imageError ? (
                <AvatarImage
                  src={character.profile_image_url}
                  alt={displayName}
                  onError={handleImageError}
                />
              ) : (
                <AvatarFallback className="bg-primary/10">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{displayName}</h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isOwner ? (
                    <User className="h-3 w-3 text-blue-500" />
                  ) : (
                    <Globe className="h-3 w-3 text-green-500" />
                  )}
                  <Badge variant="outline" className="text-xs">
                    {character.entity_type}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground truncate">{shortDescription}</p>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDetails}
                className="flex items-center gap-1"
              >
                {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showDetails ? 'Less' : 'More'}
              </Button>
              <Button asChild size="sm">
                <Link to={`/characters/creative/${character.character_id}`}>
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Link>
              </Button>
            </div>
          </div>
          
          {showDetails && (
            <div className="mt-4 pt-4 border-t">
              <div className="space-y-2">
                <p className="text-sm">{character.description}</p>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {character.narrative_domain || 'Unknown Domain'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOwner ? (
              <User className="h-4 w-4 text-blue-500" />
            ) : (
              <Globe className="h-4 w-4 text-green-500" />
            )}
            <Badge variant="outline" className="text-xs">
              {character.entity_type}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-16 w-16 mb-3">
            {character.profile_image_url && !imageError ? (
              <AvatarImage
                src={character.profile_image_url}
                alt={displayName}
                onError={handleImageError}
              />
            ) : (
              <AvatarFallback className="bg-primary/10 text-lg">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <h3 className="font-semibold text-lg leading-tight">{displayName}</h3>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        <p className="text-sm text-muted-foreground text-center line-clamp-3">
          {shortDescription}
        </p>
        
        {showDetails && (
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-full justify-center">
                {character.narrative_domain || 'Unknown Domain'}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDetails}
          className="w-full flex items-center gap-1"
        >
          {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {showDetails ? 'Show Less' : 'Show More'}
        </Button>
        <Button asChild size="sm" className="w-full">
          <Link to={`/characters/creative/${character.character_id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Character
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
});

OptimizedCharacterCard.displayName = 'OptimizedCharacterCard';

export default OptimizedCharacterCard;
