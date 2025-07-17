
import { useState } from 'react';
import { toast } from 'sonner';
import { generateCharacterImage } from '../services/characterImageService';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import { CharacterImage } from '../services/characterImageGalleryService';
import { useAuthSession } from '@/hooks/useAuthSession';

type AnyCharacter = Character | NonHumanoidCharacter;

interface GenerationData {
  characterData: AnyCharacter;
  style: string;
  customText: string;
  referenceImageUrl?: string;
}

export const useImageGenerationWithAuth = (character: AnyCharacter) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const { session, validateSession, isValidating } = useAuthSession();

  const isNonHumanoid = 'species_type' in character;

  const generateImageWithRetry = async (
    selectedStyle: string,
    customText: string,
    referenceImage: CharacterImage | null,
    retryCount = 0
  ): Promise<boolean> => {
    const maxRetries = 3;
    
    try {
      // Validate session before attempting generation
      console.log('Validating session before image generation...');
      const validSession = await validateSession(retryCount > 0);
      
      if (!validSession) {
        throw new Error('Please sign in again to generate images');
      }

      console.log(`Image generation attempt ${retryCount + 1}/${maxRetries + 1}`);
      
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
        return true;
      } else if (typeof result === 'string' && result) {
        setGeneratedImageUrl(result);
        setGeneratedPrompt('');
        return true;
      } else {
        throw new Error('No image was generated');
      }
    } catch (error) {
      console.error(`Generation attempt ${retryCount + 1} failed:`, error);
      
      // Check if it's an authentication error and we haven't exceeded retries
      const isAuthError = error.message?.includes('Authentication') || 
                          error.message?.includes('session') || 
                          error.message?.includes('sign in');
      
      if (isAuthError && retryCount < maxRetries) {
        console.log(`Authentication error detected, retrying in ${(retryCount + 1) * 1000}ms...`);
        
        // Show progress toast for retries
        toast.info(`Authentication issue detected, retrying... (${retryCount + 1}/${maxRetries})`, {
          description: 'Refreshing session and trying again'
        });
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
        
        return generateImageWithRetry(selectedStyle, customText, referenceImage, retryCount + 1);
      }
      
      // Final error after all retries
      throw error;
    }
  };

  const generateImage = async (
    selectedStyle: string,
    customText: string,
    referenceImage: CharacterImage | null
  ) => {
    if (!character) {
      toast.error('No character data available');
      return false;
    }

    // Check if we're already validating auth
    if (isValidating) {
      toast.info('Validating authentication, please wait...');
      return false;
    }

    setIsGenerating(true);
    
    try {
      // Show initial toast with mobile-friendly message
      toast.info(`Generating ${isNonHumanoid ? 'entity' : 'character'} image...`, {
        description: `Using ${selectedStyle} style. This may take a few moments.`,
        duration: 5000
      });
      
      const success = await generateImageWithRetry(selectedStyle, customText, referenceImage);
      
      if (success) {
        toast.success(`${isNonHumanoid ? 'Entity' : 'Character'} image generated successfully!`, {
          description: 'You can now save it to your gallery or set as profile image'
        });
        return true;
      } else {
        toast.error('Failed to generate character image');
        return false;
      }
    } catch (error) {
      console.error('Error generating character image:', error);
      
      // Provide specific error messages for common issues
      let errorMessage = 'An error occurred while generating the image';
      let errorDescription = 'Please try again';
      
      if (error.message?.includes('Authentication') || error.message?.includes('sign in')) {
        errorMessage = 'Authentication required';
        errorDescription = 'Please sign in again and try generating the image';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error';
        errorDescription = 'Please check your connection and try again';
      } else if (error.message?.includes('access denied') || error.message?.includes('your own characters')) {
        errorMessage = 'Access denied';
        errorDescription = 'You can only generate images for your own characters';
      }
      
      toast.error(errorMessage, { description: errorDescription });
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
    isNonHumanoid,
    isAuthenticated: !!session
  };
};
