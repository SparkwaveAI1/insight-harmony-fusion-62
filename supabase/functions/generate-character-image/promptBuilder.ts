function getPhysicalDescription(characterData: any): string {
  // Use the new direct fields first, fall back to metadata for backwards compatibility
  const age = characterData.age || parseInt(characterData.metadata?.age) || 30;
  const gender = characterData.gender || characterData.metadata?.gender || 'person';
  
  // Physical attributes from new direct fields or metadata
  const physicalAppearance = characterData.physical_appearance || {};
  const height = physicalAppearance.height || characterData.metadata?.height || 'average height';
  const build = physicalAppearance.build_body_type || characterData.metadata?.build_body_type || 'average build';
  const hairColor = physicalAppearance.hair_color || characterData.metadata?.hair_color || 'brown';
  const hairStyle = physicalAppearance.hair_style || characterData.metadata?.hair_style || 'practical unstyled';
  const eyeColor = physicalAppearance.eye_color || characterData.metadata?.eye_color || 'brown';
  const skinTone = physicalAppearance.skin_tone || characterData.metadata?.skin_tone || 'natural complexion';
  
  // Build consolidated description with more authentic hair styling
  let description = `${age}-year-old ${gender}, ${height}, ${build}, ${hairColor} ${hairStyle} hair, ${eyeColor} eyes, ${skinTone}`;
  
  return description;
}

function getHistoricalClothing(characterData: any): string {
  // Use new direct fields first, fall back to metadata
  const historicalPeriod = characterData.historical_period || characterData.metadata?.historical_period || '1700s';
  const socialClass = characterData.social_class || characterData.metadata?.social_class || 'middle class';
  const region = characterData.region || characterData.metadata?.region || 'European';
  
  const isFrontier = region.toLowerCase().includes('virginia') || 
                    region.toLowerCase().includes('frontier') || 
                    region.toLowerCase().includes('colony') ||
                    region.toLowerCase().includes('america') ||
                    region.toLowerCase().includes('tn') ||
                    region.toLowerCase().includes('tennessee');
  
  let clothingQuality = 'well-worn middle-class';
  if (socialClass.toLowerCase().includes('upper')) {
    clothingQuality = 'fine but lived-in upper-class';
  } else if (socialClass.toLowerCase().includes('lower')) {
    clothingQuality = 'practical worn working-class';
  } else {
    clothingQuality = 'well-worn middle-class';
  }
  
  if (historicalPeriod.includes('1700') || historicalPeriod.includes('18th')) {
    return `${clothingQuality} 1700s clothing`;
  }
  
  return `${clothingQuality} ${historicalPeriod} clothing`;
}

export function buildCharacterImagePrompt(characterData: any): string {
  console.log("Building character portrait prompt with new template");
  
  // Use new direct fields first, fall back to metadata
  const historicalPeriod = characterData.historical_period || characterData.metadata?.historical_period || '1700s';
  const region = characterData.region || characterData.metadata?.region || 'Europe';
  
  // Get physical description and clothing
  const physicalDescription = getPhysicalDescription(characterData);
  const clothingDescription = getHistoricalClothing(characterData);
  
  // Build the prompt with the new template
  const century = historicalPeriod.includes('1700') || historicalPeriod.includes('18th') ? '18th-century' : `${historicalPeriod}`;
  
  const prompt = `Full-body portrait. Hyper-realistic art style, conveying historical accuracy. ${physicalDescription}, wearing ${clothingDescription}, ${century} ${region}`;
  
  console.log("Generated character portrait prompt with new template:", prompt);
  return prompt;
}
