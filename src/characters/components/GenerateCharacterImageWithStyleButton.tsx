
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { generateCharacterImage } from '../services/characterImageService';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import ImageStyleSelector from './ImageStyleSelector';

type AnyCharacter = Character | NonHumanoidCharacter;

interface GenerateCharacterImageWithStyleButtonProps {
  character: AnyCharacter;
  onImageGenerated?: (imageUrl: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const GenerateCharacterImageWithStyleButton = ({ 
  character, 
  onImageGenerated,
  variant = 'outline',
  size = 'default',
  className 
}: GenerateCharacterImageWithStyleButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isNonHumanoid = 'species_type' in character;

  const handleGenerateImage = async () => {
    if (!character) {
      toast.error('No character data available');
      return;
    }

    setIsGenerating(true);
    
    try {
      toast.info(`Generating ${isNonHumanoid ? 'entity' : 'character'} image...`, {
        description: `Using ${selectedStyle} style. This may take a few moments.`
      });
      
      const imageUrl = await generateCharacterImage(character, selectedStyle);
      
      if (imageUrl) {
        toast.success(`${isNonHumanoid ? 'Entity' : 'Character'} image generated successfully!`, {
          description: `Created with ${selectedStyle} style`
        });
        onImageGenerated?.(imageUrl);
        setIsDialogOpen(false);
      } else {
        toast.error('Failed to generate character image');
      }
    } catch (error) {
      console.error('Error generating character image:', error);
      toast.error('An error occurred while generating the image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Generate {isNonHumanoid ? 'Entity' : 'Character'} Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
          
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleGenerateImage}
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
              onClick={() => setIsDialogOpen(false)}
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

export default GenerateCharacterImageWithStyleButton;
