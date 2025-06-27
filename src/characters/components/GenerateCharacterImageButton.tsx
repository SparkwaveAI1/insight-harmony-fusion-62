
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateCharacterImage } from '../services/characterImageService';
import { Character } from '../types/characterTraitTypes';

interface GenerateCharacterImageButtonProps {
  character: Character;
  onImageGenerated?: (imageUrl: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const GenerateCharacterImageButton = ({ 
  character, 
  onImageGenerated,
  variant = 'outline',
  size = 'default',
  className 
}: GenerateCharacterImageButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImage = async () => {
    if (!character) {
      toast.error('No character data available');
      return;
    }

    setIsGenerating(true);
    
    try {
      toast.info('Generating character image...', {
        description: 'This may take a few moments'
      });
      
      const imageUrl = await generateCharacterImage(character);
      
      if (imageUrl) {
        toast.success('Character image generated successfully!');
        onImageGenerated?.(imageUrl);
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
    <Button
      onClick={handleGenerateImage}
      disabled={isGenerating}
      variant={variant}
      size={size}
      className={className}
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
  );
};

export default GenerateCharacterImageButton;
