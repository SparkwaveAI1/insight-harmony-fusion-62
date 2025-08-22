import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { createV4PersonaCall1, createV4PersonaCall2, createV4PersonaCall3 } from '@/services/v4-persona/createV4Persona';
import { addPersonaToCollection } from '@/services/collections/collectionsService';
import { toast } from 'sonner';

interface CreatePersonaInCollectionDialogProps {
  collectionId: string;
  collectionName: string;
  onPersonaCreated?: () => void;
}

type Stage = 'input' | 'creating' | 'generating-summary' | 'generating-image' | 'adding-to-collection' | 'success' | 'error';

export function CreatePersonaInCollectionDialog({ 
  collectionId, 
  collectionName, 
  onPersonaCreated 
}: CreatePersonaInCollectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generateImage, setGenerateImage] = useState(true);
  const [stage, setStage] = useState<Stage>('input');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePersona = async () => {
    if (!prompt.trim()) return;

    try {
      setStage('creating');
      setError(null);

      // Step 1: Create initial persona
      const call1Result = await createV4PersonaCall1({
        user_prompt: prompt,
        user_id: '' // Will be set by the edge function
      });

      if (!call1Result.success || !call1Result.persona_id) {
        throw new Error(call1Result.error || 'Failed to create persona');
      }

      setStage('generating-summary');

      // Step 2: Generate summary
      const call2Result = await createV4PersonaCall2(call1Result.persona_id);

      if (!call2Result.success) {
        throw new Error(call2Result.error || 'Failed to generate persona summary');
      }

      // Step 3: Generate image (if requested)
      if (generateImage) {
        setStage('generating-image');
        const call3Result = await createV4PersonaCall3(call1Result.persona_id, true);

        if (!call3Result.success) {
          console.warn('Image generation failed, but continuing with persona creation');
        }
      }

      // Step 4: Add to collection
      setStage('adding-to-collection');
      const addedToCollection = await addPersonaToCollection(collectionId, call1Result.persona_id);

      if (!addedToCollection) {
        // Persona was created but couldn't be added to collection
        toast.error(`Persona created but couldn't be added to ${collectionName}. You can add it manually.`);
      }

      setStage('success');
      setResult({ persona_id: call1Result.persona_id, persona_name: call1Result.persona_name });
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
      case 'generating-summary':
        return 'Generating conversation summary...';
      case 'generating-image':
        return 'Generating profile image...';
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
    if (stage !== 'creating' && stage !== 'generating-summary' && stage !== 'generating-image' && stage !== 'adding-to-collection') {
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

          {(stage === 'creating' || stage === 'generating-summary' || stage === 'generating-image' || stage === 'adding-to-collection') && (
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