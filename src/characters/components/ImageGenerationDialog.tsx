
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import { CharacterImage } from '../services/characterImageGalleryService';
import ImageStyleSelector from './ImageStyleSelector';
import ReferenceImageSelector from './ReferenceImageSelector';

type AnyCharacter = Character | NonHumanoidCharacter;

interface ImageGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  character: AnyCharacter;
  isGenerating: boolean;
  isNonHumanoid: boolean;
  onGenerate: (style: string, customText: string, referenceImage: CharacterImage | null) => void;
}

const ImageGenerationDialog = ({
  isOpen,
  onClose,
  character,
  isGenerating,
  isNonHumanoid,
  onGenerate
}: ImageGenerationDialogProps) => {
  const [selectedStyle, setSelectedStyle] = useState('profile');
  const [customText, setCustomText] = useState('');
  const [referenceImage, setReferenceImage] = useState<CharacterImage | null>(null);

  const handleGenerate = () => {
    onGenerate(selectedStyle, customText, referenceImage);
  };

  const resetForm = () => {
    setCustomText('');
    setReferenceImage(null);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Generate {isNonHumanoid ? 'Entity' : 'Character'} Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {isNonHumanoid 
                ? 'Create a visual representation of this non-humanoid entity based on its physical manifestation traits.'
                : 'Generate a profile image for this character based on their traits and characteristics.'
              }
            </p>
          </div>
          
          <ImageStyleSelector
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
            disabled={isGenerating}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Description (Optional)</label>
            <Textarea
              placeholder="Add specific details to guide the image generation..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              disabled={isGenerating}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This will be combined with the character's existing traits
            </p>
          </div>
          
          <ReferenceImageSelector
            character={character}
            selectedImageId={referenceImage?.id}
            onImageSelect={setReferenceImage}
          />
          
          <div className="flex gap-2 pt-4">
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
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isGenerating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageGenerationDialog;
