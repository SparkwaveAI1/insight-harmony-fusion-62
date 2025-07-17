
import { useState } from 'react';
import { toast } from 'sonner';
import { generateCharacterImage } from '../services/characterImageService';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import { CharacterImage } from '../services/characterImageGalleryService';

type AnyCharacter = Character | NonHumanoidCharacter;

interface GenerationData {
  characterData: AnyCharacter;
  style: string;
  customText: string;
  referenceImageUrl?: string;
}

export const useImageGeneration = (character: AnyCharacter) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  const isNonHumanoid = 'species_type' in character;

  const generateImage = async (
    selectedStyle: string,
    customText: string,
    referenceImage: CharacterImage | null
  ) => {
    if (!character) {
      toast.error('No character data available');
      return false;
    }

    setIsGenerating(true);
    
    try {
      toast.info(`Generating ${isNonHumanoid ? 'entity' : 'character'} image...`, {
        description: `Using ${selectedStyle} style. This may take a few moments.`
      });
      
      const generationData: GenerationData = {
        characterData: character,
        style: selectedStyle,
        customText: customText.trim(),
        referenceImageUrl: referenceImage?.storage_url
      };
      
      const result = await generateCharacterImage(generationData, selectedStyle, false);
      
      if (typeof result === 'object' && result && 'image_url' in result && result.image_url) {
        setGeneratedImageUrl(result.image_url);
        setGeneratedPrompt(result.prompt || '');
        toast.success(`${isNonHumanoid ? 'Entity' : 'Character'} image generated successfully!`);
        return true;
      } else if (typeof result === 'string' && result) {
        setGeneratedImageUrl(result);
        setGeneratedPrompt('');
        toast.success(`${isNonHumanoid ? 'Entity' : 'Character'} image generated successfully!`);
        return true;
      } else {
        toast.error('Failed to generate character image');
        return false;
      }
    } catch (error) {
      console.error('Error generating character image:', error);
      toast.error('An error occurred while generating the image');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGeneration = () => {
    setGeneratedImageUrl('');
    setGeneratedPrompt('');
  };

  return {
    isGenerating,
    generatedImageUrl,
    generatedPrompt,
    generateImage,
    resetGeneration,
    isNonHumanoid
  };
};
