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
  console.log("Generating minimal non-humanoid character image prompt");
  
  const styleConfig = IMAGE_STYLES[style] || IMAGE_STYLES.photorealistic;
  
  // Start with the character's basic description
  let prompt = '';
  
  if (characterData.metadata?.description) {
    // Use the description but clean it up
    prompt = characterData.metadata.description.trim();
    // Remove any trailing punctuation
    prompt = prompt.replace(/[.,\s]+$/, '');
  } else if (characterData.name) {
    prompt = `${characterData.name}`;
  } else {
    prompt = 'A unique character';
  }
  
  // Add style modifiers
  const styleModifiers = styleConfig.promptModifiers.join(', ');
  prompt += `, ${styleModifiers}`;
  
  // Add essential composition requirements - keep it simple
  prompt += ', single character, full body, standing, plain background, no text, no annotations, no labels, clean image';
  
  console.log("Generated minimal prompt:", prompt);
  return prompt;
}
