
import React from 'react';
import Card from '@/components/ui-custom/Card';
import CharacterAvatar from './CharacterAvatar';
import GenerateCharacterImageButton from './GenerateCharacterImageButton';
import CharacterVisibilityToggle from './CharacterVisibilityToggle';
import { Character } from '../types/characterTraitTypes';

interface CharacterProfileSectionProps {
  character: Character;
  onImageGenerated: (imageUrl: string) => void;
  onVisibilityChange: (isPublic: boolean) => void;
}

const CharacterProfileSection = ({ 
  character, 
  onImageGenerated, 
  onVisibilityChange 
}: CharacterProfileSectionProps) => {
  return (
    <div className="text-center mb-8">
      <Card className="p-8">
        <div className="flex flex-col items-center">
          {/* Character Image - Large and rectangular */}
          <div className="mb-6">
            {character.profile_image_url ? (
              <div className="w-full max-w-md">
                <img 
                  src={character.profile_image_url} 
                  alt={`${character.name} portrait`}
                  className="w-full h-64 object-cover rounded-lg border-4 border-primary/20 shadow-lg"
                />
              </div>
            ) : (
              <div className="w-full max-w-md h-64 flex items-center justify-center bg-muted rounded-lg border-4 border-primary/20">
                <CharacterAvatar 
                  character={character} 
                  size="xl" 
                  className="w-24 h-24"
                />
              </div>
            )}
          </div>

          {/* Character Info */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{character.name}</h1>
            <p className="text-muted-foreground mb-4">
              {character.character_type === 'historical' ? 'Historical' : 'Fictional'} Character
            </p>
            <CharacterVisibilityToggle
              characterId={character.character_id}
              isPublic={character.is_public || false}
              isOwner={true}
              onVisibilityChange={onVisibilityChange}
            />
          </div>

          {/* Generate Image Button */}
          <GenerateCharacterImageButton
            character={character}
            onImageGenerated={onImageGenerated}
            className="w-full max-w-sm"
          />
        </div>
      </Card>
    </div>
  );
};

export default CharacterProfileSection;
