
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
      'high resolution',
      'professional photography',
      'studio lighting',
      'neutral background'
    ],
    openaiStyle: 'natural',
    quality: 'hd'
  },
  cinematic: {
    name: 'Cinematic',
    description: 'Movie-style dramatic lighting and composition',
    promptModifiers: [
      'cinematic',
      'movie poster style',
      'dramatic lighting',
      'epic composition',
      'neutral backdrop'
    ],
    openaiStyle: 'vivid',
    quality: 'hd'
  },
  anime: {
    name: 'Anime',
    description: 'Japanese animation art style',
    promptModifiers: [
      'anime style',
      'manga illustration',
      'cel shading',
      'vibrant colors',
      'clean background'
    ],
    openaiStyle: 'vivid',
    quality: 'hd'
  },
  comics: {
    name: 'Comics',
    description: 'Comic book illustration style',
    promptModifiers: [
      'comic book style',
      'graphic novel art',
      'bold outlines',
      'dynamic pose',
      'simple background'
    ],
    openaiStyle: 'vivid',
    quality: 'hd'
  }
};

export function buildNonHumanoidImagePrompt(characterData: any, style: string = 'photorealistic'): string {
  console.log("Generating non-humanoid character image prompt");
  
  const styleConfig = IMAGE_STYLES[style] || IMAGE_STYLES.photorealistic;
  
  // Start with basic character description from metadata
  let prompt = '';
  
  // Use the character's description from metadata first
  if (characterData.metadata?.description) {
    prompt = characterData.metadata.description.trim();
    // Clean up the description - remove trailing periods/commas
    prompt = prompt.replace(/[.,\s]+$/, '');
  } else if (characterData.name) {
    prompt = `${characterData.name}`;
  } else {
    prompt = 'A unique non-humanoid character';
  }
  
  // Add environment context if available
  if (characterData.metadata?.environment) {
    const environment = characterData.metadata.environment.toLowerCase();
    if (!environment.includes('earth') && !environment.includes('environment')) {
      prompt += `, in ${environment}`;
    }
  }
  
  // Add style modifiers
  const styleModifiers = styleConfig.promptModifiers.join(', ');
  prompt += `, ${styleModifiers}`;
  
  // Ensure full body and neutral background
  prompt += ', full body portrait, standing pose, neutral background, professional composition';
  
  console.log("Generated non-humanoid prompt:", prompt);
  return prompt;
}

function buildBasicNonHumanoidPrompt(characterData: any, styleConfig: StyleConfig): string {
  let prompt = `${characterData.name || 'Non-humanoid character'}`;
  
  if (characterData.metadata?.description) {
    prompt = characterData.metadata.description.trim();
  }
  
  // Add style modifiers
  const styleModifiers = styleConfig.promptModifiers.join(', ');
  prompt += `, ${styleModifiers}`;
  
  // Add full-body and background specifications
  prompt += ', full body portrait, standing pose, neutral background, professional composition';
  
  return prompt;
}
