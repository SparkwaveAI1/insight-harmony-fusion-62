
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
  
  // Build age-specific appearance with health considerations - ENHANCED FOR ACCURACY
  function getAgeHealthAppearance(): string {
    const ageNum = parseInt(age.toString().replace(/[^0-9]/g, ''));
    let appearance = "";
    
    // Very specific age-based appearance with emphasis on youthfulness
    if (ageNum >= 18 && ageNum <= 25) {
      appearance = "very youthful face with smooth, unblemished skin, bright clear eyes, and fresh complexion showing no signs of aging";
    } else if (ageNum >= 26 && ageNum <= 35) {
      appearance = "young adult with healthy, smooth skin showing minimal aging, bright eyes, and a fresh, energetic appearance. NO wrinkles, NO lines around eyes, NO bags under eyes, NO age spots";
    } else if (ageNum >= 36 && ageNum <= 45) {
      appearance = "mature adult with healthy skin showing only very subtle signs of aging, clear complexion with minimal fine lines";
    } else if (ageNum >= 46 && ageNum <= 55) {
      appearance = "middle-aged with natural aging signs including some fine lines and mature features";
    } else if (ageNum > 55) {
      appearance = "mature person with natural aging, wrinkles, and distinguished features";
    }
    
    // Modify based on health and fitness - emphasize youthful glow for younger ages
    if (fitnessActivityLevel?.toLowerCase().includes("high")) {
      if (ageNum <= 35) {
        appearance += ", with an exceptionally healthy, youthful glow and excellent skin tone";
      } else {
        appearance += ", with a fit, healthy glow and good posture";
      }
    } else if (fitnessActivityLevel?.toLowerCase().includes("low")) {
      appearance += ", with a more sedentary lifestyle reflected in their bearing";
    }
    
    // Modify based on stress and sleep - critical for age accuracy
    if (stressManagement?.toLowerCase().includes("poor") || sleepPatterns?.toLowerCase().includes("poor")) {
      if (ageNum <= 35) {
        appearance += ", showing very subtle signs of tiredness but maintaining youthful features";
      } else {
        appearance += ", showing some signs of tiredness or stress";
      }
    } else if (stressManagement?.toLowerCase().includes("good") && sleepPatterns?.toLowerCase().includes("good")) {
      if (ageNum <= 35) {
        appearance += ", with a well-rested, radiant, and exceptionally youthful appearance";
      } else {
        appearance += ", with a well-rested, relaxed appearance";
      }
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
  
  // Add realism specifications with strong age accuracy emphasis
  imagePrompt += `. The image shows real skin texture with natural pores and authentic human characteristics appropriate for their exact age. It feels like a genuine photo taken with a DSLR camera - candid, natural, and unretouched. The lighting is natural and flattering but not perfect studio lighting. This is a real person in a real moment`;
  
  // Add age-specific skin realism with STRONG specifications to prevent aging
  const ageNum = parseInt(age.toString().replace(/[^0-9]/g, ''));
  if (ageNum >= 18 && ageNum <= 25) {
    imagePrompt += ". The skin appears naturally youthful with clear, smooth texture typical of someone in their early twenties. NO wrinkles, NO fine lines, NO age spots, completely smooth skin";
  } else if (ageNum >= 26 && ageNum <= 35) {
    imagePrompt += ". The skin shows the healthy appearance of someone in their thirties with very minimal aging signs. Specifically: smooth skin around the eyes with NO crow's feet, NO bags under the eyes, NO pronounced wrinkles, NO deep lines. The person should look distinctly younger than 40 years old";
  } else if (ageNum >= 36 && ageNum <= 45) {
    imagePrompt += ". The skin displays natural aging appropriate for someone in their forties with some fine lines but still maintaining a relatively youthful appearance";
  } else if (ageNum >= 46 && ageNum <= 55) {
    imagePrompt += ". The skin shows the natural aging of someone in their fifties with visible but natural signs of maturity";
  } else if (ageNum > 55) {
    imagePrompt += ". The skin displays the natural aging and experience of advanced age with wrinkles and mature features";
  }
  
  // Critical specifications for single subject and age accuracy
  imagePrompt += ". CRITICAL REQUIREMENTS: 1) This must be exactly ONE person only. No duplicates, no reflections, no multiple faces. 2) The person must look their stated age - if they are 34 years old, they should NOT look older than 35-36 maximum. Pay special attention to eye area, skin smoothness, and facial structure to ensure age accuracy. 3) Generate a single individual human being as the sole subject of this realistic photograph. The background should be simple and non-reflective";
  
  console.log("Generated realistic persona photo prompt:", imagePrompt);
  
  return imagePrompt;
}
