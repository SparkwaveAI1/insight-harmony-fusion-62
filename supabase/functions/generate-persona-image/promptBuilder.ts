
function getAgeHealthAppearance(metadata: any): string {
  const age = parseInt(metadata?.age) || 30;
  const healthStatus = metadata?.physical_health_status || 'average';
  const fitnessLevel = metadata?.fitness_activity_level || 0.5;
  
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

export function buildImagePrompt(personaData: any): string {
  console.log("Generating clean realistic image prompt from persona data");
  
  const metadata = personaData.metadata || {};
  
  // Basic demographic information
  const age = metadata.age || '30';
  const gender = metadata.gender || 'person';
  const ethnicity = metadata.race_ethnicity || 'diverse';
  
  // Physical characteristics
  const height = metadata.height || 'average height';
  const bodyType = metadata.build_body_type || 'average build';
  const hairColor = metadata.hair_color || 'brown';
  const hairStyle = metadata.hair_style || 'medium length';
  const eyeColor = metadata.eye_color || 'brown';
  const skinTone = metadata.skin_tone || 'medium';
  
  // Clothing and style
  const fashionSense = metadata.style_fashion_sense || 'casual';
  const occupation = metadata.occupation || 'professional';
  
  // Enhanced appearance details
  const ageHealthAppearance = getAgeHealthAppearance(metadata);
  
  // Build clean visual prompt
  let prompt = `Professional portrait of a ${age}-year-old ${gender}`;
  
  if (ethnicity && ethnicity !== 'diverse') {
    prompt += ` of ${ethnicity} ethnicity`;
  }
  
  // Physical features
  prompt += `, ${ageHealthAppearance}`;
  prompt += `, ${hairColor} ${hairStyle} hair, ${eyeColor} eyes, ${skinTone} skin tone`;
  prompt += `, ${bodyType}, ${height}`;
  
  // Style and presentation
  prompt += `, dressed in ${fashionSense} attire suitable for a ${occupation}`;
  
  // Photography style - emphasize clean visual
  prompt += `, professional headshot, clean background, high quality portrait photography`;
  prompt += `, realistic, photorealistic, natural expression, professional lighting`;
  prompt += `, studio quality, crisp details, 4K resolution`;
  
  // Strong emphasis on no text
  prompt += `, no text, no words, no letters, no annotations, no labels, no captions, clean image without written content`;
  
  console.log("Generated clean persona image prompt:", prompt);
  return prompt;
}
