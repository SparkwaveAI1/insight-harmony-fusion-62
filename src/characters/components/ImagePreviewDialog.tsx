
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Save, Star, X, Check, ChevronDown } from 'lucide-react';
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
  const [savedToGallery, setSavedToGallery] = React.useState(false);
  const [setAsProfile, setSetAsProfile] = React.useState(false);
  const [isPromptOpen, setIsPromptOpen] = React.useState(false);

  // Reset states when dialog opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setSavedToGallery(false);
      setSetAsProfile(false);
      setIsPromptOpen(false);
    }
  }, [isOpen]);

  const handleSaveToGallery = async () => {
    await onSaveToGallery();
    setSavedToGallery(true);
  };

  const handleSetAsProfile = async () => {
    await onSetAsProfile();
    setSetAsProfile(true);
    // Don't close dialog anymore, let user decide when to close
  };

  const handleSaveAndSetAsProfile = async () => {
    await onSaveAndSetAsProfile();
    setSavedToGallery(true);
    setSetAsProfile(true);
    // Don't close dialog anymore, let user decide when to close
  };

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
          
          {/* Collapsible Prompt Display */}
          <Collapsible open={isPromptOpen} onOpenChange={setIsPromptOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                <span className="text-sm font-medium">Generation Prompt</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isPromptOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">{prompt}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Action Status */}
          {(savedToGallery || setAsProfile) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Completed:</span>
              </div>
              <ul className="text-sm text-green-600 mt-1 ml-6">
                {savedToGallery && <li>• Saved to gallery</li>}
                {setAsProfile && <li>• Set as profile image</li>}
              </ul>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleSaveToGallery}
              disabled={isSaving || savedToGallery}
              variant="outline"
              className="flex-1"
            >
              {savedToGallery ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved to Gallery
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save to Gallery
                </>
              )}
            </Button>
            
            <Button
              onClick={handleSetAsProfile}
              disabled={isSaving || setAsProfile}
              variant="outline"
              className="flex-1"
            >
              {setAsProfile ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Set as Profile
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Set as Profile
                </>
              )}
            </Button>
            
            <Button
              onClick={handleSaveAndSetAsProfile}
              disabled={isSaving || (savedToGallery && setAsProfile)}
              className="flex-1"
            >
              {(savedToGallery && setAsProfile) ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Completed
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save & Set as Profile
                </>
              )}
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              disabled={isSaving}
              variant="ghost"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;
