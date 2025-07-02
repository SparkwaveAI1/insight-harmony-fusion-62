
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
  const { isGenerating, generateImage } = usePersonaImageGeneration(persona);

  const handleGenerate = async () => {
    const result = await generateImage(saveToGallery);
    if (result) {
      onImageGenerated();
      setIsOpen(false);
      setSaveToGallery(false); // Reset for next time
    }
  };

  const defaultTrigger = (
    <Button variant="outline" disabled={isGenerating}>
      <ImageIcon className="h-4 w-4 mr-2" />
      {isGenerating ? 'Generating...' : 'Generate Image'}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Profile Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a new profile image for {persona.name} based on their persona traits.
          </p>
          
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
          
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonaImageGenerationDialog;
