
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
  console.log("Generating enhanced realistic image prompt from persona data");
  console.log("Persona data structure:", JSON.stringify(personaData, null, 2));
  
  // Check if this is a V4 persona
  const isV4Persona = personaData.persona_id?.startsWith('v4_') || personaData.full_profile || personaData.conversation_summary;
  
  if (isV4Persona) {
    console.log("Detected V4 persona, using V4 data structure");
    return buildV4ImagePrompt(personaData);
  } else {
    console.log("Detected legacy persona, using legacy data structure");
    return buildLegacyImagePrompt(personaData);
  }
}

function getBMIDescription(bmi: number): string {
  if (bmi < 18.5) return 'slender build, lean frame';
  if (bmi < 25) return 'athletic build, healthy proportions';
  if (bmi < 30) return 'stocky build, solid frame';
  if (bmi < 35) return 'heavier build, fuller figure';
  if (bmi < 40) return 'larger build, robust frame';
  return 'very heavy build, substantial frame';
}

function buildV4ImagePrompt(personaData: any): string {
  const identity = personaData.full_profile?.identity || {};
  const healthProfile = personaData.full_profile?.health_profile || {};
  const conversationSummary = personaData.conversation_summary || {};
  const demographics = conversationSummary.demographics || {};
  
  // Extract the four required categories
  const age = identity.age || demographics.age;
  const gender = identity.gender;
  const ethnicity = identity.ethnicity;
  let physicalDescription = conversationSummary.physical_description;
  
  // Clean up attractiveness rating pattern from description
  if (physicalDescription) {
    physicalDescription = physicalDescription.replace(/\(Attractiveness:.*?\)/g, '').trim();
  }
  
  // Enhance physical description with specific physical traits from health_profile
  const physicalEnhancements = [];
  
  // Add facial hair details (men)
  if (gender?.toLowerCase() === 'male' && healthProfile.facial_hair) {
    const facialHairMap = {
      'full_beard': 'full thick beard',
      'goatee': 'goatee facial hair',
      'mustache_only': 'mustache without beard',
      'stubble': 'stubble facial hair',
      'van_dyke': 'van dyke beard style',
      'no_facial_hair': 'clean shaven'
    };
    physicalEnhancements.push(facialHairMap[healthProfile.facial_hair] || healthProfile.facial_hair);
  }
  
  // Add hair loss patterns
  if (healthProfile.hair_loss_pattern) {
    const hairLossMap = {
      'significant_balding': 'significantly bald, male pattern baldness',
      'moderate_balding': 'balding, thinning hair on top',
      'receding_hairline': 'receding hairline, widow\'s peak'
    };
    physicalEnhancements.push(hairLossMap[healthProfile.hair_loss_pattern] || healthProfile.hair_loss_pattern);
  }
  
  // Add distinctive features
  if (healthProfile.distinctive_features && healthProfile.distinctive_features.length > 0) {
    const featureMap = {
      'large_nose': 'large prominent nose',
      'prominent_nose': 'distinctive prominent nose',
      'prominent_ears': 'ears that stick out',
      'strong_jaw': 'strong prominent jaw',
      'deep_set_eyes': 'deep-set eyes',
      'thin_lips': 'thin lips',
      'high_cheekbones': 'high prominent cheekbones'
    };
    
    healthProfile.distinctive_features.forEach((feature: string) => {
      if (featureMap[feature]) {
        physicalEnhancements.push(featureMap[feature]);
      }
    });
  }
  
  // Add attractiveness context (avoid making everyone attractive)
  if (healthProfile.attractiveness_level && healthProfile.attractiveness_level <= 4) {
    physicalEnhancements.push('average everyday appearance, not conventionally attractive');
  } else if (healthProfile.attractiveness_level && healthProfile.attractiveness_level >= 8) {
    physicalEnhancements.push('attractive appearance');
  }
  
  // Combine original description with enhancements
  if (physicalEnhancements.length > 0) {
    const enhancementText = physicalEnhancements.join(', ');
    if (physicalDescription) {
      physicalDescription = `${physicalDescription}, ${enhancementText}`;
    } else {
      physicalDescription = enhancementText;
    }
  }
  
  // Physical description is already comprehensive from the persona generation process
  
  console.log("V4 persona details:", { age, gender, ethnicity, bmi: healthProfile.bmi });
  console.log("Physical description:", physicalDescription);
  
  // Build prompt using exact user specification
  const prompt = `Film still photograph of [ Age ${age}, "gender": "${gender}", "ethnicity": "${ethnicity}", "physical_description": "${physicalDescription}" ] in 2024, sigma 85mm f/1.4`;
  
  console.log("Generated V4 image prompt:", prompt);
  return prompt;
}

function buildLegacyImagePrompt(personaData: any): string {
  const metadata = personaData.metadata || {};
  
  // Basic demographic information
  const age = metadata.age || '30';
  const gender = metadata.gender || 'person';
  const ethnicity = metadata.race_ethnicity || 'diverse';
  const region = metadata.region || 'general';
  
  // Physical characteristics
  const height = metadata.height || 'average height';
  const bodyType = metadata.build_body_type || 'average';
  const hairColor = metadata.hair_color || 'brown';
  const hairStyle = metadata.hair_style || 'medium length';
  const eyeColor = metadata.eye_color || 'brown';
  const skinTone = metadata.skin_tone || 'medium';
  
  // Clothing and style
  const fashionSense = metadata.style_fashion_sense || 'casual';
  const occupation = metadata.occupation || 'professional';
  
  // Enhanced appearance details
  const ageHealthAppearance = getAgeHealthAppearance(metadata);
  
  // Build comprehensive prompt
  let prompt = `Professional headshot portrait of a ${age}-year-old ${gender}`;
  
  if (ethnicity && ethnicity !== 'diverse') {
    prompt += ` of ${ethnicity} ethnicity`;
  }
  
  // Physical features
  prompt += `, ${ageHealthAppearance}`;
  prompt += `, ${hairColor} ${hairStyle} hair, ${eyeColor} eyes, ${skinTone} skin tone`;
  prompt += `, ${bodyType} build, ${height}`;
  
  // Style and presentation
  prompt += `, dressed in ${fashionSense} attire appropriate for a ${occupation}`;
  
  // Photography style
  prompt += `, professional lighting, clean background, high quality portrait photography`;
  prompt += `, realistic, photorealistic, detailed facial features, natural expression`;
  prompt += `, shot with professional camera, studio lighting, crisp details`;
  
  // Final quality modifiers
  prompt += `, 4K resolution, professional headshot style, corporate portrait quality`;
  
  console.log("Generated legacy image prompt:", prompt);
  return prompt;
}

function getAgeAppearanceFromAge(age: number): string {
  if (age < 25) {
    return 'youthful appearance, clear skin, energetic posture';
  } else if (age < 35) {
    return 'young adult appearance, confident bearing';
  } else if (age < 45) {
    return 'mature adult appearance, established presence';
  } else if (age < 55) {
    return 'middle-aged appearance, distinguished look';
  } else if (age < 65) {
    return 'mature appearance, some signs of aging';
  } else {
    return 'older adult appearance, wisdom in features, possible gray hair';
  }
}
