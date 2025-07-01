
import { supabase } from '@/integrations/supabase/client';
import { Character } from '../types/characterTraitTypes';
import { NonHumanoidCharacter } from '../types/nonHumanoidTypes';
import { generateCreativeCharacterImage } from './creativeCharacterImageService';

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
    
    // Determine character type to route to correct service
    let characterData: any;
    
    // Handle both old and new API formats
    if (typeof characterOrData === 'object' && 'characterData' in characterOrData) {
      characterData = characterOrData.characterData;
    } else {
      characterData = characterOrData;
    }

    // Route to appropriate service based on character type
    if (characterData.creation_source === 'creative') {
      // Creative characters from Character Lab - use dedicated service
      console.log('Routing to creative character image generation');
      
      let customText = '';
      let referenceImageUrl = null;
      
      // Extract additional parameters if provided
      if (typeof characterOrData === 'object' && 'customText' in characterOrData) {
        customText = characterOrData.customText || '';
        referenceImageUrl = characterOrData.referenceImageUrl || null;
      }
      
      return await generateCreativeCharacterImage(
        characterData,
        style,
        customText,
        referenceImageUrl,
        autoSave
      );
    } else if (characterData.species_type) {
      // Non-humanoid character
      console.log('Routing to non-humanoid character image generation');
      return await generateNonHumanoidImage(characterOrData, style, autoSave);
    } else if (characterData.character_type === 'historical' || characterData.creation_source === 'historical') {
      // Historical character
      console.log('Routing to historical character image generation');
      return await generateHistoricalImage(characterOrData, style, autoSave);
    } else {
      throw new Error('Unknown character type - cannot determine image generation service');
    }
  } catch (error) {
    console.error('Error in generateCharacterImage:', error);
    throw error;
  }
}

// Legacy function for non-humanoid characters
async function generateNonHumanoidImage(characterOrData: any, style: string, autoSave: boolean): Promise<GenerationResult | string> {
  const requestData = typeof characterOrData === 'object' && 'characterData' in characterOrData 
    ? characterOrData 
    : { characterData: characterOrData, style: style, autoSave: autoSave };

  const { data, error } = await supabase.functions.invoke('generate-nonhumanoid-character-image', {
    body: requestData
  });

  if (error) {
    throw new Error(`Failed to generate image: ${error.message}`);
  }

  return data?.success ? (autoSave ? data.image_url : data) : data;
}

// Legacy function for historical characters
async function generateHistoricalImage(characterOrData: any, style: string, autoSave: boolean): Promise<GenerationResult | string> {
  const requestData = typeof characterOrData === 'object' && 'characterData' in characterOrData 
    ? characterOrData 
    : { characterData: characterOrData, style: style, autoSave: autoSave };

  const { data, error } = await supabase.functions.invoke('generate-character-image', {
    body: requestData
  });

  if (error) {
    throw new Error(`Failed to generate image: ${error.message}`);
  }

  return data?.success ? (autoSave ? data.image_url : data) : data;
}
