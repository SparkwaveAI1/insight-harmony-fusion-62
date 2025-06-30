import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, MessageCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useCharacter } from '../hooks/useCharacter';
import CharacterAvatar from '../components/CharacterAvatar';
import GenerateCharacterImageWithStyleButton from '../components/GenerateCharacterImageWithStyleButton';
import CharacterVisibilityToggle from '../components/CharacterVisibilityToggle';
import DeleteCharacterButton from '../components/DeleteCharacterButton';
import { downloadCharacterAsJSON } from '../utils/downloadUtils';
import CharacterDetailHeader from '../components/CharacterDetailHeader';
import CharacterInfoSections from '../components/CharacterInfoSections';
import CharacterDangerZone from '../components/CharacterDangerZone';
import CharacterImageGallery from '../components/CharacterImageGallery';

const CharacterDetail = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const { activeCharacter, isLoading, error, loadCharacter } = useCharacter();

  // Load character when component mounts
  React.useEffect(() => {
    if (characterId) {
      loadCharacter(characterId);
    }
  }, [characterId]);

  const handleImageGenerated = async (imageUrl: string) => {
    console.log('Image generated successfully:', imageUrl);
    // Force reload character to get updated image URL
    if (characterId) {
      console.log('Reloading character data...');
      await loadCharacter(characterId);
    }
  };

  const handleCurrentImageChange = (imageUrl: string) => {
    // Update the character's profile image URL in the UI
    if (activeCharacter) {
      // This will trigger a re-render with the updated image
      loadCharacter(characterId!);
    }
  };

  const handleVisibilityChange = (isPublic: boolean) => {
    // Update the character state to reflect the new visibility
    if (activeCharacter) {
      // This will trigger a re-render with the updated visibility status
      loadCharacter(characterId!);
    }
  };

  const handleDownloadJSON = () => {
    if (activeCharacter) {
      downloadCharacterAsJSON(activeCharacter);
    }
  };

  const handleCharacterDeleted = async (): Promise<void> => {
    // Navigate back to character library after successful deletion
    navigate('/characters');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Section>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading character...</p>
              </div>
            </div>
          </Section>
        </div>
      </div>
    );
  };

  if (error || !activeCharacter) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Section>
            <Card className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2 text-red-600">Character Not Found</h2>
              <p className="text-muted-foreground mb-4">
                {error || 'The character you are looking for could not be found.'}
              </p>
              <Button asChild>
                <Link to="/characters">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Library
                </Link>
              </Button>
            </Card>
          </Section>
        </div>
      </div>
    );
  }

  // Check if it's a non-humanoid character
  const isNonHumanoidCharacter = 'species_type' in activeCharacter;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Section>
          <CharacterDetailHeader 
            character={activeCharacter}
            onDownloadJSON={handleDownloadJSON}
          />

          {/* Character Profile Section */}
          <div className="text-center mb-8">
            <Card className="p-8">
              <div className="flex flex-col items-center">
                {/* Character Image/Avatar */}
                <div className="mb-6 w-full max-w-md">
                  {activeCharacter.profile_image_url ? (
                    <AspectRatio ratio={1} className="w-full">
                      <img 
                        src={activeCharacter.profile_image_url} 
                        alt={`${activeCharacter.name} ${isNonHumanoidCharacter ? 'entity' : 'portrait'}`}
                        className="w-full h-full object-contain rounded-lg border-4 border-primary/20 shadow-lg bg-muted"
                        onError={(e) => {
                          console.error('Error loading image:', activeCharacter.profile_image_url);
                          console.log('Image load error event:', e);
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', activeCharacter.profile_image_url);
                        }}
                      />
                    </AspectRatio>
                  ) : (
                    <AspectRatio ratio={1} className="w-full">
                      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg border-4 border-primary/20">
                        <CharacterAvatar 
                          character={activeCharacter} 
                          size="xl" 
                          className="w-24 h-24"
                        />
                      </div>
                    </AspectRatio>
                  )}
                </div>

                {/* Character Info */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">{activeCharacter.name}</h1>
                  <p className="text-muted-foreground mb-4">
                    {isNonHumanoidCharacter ? 'Creative Entity' : 
                     activeCharacter.character_type === 'historical' ? 'Historical' : 'Fictional'} Character
                  </p>
                  <CharacterVisibilityToggle
                    characterId={activeCharacter.character_id}
                    isPublic={activeCharacter.is_public || false}
                    isOwner={true}
                    onVisibilityChange={handleVisibilityChange}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                  <GenerateCharacterImageWithStyleButton
                    character={activeCharacter}
                    onImageGenerated={handleImageGenerated}
                    className="flex-1"
                  />
                  
                  <CharacterImageGallery
                    character={activeCharacter}
                    onCurrentImageChange={handleCurrentImageChange}
                  />
                </div>
              </div>
            </Card>
          </div>

          <CharacterInfoSections character={activeCharacter} />

          <CharacterDangerZone
            characterId={activeCharacter.character_id}
            characterName={activeCharacter.name}
            onDeleted={handleCharacterDeleted}
          />
        </Section>
      </div>
    </div>
  );
};

export default CharacterDetail;
