
export function buildCharacterImagePrompt(characterData: any): string {
  console.log("Building character image prompt with new format");
  console.log("Character data:", characterData);
  
  // Extract key information from character data
  const name = characterData.name || 'Unknown';
  const gender = characterData.gender || characterData.trait_profile?.gender || 'person';
  const age = characterData.age || characterData.trait_profile?.age || '30';
  const ethnicity = characterData.ethnicity || characterData.trait_profile?.ethnicity || characterData.trait_profile?.race_ethnicity || '';
  const height = characterData.trait_profile?.height_build || characterData.height_build || '';
  const appearance = characterData.appearance || characterData.trait_profile?.appearance || characterData.trait_profile?.physical_appearance || '';
  
  // Extract historical context
  const historicalPeriod = characterData.historical_period || characterData.trait_profile?.historical_period || '';
  const region = characterData.region || characterData.trait_profile?.region || '';
  const culturalContext = characterData.trait_profile?.cultural_context || characterData.trait_profile?.cultural_background || '';
  const socialClass = characterData.social_class || characterData.trait_profile?.social_class || '';
  const occupation = characterData.occupation || characterData.trait_profile?.occupation || '';
  
  // Determine year of birth from historical period or age
  let yearOfBirth = '';
  if (historicalPeriod) {
    // Extract year from historical period if available
    const yearMatch = historicalPeriod.match(/(\d{4})/);
    if (yearMatch) {
      const periodYear = parseInt(yearMatch[1]);
      const currentAge = parseInt(age) || 30;
      yearOfBirth = (periodYear - currentAge).toString();
    } else if (historicalPeriod.toLowerCase().includes('1600') || region.toLowerCase().includes('gujarat')) {
      // Default to 1600s for Gujarat context
      const currentAge = parseInt(age) || 30;
      yearOfBirth = (1650 - currentAge).toString();
    }
  }
  
  // Build the new prompt format
  let prompt = `Create: photorealistic historical character, ${gender}, ${age} years old`;
  
  if (yearOfBirth) {
    prompt += `, born ${yearOfBirth}`;
  }
  
  if (ethnicity) {
    prompt += `, ${ethnicity}`;
  }
  
  if (height) {
    prompt += `, ${height}`;
  }
  
  if (appearance) {
    prompt += `, ${appearance}`;
  }
  
  // Add historical and cultural context
  if (historicalPeriod) {
    prompt += `, from ${historicalPeriod}`;
  }
  
  if (region) {
    prompt += `, ${region}`;
  }
  
  if (culturalContext) {
    prompt += `, ${culturalContext}`;
  }
  
  if (socialClass) {
    prompt += `, ${socialClass}`;
  }
  
  if (occupation) {
    prompt += `, working as ${occupation}`;
  }
  
  // Add specific styling instructions for historical accuracy
  prompt += ', wearing period-accurate clothing and hairstyle';
  prompt += ', authentic historical appearance';
  prompt += ', detailed portrait';
  prompt += ', professional photography style';
  prompt += ', clean background';
  prompt += ', single person';
  prompt += ', no modern elements';
  
  console.log("Generated historical prompt:", prompt);
  return prompt;
}
