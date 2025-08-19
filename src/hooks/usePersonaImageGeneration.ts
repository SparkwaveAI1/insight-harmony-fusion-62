
import { useState } from 'react';
import { toast } from 'sonner';
import { generatePersonaImage } from '@/services/persona';
import { uploadPersonaImageFromUrl } from '@/services/supabase/storage/imageUploadService';
import { Persona } from '@/services/persona/types';

export const usePersonaImageGeneration = (persona: Persona) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');

  const generateImage = async (saveToGallery: boolean = false) => {
    if (!persona) {
      toast.error('No persona data available');
      return null;
    }

    setIsGenerating(true);
    
    try {
      toast.info('Generating profile image...', {
        description: 'This may take a few moments.'
      });
      
      const imageUrl = await generatePersonaImage(persona);
      
      if (imageUrl) {
        setGeneratedImageUrl(imageUrl);
        
        if (saveToGallery) {
          // Save to both profile and gallery using URL
          const savedUrl = await uploadPersonaImageFromUrl(imageUrl, persona.persona_id);
          if (savedUrl) {
            toast.success('Profile image generated and saved to gallery!');
          } else {
            toast.warning('Image generated but failed to save to gallery');
          }
        } else {
          // Just set as profile using URL
          const savedUrl = await uploadPersonaImageFromUrl(imageUrl, persona.persona_id);
          if (savedUrl) {
            toast.success('Profile image generated successfully!');
          } else {
            toast.error('Failed to save profile image');
          }
        }
        
        return imageUrl;
      } else {
        toast.error('Failed to generate profile image');
        return null;
      }
    } catch (error) {
      console.error('Error generating profile image:', error);
      toast.error('An error occurred while generating the profile image');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGeneration = () => {
    setGeneratedImageUrl('');
  };

  return {
    isGenerating,
    generatedImageUrl,
    generateImage,
    resetGeneration
  };
};
