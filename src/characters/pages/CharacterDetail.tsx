
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Users, ArrowLeft, Edit, MessageCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import CharacterHeader from '../components/CharacterHeader';
import CharacterTraits from '../components/CharacterTraits';
import { useCharacter } from '../hooks/useCharacter';
import { deleteCharacter } from '../services/characterService';
import { downloadPersonaAsJSON } from '@/utils/downloadUtils';
import DeleteCharacterButton from '@/components/persona-details/DeleteCharacterButton';
import { useAuth } from '@/context/AuthContext';

const CharacterDetail = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeCharacter: character, isLoading, error, loadCharacter } = useCharacter();

  useEffect(() => {
    if (characterId) {
      loadCharacter(characterId);
    }
  }, [characterId, loadCharacter]);

  const handleDeleteCharacter = async (): Promise<void> => {
    if (!characterId || !user) return Promise.resolve();
    
    try {
      await deleteCharacter(characterId);
      toast.success("Character deleted successfully");
      navigate("/characters");
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting character:", error);
      toast.error("Failed to delete character");
      return Promise.reject(error);
    }
  };

  const handleChatClick = () => {
    if (characterId) {
      navigate(`/characters/${characterId}/chat`);
    }
  };

  const handleDownloadJSON = () => {
    if (character) {
      try {
        downloadPersonaAsJSON(character);
        toast.success("Character data downloaded successfully");
      } catch (error) {
        console.error("Error downloading character data:", error);
        toast.error("Failed to download character data");
      }
    }
  };

  // Check if current user is the owner of this character
  const isOwner = user?.id === character?.user_id;

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

  if (error || !character) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Section>
            <Card className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2 text-red-600">Character Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The character you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/characters')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Characters
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
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/characters')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Characters
            </Button>
            
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Character Detail</span>
            </div>
          </div>

          {/* Character Header */}
          <CharacterHeader character={character} />

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Button 
                onClick={handleChatClick}
                className="w-full"
                size="lg"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat with Character
              </Button>
            </div>
            
            {isOwner && (
              <Button 
                variant="outline"
                onClick={() => navigate(`/characters/${character.character_id}/edit`)}
                className="w-full md:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Character
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleDownloadJSON}
              className="w-full md:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>

          {/* Character Traits */}
          <CharacterTraits traitProfile={character.trait_profile} />

          {/* Delete Button */}
          {isOwner && (
            <div className="max-w-md mx-auto mt-8">
              <DeleteCharacterButton 
                onDelete={handleDeleteCharacter} 
                isOwner={isOwner} 
              />
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

export default CharacterDetail;
