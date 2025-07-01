
export const NON_HUMANOID_STYLES = {
  photorealistic: {
    prompt: "photorealistic, highly detailed, professional photography, clean composition",
    quality: "hd",
    openaiStyle: "natural"
  },
  cinematic: {
    prompt: "cinematic lighting, dramatic composition, movie-style photography, high contrast",
    quality: "hd", 
    openaiStyle: "vivid"
  },
  artistic: {
    prompt: "artistic style, painterly composition, creative lighting, stylized",
    quality: "hd",
    openaiStyle: "natural"
  },
  cosmic: {
    prompt: "cosmic, otherworldly, ethereal lighting, space-like environment",
    quality: "hd",
    openaiStyle: "vivid"
  },
  organic: {
    prompt: "organic, natural textures, biological forms, living entity",
    quality: "hd",
    openaiStyle: "natural"
  }
};

export function buildNonHumanoidImagePrompt(characterData: any, style: string = 'photorealistic'): string {
  console.log("Generating non-humanoid character image prompt");
  console.log("Character data:", JSON.stringify(characterData, null, 2));
  
  // Extract non-humanoid specific information
  const name = characterData.name || 'Unknown Entity';
  const speciesType = characterData.species_type || 'unknown entity';
  const description = characterData.trait_profile?.description || characterData.description || '';
  const environment = characterData.trait_profile?.environment || '';
  
  // Extract physical manifestation details
  const physicalManifestation = characterData.trait_profile?.physical_manifestation;
  let physicalDetails = '';
  
  if (physicalManifestation) {
    const details = [];
    if (physicalManifestation.primary_form) details.push(physicalManifestation.primary_form);
    if (physicalManifestation.material_composition) details.push(physicalManifestation.material_composition);
    if (physicalManifestation.luminescence_pattern) details.push(physicalManifestation.luminescence_pattern);
    if (physicalManifestation.texture_quality) details.push(physicalManifestation.texture_quality);
    if (physicalManifestation.movement_characteristics) details.push(physicalManifestation.movement_characteristics);
    
    physicalDetails = details.join(', ');
  }
  
  // Build the non-humanoid prompt
  let prompt = `${name} - ${speciesType}`;
  
  if (description) {
    prompt += `, ${description}`;
  }
  
  if (physicalDetails) {
    prompt += `, ${physicalDetails}`;
  }
  
  if (environment) {
    prompt += `, in ${environment}`;
  }
  
  // Add style-specific modifiers
  const styleConfig = NON_HUMANOID_STYLES[style];
  if (styleConfig && styleConfig.prompt) {
    prompt += `, ${styleConfig.prompt}`;
  }
  
  // Add composition guidelines for non-humanoid entities
  prompt += ', single entity, alien appearance, non-human form, otherworldly being, clean background, no text, no annotations, no labels, detailed entity portrait';
  
  console.log("Generated non-humanoid prompt:", prompt);
  return prompt;
}
