
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import CharacterAvatar from './CharacterAvatar';
import CloneCharacterButton from './CloneCharacterButton';
import { CreativeCharacter } from '../types/creativeCharacterTypes';
import { creativeCharacterToCharacter } from '../services/creativeCharacterTypeMappers';
import { useAuth } from '@/context/AuthContext';

interface CreativeCharacterCardProps {
  character: CreativeCharacter;
  viewMode: 'grid' | 'list';
  onImageGenerated?: (imageUrl: string) => void;
}

const CreativeCharacterCard = ({ character, viewMode, onImageGenerated }: CreativeCharacterCardProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === character.user_id;
  
  console.log('CreativeCharacterCard ownership check:', {
    currentUserId: user?.id,
    characterUserId: character.user_id,
    characterName: character.name,
    isOwner
  });
  
  const getCharacterTypeLabel = (character: CreativeCharacter) => {
    if (character.character_type === 'multi_species') {
      return character.species_type || 'Non-Humanoid';
    }
    return 'Humanoid';
  };

  const getCharacterDescription = (character: CreativeCharacter) => {
    const description = character.metadata?.description || 
                       character.trait_profile?.description ||
                       character.trait_profile?.background_story || 
                       `A ${getCharacterTypeLabel(character).toLowerCase()} character`;
    
    return description.length > 120 ? description.substring(0, 120) + '...' : description;
  };

  // Convert CreativeCharacter to Character for CloneCharacterButton compatibility
  const characterForCloning = creativeCharacterToCharacter(character);

  return (
    <Card className={`hover:shadow-lg transition-shadow ${
      viewMode === 'grid' ? 'flex flex-col h-full max-w-sm w-full' : 'h-32'
    }`}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start gap-4">
          <CharacterAvatar 
            character={{
              name: character.name,
              profile_image_url: character.profile_image_url
            }}
            size="md"
            className="flex-shrink-0"
          />
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
          {getCharacterDescription(character)}
        </p>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {getCharacterTypeLabel(character)}
          </Badge>
          {character.trait_profile?.narrative_domain && (
            <Badge variant="outline" className="text-xs">
              {character.trait_profile.narrative_domain}
            </Badge>
          )}
          {character.trait_profile?.functional_role && (
            <Badge variant="outline" className="text-xs">
              {character.trait_profile.functional_role}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex-shrink-0">
        {isOwner ? (
          // Owner gets only view details button
          <Link to={`/characters/${character.character_id}`} className="w-full">
            <Button size="sm" className="w-full text-xs">
              View Details
            </Button>
          </Link>
        ) : (
          // Non-owner gets stacked buttons - view details and clone
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
};

export default CreativeCharacterCard;
