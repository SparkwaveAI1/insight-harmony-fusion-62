
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
  console.log("Generating visual prompt for non-humanoid character using physical appearance description");
  
  const styleConfig = IMAGE_STYLES[style] || IMAGE_STYLES.photorealistic;
  
  // Try to get the dedicated physical appearance description first
  let visualDescription = '';
  
  if (characterData.physical_appearance_description) {
    visualDescription = characterData.physical_appearance_description;
  } else if (characterData.physicalForm) {
    visualDescription = characterData.physicalForm;
  } else {
    // Minimal fallback
    visualDescription = characterData.name || 'Unique creative entity';
  }
  
  // Build clean visual prompt
  let prompt = visualDescription;
  
  // Add style modifiers
  const styleModifiers = styleConfig.promptModifiers.join(', ');
  prompt += `, ${styleModifiers}`;
  
  // Add professional image requirements
  prompt += ', single subject, clean background, high quality, detailed, no text, no words, no labels, no annotations';
  
  console.log("Non-humanoid appearance prompt:", prompt);
  return prompt;
}
