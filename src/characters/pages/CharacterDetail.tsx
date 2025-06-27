
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { useCharacter } from '../hooks/useCharacter';
import CharacterTraits from '../components/CharacterTraits';
import CharacterAvatar from '../components/CharacterAvatar';
import GenerateCharacterImageButton from '../components/GenerateCharacterImageButton';

const CharacterDetail = () => {
  const { characterId } = useParams<{ characterId: string }>();
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
              <div>
                <h1 className="text-3xl font-bold">{activeCharacter.name}</h1>
                <p className="text-muted-foreground">
                  {activeCharacter.character_type} Character
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                {activeCharacter.is_public ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Public
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Private
                  </>
                )}
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

          {/* Character Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                <div className="space-y-3">
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

              {/* Prompt */}
              {activeCharacter.prompt && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Creation Prompt</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {activeCharacter.prompt}
                  </p>
                </Card>
              )}

              {/* Character Traits */}
              {activeCharacter.trait_profile && (
                <Card className="p-6">
                  <CharacterTraits traitProfile={activeCharacter.trait_profile} />
                </Card>
              )}
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Character Image */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Character Image</h3>
                <div className="flex flex-col items-center space-y-4">
                  {activeCharacter.profile_image_url ? (
                    <div className="w-full max-w-sm">
                      <img 
                        src={activeCharacter.profile_image_url} 
                        alt={`${activeCharacter.name} portrait`}
                        className="w-full h-auto rounded-lg border-4 border-primary/20 shadow-lg"
                      />
                    </div>
                  ) : (
                    <CharacterAvatar 
                      character={activeCharacter} 
                      size="xl" 
                      className="border-4 border-primary/20"
                    />
                  )}
                  <GenerateCharacterImageButton
                    character={activeCharacter}
                    onImageGenerated={handleImageGenerated}
                    className="w-full"
                  />
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Visibility:</span>
                    <span className={activeCharacter.is_public ? 'text-green-600' : 'text-gray-600'}>
                      {activeCharacter.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span>{activeCharacter.enhanced_metadata_version || 2}</span>
                  </div>
                  {activeCharacter.trait_profile && (
                    <div className="flex justify-between">
                      <span>Trait Categories:</span>
                      <span>{Object.keys(activeCharacter.trait_profile).length}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default CharacterDetail;
