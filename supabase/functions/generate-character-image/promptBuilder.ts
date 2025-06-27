
function getPhysicalDescription(characterData: any): string {
  const metadata = characterData.metadata || {};
  const traitProfile = characterData.trait_profile || {};
  
  const age = parseInt(metadata?.age) || 30;
  const gender = metadata?.gender || 'person';
  
  // Basic physical attributes from metadata
  const height = metadata?.height || 'average height';
  const build = metadata?.build_body_type || 'average build';
  const hairColor = metadata?.hair_color || 'brown';
  const hairStyle = metadata?.hair_style || 'period-appropriate style';
  const eyeColor = metadata?.eye_color || 'brown';
  const skinTone = metadata?.skin_tone || 'natural complexion';
  
  // Physical appearance traits if available
  const physicalTraits = traitProfile.physical_appearance || {};
  const healthTraits = traitProfile.physical_health || {};
  
  let description = [];
  
  // Age and basic description
  description.push(`${age}-year-old ${gender}`);
  description.push(`${height} and ${build}`);
  description.push(`${hairColor} hair in ${hairStyle}`);
  description.push(`${eyeColor} eyes`);
  
  // Add skin and aging details
  let skinDescription = skinTone;
  if (physicalTraits.skin_quality !== undefined) {
    const skinQuality = physicalTraits.skin_quality;
    if (skinQuality > 0.7) {
      skinDescription += ' with clear, healthy skin';
    } else if (skinQuality > 0.4) {
      skinDescription += ' with weathered skin and natural aging';
    } else {
      skinDescription += ' with rough, sun-damaged skin and visible aging';
    }
  } else {
    skinDescription += ' with weathered skin and natural aging';
  }
  
  if (physicalTraits.build_muscularity !== undefined) {
    const muscularity = physicalTraits.build_muscularity;
    if (muscularity > 0.7) {
      skinDescription += ' and muscle tone';
    } else if (muscularity > 0.4) {
      skinDescription += ' and moderate muscle tone';
    }
  } else {
    skinDescription += ' and muscle tone';
  }
  
  description.push(skinDescription);
  
  return description.join(', ');
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
  console.log("Building character portrait prompt with new structure");
  
  const name = characterData.name || 'Historical Character';
  const historicalPeriod = characterData.metadata?.historical_period || '1700s';
  const region = characterData.metadata?.region || 'Europe';
  
  // Get physical description and clothing
  const physicalDescription = getPhysicalDescription(characterData);
  const clothingDescription = getHistoricalClothing(characterData);
  
  // Build the prompt in the new structure
  const century = historicalPeriod.includes('1700') || historicalPeriod.includes('18th') ? '18th-century' : `${historicalPeriod}`;
  
  const prompt = `Full-body photorealistic portrait of ${name}, a ${physicalDescription} in ${century} ${region}.
Wearing ${clothingDescription}.
Neutral background, natural lighting.
Realistic skin texture, visible imperfections, period-accurate expression and emotion.`;
  
  console.log("Generated character portrait prompt:", prompt);
  return prompt;
}
