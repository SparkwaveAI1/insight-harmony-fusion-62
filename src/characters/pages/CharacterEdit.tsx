import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import { useCharacter } from '../hooks/useCharacter';

const CharacterEdit = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const navigate = useNavigate();
  const { activeCharacter, isLoading, error, loadCharacter } = useCharacter();

  // Load character when component mounts
  React.useEffect(() => {
    if (characterId) {
      loadCharacter(characterId);
    }
  }, [characterId]);

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
                {error || 'The character you are trying to edit could not be found.'}
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
                <Link to={`/characters/${activeCharacter.character_id}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Character
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Edit {activeCharacter.name}</h1>
                <p className="text-muted-foreground">
                  Modify character details and settings
                </p>
              </div>
            </div>
            
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>

          {/* Edit Form Placeholder */}
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Character Editing</h2>
            <p className="text-muted-foreground mb-6">
              Character editing functionality will be implemented here.
            </p>
            <p className="text-sm text-muted-foreground">
              This would include forms to edit the character's name, description, 
              traits, and other properties.
            </p>
          </Card>
        </Section>
      </div>
    </div>
  );
};

export default CharacterEdit;
