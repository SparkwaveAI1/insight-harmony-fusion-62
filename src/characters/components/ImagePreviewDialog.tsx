
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Save, Star, X } from 'lucide-react';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';

type AnyCharacter = Character | NonHumanoidCharacter;

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  character: AnyCharacter;
  prompt: string;
  onSaveToGallery: () => Promise<void>;
  onSetAsProfile: () => Promise<void>;
  onSaveAndSetAsProfile: () => Promise<void>;
  isSaving: boolean;
}

const ImagePreviewDialog = ({
  isOpen,
  onClose,
  imageUrl,
  character,
  prompt,
  onSaveToGallery,
  onSetAsProfile,
  onSaveAndSetAsProfile,
  isSaving
}: ImagePreviewDialogProps) => {
  const isNonHumanoid = 'species_type' in character;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Generated Image Preview - {character.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image Preview */}
          <AspectRatio ratio={1} className="w-full">
            <img
              src={imageUrl}
              alt={`Generated image for ${character.name}`}
              className="w-full h-full object-contain rounded-lg border"
            />
          </AspectRatio>
          
          {/* Prompt Display */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Generation Prompt:</p>
            <p className="text-sm">{prompt}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={onSaveToGallery}
              disabled={isSaving}
              variant="outline"
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save to Gallery
            </Button>
            
            <Button
              onClick={onSetAsProfile}
              disabled={isSaving}
              variant="outline"
              className="flex-1"
            >
              <Star className="h-4 w-4 mr-2" />
              Set as Profile
            </Button>
            
            <Button
              onClick={onSaveAndSetAsProfile}
              disabled={isSaving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save & Set as Profile
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              disabled={isSaving}
              variant="ghost"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
