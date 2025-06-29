
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
      'detailed texture',
      'professional photography',
      'natural lighting',
      '8K quality'
    ],
    openaiStyle: 'natural',
    quality: 'hd'
  },
  concept_art: {
    name: 'Concept Art',
    description: 'Artistic, fantasy-style illustration',
    promptModifiers: [
      'concept art',
      'fantasy illustration',
      'digital painting',
      'artistic rendering',
      'dramatic composition',
      'stylized'
    ],
    openaiStyle: 'vivid',
    quality: 'hd'
  },
  scientific: {
    name: 'Scientific Illustration',
    description: 'Technical, diagram-like representation',
    promptModifiers: [
      'scientific illustration',
      'technical diagram',
      'educational reference',
      'clean lines',
      'precise details',
      'documentary style'
    ],
    openaiStyle: 'natural',
    quality: 'standard'
  },
  abstract: {
    name: 'Abstract',
    description: 'Stylized, symbolic representation',
    promptModifiers: [
      'abstract art',
      'symbolic representation',
      'minimalist',
      'geometric forms',
      'artistic interpretation',
      'stylized composition'
    ],
    openaiStyle: 'vivid',
    quality: 'standard'
  },
  cinematic: {
    name: 'Cinematic',
    description: 'Movie/game-style dramatic lighting',
    promptModifiers: [
      'cinematic lighting',
      'dramatic atmosphere',
      'movie poster style',
      'epic composition',
      'dynamic lighting',
      'high contrast'
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
  
  let prompt = `A ${characterData.species_type || 'mysterious entity'}`;
  
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
      'Microscopic': 'tiny, intricate details visible under magnification',
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
  
  // Movement and interaction
  if (physicalManifest.movement_characteristics) {
    prompt += `, ${physicalManifest.movement_characteristics.toLowerCase()}`;
  }
  
  if (physicalManifest.environmental_interaction) {
    prompt += `, ${physicalManifest.environmental_interaction.toLowerCase()}`;
  }
  
  // Dimensional properties
  if (physicalManifest.dimensional_properties && 
      physicalManifest.dimensional_properties !== '3D Stable') {
    prompt += `, exhibiting ${physicalManifest.dimensional_properties.toLowerCase()} geometry`;
  }
  
  // Sensory emanations
  if (physicalManifest.sensory_emanations) {
    prompt += `, producing ${physicalManifest.sensory_emanations.toLowerCase()}`;
  }
  
  // Add style modifiers
  const styleModifiers = styleConfig.promptModifiers.join(', ');
  prompt += `, rendered in ${styleModifiers} style`;
  
  // Environment context
  if (characterData.origin_universe) {
    prompt += `, set in ${characterData.origin_universe} environment`;
  }
  
  // Final quality specifications
  prompt += ', highly detailed, professional quality';
  
  console.log("Generated non-humanoid prompt:", prompt);
  return prompt;
}

function buildBasicNonHumanoidPrompt(characterData: any, styleConfig: StyleConfig): string {
  let prompt = `A ${characterData.species_type || 'mysterious non-humanoid entity'}`;
  
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
  prompt += `, rendered in ${styleModifiers} style, highly detailed`;
  
  return prompt;
}
