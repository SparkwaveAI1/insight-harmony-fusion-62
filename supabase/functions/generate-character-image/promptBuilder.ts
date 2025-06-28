
function getPhysicalDescription(characterData: any): string {
  // Use the new direct fields first, fall back to metadata for backwards compatibility
  const age = characterData.age || parseInt(characterData.metadata?.age) || 30;
  const gender = characterData.gender || characterData.metadata?.gender || 'person';
  
  // Physical attributes from new direct fields or metadata
  const physicalAppearance = characterData.physical_appearance || {};
  const height = physicalAppearance.height || characterData.metadata?.height || 'average height';
  const build = physicalAppearance.build_body_type || characterData.metadata?.build_body_type || 'average build';
  const hairColor = physicalAppearance.hair_color || characterData.metadata?.hair_color || 'brown';
  const hairStyle = physicalAppearance.hair_style || characterData.metadata?.hair_style || 'practical unstyled';
  const eyeColor = physicalAppearance.eye_color || characterData.metadata?.eye_color || 'brown';
  const skinTone = physicalAppearance.skin_tone || characterData.metadata?.skin_tone || 'natural complexion';
  const ethnicity = physicalAppearance.ethnicity || characterData.metadata?.ethnicity || characterData.ethnicity;
  
  // Handle specific historical figures with known appearances
  if (characterData.name && characterData.name.toLowerCase().includes('toussaint')) {
    return `${age}-year-old Black ${gender}, ${height}, ${build}, short dark hair, dark eyes, dark complexion, of African descent`;
  }
  
  // Build consolidated description with ethnicity consideration
  let description = `${age}-year-old ${gender}, ${height}, ${build}, ${hairColor} ${hairStyle} hair, ${eyeColor} eyes, ${skinTone}`;
  
  // Add ethnicity information if available
  if (ethnicity && ethnicity !== 'Not specified') {
    if (ethnicity.toLowerCase().includes('african') || ethnicity.toLowerCase().includes('black')) {
      description = description.replace('natural complexion', 'dark complexion');
      description += ', of African descent';
    } else if (ethnicity.toLowerCase().includes('european') || ethnicity.toLowerCase().includes('white')) {
      description += ', of European descent';
    } else if (ethnicity.toLowerCase().includes('indigenous') || ethnicity.toLowerCase().includes('native')) {
      description += ', of Indigenous descent';
    } else if (ethnicity.toLowerCase().includes('asian')) {
      description += ', of Asian descent';
    } else if (ethnicity.toLowerCase().includes('middle eastern')) {
      description += ', of Middle Eastern descent';
    } else if (ethnicity.toLowerCase().includes('mixed') || ethnicity.toLowerCase().includes('multiracial')) {
      description += ', of mixed heritage';
    }
  }
  
  return description;
}

function getHistoricalClothing(characterData: any): string {
  // Use new direct fields first, fall back to metadata
  const historicalPeriod = characterData.historical_period || characterData.metadata?.historical_period || '1700s';
  const socialClass = characterData.social_class || characterData.metadata?.social_class || 'middle class';
  const region = characterData.region || characterData.metadata?.region || 'European';
  const occupation = characterData.occupation || characterData.metadata?.occupation;
  
  const isCaribbean = region.toLowerCase().includes('haiti') || 
                     region.toLowerCase().includes('caribbean') || 
                     region.toLowerCase().includes('santo domingo');
  
  const isFrontier = region.toLowerCase().includes('virginia') || 
                    region.toLowerCase().includes('frontier') || 
                    region.toLowerCase().includes('colony') ||
                    region.toLowerCase().includes('america') ||
                    region.toLowerCase().includes('tn') ||
                    region.toLowerCase().includes('tennessee');
  
  // Handle specific historical figures
  if (characterData.name && characterData.name.toLowerCase().includes('toussaint')) {
    return 'military uniform of a Haitian revolutionary general, 18th-century colonial military dress with tropical adaptations';
  }
  
  let clothingQuality = 'well-worn middle-class';
  if (socialClass.toLowerCase().includes('upper')) {
    clothingQuality = 'fine but lived-in upper-class';
  } else if (socialClass.toLowerCase().includes('lower')) {
    clothingQuality = 'practical worn working-class';
  } else {
    clothingQuality = 'well-worn middle-class';
  }
  
  // Handle military occupations
  if (occupation && (occupation.toLowerCase().includes('military') || 
                    occupation.toLowerCase().includes('general') || 
                    occupation.toLowerCase().includes('soldier'))) {
    return `${clothingQuality} military uniform appropriate for ${historicalPeriod}`;
  }
  
  // Regional clothing adaptations
  if (isCaribbean) {
    return `${clothingQuality} ${historicalPeriod} clothing adapted for tropical climate`;
  }
  
  if (historicalPeriod.includes('1700') || historicalPeriod.includes('18th')) {
    return `${clothingQuality} 1700s clothing`;
  }
  
  return `${clothingQuality} ${historicalPeriod} clothing`;
}

export function buildCharacterImagePrompt(characterData: any): string {
  console.log("Building character portrait prompt with enhanced template");
  
  // Use new direct fields first, fall back to metadata
  const historicalPeriod = characterData.historical_period || characterData.metadata?.historical_period || '1700s';
  const region = characterData.region || characterData.metadata?.region || 'Europe';
  
  // Get physical description and clothing
  const physicalDescription = getPhysicalDescription(characterData);
  const clothingDescription = getHistoricalClothing(characterData);
  
  // Build the prompt with enhanced accuracy
  const century = historicalPeriod.includes('1700') || historicalPeriod.includes('18th') ? '18th-century' : `${historicalPeriod}`;
  
  const prompt = `Historical portrait painting style. Accurate historical representation. ${physicalDescription}, wearing ${clothingDescription}, ${century} ${region}. Professional historical accuracy, dignified pose, period-appropriate lighting and composition.`;
  
  console.log("Generated enhanced character portrait prompt:", prompt);
  return prompt;
}
