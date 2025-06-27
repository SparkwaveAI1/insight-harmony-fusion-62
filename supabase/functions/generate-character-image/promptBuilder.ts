
function getPhysicalDescription(characterData: any): string {
  const metadata = characterData.metadata || {};
  
  const age = parseInt(metadata?.age) || 30;
  const gender = metadata?.gender || 'person';
  
  // Basic physical attributes from metadata
  const height = metadata?.height || 'average height';
  const build = metadata?.build_body_type || 'average build';
  const hairColor = metadata?.hair_color || 'brown';
  const hairStyle = metadata?.hair_style || 'period-appropriate style';
  const eyeColor = metadata?.eye_color || 'brown';
  const skinTone = metadata?.skin_tone || 'natural complexion';
  
  // Build consolidated description
  let description = `${age}-year-old ${gender}, ${height}, ${build}, ${hairColor} ${hairStyle} hair, ${eyeColor} eyes, ${skinTone}`;
  
  return description;
}

function getHistoricalClothing(characterData: any): string {
  const metadata = characterData.metadata || {};
  const historicalPeriod = metadata?.historical_period || '1700s';
  const socialClass = metadata?.social_class || 'middle class';
  const region = metadata?.region || 'European';
  
  const isFrontier = region.toLowerCase().includes('virginia') || 
                    region.toLowerCase().includes('frontier') || 
                    region.toLowerCase().includes('colony') ||
                    region.toLowerCase().includes('america') ||
                    region.toLowerCase().includes('tn') ||
                    region.toLowerCase().includes('tennessee');
  
  let clothingQuality = 'middle-class';
  if (socialClass.toLowerCase().includes('upper')) {
    clothingQuality = 'high-quality upper-class';
  } else if (socialClass.toLowerCase().includes('lower')) {
    clothingQuality = 'practical working-class';
  } else {
    clothingQuality = 'high-quality middle-class';
  }
  
  if (historicalPeriod.includes('1700') || historicalPeriod.includes('18th')) {
    return `${clothingQuality} 1700s clothing`;
  }
  
  return `${clothingQuality} ${historicalPeriod} clothing`;
}

export function buildCharacterImagePrompt(characterData: any): string {
  console.log("Building character portrait prompt with simplified structure");
  
  const historicalPeriod = characterData.metadata?.historical_period || '1700s';
  const region = characterData.metadata?.region || 'Europe';
  
  // Get physical description and clothing
  const physicalDescription = getPhysicalDescription(characterData);
  const clothingDescription = getHistoricalClothing(characterData);
  
  // Build the prompt with the requested structure
  const century = historicalPeriod.includes('1700') || historicalPeriod.includes('18th') ? '18th-century' : `${historicalPeriod}`;
  
  const prompt = `Full-body portrait Hyper-realistic art style, ${physicalDescription}, wearing ${clothingDescription}, ${century} ${region}, natural lighting, neutral background`;
  
  console.log("Generated simplified character portrait prompt:", prompt);
  return prompt;
}
