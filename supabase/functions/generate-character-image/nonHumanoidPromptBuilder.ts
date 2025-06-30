
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
  console.log("Character data:", JSON.stringify(characterData, null, 2));
  
  const styleConfig = IMAGE_STYLES[style] || IMAGE_STYLES.photorealistic;
  
  // Try to get the dedicated physical appearance description first
  let visualDescription = '';
  
  if (characterData.physical_appearance_description) {
    visualDescription = characterData.physical_appearance_description;
    console.log("Using physical_appearance_description:", visualDescription);
  } 
  // Check for trait profile physical manifestation (for non-humanoid characters)
  else if (characterData.trait_profile?.physical_manifestation?.primary_form) {
    visualDescription = characterData.trait_profile.physical_manifestation.primary_form;
    console.log("Using trait_profile primary_form:", visualDescription);
  }
  // Check metadata description and extract appearance details
  else if (characterData.metadata?.description) {
    const description = characterData.metadata.description;
    console.log("Extracting from metadata description:", description);
    
    // Try to extract physical characteristics from the description
    const lines = description.split('\n');
    const physicalLines = lines.filter(line => 
      line.toLowerCase().includes('thin') ||
      line.toLowerCase().includes('body') ||
      line.toLowerCase().includes('head') ||
      line.toLowerCase().includes('appearance') ||
      line.toLowerCase().includes('tall') ||
      line.toLowerCase().includes('height') ||
      line.toLowerCase().includes('build') ||
      line.toLowerCase().includes('skin') ||
      line.toLowerCase().includes('eyes') ||
      line.toLowerCase().includes('hair')
    );
    
    if (physicalLines.length > 0) {
      visualDescription = physicalLines.join(', ');
    } else {
      // Fallback to species type if available
      visualDescription = characterData.species_type || characterData.name;
    }
  }
  else if (characterData.physicalForm) {
    visualDescription = characterData.physicalForm;
    console.log("Using physicalForm:", visualDescription);
  } 
  else {
    // Final fallback - use species type or name
    visualDescription = characterData.species_type || characterData.name || 'Unique creative entity';
    console.log("Using fallback:", visualDescription);
  }
  
  // Build clean visual prompt with explicit instructions for OpenAI
  let prompt = `IMPORTANT: Focus only on the physical appearance details provided below. Create an accurate visual representation of this character with a neutral background. 

Physical description: ${visualDescription}`;
  
  // Add style modifiers
  const styleModifiers = styleConfig.promptModifiers.join(', ');
  prompt += `, ${styleModifiers}`;
  
  // Add professional image requirements with explicit neutral background instruction
  prompt += ', single subject, neutral background, detailed, accurate representation, no text, no words, no labels, no annotations';
  
  console.log("Non-humanoid appearance prompt:", prompt);
  return prompt;
}
