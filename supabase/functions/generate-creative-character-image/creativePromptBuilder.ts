
export function buildCreativeCharacterImagePrompt(characterData: any, style: string): string {
  console.log("Building creative character image prompt for:", characterData.name);
  
  let prompt = "";
  
  // Base character description
  if (characterData.metadata?.description) {
    prompt += characterData.metadata.description;
  } else {
    prompt += `A character named ${characterData.name}`;
  }
  
  // Add physical form details if available
  if (characterData.metadata?.physical_form) {
    prompt += `, ${characterData.metadata.physical_form}`;
  }
  
  // Add environment context
  if (characterData.metadata?.environment) {
    prompt += `, in ${characterData.metadata.environment}`;
  }
  
  // Add narrative domain styling
  if (characterData.metadata?.narrative_domain) {
    const domain = characterData.metadata.narrative_domain.toLowerCase();
    if (domain.includes('fantasy')) {
      prompt += ", fantasy setting with magical elements";
    } else if (domain.includes('sci-fi') || domain.includes('science fiction')) {
      prompt += ", futuristic sci-fi setting with advanced technology";
    } else if (domain.includes('horror')) {
      prompt += ", dark atmospheric horror setting";
    } else if (domain.includes('mystery')) {
      prompt += ", mysterious atmospheric setting";
    } else if (domain.includes('romance')) {
      prompt += ", romantic atmospheric setting";
    } else if (domain.includes('thriller')) {
      prompt += ", intense thriller atmosphere";
    } else {
      prompt += `, ${domain} genre setting`;
    }
  }
  
  // Apply style-specific modifiers
  switch (style) {
    case 'photorealistic':
      prompt += ", highly detailed photorealistic portrait, professional lighting, sharp focus";
      break;
    case 'artistic':
      prompt += ", artistic illustration, creative composition, vibrant colors";
      break;
    case 'cinematic':
      prompt += ", cinematic composition, dramatic lighting, movie poster style";
      break;
    case 'anime':
      prompt += ", anime art style, detailed character design, expressive features";
      break;
    case 'cartoon':
      prompt += ", cartoon illustration, stylized character design, bright colors";
      break;
    default:
      prompt += ", detailed character portrait";
  }
  
  // Ensure high quality output
  prompt += ", high resolution, masterpiece quality";
  
  console.log("Generated creative character prompt:", prompt);
  return prompt;
}
