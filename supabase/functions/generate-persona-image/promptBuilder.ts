
import { getPersonaClothing } from "./clothingService.ts";

export function buildImagePrompt(personaData: any): string {
  console.log("Generating enhanced realistic image prompt from persona data");
  
  // Extract demographic information
  const metadata = personaData.metadata || {};
  const traits = personaData.trait_profile || {};
  const description = personaData.prompt || "";
  
  // Extract essential data
  const age = metadata.age || "adult";
  const gender = metadata.gender || "person";
  const ethnicity = metadata.race_ethnicity || "";
  const occupation = metadata.occupation || "";
  const socialClass = metadata.social_class_identity || "";
  const region = metadata.region || "";
  const urbanRural = metadata.urban_rural_context || "";
  
  // Extract physical description attributes
  const height = metadata.height || "";
  const buildBodyType = metadata.build_body_type || "";
  const hairColor = metadata.hair_color || "";
  const hairStyle = metadata.hair_style || "";
  const eyeColor = metadata.eye_color || "";
  const skinTone = metadata.skin_tone || "";
  const distinctiveFeatures = metadata.distinctive_features || [];
  const styleFashionSense = metadata.style_fashion_sense || "";
  const groomingHabits = metadata.grooming_habits || "";
  const postureBearing = metadata.posture_bearing || "";
  
  // Extract health-related attributes
  const physicalHealthStatus = metadata.physical_health_status || "";
  const fitnessActivityLevel = metadata.fitness_activity_level || "";
  const stressManagement = metadata.stress_management || "";
  const sleepPatterns = metadata.sleep_patterns || "";
  
  // Extract personality traits for expression and demeanor
  const bigFive = traits.big_five || {};
  const extraversionLevel = bigFive.extraversion || 0;
  const neuroticismLevel = bigFive.neuroticism || 0;
  const opennessLevel = bigFive.openness || 0;
  const agreeablenessLevel = bigFive.agreeableness || 0;
  const conscientiousnessLevel = bigFive.conscientiousness || 0;
  
  // Determine personality-based expression
  function getPersonalityExpression(): string {
    if (extraversionLevel > 6) {
      return agreeablenessLevel > 6 ? "warm, engaging smile and bright eyes" : "confident, bold expression";
    } else if (extraversionLevel < 4) {
      return neuroticismLevel > 6 ? "thoughtful, slightly reserved expression" : "calm, introspective look";
    } else {
      return agreeablenessLevel > 6 ? "gentle, approachable expression" : "natural, relaxed expression";
    }
  }
  
  // Determine style from traits and demographics
  function getStyleFromTraits(): string {
    let style = "";
    
    if (opennessLevel > 7) {
      style = "creative, artistic";
    } else if (conscientiousnessLevel > 7) {
      style = "neat, well-organized";
    } else if (extraversionLevel > 7) {
      style = "trendy, attention-getting";
    } else {
      style = "casual, comfortable";
    }
    
    // Modify based on social class and age
    const ageNum = parseInt(age.toString().replace(/[^0-9]/g, ''));
    if (socialClass?.toLowerCase().includes("upper")) {
      style = `upscale ${style}`;
    } else if (socialClass?.toLowerCase().includes("working")) {
      style = `practical ${style}`;
    }
    
    if (ageNum < 25) {
      style = `youthful ${style}`;
    } else if (ageNum > 50) {
      style = `mature ${style}`;
    }
    
    return style;
  }
  
  // Determine setting based on lifestyle and traits
  function getSettingFromTraits(): string {
    const settings = [];
    
    if (occupation?.toLowerCase().includes("tech") || occupation?.toLowerCase().includes("creative")) {
      settings.push("modern coffee shop", "co-working space", "urban environment");
    } else if (occupation?.toLowerCase().includes("outdoor") || fitnessActivityLevel?.toLowerCase().includes("high")) {
      settings.push("outdoor park", "natural setting", "active environment");
    } else if (socialClass?.toLowerCase().includes("upper")) {
      settings.push("upscale restaurant", "modern office", "well-appointed home");
    } else {
      settings.push("casual restaurant", "local cafe", "comfortable home setting");
    }
    
    if (urbanRural?.toLowerCase().includes("rural")) {
      settings.push("small town setting", "countryside background");
    } else if (urbanRural?.toLowerCase().includes("urban")) {
      settings.push("city environment", "urban backdrop");
    }
    
    return settings[Math.floor(Math.random() * settings.length)];
  }
  
  // Build age-specific appearance with health considerations
  function getAgeHealthAppearance(): string {
    const ageNum = parseInt(age.toString().replace(/[^0-9]/g, ''));
    let appearance = "";
    
    // Base age appearance
    if (ageNum >= 18 && ageNum <= 25) {
      appearance = "youthful face with smooth, clear skin and bright eyes";
    } else if (ageNum >= 26 && ageNum <= 35) {
      appearance = "young adult appearance with healthy, vibrant skin and confident bearing";
    } else if (ageNum >= 36 && ageNum <= 45) {
      appearance = "mature adult with some natural aging signs but still energetic appearance";
    } else if (ageNum >= 46 && ageNum <= 55) {
      appearance = "middle-aged with distinguished features and life experience showing";
    } else if (ageNum > 55) {
      appearance = "mature person with wisdom lines and dignified presence";
    }
    
    // Modify based on health and fitness
    if (fitnessActivityLevel?.toLowerCase().includes("high")) {
      appearance += ", with a fit, healthy glow and good posture";
    } else if (fitnessActivityLevel?.toLowerCase().includes("low")) {
      appearance += ", with a more sedentary lifestyle reflected in their bearing";
    }
    
    // Modify based on stress and sleep
    if (stressManagement?.toLowerCase().includes("poor") || sleepPatterns?.toLowerCase().includes("poor")) {
      appearance += ", showing some signs of tiredness or stress";
    } else if (stressManagement?.toLowerCase().includes("good") && sleepPatterns?.toLowerCase().includes("good")) {
      appearance += ", with a well-rested, relaxed appearance";
    }
    
    return appearance;
  }
  
  // Get clothing style
  const clothing = getPersonaClothing(occupation, gender, age, socialClass, region, urbanRural, description);
  const personalStyle = getStyleFromTraits();
  
  // Build the realistic photo prompt
  let imagePrompt = `A realistic, candid photo of a ${age}-year-old`;
  
  // Add gender presentation and ethnicity
  if (ethnicity && gender) {
    imagePrompt += ` ${gender.toLowerCase()} presenting ${ethnicity}`;
  } else if (gender) {
    imagePrompt += ` ${gender.toLowerCase()}`;
  } else if (ethnicity) {
    imagePrompt += ` ${ethnicity}`;
  }
  imagePrompt += ` person`;
  
  // Add age and health-based appearance
  const ageHealthAppearance = getAgeHealthAppearance();
  if (ageHealthAppearance) {
    imagePrompt += ` with ${ageHealthAppearance}`;
  }
  
  // Add physical features
  const physicalFeatures = [];
  if (hairColor && hairStyle) {
    physicalFeatures.push(`${hairColor} hair in a ${hairStyle} style`);
  } else if (hairColor) {
    physicalFeatures.push(`${hairColor} hair`);
  } else if (hairStyle) {
    physicalFeatures.push(`hair styled in a ${hairStyle}`);
  }
  
  if (eyeColor) {
    physicalFeatures.push(`${eyeColor} eyes`);
  }
  
  if (skinTone) {
    physicalFeatures.push(`${skinTone} skin`);
  }
  
  if (buildBodyType) {
    physicalFeatures.push(`${buildBodyType} build`);
  }
  
  if (physicalFeatures.length > 0) {
    imagePrompt += `. They have ${physicalFeatures.join(", ")}`;
  }
  
  // Add distinctive features
  if (distinctiveFeatures.length > 0) {
    imagePrompt += `, with ${distinctiveFeatures.join(", ")}`;
  }
  
  // Add clothing and style
  imagePrompt += `. They are wearing ${clothing}`;
  if (styleFashionSense) {
    imagePrompt += ` that reflects their ${styleFashionSense} fashion sense`;
  }
  
  // Add personality-based expression
  const personalityExpression = getPersonalityExpression();
  imagePrompt += `, and their expression looks ${personalityExpression}`;
  
  // Add setting
  const setting = getSettingFromTraits();
  imagePrompt += `. The photo is taken in ${setting} with natural lighting`;
  
  // Add realism specifications
  imagePrompt += `. The image shows real skin texture with natural pores, subtle imperfections, and authentic human characteristics. It feels like a genuine photo taken with a DSLR camera - not retouched, not posed, not artificial. The lighting is natural and flattering but not perfect studio lighting. This is a real person in a real moment`;
  
  // Add age-specific skin realism
  const ageNum = parseInt(age.toString().replace(/[^0-9]/g, ''));
  if (ageNum >= 18 && ageNum <= 25) {
    imagePrompt += ". The skin appears naturally youthful with the subtle imperfections typical of someone in their early twenties";
  } else if (ageNum >= 26 && ageNum <= 35) {
    imagePrompt += ". The skin shows the healthy maturity of someone in their thirties with very subtle aging signs";
  } else if (ageNum >= 36 && ageNum <= 45) {
    imagePrompt += ". The skin displays natural aging appropriate for someone in their forties with some fine lines and mature characteristics";
  } else if (ageNum >= 46 && ageNum <= 55) {
    imagePrompt += ". The skin shows the dignified aging of someone in their fifties with visible but natural signs of maturity";
  } else if (ageNum > 55) {
    imagePrompt += ". The skin displays the wisdom and experience of age with natural wrinkles and mature features";
  }
  
  // Critical specifications for single subject
  imagePrompt += ". CRITICAL: This must be exactly ONE person only. No duplicates, no reflections, no multiple faces, no mirrors, no confusing elements. Generate a single individual human being as the sole subject of this realistic photograph. The background should be simple and non-reflective. This is a straightforward, authentic photo of one real person";
  
  console.log("Generated realistic persona photo prompt:", imagePrompt);
  
  return imagePrompt;
}
