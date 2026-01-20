
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

  // Extract key fields (keep them non-identifying / non-PII)
  const ageRaw = identity.age ?? demographics.age;
  const ageNum = typeof ageRaw === "number" ? ageRaw : parseInt(String(ageRaw || ""), 10);
  const age = Number.isFinite(ageNum) ? ageNum : 30;

  const genderRaw = (demographics.gender || identity.gender || "").toString().trim();
  const ethnicityRaw = (demographics.ethnicity || identity.ethnicity || "").toString().trim();
  const bmi = healthProfile.bmi;

  // Map to safer, non-identifying descriptors
  const ageGroup = age < 25 ? "young adult" : age < 45 ? "adult" : age < 65 ? "middle-aged" : "older adult";

  const genderLower = genderRaw.toLowerCase();
  const genderLabel =
    !genderLower || genderLower === "unknown" ? "person" :
    genderLower === "male" || genderLower === "man" ? "man" :
    genderLower === "female" || genderLower === "woman" ? "woman" :
    "person";

  const ethnicityLower = ethnicityRaw.toLowerCase();
  const ethnicityLabel = !ethnicityLower || ethnicityLower === "unknown" ? "" : ethnicityRaw;

  const bodyType = (bmi && typeof bmi === "number") ? getBMIDescription(bmi) : "average build";
  const ageAppearance = getAgeAppearanceFromAge(age);

  console.log("V4 persona details:", { age, gender: genderRaw, ethnicity: ethnicityRaw, bmi });

  // IMPORTANT: Avoid including specific age numbers, height/weight/BMI numbers, names, medical conditions,
  // or overly-detailed physical descriptions. Gemini may treat that as PII.
  const promptParts: string[] = [];
  promptParts.push(`Professional headshot portrait photograph of a fictional, non-identifiable ${ageGroup} ${genderLabel}`);
  if (ethnicityLabel) promptParts.push(`of ${ethnicityLabel} ethnicity`);
  promptParts.push(`with a ${bodyType}`);
  promptParts.push(`${ageAppearance}`);
  promptParts.push(
    "Natural skin texture, realistic everyday features, friendly neutral expression. " +
      "Neutral studio background, soft studio lighting, 85mm lens, shallow depth of field, photorealistic. " +
      "Do not depict or resemble a real identifiable person; avoid unique scars/moles/tattoos and avoid medical/health details. " +
      "No text, no watermark, no logo."
  );

  const prompt = promptParts.join(", ");
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
