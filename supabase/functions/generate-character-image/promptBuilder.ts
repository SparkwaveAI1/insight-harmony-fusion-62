
export function buildCharacterImagePrompt(characterData: any): string {
  console.log("Generating visual prompt for character using physical appearance description");
  
  // Try to get the dedicated physical appearance description first
  let physicalDescription = '';
  
  // Check for the new physical appearance description field
  if (characterData.physical_appearance_description) {
    physicalDescription = characterData.physical_appearance_description;
  }
  // Fallback to physical_appearance object if available
  else if (characterData.physical_appearance && typeof characterData.physical_appearance === 'object') {
    const pa = characterData.physical_appearance;
    const parts = [];
    if (pa.height_build) parts.push(pa.height_build);
    if (pa.hair) parts.push(`${pa.hair} hair`);
    if (pa.eye_color) parts.push(`${pa.eye_color} eyes`);
    if (pa.skin_tone) parts.push(`${pa.skin_tone} skin`);
    physicalDescription = parts.join(', ');
  }
  // Final fallback to basic demographic info
  else {
    const age = characterData.age || 30;
    const gender = characterData.gender || 'person';
    const historicalPeriod = characterData.historical_period || '1700s';
    
    physicalDescription = `${age}-year-old ${gender}`;
    
    // Add period-appropriate clothing
    if (historicalPeriod.includes('1700') || historicalPeriod.includes('18th')) {
      physicalDescription += ', 18th century period clothing';
    } else if (historicalPeriod.includes('1800') || historicalPeriod.includes('19th')) {
      physicalDescription += ', 19th century period clothing';
    } else {
      physicalDescription += ', period-appropriate clothing';
    }
  }
  
  // Build clean visual prompt focused on appearance only
  let prompt = `Portrait of ${physicalDescription}`;
  
  // Add professional image requirements
  prompt += ', professional portrait, clean background, photorealistic, high quality, detailed, no text, no words, no labels, no annotations';
  
  console.log("Character appearance prompt:", prompt);
  return prompt;
}
