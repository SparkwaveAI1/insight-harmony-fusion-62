import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { createV4PersonaUnified } from '@/services/v4-persona/createV4PersonaUnified';
import { addPersonaToCollection } from '@/services/collections/collectionsService';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { checkUserCredits } from '@/utils/creditCheck';

interface CreatePersonaInCollectionDialogProps {
  collectionId: string;
  collectionName: string;
  onPersonaCreated?: () => void;
}

type Stage = 'input' | 'creating' | 'adding-to-collection' | 'success' | 'error';

export function CreatePersonaInCollectionDialog({ 
  collectionId, 
  collectionName, 
  onPersonaCreated 
}: CreatePersonaInCollectionDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generateImage, setGenerateImage] = useState(true);
  const [stage, setStage] = useState<Stage>('input');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePersona = async () => {
    if (!prompt.trim() || !user) return;

    // Check if user has enough credits for persona creation
    const { hasEnoughCredits, currentBalance } = await checkUserCredits(user.id, 3);

    if (!hasEnoughCredits) {
      toast(`Insufficient credits. Need 3 credits, you have ${currentBalance}. Please purchase more credits.`, {
        description: "Persona creation requires 3 credits.",
        action: {
          label: "View Billing",
          onClick: () => window.location.href = "/billing"
        }
      });
      return; // Stop persona creation
    }

    // If we get here, user has enough credits - proceed with normal persona creation

    try {
      setStage('creating');
      setError(null);

      // Single unified persona creation
      const result = await createV4PersonaUnified({
        user_description: prompt,
        user_id: user.id
      });

      if (!result.success || !result.persona_id) {
        throw new Error(result.error || 'Failed to create persona');
      }

      // Add to collection
      setStage('adding-to-collection');
      const addedToCollection = await addPersonaToCollection(collectionId, result.persona_id);

      if (!addedToCollection) {
        // Persona was created but couldn't be added to collection
        toast.error(`Persona created but couldn't be added to ${collectionName}. You can add it manually.`);
      }

      setStage('success');
      setResult({ persona_id: result.persona_id, persona_name: result.persona_name });
      toast.success(`Persona created and added to ${collectionName}!`);
      
      if (onPersonaCreated) {
        onPersonaCreated();
      }

    } catch (err) {
      console.error('Error creating persona:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStage('error');
    }
  };

  const getStageMessage = (stage: Stage) => {
    switch (stage) {
      case 'creating':
        return 'Creating persona...';
      case 'adding-to-collection':
        return `Adding to ${collectionName}...`;
      case 'success':
        return `Persona successfully created and added to ${collectionName}!`;
      case 'error':
        return 'Error occurred during creation';
      default:
        return '';
    }
  };

  const handleClose = () => {
    if (stage !== 'creating' && stage !== 'adding-to-collection') {
      setOpen(false);
      setStage('input');
      setPrompt('');
      setError(null);
      setResult(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Persona
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Persona for {collectionName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {stage === 'input' && (
            <>
              <div className="space-y-2">
                <label htmlFor="persona-prompt" className="text-sm font-medium">
                  Describe the persona you want to create:
                </label>
                <Textarea
                  id="persona-prompt"
                  placeholder="e.g., A 28-year-old software engineer from San Francisco who loves hiking and specialty coffee..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generate-image"
                  checked={generateImage}
                  onCheckedChange={(checked) => setGenerateImage(checked as boolean)}
                />
                <label htmlFor="generate-image" className="text-sm">
                  Generate profile image
                </label>
              </div>

              <Button
                onClick={handleCreatePersona}
                disabled={!prompt.trim()}
                className="w-full"
              >
                Create Persona in {collectionName}
              </Button>
            </>
          )}

          {(stage === 'creating' || stage === 'adding-to-collection') && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>{getStageMessage(stage)}</AlertDescription>
            </Alert>
          )}

          {stage === 'success' && result && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <strong>{result.persona_name || result.persona_id}</strong> has been created and added to {collectionName}!
                </div>
              </AlertDescription>
            </Alert>
          )}

          {stage === 'error' && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {(stage === 'success' || stage === 'error') && (
            <Button onClick={handleClose} className="w-full">
              {stage === 'success' ? 'Done' : 'Close'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}