
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';
import Section from '@/components/ui-custom/Section';
import CreativeCharacterDialog from '../components/CreativeCharacterDialog';
import { CreativeCharacterData } from '../types/characterTraitTypes';
import { createCreativeCharacter } from '../services/creativeCharacterService';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const CreativeCharacterCreate = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCharacterComplete = async (data: CreativeCharacterData) => {
    if (!user) {
      toast.error('Please sign in to create characters');
      navigate('/sign-in');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Creating creative character with data:', data);
      console.log('User from useAuth:', user);
      
      // Show loading toast
      toast.loading('Creating your character...', {
        id: 'character-creation',
        description: 'This may take a moment while we generate your character traits.'
      });
      
      // Pass the user ID from the auth context to the service
      const createdCharacter = await createCreativeCharacter(data, user.id);
      
      // Dismiss loading toast and show success
      toast.dismiss('character-creation');
      toast.success(`Creative character "${createdCharacter.name}" created successfully!`);
      
      // Navigate to the character detail page
      navigate(`/characters/${createdCharacter.character_id}`);
    } catch (error) {
      console.error('Error creating creative character:', error);
      // Dismiss loading toast and show error
      toast.dismiss('character-creation');
      toast.error(error instanceof Error ? error.message : 'Failed to create creative character');
    } finally {
      setIsSubmitting(false);
      setDialogOpen(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Section>
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/characters/creative')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Creative Characters
              </Button>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="p-8 text-center">
                <div className="space-y-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
                    <p className="text-muted-foreground mb-6">
                      You need to be signed in to create creative characters.
                    </p>
                  </div>

                  <Button
                    size="lg"
                    onClick={() => navigate('/sign-in')}
                    className="w-full"
                  >
                    Sign In to Continue
                  </Button>
                </div>
              </Card>
            </div>
          </Section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Section>
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/characters/creative')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Creative Characters
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Create Creative Character</h1>
              <p className="text-muted-foreground">Design an original creative character through our guided process</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-2">Character Genesis</h2>
                  <p className="text-muted-foreground mb-6">
                    Step through our guided creation process to build a unique creative character with rich depth and personality.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-900 mb-1">7 Steps</div>
                    <div className="text-blue-700">Guided creation process</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-900 mb-1">Rich Traits</div>
                    <div className="text-purple-700">Complex personality system</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-900 mb-1">Any Genre</div>
                    <div className="text-green-700">Fantasy, sci-fi, and more</div>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={() => setDialogOpen(true)}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Character...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Start Character Creation
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </Section>
      </div>

      <CreativeCharacterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onComplete={handleCharacterComplete}
      />
    </div>
  );
};

export default CreativeCharacterCreate;
