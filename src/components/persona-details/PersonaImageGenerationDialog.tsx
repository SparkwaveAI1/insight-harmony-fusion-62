
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ImageIcon } from 'lucide-react';
import { Persona } from '@/services/persona/types';
import { usePersonaImageGeneration } from '@/hooks/usePersonaImageGeneration';

interface PersonaImageGenerationDialogProps {
  persona: Persona;
  onImageGenerated: () => void;
  trigger?: React.ReactNode;
}

const PersonaImageGenerationDialog = ({ 
  persona, 
  onImageGenerated, 
  trigger 
}: PersonaImageGenerationDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [saveToGallery, setSaveToGallery] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { isGenerating, generateImage } = usePersonaImageGeneration(persona);

  const hasExistingImage = Boolean(persona.profile_image_url);

  const handleGenerate = async () => {
    // If there's an existing image and we haven't shown confirmation yet, show it first
    if (hasExistingImage && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    const result = await generateImage(saveToGallery);
    if (result) {
      onImageGenerated();
      setIsOpen(false);
      setSaveToGallery(false); // Reset for next time
      setShowConfirmation(false); // Reset confirmation state
    }
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    setShowConfirmation(false); // Reset confirmation when dialog closes
  };

  const defaultTrigger = (
    <Button variant="outline" disabled={isGenerating}>
      <ImageIcon className="h-4 w-4 mr-2" />
      {isGenerating ? 'Generating...' : 'Generate Image'}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log("Dialog open change:", open);
      if (open) {
        setIsOpen(true);
      } else {
        handleDialogClose();
      }
    }}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {hasExistingImage && showConfirmation ? 'Replace Existing Image?' : 'Generate Profile Image'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {hasExistingImage && showConfirmation ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {persona.name} already has a profile image. Are you sure you want to generate a new one? This will replace the current image.
              </p>
              {persona.profile_image_url && (
                <div className="flex justify-center">
                  <img 
                    src={persona.profile_image_url} 
                    alt="Current profile image"
                    className="w-24 h-24 rounded-lg object-cover object-top border-2 border-primary/20"
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Generate a new profile image for {persona.name} based on their persona traits.
            </p>
          )}
          
          {(!hasExistingImage || showConfirmation) && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="save-to-gallery" 
                checked={saveToGallery}
                onCheckedChange={(checked) => setSaveToGallery(checked as boolean)}
              />
              <Label htmlFor="save-to-gallery" className="text-sm">
                Save generated image to gallery
              </Label>
            </div>
          )}
          
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={handleDialogClose}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              variant={hasExistingImage && showConfirmation ? "destructive" : "default"}
            >
              {isGenerating ? 'Generating...' : 
               hasExistingImage && showConfirmation ? 'Yes, Replace Image' : 'Generate Image'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonaImageGenerationDialog;
