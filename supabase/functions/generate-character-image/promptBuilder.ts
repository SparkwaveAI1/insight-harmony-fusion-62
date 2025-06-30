
export function buildCharacterImagePrompt(characterData: any): string {
  console.log("Generating simple visual prompt for character");
  
  // Use new direct fields first, fall back to metadata for backwards compatibility
  const age = characterData.age || parseInt(characterData.metadata?.age) || 30;
  const gender = characterData.gender || characterData.metadata?.gender || 'person';
  
  // Physical characteristics from physical_appearance or metadata
  const physicalAppearance = characterData.physical_appearance || {};
  const hairColor = physicalAppearance.hair || characterData.metadata?.hair_color || 'brown';
  const eyeColor = physicalAppearance.eye_color || characterData.metadata?.eye_color || 'brown';
  const skinTone = physicalAppearance.skin_tone || characterData.metadata?.skin_tone || 'medium';
  const bodyType = physicalAppearance.height_build || 'average build';
  
  // Historical period for clothing context
  const historicalPeriod = characterData.historical_period || characterData.metadata?.historical_period || '1700s';
  
  // Build simple visual prompt
  let prompt = `Portrait of a ${age}-year-old ${gender}, ${hairColor} hair, ${eyeColor} eyes, ${skinTone} skin, ${bodyType}`;
  
  // Add simple clothing context
  if (historicalPeriod.includes('1700') || historicalPeriod.includes('18th')) {
    prompt += ', 18th century clothing';
  } else if (historicalPeriod.includes('1800') || historicalPeriod.includes('19th')) {
    prompt += ', 19th century clothing';
  } else {
    prompt += ', period clothing';
  }
  
  // Simple style requirements
  prompt += ', portrait style, clean background, photorealistic, no text, no words, no labels';
  
  console.log("Simple character prompt:", prompt);
  return prompt;
}
