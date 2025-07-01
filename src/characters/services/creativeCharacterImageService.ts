
import { supabase } from '@/integrations/supabase/client';
import { Character } from '../types/characterTraitTypes';

interface CreativeGenerationResult {
  success: boolean;
  image_url?: string;
  prompt?: string;
  error?: string;
}

export async function generateCreativeCharacterImage(
  characterData: Character, 
  style: string = 'photorealistic',
  customText: string = '',
  referenceImageUrl: string | null = null,
  autoSave: boolean = true
): Promise<CreativeGenerationResult | string> {
  try {
    console.log('Generating creative character image with data:', { characterData, style, autoSave });
    
    // Only handle creative characters
    if (characterData.creation_source !== 'creative') {
      throw new Error('This service only handles creative characters from Character Lab');
    }

    // Prepare request data
    const requestData = {
      characterData: characterData,
      style: style,
      customText: customText,
      referenceImageUrl: referenceImageUrl,
      autoSave: autoSave
    };

    console.log('Calling generate-creative-character-image function with:', requestData);

    const { data, error } = await supabase.functions.invoke('generate-creative-character-image', {
      body: requestData
    });

    if (error) {
      console.error('Creative character image generation error:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }

    console.log('Creative character image generation response:', data);

    if (data && data.success) {
      if (autoSave) {
        // Return just the URL for backward compatibility
        return data.image_url;
      } else {
        // Return the full result object for preview
        return data;
      }
    } else {
      throw new Error(data?.error || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('Error in generateCreativeCharacterImage:', error);
    throw error;
  }
}
