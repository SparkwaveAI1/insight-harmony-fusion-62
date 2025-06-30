
export function buildHistoricalCharacterImagePrompt(characterData: any): string {
  console.log("Generating visual prompt for historical character using simple demographics");
  
  // Extract basic demographic information for simple prompt
  const age = characterData.age || '30';
  const gender = characterData.gender || 'person';
  
  // Get physical appearance from the dedicated description field or build from basic traits
  let physicalDescription = '';
  
  if (characterData.physical_appearance_description) {
    physicalDescription = characterData.physical_appearance_description;
  } else {
    // Build from basic demographic fields (fallback)
    const hairColor = characterData.hair || 'brown';
    const eyeColor = characterData.eye_color || 'brown';
    const skinTone = characterData.skin_tone || 'medium';
    const bodyType = characterData.height_build || 'average build';
    
    physicalDescription = `${age}-year-old ${gender}, ${hairColor} hair, ${eyeColor} eyes, ${skinTone} skin, ${bodyType}`;
  }
  
  // Build clean visual prompt with explicit instructions for OpenAI
  let prompt = `IMPORTANT: Focus only on the physical appearance details provided below. Create an accurate visual representation of this historical character with a neutral background.

Physical description: ${physicalDescription}`;
  
  // Add historical period context if available
  if (characterData.historical_period) {
    prompt += `, period-appropriate clothing from ${characterData.historical_period}`;
  }
  
  // Add professional image requirements with explicit neutral background instruction
  prompt += ', professional portrait, neutral background, photorealistic, high quality, detailed, accurate representation, no text, no words, no labels, no annotations';
  
  console.log("Historical character appearance prompt:", prompt);
  return prompt;
}
