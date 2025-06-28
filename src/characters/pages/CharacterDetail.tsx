
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
    // Reload character to get updated image URL
    if (characterId) {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Section>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link to="/characters">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Library
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleDownloadJSON}>
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/characters/${activeCharacter.character_id}/chat`}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat
                </Link>
              </Button>
              <Button asChild>
                <Link to={`/characters/${activeCharacter.character_id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Character
                </Link>
              </Button>
            </div>
          </div>

          {/* Character Profile Header - Similar to Persona layout */}
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
                    {activeCharacter.character_type === 'historical' ? 'Historical' : 'Fictional'} Character
                  </p>
                  <CharacterVisibilityToggle
                    characterId={activeCharacter.character_id}
                    isPublic={activeCharacter.is_public || false}
                    isOwner={true}
                    onVisibilityChange={handleVisibilityChange}
                  />
                </div>

                {/* Generate Image Button */}
                <GenerateCharacterImageButton
                  character={activeCharacter}
                  onImageGenerated={handleImageGenerated}
                  className="w-full max-w-sm"
                />
              </div>
            </Card>
          </div>

          {/* Character Information - Using Persona-style comprehensive display */}
          <div className="space-y-8">
            {/* Demographics Section */}
            {activeCharacter.metadata && (
              <Card className="p-6">
                <PersonaDemographics metadata={activeCharacter.metadata} />
              </Card>
            )}

            {/* Comprehensive Traits Profile */}
            {activeCharacter.trait_profile && (
              <Card className="p-6">
                <PersonaTraits traitProfile={activeCharacter.trait_profile} />
              </Card>
            )}

            {/* Emotional Triggers */}
            {activeCharacter.emotional_triggers && (
              <Card className="p-6">
                <PersonaEmotionalTriggers emotionalTriggers={activeCharacter.emotional_triggers} />
              </Card>
            )}

            {/* Creation Prompt */}
            {activeCharacter.prompt && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Creation Prompt</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {activeCharacter.prompt}
                </p>
              </Card>
            )}

            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Character Number:</span>{' '}
                  <span className="text-muted-foreground">#{activeCharacter.character_id.slice(-8).toUpperCase()}</span>
                </div>
                <div>
                  <span className="font-medium">Character ID:</span>{' '}
                  <span className="text-muted-foreground">{activeCharacter.character_id}</span>
                </div>
                <div>
                  <span className="font-medium">Type:</span>{' '}
                  <span className="text-muted-foreground">{activeCharacter.character_type}</span>
                </div>
                <div>
                  <span className="font-medium">Created:</span>{' '}
                  <span className="text-muted-foreground">
                    {new Date(activeCharacter.creation_date).toLocaleDateString()}
                  </span>
                </div>
                {activeCharacter.metadata?.description && (
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="text-muted-foreground mt-1">
                      {activeCharacter.metadata.description}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Character #</span>
                  <span className="font-mono">#{activeCharacter.character_id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Visibility</span>
                  <span className={activeCharacter.is_public ? 'text-green-600' : 'text-gray-600'}>
                    {activeCharacter.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Version</span>
                  <span>{activeCharacter.enhanced_metadata_version || 2}</span>
                </div>
                {activeCharacter.trait_profile && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Trait Categories</span>
                    <span>{Object.keys(activeCharacter.trait_profile).length}</span>
                  </div>
                )}
                {activeCharacter.age && (
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Age</span>
                    <span>{activeCharacter.age}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Delete Character Section - Moved to bottom */}
            <Card className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-destructive">Danger Zone</h3>
                <p className="text-muted-foreground mb-4">
                  Once you delete a character, there is no going back. Please be certain.
                </p>
                <DeleteCharacterButton
                  characterId={activeCharacter.character_id}
                  characterName={activeCharacter.name}
                  onDeleted={handleCharacterDeleted}
                />
              </div>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default CharacterDetail;
