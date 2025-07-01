
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import CharacterAvatar from './CharacterAvatar';
import GenerateCharacterImageWithStyleButton from './GenerateCharacterImageWithStyleButton';
import CloneCharacterButton from './CloneCharacterButton';
import { CreativeCharacter } from '../types/creativeCharacterTypes';
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

  return (
    <Card className={`hover:shadow-lg transition-shadow ${
      viewMode === 'grid' ? 'h-96 flex flex-col' : 'h-32'
    }`}>
      <div className="flex flex-col h-full p-6">
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
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold line-clamp-2">{character.name}</h3>
              {!isOwner && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Public
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
              {getCharacterDescription(character)}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">
            {getCharacterTypeLabel(character)}
          </Badge>
          {character.trait_profile?.narrative_domain && (
            <Badge variant="outline">
              {character.trait_profile.narrative_domain}
            </Badge>
          )}
          {character.trait_profile?.functional_role && (
            <Badge variant="outline">
              {character.trait_profile.functional_role}
            </Badge>
          )}
        </div>
        
        <div className="mt-auto space-y-2">
          {isOwner ? (
            // Owner can generate images and view details
            <div className="flex gap-2">
              <Link to={`/characters/${character.character_id}`} className="flex-1">
                <Button size="sm" className="w-full">
                  View Details
                </Button>
              </Link>
              <GenerateCharacterImageWithStyleButton
                character={character}
                onImageGenerated={onImageGenerated}
                variant="outline"
                size="sm"
                className="flex-1"
              />
            </div>
          ) : (
            // Non-owner can only view details or clone - NO image generation
            <div className="flex gap-2">
              <Link to={`/characters/${character.character_id}`} className="flex-1">
                <Button size="sm" variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
              <CloneCharacterButton 
                character={character} 
                size="sm"
                className="flex-1"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CreativeCharacterCard;
