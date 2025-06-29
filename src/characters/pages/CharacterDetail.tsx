
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, MessageCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { useCharacter } from '../hooks/useCharacter';
import CharacterAvatar from '../components/CharacterAvatar';
import GenerateCharacterImageButton from '../components/GenerateCharacterImageButton';
import CharacterVisibilityToggle from '../components/CharacterVisibilityToggle';
import DeleteCharacterButton from '../components/DeleteCharacterButton';
import { downloadCharacterAsJSON } from '../utils/downloadUtils';
// Import the comprehensive trait display components from Personas
import PersonaTraits from '@/components/persona-details/PersonaTraits';
import PersonaDemographics from '@/components/persona-details/PersonaDemographics';
import PersonaEmotionalTriggers from '@/components/persona-details/PersonaEmotionalTriggers';
import CharacterDetailHeader from '../components/CharacterDetailHeader';
import CharacterProfileSection from '../components/CharacterProfileSection';
import CharacterInfoSections from '../components/CharacterInfoSections';
import CharacterDangerZone from '../components/CharacterDangerZone';

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
  }

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
                {/* Character Image - Large and rectangular */}
                <div className="mb-6">
                  {activeCharacter.profile_image_url ? (
                    <div className="w-full max-w-md">
                      <img 
                        src={activeCharacter.profile_image_url} 
                        alt={`${activeCharacter.name} portrait`}
                        className="w-full h-64 object-cover rounded-lg border-4 border-primary/20 shadow-lg"
                        onError={(e) => {
                          console.error('Error loading image:', activeCharacter.profile_image_url);
                          console.log('Image load error event:', e);
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', activeCharacter.profile_image_url);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-md h-64 flex items-center justify-center bg-muted rounded-lg border-4 border-primary/20">
                      <CharacterAvatar 
                        character={activeCharacter} 
                        size="xl" 
                        className="w-24 h-24"
                      />
                    </div>
                  )}
                </div>

                {/* Character Info */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">{activeCharacter.name}</h1>
                  <p className="text-muted-foreground mb-4">
                    {isNonHumanoidCharacter ? 'Non-Humanoid' : 
                     activeCharacter.character_type === 'historical' ? 'Historical' : 'Fictional'} Character
                  </p>
                  <CharacterVisibilityToggle
                    characterId={activeCharacter.character_id}
                    isPublic={activeCharacter.is_public || false}
                    isOwner={true}
                    onVisibilityChange={handleVisibilityChange}
                  />
                </div>

                {/* Generate Image Button - Only show for regular characters, not non-humanoid */}
                {!isNonHumanoidCharacter && (
                  <GenerateCharacterImageButton
                    character={activeCharacter as any}
                    onImageGenerated={handleImageGenerated}
                    className="w-full max-w-sm"
                  />
                )}
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
