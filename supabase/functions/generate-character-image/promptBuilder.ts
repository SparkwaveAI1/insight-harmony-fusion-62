
function getCharacterAppearance(metadata: any): string {
  const age = parseInt(metadata?.age) || 30;
  const gender = metadata?.gender || 'person';
  const physicalAttributes = metadata?.physical_attributes || {};
  
  // Age-based appearance
  let ageAppearance = '';
  if (age < 25) {
    ageAppearance = 'youthful appearance, clear skin, energetic posture';
  } else if (age < 35) {
    ageAppearance = 'young adult appearance, confident bearing';
  } else if (age < 45) {
    ageAppearance = 'mature adult appearance, established presence';
  } else if (age < 55) {
    ageAppearance = 'middle-aged appearance, distinguished look';
  } else if (age < 65) {
    ageAppearance = 'mature appearance, some signs of aging';
  } else {
    ageAppearance = 'older adult appearance, wisdom in features, possible gray hair';
  }
  
  // Physical characteristics
  const height = physicalAttributes.height || 'average height';
  const build = physicalAttributes.build || 'average build';
  const hairColor = physicalAttributes.hair_color || 'brown';
  const hairStyle = physicalAttributes.hair_style || 'period-appropriate';
  const eyeColor = physicalAttributes.eye_color || 'brown';
  const skinTone = physicalAttributes.skin_tone || 'medium';
  
  return `${ageAppearance}, ${height}, ${build}, ${hairColor} ${hairStyle} hair, ${eyeColor} eyes, ${skinTone} skin tone`;
}

function getHistoricalClothing(metadata: any): string {
  const historicalPeriod = metadata?.historical_period || '1700s';
  const occupation = metadata?.occupation || 'common person';
  const socialClass = metadata?.social_class || 'middle class';
  const region = metadata?.region || 'European';
  
  let clothingDescription = '';
  
  // Period-based clothing
  if (historicalPeriod.includes('1700') || historicalPeriod.includes('18th')) {
    if (occupation.toLowerCase().includes('noble') || socialClass.toLowerCase().includes('upper')) {
      clothingDescription = 'elaborate 18th century noble attire with fine fabrics, ornate details, powdered wig';
    } else if (occupation.toLowerCase().includes('merchant') || socialClass.toLowerCase().includes('middle')) {
      clothingDescription = '18th century middle-class clothing with quality fabrics, modest decoration';
    } else {
      clothingDescription = 'simple 18th century working-class clothing, practical and modest';
    }
  } else if (historicalPeriod.includes('1600') || historicalPeriod.includes('17th')) {
    clothingDescription = '17th century period clothing appropriate for their social station';
  } else if (historicalPeriod.includes('1800') || historicalPeriod.includes('19th')) {
    clothingDescription = '19th century period clothing with appropriate social class styling';
  } else {
    clothingDescription = `period-appropriate clothing from ${historicalPeriod} reflecting ${socialClass} status`;
  }
  
  return `${clothingDescription}, authentic historical styling for ${region} region`;
}

export function buildCharacterImagePrompt(characterData: any): string {
  console.log("Generating whole-body character image prompt from character data");
  
  const metadata = characterData.metadata || {};
  
  // Basic information
  const name = characterData.name || 'Historical Character';
  const age = metadata.age || '30';
  const gender = metadata.gender || 'person';
  const historicalPeriod = metadata.historical_period || '1700s';
  const region = metadata.region || 'Europe';
  
  // Get detailed appearance and clothing
  const appearanceDetails = getCharacterAppearance(metadata);
  const clothingDetails = getHistoricalClothing(metadata);
  
  // Build comprehensive whole-body prompt
  let prompt = `Full-body portrait of ${name}, a ${age}-year-old ${gender} from ${historicalPeriod}`;
  
  // Physical appearance
  prompt += `, ${appearanceDetails}`;
  
  // Clothing and period details  
  prompt += `, wearing ${clothingDetails}`;
  
  // Setting and composition
  prompt += `, standing in a historically accurate ${historicalPeriod} setting`;
  prompt += `, full body visible from head to toe, three-quarter view pose`;
  
  // Photography and quality specifications
  prompt += `, professional portrait photography, museum quality, historically accurate`;
  prompt += `, realistic, photorealistic, detailed period clothing, authentic historical atmosphere`;
  prompt += `, studio lighting with period-appropriate background, crisp details`;
  prompt += `, 4K resolution, historical documentary style, full-body composition`;
  
  console.log("Generated character image prompt:", prompt);
  return prompt;
}
