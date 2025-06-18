
import { getPersonaClothing } from "./clothingService.ts";

export function buildImagePrompt(personaData: any): string {
  console.log("Generating image prompt from persona data");
  
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
  
  // Build age-specific descriptors
  let ageDescriptor = "";
  if (age) {
    const ageNum = parseInt(age.toString().replace(/[^0-9]/g, ''));
    if (ageNum >= 18 && ageNum <= 25) {
      ageDescriptor = "youthful appearance, clear skin, energetic look";
    } else if (ageNum >= 26 && ageNum <= 35) {
      ageDescriptor = "young adult appearance, mature but youthful features";
    } else if (ageNum >= 36 && ageNum <= 45) {
      ageDescriptor = "middle-aged appearance, some signs of maturity";
    } else if (ageNum >= 46 && ageNum <= 55) {
      ageDescriptor = "mature adult appearance, distinguished features";
    } else if (ageNum > 55) {
      ageDescriptor = "mature appearance, dignified and experienced look";
    }
  }
  
  // Build health and fitness descriptors
  let healthDescriptor = "";
  if (fitnessActivityLevel) {
    if (fitnessActivityLevel.toLowerCase().includes("high") || fitnessActivityLevel.toLowerCase().includes("active")) {
      healthDescriptor = "fit and healthy appearance, good posture, energetic";
    } else if (fitnessActivityLevel.toLowerCase().includes("moderate")) {
      healthDescriptor = "average fitness level, healthy appearance";
    } else if (fitnessActivityLevel.toLowerCase().includes("low") || fitnessActivityLevel.toLowerCase().includes("sedentary")) {
      healthDescriptor = "less active lifestyle reflected in appearance";
    }
  }
  
  // Build stress and lifestyle descriptors
  let lifestyleDescriptor = "";
  if (stressManagement && sleepPatterns) {
    if (stressManagement.toLowerCase().includes("poor") || sleepPatterns.toLowerCase().includes("poor")) {
      lifestyleDescriptor = "some signs of stress or fatigue";
    } else if (stressManagement.toLowerCase().includes("good") && sleepPatterns.toLowerCase().includes("good")) {
      lifestyleDescriptor = "well-rested and relaxed appearance";
    }
  }
  
  const clothing = getPersonaClothing(occupation, gender, age, socialClass, region, urbanRural, description);
  
  // Build the base prompt with enhanced physical details
  let imagePrompt = `A professional headshot portrait of one ${age}-year-old ${ethnicity} ${gender}`;
  
  // Add age-specific appearance
  if (ageDescriptor) {
    imagePrompt += ` with ${ageDescriptor}`;
  }
  
  // Add physical build and body type
  if (buildBodyType) {
    imagePrompt += `, ${buildBodyType} build`;
  }
  
  // Add facial features and hair
  const facialFeatures = [];
  if (hairColor && hairStyle) {
    facialFeatures.push(`${hairColor} hair styled as ${hairStyle}`);
  } else if (hairColor) {
    facialFeatures.push(`${hairColor} hair`);
  } else if (hairStyle) {
    facialFeatures.push(`hair styled as ${hairStyle}`);
  }
  
  if (eyeColor) {
    facialFeatures.push(`${eyeColor} eyes`);
  }
  
  if (skinTone) {
    facialFeatures.push(`${skinTone} skin tone`);
  }
  
  if (facialFeatures.length > 0) {
    imagePrompt += `, with ${facialFeatures.join(", ")}`;
  }
  
  // Add distinctive features
  if (distinctiveFeatures.length > 0) {
    imagePrompt += `, featuring ${distinctiveFeatures.join(", ")}`;
  }
  
  // Add posture and bearing
  if (postureBearing) {
    imagePrompt += `, displaying ${postureBearing}`;
  }
  
  // Add health and fitness descriptors
  if (healthDescriptor) {
    imagePrompt += `, ${healthDescriptor}`;
  }
  
  // Add lifestyle descriptors
  if (lifestyleDescriptor) {
    imagePrompt += `, ${lifestyleDescriptor}`;
  }
  
  // Add occupation if available
  if (occupation) {
    imagePrompt += `, who works as a ${occupation}`;
  }
  
  // Add clothing and style
  imagePrompt += `, ${clothing}`;
  
  // Add fashion sense and grooming
  if (styleFashionSense) {
    imagePrompt += `, with ${styleFashionSense} fashion sense`;
  }
  
  if (groomingHabits) {
    imagePrompt += `, ${groomingHabits} grooming habits`;
  }
  
  // Add confident, natural expression
  imagePrompt += `, with a confident, natural expression and genuine smile`;
  
  // Add professional portrait specifications focused on realism and age accuracy
  imagePrompt += `. Professional corporate headshot photography taken in a modern studio. Shot with a Canon 5D Mark IV using an 85mm f/1.8 portrait lens at f/2.8 for optimal sharpness. Clean studio lighting with a key light at 45 degrees and a subtle fill light to eliminate harsh shadows. The subject is positioned directly facing the camera with good posture and professional bearing. Ultra-realistic skin texture showing natural pores, subtle skin variations, and authentic human characteristics appropriate for their age. Sharp focus on the eyes with natural catchlights. The background is a simple, solid neutral color - either warm gray, soft beige, or clean white - completely out of focus to ensure the subject stands out clearly.`;
  
  // Add age-specific skin and appearance details
  if (age) {
    const ageNum = parseInt(age.toString().replace(/[^0-9]/g, ''));
    if (ageNum >= 18 && ageNum <= 25) {
      imagePrompt += " The skin should appear youthful, smooth, and clear with minimal signs of aging.";
    } else if (ageNum >= 26 && ageNum <= 35) {
      imagePrompt += " The skin should appear healthy and youthful with very subtle signs of maturity.";
    } else if (ageNum >= 36 && ageNum <= 45) {
      imagePrompt += " The skin should show appropriate signs of aging for this age group, including subtle lines and mature features.";
    } else if (ageNum >= 46 && ageNum <= 55) {
      imagePrompt += " The skin should display mature characteristics with visible signs of aging appropriate for this age group.";
    } else if (ageNum > 55) {
      imagePrompt += " The skin should show dignified aging with appropriate wrinkles and mature features.";
    }
  }
  
  // Add critical specifications to prevent artifacts and ensure single subject
  imagePrompt += " IMPORTANT: Generate only ONE person in the image. No reflections, no mirrors, no duplicates, no multiple faces or figures. The image should contain exactly one individual person as the sole subject. Avoid any reflective surfaces, glass, or elements that could create duplicate images. The background should be completely plain and non-reflective. Focus on creating a clean, professional single-person portrait with no visual artifacts, duplications, or confusing elements. This must be a straightforward headshot of one person only.";
  
  console.log("Generated enhanced prompt:", imagePrompt);
  
  return imagePrompt;
}
