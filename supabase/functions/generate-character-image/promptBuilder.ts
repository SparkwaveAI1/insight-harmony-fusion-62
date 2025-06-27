
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
  description.push(`${height}, ${build}`);
  description.push(`${hairColor} ${hairStyle} hair, ${eyeColor} eyes`);
  description.push(`${skinTone} with natural skin texture`);
  
  // Add trait-based details if available
  if (physicalTraits.skin_quality !== undefined) {
    const skinQuality = physicalTraits.skin_quality;
    if (skinQuality > 0.7) {
      description.push('clear, healthy skin');
    } else if (skinQuality > 0.4) {
      description.push('weathered skin with natural aging');
    } else {
      description.push('rough, sun-damaged skin');
    }
  }
  
  if (physicalTraits.build_muscularity !== undefined) {
    const muscularity = physicalTraits.build_muscularity;
    if (muscularity > 0.7) {
      description.push('well-developed muscle tone');
    } else if (muscularity < 0.3) {
      description.push('soft muscle definition');
    }
  }
  
  if (healthTraits.dental_health !== undefined && healthTraits.dental_health < 0.4) {
    description.push('period-appropriate dental condition');
  }
  
  return description.join(', ');
}

function getHistoricalClothing(characterData: any): string {
  const metadata = characterData.metadata || {};
  const historicalPeriod = metadata?.historical_period || '1700s';
  const occupation = metadata?.occupation || 'common person';
  const socialClass = metadata?.social_class || 'middle class';
  const region = metadata?.region || 'European';
  
  const isFrontier = region.toLowerCase().includes('virginia') || 
                    region.toLowerCase().includes('frontier') || 
                    region.toLowerCase().includes('colony') ||
                    region.toLowerCase().includes('america');
  
  if (historicalPeriod.includes('1700') || historicalPeriod.includes('18th')) {
    if (isFrontier) {
      return 'practical 18th century frontier clothing: linen shirt, wool vest, leather breeches, sturdy boots';
    } else if (socialClass.toLowerCase().includes('upper')) {
      return 'elegant 18th century noble attire with fine fabrics';
    } else {
      return '18th century middle-class clothing with quality materials';
    }
  }
  
  return `period-appropriate ${historicalPeriod} clothing reflecting ${socialClass} status`;
}

function getHistoricalBackground(characterData: any): string {
  const metadata = characterData.metadata || {};
  const historicalPeriod = metadata?.historical_period || '1700s';
  const region = metadata?.region || 'European';
  const occupation = metadata?.occupation || '';
  
  const isFrontier = region.toLowerCase().includes('virginia') || 
                    region.toLowerCase().includes('frontier') || 
                    region.toLowerCase().includes('colony') ||
                    region.toLowerCase().includes('america');
  
  if (historicalPeriod.includes('1700') || historicalPeriod.includes('18th')) {
    if (isFrontier) {
      if (occupation.toLowerCase().includes('farm') || occupation.toLowerCase().includes('land')) {
        return 'rustic colonial farmstead with wooden buildings and cleared fields';
      } else {
        return 'frontier settlement with log cabins and forest in the background';
      }
    } else {
      return 'elegant 18th century interior with period furnishings';
    }
  }
  
  return `authentic ${historicalPeriod} setting appropriate to the time period`;
}

export function buildCharacterImagePrompt(characterData: any): string {
  console.log("Building new hyper-realistic character portrait prompt");
  
  const name = characterData.name || 'Historical Character';
  const historicalPeriod = characterData.metadata?.historical_period || '1700s';
  const region = characterData.metadata?.region || 'Europe';
  
  // Get physical description, clothing, and background
  const physicalDescription = getPhysicalDescription(characterData);
  const clothingDescription = getHistoricalClothing(characterData);
  const backgroundDescription = getHistoricalBackground(characterData);
  
  // Build the new prompt with more body visibility and historical background
  let prompt = `Three-quarter body portrait of ${name} from ${historicalPeriod} in ${region}. `;
  prompt += `Physical appearance: ${physicalDescription}. `;
  prompt += `Clothing: ${clothingDescription}. `;
  prompt += `Background: ${backgroundDescription}. `;
  prompt += `Hyper-realistic art style with attention to detail, conveying emotion and depth, `;
  prompt += `natural skin texture, authentic aging and natural imperfections. `;
  prompt += `Professional portrait composition with natural lighting, showing from waist up or more of the body.`;
  
  console.log("Generated hyper-realistic portrait prompt:", prompt);
  return prompt;
}
