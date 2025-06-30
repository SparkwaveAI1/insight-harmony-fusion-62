function getAgeHealthAppearance(characterData: any): string {
  // Use new direct fields first, fall back to metadata for backwards compatibility
  const age = characterData.age || parseInt(characterData.metadata?.age) || 30;
  const healthStatus = characterData.metadata?.physical_health_status || 'average';
  const fitnessLevel = characterData.metadata?.fitness_activity_level || 0.5;
  
  // Convert numeric fitness level to descriptive string
  let fitnessDescription = 'average fitness';
  if (typeof fitnessLevel === 'number') {
    if (fitnessLevel >= 0.8) fitnessDescription = 'very fit and athletic';
    else if (fitnessLevel >= 0.6) fitnessDescription = 'fit and active';
    else if (fitnessLevel >= 0.4) fitnessDescription = 'moderate fitness';
    else if (fitnessLevel >= 0.2) fitnessDescription = 'low fitness';
    else fitnessDescription = 'sedentary lifestyle';
  } else if (typeof fitnessLevel === 'string') {
    // Handle string values if they exist
    fitnessDescription = fitnessLevel.toLowerCase();
  }
  
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
  
  // Combine age and fitness for overall health appearance
  const healthAppearance = healthStatus === 'excellent' ? 'vibrant and healthy' :
                           healthStatus === 'good' ? 'healthy and well-maintained' :
                           healthStatus === 'poor' ? 'showing signs of health challenges' :
                           'average health appearance';
  
  return `${ageAppearance}, ${fitnessDescription}, ${healthAppearance}`;
}

export function buildCharacterImagePrompt(characterData: any): string {
  console.log("Generating clean visual character image prompt from character data");
  
  // Use new direct fields first, fall back to metadata for backwards compatibility
  const age = characterData.age || parseInt(characterData.metadata?.age) || 30;
  const gender = characterData.gender || characterData.metadata?.gender || 'person';
  const ethnicity = characterData.ethnicity || characterData.metadata?.ethnicity || characterData.physical_appearance?.ethnicity || 'diverse';
  
  // Physical characteristics from physical_appearance or metadata
  const physicalAppearance = characterData.physical_appearance || {};
  const height = physicalAppearance.height_build || characterData.metadata?.height || 'average height';
  const bodyType = physicalAppearance.height_build || characterData.metadata?.build_body_type || 'average build';
  const hairColor = physicalAppearance.hair || characterData.metadata?.hair_color || 'brown';
  const eyeColor = physicalAppearance.eye_color || characterData.metadata?.eye_color || 'brown';
  const skinTone = physicalAppearance.skin_tone || characterData.metadata?.skin_tone || 'medium';
  
  // Clothing and style
  const socialClass = characterData.social_class || characterData.metadata?.social_class || 'middle class';
  const occupation = characterData.occupation || characterData.metadata?.occupation || 'professional';
  const historicalPeriod = characterData.historical_period || characterData.metadata?.historical_period || '1700s';
  
  // Enhanced appearance details
  const ageHealthAppearance = getAgeHealthAppearance(characterData);
  
  // Build comprehensive but clean prompt focused on visual elements only
  let prompt = `Portrait of a ${age}-year-old ${gender}`;
  
  if (ethnicity && ethnicity !== 'diverse' && ethnicity !== 'not specified') {
    prompt += ` of ${ethnicity} descent`;
  }
  
  // Physical features - focus on visual description
  prompt += `, ${ageHealthAppearance}`;
  prompt += `, ${hairColor} hair, ${eyeColor} eyes, ${skinTone} complexion`;
  prompt += `, ${bodyType}, ${height}`;
  
  // Historical context and clothing - simplified
  let clothingStyle = 'period clothing';
  if (historicalPeriod.includes('1700') || historicalPeriod.includes('18th')) {
    clothingStyle = '18th century attire';
  } else if (historicalPeriod.includes('1800') || historicalPeriod.includes('19th')) {
    clothingStyle = '19th century clothing';
  } else if (historicalPeriod.includes('medieval')) {
    clothingStyle = 'medieval garments';
  }
  
  // Adjust clothing by social class - keep simple
  if (socialClass.toLowerCase().includes('upper')) {
    clothingStyle = `elegant ${clothingStyle}`;
  } else if (socialClass.toLowerCase().includes('lower')) {
    clothingStyle = `simple ${clothingStyle}`;
  }
  
  prompt += `, wearing ${clothingStyle}`;
  
  // Photography style - emphasize no text
  prompt += `, professional portrait, clean background, high quality, photorealistic`;
  prompt += `, detailed facial features, natural lighting, studio photography`;
  prompt += `, ${historicalPeriod} style portrait`;
  
  // Strong emphasis on no text or annotations
  prompt += `, no text, no words, no letters, no annotations, no labels, no captions, clean image without any written content`;
  
  console.log("Generated clean visual character prompt:", prompt);
  return prompt;
}
