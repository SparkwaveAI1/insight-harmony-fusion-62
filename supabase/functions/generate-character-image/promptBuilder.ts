
function getCharacterAppearance(metadata: any): string {
  const age = parseInt(metadata?.age) || 30;
  const gender = metadata?.gender || 'person';
  const physicalAttributes = metadata?.physical_attributes || {};
  
  // Age-based appearance with frontier realism
  let ageAppearance = '';
  if (age < 25) {
    ageAppearance = 'youthful but weathered face, sun-worn skin, calloused hands from hard work';
  } else if (age < 35) {
    ageAppearance = 'young adult with weathered features, sun-damaged skin, work-hardened appearance';
  } else if (age < 45) {
    ageAppearance = 'mature adult with deeply weathered face, sun-leathered skin, scars from frontier life';
  } else if (age < 55) {
    ageAppearance = 'middle-aged with deeply lined face, sun-beaten skin, graying hair, worn hands';
  } else if (age < 65) {
    ageAppearance = 'mature appearance with deeply weathered features, sun-damaged skin, significant graying';
  } else {
    ageAppearance = 'elderly with deeply lined, sun-weathered face, calloused hands, silver-gray hair';
  }
  
  // Physical characteristics with frontier realism
  const height = physicalAttributes.height || 'average height';
  const build = physicalAttributes.build || 'lean and muscular from hard labor';
  const hairColor = physicalAttributes.hair_color || 'brown';
  const hairStyle = physicalAttributes.hair_style || 'practical, roughly cut';
  const eyeColor = physicalAttributes.eye_color || 'brown';
  const skinTone = physicalAttributes.skin_tone || 'sun-weathered and tanned';
  
  return `${ageAppearance}, ${height}, ${build}, ${hairColor} ${hairStyle} hair, ${eyeColor} eyes, ${skinTone} skin with natural sun exposure and weathering`;
}

function getHistoricalClothing(metadata: any): string {
  const historicalPeriod = metadata?.historical_period || '1700s';
  const occupation = metadata?.occupation || 'common person';
  const socialClass = metadata?.social_class || 'middle class';
  const region = metadata?.region || 'European';
  
  let clothingDescription = '';
  
  // Check if this is frontier/colonial America
  const isFrontier = region.toLowerCase().includes('virginia') || 
                    region.toLowerCase().includes('frontier') || 
                    region.toLowerCase().includes('colony') ||
                    region.toLowerCase().includes('america');
  
  // Period-based clothing with frontier realism
  if (historicalPeriod.includes('1700') || historicalPeriod.includes('18th')) {
    if (isFrontier) {
      clothingDescription = 'practical frontier clothing: worn linen shirt, leather or wool vest, rough-hewn breeches, sturdy boots, clothing showing wear from hard frontier life, patched and mended garments, earth-stained from outdoor work';
    } else if (occupation.toLowerCase().includes('noble') || socialClass.toLowerCase().includes('upper')) {
      clothingDescription = 'fine 18th century noble attire with rich fabrics, ornate details, but showing some wear from daily use';
    } else if (occupation.toLowerCase().includes('merchant') || socialClass.toLowerCase().includes('middle')) {
      clothingDescription = '18th century middle-class clothing with quality but practical fabrics, modest decoration, showing normal wear';
    } else {
      clothingDescription = 'simple 18th century working-class clothing, practical and modest, showing wear from daily labor';
    }
  } else if (historicalPeriod.includes('1600') || historicalPeriod.includes('17th')) {
    clothingDescription = '17th century period clothing appropriate for their social station, showing realistic wear';
  } else if (historicalPeriod.includes('1800') || historicalPeriod.includes('19th')) {
    clothingDescription = '19th century period clothing with appropriate social class styling, showing normal use';
  } else {
    clothingDescription = `period-appropriate clothing from ${historicalPeriod} reflecting ${socialClass} status, showing realistic wear and use`;
  }
  
  return clothingDescription;
}

function getHistoricalBackground(metadata: any): string {
  const historicalPeriod = metadata?.historical_period || '1700s';
  const region = metadata?.region || 'European';
  const occupation = metadata?.occupation || 'common person';
  
  // Check if this is frontier/colonial America
  const isFrontier = region.toLowerCase().includes('virginia') || 
                    region.toLowerCase().includes('frontier') || 
                    region.toLowerCase().includes('colony') ||
                    region.toLowerCase().includes('america');
  
  let backgroundDescription = '';
  
  if (historicalPeriod.includes('1700') || historicalPeriod.includes('18th')) {
    if (isFrontier) {
      backgroundDescription = 'rustic colonial Virginia frontier setting with rough-hewn log structures, natural woodland environment, wooden tools and period implements visible, authentic 1700s frontier atmosphere with natural lighting';
    } else if (occupation.toLowerCase().includes('noble') || region.toLowerCase().includes('europe')) {
      backgroundDescription = '18th century European manor grounds with stone architecture, manicured gardens, period furnishings visible, elegant historical setting';
    } else {
      backgroundDescription = '18th century middle-class home exterior or courtyard with modest wooden architecture, simple period decorations, authentic historical environment';
    }
  } else if (historicalPeriod.includes('1600') || historicalPeriod.includes('17th')) {
    backgroundDescription = '17th century outdoor setting with period-appropriate architecture and natural environment';
  } else if (historicalPeriod.includes('1800') || historicalPeriod.includes('19th')) {
    backgroundDescription = '19th century outdoor setting reflecting the period and social class with appropriate architecture';
  } else {
    backgroundDescription = `period-appropriate outdoor setting from ${historicalPeriod} reflecting the social and regional context with natural lighting`;
  }
  
  return backgroundDescription;
}

export function buildCharacterImagePrompt(characterData: any): string {
  console.log("Generating full body HDR photograph from character data");
  
  const metadata = characterData.metadata || {};
  
  // Basic information
  const name = characterData.name || 'Historical Character';
  const age = metadata.age || '30';
  const gender = metadata.gender || 'person';
  const historicalPeriod = metadata.historical_period || '1700s';
  const region = metadata.region || 'Europe';
  
  // Get detailed appearance, clothing, and background
  const appearanceDetails = getCharacterAppearance(metadata);
  const clothingDetails = getHistoricalClothing(metadata);
  const backgroundDetails = getHistoricalBackground(metadata);
  
  // Build comprehensive full body HDR prompt
  let prompt = `An HDR photograph of ${name}, a ${age}-year-old ${gender} from ${historicalPeriod} in ${region}`;
  
  // Physical appearance with realism
  prompt += ` with ${appearanceDetails}`;
  
  // Clothing and period details with wear
  prompt += `, wearing ${clothingDetails}`;
  
  // Historical background setting
  prompt += `, in ${backgroundDetails}`;
  
  // Full body composition and HDR specifications
  prompt += `, full body shot, standing pose, complete figure from head to feet visible`;
  prompt += `, focusing on capturing a wide range of light and detail`;
  prompt += `, using studio lighting conditions to enhance the lifelike quality and create a vibrant, detailed image`;
  
  // Photography and quality specifications with HDR emphasis
  prompt += `, HDR photography, professional historical documentation style`;
  prompt += `, photorealistic, ultra-realistic skin texture, enhanced dynamic range lighting`;
  prompt += `, authentic historical atmosphere with vibrant colors and rich detail`;
  prompt += `, high contrast, detailed shadows and highlights, museum quality documentation`;
  prompt += `, single subject composition, no duplicates, complete body visible`;
  prompt += `, 4K resolution, HDR documentary photography style, authentic historical portraiture`;
  
  // Explicit instructions to avoid AI artifacts
  prompt += `, avoid: cropped body parts, partial figures, multiple subjects, headless bodies, perfect skin, artificial lighting, modern elements`;
  
  console.log("Generated full body HDR character photograph prompt:", prompt);
  return prompt;
}
