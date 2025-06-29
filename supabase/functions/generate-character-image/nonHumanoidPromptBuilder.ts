
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
      'full body portrait',
      'neutral background',
      '8K quality'
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
      'full body shot',
      'neutral backdrop',
      'high contrast'
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
      'full body character design',
      'clean background',
      'high quality anime art'
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
      'full body illustration',
      'simple background',
      'superhero comic style'
    ],
    openaiStyle: 'vivid',
    quality: 'hd'
  }
};

export function buildNonHumanoidImagePrompt(characterData: any, style: string = 'photorealistic'): string {
  console.log("Generating non-humanoid character image prompt");
  
  const traitProfile = characterData.trait_profile;
  const physicalManifest = traitProfile?.physical_manifestation;
  const styleConfig = IMAGE_STYLES[style] || IMAGE_STYLES.photorealistic;
  
  if (!physicalManifest) {
    console.warn("No physical manifestation data found, using basic prompt");
    return buildBasicNonHumanoidPrompt(characterData, styleConfig);
  }
  
  let prompt = `Full body portrait of a ${characterData.species_type || 'mysterious entity'}`;
  
  // Primary form and composition
  if (physicalManifest.primary_form) {
    prompt += ` manifesting as ${physicalManifest.primary_form.toLowerCase()}`;
  }
  
  if (physicalManifest.material_composition) {
    prompt += ` composed of ${physicalManifest.material_composition.toLowerCase()}`;
  }
  
  // Scale and dimensions
  if (physicalManifest.scale_category) {
    const scaleMap: Record<string, string> = {
      'Microscopic': 'tiny, intricate details visible',
      'Human-scale': 'human-sized proportions',
      'Massive': 'imposing, large-scale presence',
      'Planetary': 'enormous, cosmic scale'
    };
    const scaleDesc = scaleMap[physicalManifest.scale_category] || physicalManifest.scale_category.toLowerCase();
    prompt += `, ${scaleDesc}`;
  }
  
  // Visual characteristics
  if (physicalManifest.luminescence_pattern) {
    prompt += `, emanating ${physicalManifest.luminescence_pattern.toLowerCase()} light`;
  }
  
  if (physicalManifest.texture_quality) {
    prompt += `, with ${physicalManifest.texture_quality.toLowerCase()} surface texture`;
  }
  
  // Movement and interaction - simplified for static image
  if (physicalManifest.movement_characteristics) {
    const movementHints = physicalManifest.movement_characteristics.toLowerCase();
    if (movementHints.includes('elegant') || movementHints.includes('graceful')) {
      prompt += `, posed gracefully`;
    } else if (movementHints.includes('powerful') || movementHints.includes('strong')) {
      prompt += `, in a powerful stance`;
    }
  }
  
  // Dimensional properties
  if (physicalManifest.dimensional_properties && 
      physicalManifest.dimensional_properties !== '3D Stable') {
    prompt += `, exhibiting ${physicalManifest.dimensional_properties.toLowerCase()} geometry`;
  }
  
  // Add style modifiers
  const styleModifiers = styleConfig.promptModifiers.join(', ');
  prompt += `, rendered in ${styleModifiers} style`;
  
  // Add full-body and background specifications
  prompt += ', standing pose, full body visible, neutral background, professional composition';
  
  console.log("Generated non-humanoid prompt:", prompt);
  return prompt;
}

function buildBasicNonHumanoidPrompt(characterData: any, styleConfig: StyleConfig): string {
  let prompt = `Full body portrait of a ${characterData.species_type || 'mysterious non-humanoid entity'}`;
  
  if (characterData.form_factor) {
    prompt += ` with ${characterData.form_factor.toLowerCase()} characteristics`;
  }
  
  // Add basic mysterious/otherworldly elements
  prompt += ', otherworldly appearance, unique alien features';
  
  if (characterData.origin_universe) {
    prompt += `, from ${characterData.origin_universe}`;
  }
  
  // Add style modifiers
  const styleModifiers = styleConfig.promptModifiers.join(', ');
  prompt += `, rendered in ${styleModifiers} style`;
  
  // Add full-body and background specifications
  prompt += ', standing pose, full body visible, neutral background, professional composition';
  
  return prompt;
}
