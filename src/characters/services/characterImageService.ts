
import { supabase } from '@/integrations/supabase/client';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';

type AnyCharacter = Character | NonHumanoidCharacter;

interface GenerationResult {
  success: boolean;
  image_url?: string;
  prompt?: string;
  error?: string;
}

export async function generateCharacterImage(
  characterOrData: AnyCharacter | any, 
  style: string = 'photorealistic',
  autoSave: boolean = true
): Promise<GenerationResult | string> {
  try {
    console.log('Generating character image with data:', { characterOrData, style, autoSave });
    
    // Handle both old and new API formats
    let requestData;
    if (typeof characterOrData === 'object' && 'characterData' in characterOrData) {
      // New format with additional parameters
      requestData = {
        characterData: characterOrData.characterData,
        style: style,
        customText: characterOrData.customText,
        referenceImageUrl: characterOrData.referenceImageUrl,
        autoSave: autoSave
      };
    } else {
      // Legacy format
      requestData = {
        characterData: characterOrData,
        style: style,
        autoSave: autoSave
      };
    }

    console.log('Calling generate-character-image function with:', requestData);

    const { data, error } = await supabase.functions.invoke('generate-character-image', {
      body: requestData
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }

    console.log('Function response:', data);

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
    console.error('Error in generateCharacterImage:', error);
    throw error;
  }
}
