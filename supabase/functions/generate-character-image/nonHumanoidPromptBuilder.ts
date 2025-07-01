export const IMAGE_STYLES = {
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
  portrait: {
    prompt: "professional portrait style, studio lighting, clean background, detailed facial features",
    quality: "hd",
    openaiStyle: "natural"
  },
  historical: {
    prompt: "historically accurate, period-appropriate clothing and setting, authentic details",
    quality: "hd",
    openaiStyle: "natural"
  }
};

export function buildNonHumanoidImagePrompt(characterData: any, style: string = 'photorealistic'): string {
  console.log("Generating minimal non-humanoid character image prompt");
  
  // For non-humanoid characters, use a more descriptive approach
  const name = characterData.name || 'Unknown Entity';
  const speciesType = characterData.species_type || 'unknown entity';
  const description = characterData.trait_profile?.description || characterData.description || '';
  const environment = characterData.trait_profile?.environment || '';
  const physicalForm = characterData.trait_profile?.physical_form || characterData.trait_profile?.physicalForm || '';
  
  let prompt = `${name} - ${speciesType}`;
  
  if (description) {
    prompt += `, ${description}`;
  }
  
  if (physicalForm) {
    prompt += `, ${physicalForm}`;
  }
  
  if (environment) {
    prompt += `, in ${environment}`;
  }
  
  // Add style-specific modifiers
  const styleConfig = IMAGE_STYLES[style];
  if (styleConfig && styleConfig.prompt) {
    prompt += `, ${styleConfig.prompt}`;
  }
  
  // Add basic composition guidelines
  prompt += ', single character, full body, standing, plain background, no text, no annotations, no labels, clean image';
  
  console.log("Generated minimal prompt:", prompt);
  return prompt;
}
