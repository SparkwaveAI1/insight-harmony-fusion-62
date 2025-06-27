
function synthesizePhysicalAppearance(traitProfile: any, metadata: any): string {
  const age = parseInt(metadata?.age) || 30;
  const gender = metadata?.gender || 'person';
  
  // If no trait profile, use basic appearance
  if (!traitProfile?.physical_appearance) {
    return getBasicCharacterAppearance(metadata);
  }
  
  const physicalTraits = traitProfile.physical_appearance;
  const healthTraits = traitProfile.physical_health || {};
  const personality = traitProfile.big_five || {};
  
  let description = [];
  
  // Age and overall condition
  const overallHealth = healthTraits.overall_health_status || 0.5;
  const skinCondition = Math.min(physicalTraits.skin_quality || 0.5, healthTraits.skin_condition || 0.5);
  
  // Synthesize age appearance with health
  if (age < 25) {
    if (overallHealth > 0.7) {
      description.push(`youthful ${age}-year-old with healthy, clear complexion`);
    } else {
      description.push(`young ${age}-year-old with weathered features beyond their years`);
    }
  } else if (age < 40) {
    if (overallHealth > 0.6) {
      description.push(`${age}-year-old adult with natural aging and healthy skin tone`);
    } else {
      description.push(`${age}-year-old with prematurely aged features and worn appearance`);
    }
  } else if (age < 55) {
    description.push(`middle-aged ${age}-year-old with mature features and life experience visible in their face`);
  } else {
    description.push(`older ${age}-year-old with dignified aging and character lines`);
  }
  
  // Synthesize skin appearance realistically
  if (skinCondition > 0.8) {
    description.push('remarkably clear, healthy skin with natural glow');
  } else if (skinCondition > 0.6) {
    description.push('healthy skin with normal aging and natural texture');
  } else if (skinCondition > 0.4) {
    description.push('weathered skin showing signs of outdoor life and natural aging');
  } else if (skinCondition > 0.2) {
    description.push('rough, sun-damaged skin with visible wear from hard living');
  } else {
    description.push('heavily weathered, scarred skin marked by harsh conditions');
  }
  
  // Body type and build
  const buildWeight = physicalTraits.build_weight || 0;
  const muscularity = physicalTraits.build_muscularity || 0.5;
  
  if (buildWeight < -1) {
    description.push('very thin, gaunt frame');
  } else if (buildWeight < -0.5) {
    description.push('lean, wiry build');
  } else if (buildWeight < 0.5) {
    description.push('average, proportionate build');
  } else if (buildWeight < 1) {
    description.push('stocky, solid frame');
  } else {
    description.push('heavy-set, robust build');
  }
  
  if (muscularity > 0.7) {
    description.push('with well-developed muscle tone from physical work');
  } else if (muscularity < 0.3) {
    description.push('with soft, minimal muscle definition');
  }
  
  // Facial features
  const facialSymmetry = physicalTraits.facial_symmetry || 0.5;
  const attractiveness = physicalTraits.overall_attractiveness || 0.5;
  
  if (facialSymmetry > 0.7 && attractiveness > 0.7) {
    description.push('symmetrical, naturally attractive facial features');
  } else if (facialSymmetry > 0.6) {
    description.push('well-proportioned facial features');
  } else if (facialSymmetry < 0.4) {
    description.push('asymmetrical facial features with distinctive character');
  } else {
    description.push('naturally irregular facial features');
  }
  
  // Expression and bearing from personality
  const extraversion = personality.extraversion || 0.5;
  const neuroticism = personality.neuroticism || 0.5;
  const posture = physicalTraits.posture_bearing || 0.5;
  
  if (extraversion > 0.7) {
    description.push('warm, engaging expression');
  } else if (extraversion < 0.3) {
    description.push('reserved, thoughtful expression');
  }
  
  if (neuroticism > 0.7) {
    description.push('with visible tension and worry lines');
  } else if (neuroticism < 0.3) {
    description.push('with calm, relaxed demeanor');
  }
  
  if (posture > 0.7) {
    description.push('upright, confident bearing');
  } else if (posture < 0.4) {
    description.push('slouched, weary posture');
  }
  
  // Specific health conditions affecting appearance
  const dentalHealth = healthTraits.dental_health || 0.5;
  const vision = healthTraits.sensory_vision || 1.0;
  
  if (dentalHealth < 0.3) {
    description.push('poor dental condition typical of the historical period');
  }
  
  if (vision < 0.5) {
    description.push('squinting eyes suggesting vision difficulties');
  }
  
  return description.join(', ');
}

function synthesizeClothingAppearance(traitProfile: any, metadata: any): string {
  const basicClothing = getHistoricalClothing(metadata);
  
  if (!traitProfile?.physical_appearance) {
    return basicClothing;
  }
  
  const physicalTraits = traitProfile.physical_appearance;
  const personality = traitProfile.big_five || {};
  
  let clothingDesc = [basicClothing];
  
  // Synthesize clothing condition
  const quality = physicalTraits.clothing_quality || 0.5;
  const cleanliness = physicalTraits.clothing_cleanliness || 0.5;
  const appropriateness = physicalTraits.clothing_appropriateness || 0.5;
  const conscientiousness = personality.conscientiousness || 0.5;
  
  if (quality > 0.7 && cleanliness > 0.7) {
    clothingDesc.push('well-made, clean garments showing care and attention');
  } else if (quality > 0.5 && cleanliness > 0.5) {
    clothingDesc.push('decent quality clothing in reasonable condition');
  } else if (quality < 0.3 || cleanliness < 0.3) {
    clothingDesc.push('worn, patched clothing showing signs of poverty or neglect');
  } else {
    clothingDesc.push('modest clothing with normal wear from daily use');
  }
  
  if (conscientiousness > 0.7) {
    clothingDesc.push('with meticulous attention to proper dress');
  } else if (conscientiousness < 0.3) {
    clothingDesc.push('with little attention to appearance or grooming');
  }
  
  return clothingDesc.join(', ');
}

function getBasicCharacterAppearance(metadata: any): string {
  const age = parseInt(metadata?.age) || 30;
  const gender = metadata?.gender || 'person';
  const physicalAttributes = metadata?.physical_attributes || {};
  
  // Age-based appearance
  let ageAppearance;
  if (age < 25) {
    ageAppearance = `youthful ${age}-year-old with clear, healthy skin`;
  } else if (age < 40) {
    ageAppearance = `${age}-year-old adult with natural aging and healthy complexion`;
  } else if (age < 55) {
    ageAppearance = `middle-aged ${age}-year-old with mature features and natural aging`;
  } else {
    ageAppearance = `older ${age}-year-old with dignified aging and character lines`;
  }
  
  const height = physicalAttributes.height || 'average height';
  const build = physicalAttributes.build || 'average build';
  const hairColor = physicalAttributes.hair_color || 'brown';
  const hairStyle = physicalAttributes.hair_style || 'period-appropriate style';
  const eyeColor = physicalAttributes.eye_color || 'brown';
  const skinTone = physicalAttributes.skin_tone || 'natural complexion';
  
  return `${ageAppearance}, ${height}, ${build}, ${hairColor} ${hairStyle} hair, ${eyeColor} eyes, ${skinTone} with natural skin texture`;
}

function getHistoricalClothing(metadata: any): string {
  const historicalPeriod = metadata?.historical_period || '1700s';
  const occupation = metadata?.occupation || 'common person';
  const socialClass = metadata?.social_class || 'middle class';
  const region = metadata?.region || 'European';
  
  const isFrontier = region.toLowerCase().includes('virginia') || 
                    region.toLowerCase().includes('frontier') || 
                    region.toLowerCase().includes('colony') ||
                    region.toLowerCase().includes('america');
  
  if (historicalPeriod.includes('1700') || historicalPeriod.includes('18th')) {
    if (isFrontier) {
      return 'practical 18th century frontier clothing: linen shirt, wool vest, leather breeches, sturdy boots';
    } else if (occupation.toLowerCase().includes('noble') || socialClass.toLowerCase().includes('upper')) {
      return 'elegant 18th century noble attire with fine fabrics and quality construction';
    } else if (occupation.toLowerCase().includes('merchant') || socialClass.toLowerCase().includes('middle')) {
      return '18th century middle-class clothing with quality materials and modest decoration';
    } else {
      return 'simple 18th century working-class clothing, practical and functional';
    }
  } else if (historicalPeriod.includes('1600') || historicalPeriod.includes('17th')) {
    return '17th century period clothing appropriate for their social station';
  } else if (historicalPeriod.includes('1800') || historicalPeriod.includes('19th')) {
    return '19th century period clothing with appropriate social class styling';
  } else {
    return `period-appropriate clothing from ${historicalPeriod} reflecting ${socialClass} status`;
  }
}

function getHistoricalBackground(metadata: any): string {
  return 'neutral portrait background with soft natural lighting, professional historical documentation setting';
}

export function buildCharacterImagePrompt(characterData: any): string {
  console.log("Generating enhanced historical portrait from character data");
  
  const metadata = characterData.metadata || {};
  const traitProfile = characterData.trait_profile || {};
  
  const name = characterData.name || 'Historical Character';
  const historicalPeriod = metadata.historical_period || '1700s';
  const region = metadata.region || 'Europe';
  
  // Synthesize comprehensive physical appearance
  const physicalDescription = synthesizePhysicalAppearance(traitProfile, metadata);
  const clothingDescription = synthesizeClothingAppearance(traitProfile, metadata);
  const backgroundDescription = getHistoricalBackground(metadata);
  
  // Build streamlined prompt focused on realistic appearance
  let prompt = `Professional colorized historical portrait of ${name} from ${historicalPeriod} in ${region}. `;
  prompt += `Physical appearance: ${physicalDescription}. `;
  prompt += `Clothing: ${clothingDescription}. `;
  prompt += `Setting: ${backgroundDescription}. `;
  
  // Technical specifications for realism
  prompt += `Style: High-quality colorized vintage photograph with natural lighting, authentic skin texture, `;
  prompt += `realistic human proportions, professional portrait composition, museum-quality historical documentation. `;
  prompt += `Focus on natural, realistic skin with appropriate texture, pores, and natural imperfections. `;
  prompt += `Avoid: artificial smooth skin, over-processed appearance, modern lighting, cropped body parts, multiple subjects.`;
  
  console.log("Generated streamlined portrait prompt:", prompt);
  return prompt;
}
