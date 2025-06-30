
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
      'high quality'
    ],
    openaiStyle: 'natural',
    quality: 'hd'
  },
  cinematic: {
    name: 'Cinematic',
    description: 'Movie-style dramatic lighting and composition',
    promptModifiers: [
      'cinematic',
      'dramatic lighting'
    ],
    openaiStyle: 'vivid',
    quality: 'hd'
  },
  anime: {
    name: 'Anime',
    description: 'Japanese animation art style',
    promptModifiers: [
      'anime style'
    ],
    openaiStyle: 'vivid',
    quality: 'hd'
  },
  comics: {
    name: 'Comics',
    description: 'Comic book illustration style',
    promptModifiers: [
      'comic book style'
    ],
    openaiStyle: 'vivid',
    quality: 'hd'
  }
};

export function buildNonHumanoidImagePrompt(characterData: any, style: string = 'photorealistic'): string {
  console.log("Generating simple non-humanoid visual prompt");
  
  const styleConfig = IMAGE_STYLES[style] || IMAGE_STYLES.photorealistic;
  
  // Extract only the basic visual essence
  let prompt = characterData.name || 'Unique entity';
  
  // Add style modifiers
  const styleModifiers = styleConfig.promptModifiers.join(', ');
  prompt += `, ${styleModifiers}`;
  
  // Simple composition requirements
  prompt += ', single subject, clean background, no text, no words, no annotations';
  
  console.log("Simple non-humanoid prompt:", prompt);
  return prompt;
}
