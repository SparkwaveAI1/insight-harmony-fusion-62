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

function getEnhancedPhysicalAppearance(traitProfile: any, metadata: any): string {
  if (!traitProfile?.physical_appearance) {
    return getCharacterAppearance(metadata);
  }
  
  const traits = traitProfile.physical_appearance;
  const health = traitProfile.physical_health || {};
  const age = parseInt(metadata?.age) || 30;
  const gender = metadata?.gender || 'person';
  
  // Build comprehensive physical description
  let appearance = [];
  
  // Facial features based on traits
  const facialSymmetry = traits.facial_symmetry || 0.5;
  const skinQuality = Math.min(traits.skin_quality || 0.5, health.skin_condition || 0.5);
  const overallAttractiveness = traits.overall_attractiveness || 0.5;
  
  if (facialSymmetry > 0.7) {
    appearance.push('symmetrical, well-proportioned facial features');
  } else if (facialSymmetry < 0.3) {
    appearance.push('asymmetrical facial features with character');
  } else {
    appearance.push('naturally asymmetrical facial features');
  }
  
  // Skin condition reflecting health and work
  if (skinQuality > 0.8) {
    appearance.push('remarkably clear, healthy skin despite outdoor life');
  } else if (skinQuality > 0.6) {
    appearance.push('sun-weathered but healthy skin with natural aging');
  } else if (skinQuality > 0.4) {
    appearance.push('heavily weathered skin showing signs of hard outdoor work');
  } else {
    appearance.push('rough, scarred skin marked by harsh frontier conditions');
  }
  
  // Build and posture
  const buildWeight = traits.build_weight || 0;
  const muscularity = traits.build_muscularity || 0.5;
  const posture = traits.posture_bearing || 0.5;
  
  let buildDesc = '';
  if (buildWeight < -1) buildDesc = 'very thin, gaunt frame';
  else if (buildWeight < -0.5) buildDesc = 'lean, wiry build';
  else if (buildWeight < 0.5) buildDesc = 'average build';
  else if (buildWeight < 1) buildDesc = 'stocky, solid frame';
  else buildDesc = 'heavy-set, robust build';
  
  if (muscularity > 0.7) buildDesc += ' with well-developed muscles from physical labor';
  else if (muscularity > 0.4) buildDesc += ' with moderate muscle tone';
  else buildDesc += ' with little muscle definition';
  
  appearance.push(buildDesc);
  
  // Posture and bearing
  if (posture > 0.7) {
    appearance.push('upright, confident bearing and posture');
  } else if (posture > 0.4) {
    appearance.push('average posture with natural stance');
  } else {
    appearance.push('slouched posture, weary bearing');
  }
  
  // Dental health (significant for realism)
  const dentalHealth = health.dental_health || 0.5;
  if (dentalHealth < 0.3) {
    appearance.push('poor dental condition with missing or damaged teeth');
  } else if (dentalHealth < 0.6) {
    appearance.push('moderate dental wear typical of the era');
  } else {
    appearance.push('surprisingly good teeth for the time period');
  }
  
  // Vision issues affecting appearance
  const vision = health.sensory_vision || 1.0;
  if (vision < 0.5) {
    appearance.push('squinting eyes, signs of vision difficulties');
  } else if (vision < 0.8) {
    appearance.push('slightly strained expression from minor vision issues');
  }
  
  // Overall attractiveness influence
  if (overallAttractiveness > 0.7) {
    appearance.push('naturally attractive features despite hard living');
  } else if (overallAttractiveness < 0.3) {
    appearance.push('weathered, rough features shaped by harsh frontier life');
  }
  
  return appearance.join(', ');
}

function getEnhancedClothing(traitProfile: any, metadata: any): string {
  const basicClothing = getHistoricalClothing(metadata);
  
  if (!traitProfile?.physical_appearance) {
    return basicClothing;
  }
  
  const traits = traitProfile.physical_appearance;
  const personality = traitProfile.big_five || {};
  
  const clothingQuality = traits.clothing_quality || 0.5;
  const clothingCleanliness = traits.clothing_cleanliness || 0.5;
  const clothingAppropriateness = traits.clothing_appropriateness || 0.5;
  const groomingAttention = traits.grooming_attention || 0.5;
  const conscientiousness = personality.conscientiousness || 0.5;
  
  let clothingDesc = [basicClothing];
  
  // Quality modifiers
  if (clothingQuality > 0.8) {
    clothingDesc.push('made from fine, well-crafted materials');
  } else if (clothingQuality > 0.6) {
    clothingDesc.push('good quality fabrics with careful construction');
  } else if (clothingQuality > 0.4) {
    clothingDesc.push('modest quality materials, practical construction');
  } else if (clothingQuality > 0.2) {
    clothingDesc.push('rough, coarse fabrics with basic construction');
  } else {
    clothingDesc.push('poor quality materials, heavily patched and mended');
  }
  
  // Cleanliness and care
  if (clothingCleanliness > 0.8 && conscientiousness > 0.6) {
    clothingDesc.push('remarkably clean and well-maintained despite frontier conditions');
  } else if (clothingCleanliness > 0.6) {
    clothingDesc.push('reasonably clean with signs of regular care');
  } else if (clothingCleanliness > 0.4) {
    clothingDesc.push('showing normal wear and frontier dirt');
  } else if (clothingCleanliness > 0.2) {
    clothingDesc.push('heavily stained and worn from hard outdoor work');
  } else {
    clothingDesc.push('dirty, unkempt clothing reflecting neglect or extreme hardship');
  }
  
  // Appropriateness and styling
  if (clothingAppropriateness > 0.8) {
    clothingDesc.push('perfectly suited to their role and social position');
  } else if (clothingAppropriateness < 0.3) {
    clothingDesc.push('ill-fitting or mismatched garments suggesting poverty or eccentricity');
  }
  
  // Grooming attention
  if (groomingAttention > 0.8) {
    clothingDesc.push('with meticulous attention to personal presentation');
  } else if (groomingAttention < 0.3) {
    clothingDesc.push('with little attention to personal grooming or appearance');
  }
  
  return clothingDesc.join(', ');
}

function getPersonalityInfluencedExpression(traitProfile: any): string {
  if (!traitProfile?.big_five) return '';
  
  const personality = traitProfile.big_five;
  const extended = traitProfile.extended_traits || {};
  
  let expressions = [];
  
  // Extraversion affects facial expression and demeanor
  if (personality.extraversion > 0.7) {
    expressions.push('warm, engaging expression with natural confidence');
  } else if (personality.extraversion < 0.3) {
    expressions.push('reserved, introspective expression with quiet demeanor');
  }
  
  // Neuroticism affects tension and worry lines
  if (personality.neuroticism > 0.7) {
    expressions.push('worry lines and tension visible in facial features');
  } else if (personality.neuroticism < 0.3) {
    expressions.push('calm, relaxed facial expression showing inner peace');
  }
  
  // Conscientiousness affects overall presentation
  if (personality.conscientiousness > 0.7) {
    expressions.push('neat, orderly appearance reflecting disciplined nature');
  } else if (personality.conscientiousness < 0.3) {
    expressions.push('somewhat disheveled appearance suggesting casual attitude');
  }
  
  // Agreeableness affects warmth in expression
  if (personality.agreeableness > 0.7) {
    expressions.push('kind, approachable expression with gentle features');
  } else if (personality.agreeableness < 0.3) {
    expressions.push('stern, somewhat harsh expression with hardened features');
  }
  
  // Emotional intensity affects overall presence
  const emotionalIntensity = extended.emotional_intensity || 0.5;
  if (emotionalIntensity > 0.7) {
    expressions.push('intense, passionate expression with animated features');
  } else if (emotionalIntensity < 0.3) {
    expressions.push('subdued, controlled expression with restrained features');
  }
  
  return expressions.length > 0 ? ', ' + expressions.join(', ') : '';
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
  
  // Use neutral portrait backgrounds for professional historical documentation
  return 'neutral studio portrait background with soft gradient lighting, professional historical documentation setting with subtle environmental context, museum-quality portrait backdrop';
}

export function buildCharacterImagePrompt(characterData: any): string {
  console.log("Generating enhanced colorized historical portrait from character data with trait integration");
  
  const metadata = characterData.metadata || {};
  const traitProfile = characterData.trait_profile || {};
  
  // Basic information
  const name = characterData.name || 'Historical Character';
  const age = metadata.age || '30';
  const gender = metadata.gender || 'person';
  const historicalPeriod = metadata.historical_period || '1700s';
  const region = metadata.region || 'Europe';
  
  // Get enhanced appearance details using trait data
  const appearanceDetails = getEnhancedPhysicalAppearance(traitProfile, metadata);
  const clothingDetails = getEnhancedClothing(traitProfile, metadata);
  const backgroundDetails = getHistoricalBackground(metadata);
  const personalityExpression = getPersonalityInfluencedExpression(traitProfile);
  
  // Build comprehensive colorized historical portrait prompt with trait integration
  let prompt = `A professional colorized historical portrait photograph of ${name}, a ${age}-year-old ${gender} from ${historicalPeriod} in ${region}`;
  
  // Enhanced physical appearance with trait-based realism
  prompt += ` with ${appearanceDetails}`;
  
  // Personality-influenced expression and demeanor
  prompt += personalityExpression;
  
  // Enhanced clothing with trait-based authenticity
  prompt += `, wearing ${clothingDetails}`;
  
  // Professional portrait composition and lighting
  prompt += `, positioned against ${backgroundDetails}`;
  prompt += `, full body standing portrait, complete figure from head to feet clearly visible in natural dignified pose`;
  prompt += `, professional historical portrait photography in the style of colorized vintage photographs`;
  prompt += `, soft natural lighting with gentle shadows, museum-quality historical documentation`;
  prompt += `, authentic period-accurate representation with realistic human features and natural aging`;
  
  // Enhanced realism and quality specifications
  prompt += `, photorealistic with natural skin texture and subtle weathering appropriate to age and lifestyle`;
  prompt += `, rich but natural color palette, professional portrait composition with proper framing`;
  prompt += `, authentic human proportions with individual character traits clearly visible`;
  prompt += `, high detail showing personality and life experience through facial expression and bearing`;
  
  // Professional portrait specifications
  prompt += `, masterpiece quality colorized historical portrait, sharp focus with natural depth of field`;
  prompt += `, 4K resolution, single subject, complete body visible, professional portrait lighting`;
  
  // Critical exclusions for authentic historical portrait style
  prompt += `, avoid: harsh lighting, modern studio effects, over-weathered appearance, cropped limbs, multiple subjects, artificial poses, contemporary elements, idealized perfection, incomplete bodies, poor composition`;
  
  console.log("Generated enhanced colorized historical portrait prompt:", prompt);
  return prompt;
}
