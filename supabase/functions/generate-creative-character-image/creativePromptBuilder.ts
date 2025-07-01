
export function buildCreativeCharacterImagePrompt(characterData: any, style: string): string {
  console.log("Building enhanced creative character image prompt for:", characterData.name);
  
  let prompt = "";
  
  // Use enhanced appearance description if available
  if (characterData.trait_profile?.appearance_model?.appearance_description) {
    prompt += characterData.trait_profile.appearance_model.appearance_description;
    console.log("Using enhanced appearance description");
  } else if (characterData.metadata?.description) {
    // Fallback to basic description
    const description = characterData.metadata.description;
    const firstParagraph = description.split('\n\n')[0] || description.split('\n')[0];
    const shortDescription = firstParagraph.length > 200 ? 
      firstParagraph.substring(0, 200) + "..." : firstParagraph;
    prompt += shortDescription;
  } else {
    prompt += `A character named ${characterData.name}`;
  }
  
  // Add visual theme if available
  if (characterData.trait_profile?.appearance_model?.visual_theme) {
    prompt += `, rendered in ${characterData.trait_profile.appearance_model.visual_theme} style`;
  }
  
  // Add aesthetic class if available
  if (characterData.trait_profile?.appearance_model?.aesthetic_class) {
    prompt += `, with ${characterData.trait_profile.appearance_model.aesthetic_class} design elements`;
  }
  
  // Add signature features if available
  if (characterData.trait_profile?.appearance_model?.signature_features?.length > 0) {
    const features = characterData.trait_profile.appearance_model.signature_features.join(', ');
    prompt += `, featuring ${features}`;
  }
  
  // Add physical form details if available
  if (characterData.trait_profile?.physical_form) {
    prompt += `, with physical manifestation: ${characterData.trait_profile.physical_form}`;
  }
  
  // Add environment context
  if (characterData.trait_profile?.environment) {
    prompt += `, in environment: ${characterData.trait_profile.environment}`;
  }
  
  // Add narrative domain styling with enhanced logic
  if (characterData.trait_profile?.narrative_domain) {
    const domain = characterData.trait_profile.narrative_domain.toLowerCase();
    if (domain.includes('fantasy')) {
      prompt += ", fantasy setting with magical elements, mystical lighting, arcane atmosphere";
    } else if (domain.includes('sci-fi') || domain.includes('science fiction')) {
      prompt += ", futuristic sci-fi setting with advanced technology, neon lighting, cyberpunk atmosphere";
    } else if (domain.includes('horror')) {
      prompt += ", dark atmospheric horror setting, ominous shadows, unsettling mood";
    } else if (domain.includes('mystery')) {
      prompt += ", mysterious atmospheric setting, enigmatic lighting, subtle intrigue";
    } else if (domain.includes('romance')) {
      prompt += ", romantic atmospheric setting, soft lighting, dreamy ambiance";
    } else if (domain.includes('thriller')) {
      prompt += ", intense thriller atmosphere, dramatic lighting, tension-filled environment";
    } else {
      prompt += `, ${domain} genre setting with appropriate atmosphere`;
    }
  }
  
  // Apply style-specific modifiers with enhanced options
  switch (style) {
    case 'photorealistic':
      prompt += ", highly detailed photorealistic portrait, professional studio lighting, sharp focus, 8K resolution";
      break;
    case 'artistic':
      prompt += ", artistic illustration, creative composition, vibrant colors, painterly technique";
      break;
    case 'cinematic':
      prompt += ", cinematic composition, dramatic lighting, movie poster style, epic scale";
      break;
    case 'anime':
      prompt += ", anime art style, detailed character design, expressive features, Japanese animation style";
      break;
    case 'cartoon':
      prompt += ", cartoon illustration, stylized character design, bright colors, animated style";
      break;
    case 'concept-art':
      prompt += ", concept art style, detailed character sheet, multiple angles, professional game art";
      break;
    default:
      prompt += ", detailed character portrait, high quality artwork";
  }
  
  // Ensure high quality output
  prompt += ", masterpiece quality, trending on artstation, professional artwork";
  
  console.log("Generated enhanced creative character prompt:", prompt);
  return prompt;
}
