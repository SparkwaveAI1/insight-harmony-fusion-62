
export function buildCreativeCharacterImagePrompt(characterData: any, style: string): string {
  console.log("Building enhanced creative character image prompt for:", characterData.name);
  
  let prompt = "";
  
  // Start with character name and basic type
  prompt += `${characterData.name} - `;
  
  // Use enhanced appearance description if available, but clean it up
  if (characterData.trait_profile?.appearance_model?.appearance_description) {
    let description = characterData.trait_profile.appearance_model.appearance_description;
    // Clean up the description - remove complex formatting and technical terms
    description = description.replace(/Species\s+/gi, '');
    description = description.replace(/\([^)]*\)/g, ''); // Remove parenthetical content
    description = description.split('.')[0]; // Take first sentence only
    prompt += description;
  } else if (characterData.metadata?.description) {
    // Fallback to basic description - first sentence only
    const description = characterData.metadata.description;
    const firstSentence = description.split('.')[0] + '.';
    const shortDescription = firstSentence.length > 150 ? 
      firstSentence.substring(0, 150) + "..." : firstSentence;
    prompt += shortDescription;
  } else if (characterData.trait_profile?.physical_form) {
    prompt += characterData.trait_profile.physical_form;
  } else {
    prompt += `character named ${characterData.name}`;
  }
  
  // Add environment context in a simple way
  if (characterData.trait_profile?.environment) {
    prompt += `, in ${characterData.trait_profile.environment}`;
  }
  
  // Add narrative domain styling with simpler logic
  if (characterData.trait_profile?.narrative_domain) {
    const domain = characterData.trait_profile.narrative_domain.toLowerCase();
    if (domain.includes('sci-fi') || domain.includes('science fiction')) {
      prompt += ", futuristic sci-fi setting";
    } else if (domain.includes('fantasy')) {
      prompt += ", fantasy setting with magical elements";
    } else if (domain.includes('horror')) {
      prompt += ", dark atmospheric horror setting";
    } else if (domain.includes('mystery')) {
      prompt += ", mysterious atmospheric setting";
    } else {
      prompt += `, ${domain} setting`;
    }
  }
  
  // Apply style-specific modifiers with cleaner options
  switch (style) {
    case 'photorealistic':
      prompt += ", highly detailed photorealistic portrait, professional lighting";
      break;
    case 'artistic':
      prompt += ", artistic illustration, vibrant colors";
      break;
    case 'cinematic':
      prompt += ", cinematic composition, dramatic lighting";
      break;
    case 'anime':
      prompt += ", anime art style, detailed character design";
      break;
    case 'cartoon':
      prompt += ", cartoon illustration, stylized character design";
      break;
    case 'concept-art':
      prompt += ", concept art style, detailed character sheet";
      break;
    default:
      prompt += ", detailed character portrait";
  }
  
  // Ensure high quality output with simpler terms
  prompt += ", high quality artwork";
  
  // Clean up any double spaces or formatting issues
  prompt = prompt.replace(/\s+/g, ' ').trim();
  
  console.log("Generated enhanced creative character prompt:", prompt);
  return prompt;
}
