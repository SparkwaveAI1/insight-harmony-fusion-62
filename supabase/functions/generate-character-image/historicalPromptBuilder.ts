
export const HISTORICAL_STYLES = {
  photorealistic: {
    prompt: "photorealistic historical portrait, museum quality, authentic period details",
    quality: "hd",
    openaiStyle: "natural"
  },
  cinematic: {
    prompt: "cinematic historical portrait, dramatic period lighting, epic historical drama style",
    quality: "hd", 
    openaiStyle: "vivid"
  },
  artistic: {
    prompt: "artistic historical portrait, Renaissance painting style, classical composition",
    quality: "hd",
    openaiStyle: "natural"
  },
  portrait: {
    prompt: "formal historical portrait, studio lighting, period-appropriate pose and setting",
    quality: "hd",
    openaiStyle: "natural"
  }
};

export function buildHistoricalCharacterImagePrompt(characterData: any, style: string = 'photorealistic', customText: string = ''): string {
  console.log("Building historical character image prompt with exact user format");
  console.log("Character data:", JSON.stringify(characterData, null, 2));
  console.log("Custom instructions:", customText);
  
  // Extract key information from character data
  const name = characterData.name || 'Unknown';
  const gender = characterData.gender || characterData.trait_profile?.gender || 'person';
  const age = characterData.age || characterData.trait_profile?.age || '30';
  const ethnicity = characterData.ethnicity || characterData.trait_profile?.ethnicity || characterData.trait_profile?.race_ethnicity || '';
  const heightBuild = characterData.trait_profile?.height_build || characterData.height_build || '';
  const appearance = characterData.appearance || characterData.trait_profile?.appearance || characterData.trait_profile?.physical_appearance || '';
  
  // Extract historical context
  const historicalPeriod = characterData.historical_period || characterData.trait_profile?.historical_period || '';
  const region = characterData.region || characterData.trait_profile?.region || '';
  const culturalContext = characterData.trait_profile?.cultural_context || characterData.trait_profile?.cultural_background || '';
  const socialClass = characterData.social_class || characterData.trait_profile?.social_class || '';
  const occupation = characterData.occupation || characterData.trait_profile?.occupation || '';
  
  // Use existing date_of_birth if available, otherwise calculate from historical period
  let yearOfBirth = '';
  if (characterData.date_of_birth) {
    yearOfBirth = characterData.date_of_birth.toString();
    console.log("Using existing date_of_birth:", yearOfBirth);
  } else if (historicalPeriod) {
    // Extract year from historical period if available
    const yearMatch = historicalPeriod.match(/(\d{4})/);
    if (yearMatch) {
      const periodYear = parseInt(yearMatch[1]);
      const currentAge = parseInt(age) || 30;
      yearOfBirth = (periodYear - currentAge).toString();
      console.log("Calculated year of birth from period:", yearOfBirth);
    } else if (historicalPeriod.toLowerCase().includes('17th') || region.toLowerCase().includes('gujarat')) {
      // Default to mid-1600s for Gujarat context
      const currentAge = parseInt(age) || 30;
      yearOfBirth = (1650 - currentAge).toString();
      console.log("Using default 1600s calculation:", yearOfBirth);
    }
  }
  
  // Start with priority custom instructions if provided
  let prompt = '';
  if (customText && customText.trim()) {
    prompt = `IMPORTANT INSTRUCTIONS: ${customText.trim()}. `;
    console.log("Added high-priority custom instructions to beginning of prompt");
  }
  
  // Build EXACTLY the user's format: Create: [style] historical character, [gender], [age] years old, born [year], [ethnicity], [height/build], [appearance], from [period], [region], [cultural context], [social class], working as [occupation]
  prompt += `Create: ${style} historical character, ${gender}, ${age} years old`;
  
  if (yearOfBirth) {
    prompt += `, born ${yearOfBirth}`;
  }
  
  if (ethnicity) {
    prompt += `, ${ethnicity}`;
  }
  
  if (heightBuild) {
    prompt += `, ${heightBuild}`;
  }
  
  if (appearance) {
    prompt += `, ${appearance}`;
  }
  
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
  
  // Add composition instructions based on style to encourage full-body shots
  if (style === 'cinematic') {
    prompt += ', full body shot, dramatic wide angle, complete figure visible from head to toe, cinematic composition';
  } else if (style === 'photorealistic') {
    prompt += ', full body photograph, standing pose, entire figure visible, museum quality lighting';
  } else if (style === 'artistic') {
    prompt += ', full length artistic rendering, complete figure composition, classical full body pose';
  } else if (style === 'portrait') {
    prompt += ', formal full body portrait, standing in period-appropriate setting, head to toe composition';
  }
  
  // Reinforce custom instructions at the end for emphasis
  if (customText && customText.trim()) {
    prompt += `. SPECIFICALLY: ${customText.trim()}`;
    console.log("Reinforced custom instructions at end of prompt");
  }
  
  console.log("Generated prioritized prompt with custom instructions:", prompt);
  return prompt;
}
