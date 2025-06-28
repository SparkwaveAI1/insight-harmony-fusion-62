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
          <CharacterDetailHeader 
            character={activeCharacter}
            onDownloadJSON={handleDownloadJSON}
          />

          <CharacterProfileSection
            character={activeCharacter}
            onImageGenerated={handleImageGenerated}
            onVisibilityChange={handleVisibilityChange}
          />

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
