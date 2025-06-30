export interface StyleConfig {
  name: string;
  description: string;
  promptModifiers: string[];
  openaiStyle?: string;
  quality?: 'hd' | 'standard';
}

export const IMAGE_STYLES: Record<string, StyleConfig> = {
  photorealistic: {
    name: 'Photorealistic',
    description: 'High-detail, realistic rendering',
    promptModifiers: [
      'photorealistic',
      'high quality',
      'detailed'
    ],
    openaiStyle: 'natural',
    quality: 'hd'
  },
  cinematic: {
    name: 'Cinematic',
    description: 'Movie-style dramatic lighting and composition',
    promptModifiers: [
      'cinematic',
      'dramatic lighting',
      'movie style'
    ],
    openaiStyle: 'vivid',
    quality: 'hd'
  },
  anime: {
    name: 'Anime',
    description: 'Japanese animation art style',
    promptModifiers: [
      'anime style',
      'manga style',
      'clean art'
    ],
    openaiStyle: 'vivid',
    quality: 'hd'
  },
  comics: {
    name: 'Comics',
    description: 'Comic book illustration style',
    promptModifiers: [
      'comic book style',
      'illustration',
      'clean lines'
    ],
    openaiStyle: 'vivid',
    quality: 'hd'
  }
};

export function buildNonHumanoidImagePrompt(characterData: any, style: string = 'photorealistic'): string {
  console.log("Generating clean non-humanoid character image prompt");
  
  const styleConfig = IMAGE_STYLES[style] || IMAGE_STYLES.photorealistic;
  
  // Start with the character's basic visual description
  let prompt = '';
  
  // Extract key visual elements from the description
  if (characterData.metadata?.description) {
    const description = characterData.metadata.description.trim();
    // Clean up the description to focus on visual elements only
    const visualDescription = description
      .replace(/\n\n.*$/s, '') // Remove sections after first paragraph break
      .replace(/Personality[\s\S]*$/i, '') // Remove personality sections
      .replace(/Beliefs?[\s\S]*$/i, '') // Remove beliefs sections
      .replace(/Tech[\s\S]*$/i, '') // Remove tech sections
      .replace(/Motivation[\s\S]*$/i, '') // Remove motivation sections
      .replace(/\n.*:/g, '') // Remove any remaining section headers
      .trim();
    
    prompt = visualDescription || characterData.name || 'A unique character';
  } else if (characterData.name) {
    prompt = `${characterData.name}`;
  } else {
    prompt = 'A unique character';
  }
  
  // Add style modifiers
  const styleModifiers = styleConfig.promptModifiers.join(', ');
  prompt += `, ${styleModifiers}`;
  
  // Add essential composition requirements - keep it simple and emphasize no text
  prompt += `, single character, full body view, neutral background`;
  prompt += `, professional photography, clean composition, high resolution`;
  
  // Strong emphasis on no text or annotations
  prompt += `, no text, no words, no letters, no annotations, no labels, no captions, no written content, clean visual image`;
  
  console.log("Generated clean non-humanoid prompt:", prompt);
  return prompt;
}
