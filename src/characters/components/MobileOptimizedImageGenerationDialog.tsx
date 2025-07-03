
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import ImageStyleSelector from './ImageStyleSelector';
import ReferenceImageSelector from './ReferenceImageSelector';
import { CharacterImage } from '../services/characterImageGalleryService';

type AnyCharacter = Character | NonHumanoidCharacter;

interface MobileOptimizedImageGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  character: AnyCharacter;
  isGenerating: boolean;
  isNonHumanoid: boolean;
  isAuthenticated: boolean;
  onGenerate: (style: string, customText: string, referenceImage: CharacterImage | null) => Promise<void>;
}

const MobileOptimizedImageGenerationDialog = ({
  isOpen,
  onClose,
  character,
  isGenerating,
  isNonHumanoid,
  isAuthenticated,
  onGenerate
}: MobileOptimizedImageGenerationDialogProps) => {
  const [selectedStyle, setSelectedStyle] = useState('cinematic'); // Default to cinematic
  const [customText, setCustomText] = useState('');
  const [selectedReference, setSelectedReference] = useState<CharacterImage | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStyle('cinematic');
      setCustomText('');
      setSelectedReference(null);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    await onGenerate(selectedStyle, customText, selectedReference);
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Please sign in to generate {isNonHumanoid ? 'entity' : 'character'} images.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Generate {isNonHumanoid ? 'Entity' : 'Character'} Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="font-medium mb-2">
              {character.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {character.metadata?.description?.slice(0, 150)}
              {character.metadata?.description && character.metadata.description.length > 150 ? '...' : ''}
            </p>
          </div>

          <ImageStyleSelector
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
            disabled={isGenerating}
          />

          <div>
            <Label htmlFor="custom-text" className="text-sm font-medium mb-2 block">
              Additional Details (Optional)
            </Label>
            <Textarea
              id="custom-text"
              placeholder="Add specific details, poses, or styling requests..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              disabled={isGenerating}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {customText.length}/500 characters
            </p>
          </div>

          <ReferenceImageSelector
            character={character}
            selectedReference={selectedReference}
            onReferenceChange={setSelectedReference}
            disabled={isGenerating}
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isGenerating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileOptimizedImageGenerationDialog;
