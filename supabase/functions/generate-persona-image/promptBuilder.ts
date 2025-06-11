

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
  
  // Physical attributes that should be explicitly extracted from the description
  let bodyType = "";
  let healthConditions = [];
  let emotionalState = "";
  
  // Parse the original description for physical attributes and health conditions
  if (description) {
    // Check for body type descriptions
    if (description.toLowerCase().includes("overweight") || 
        description.toLowerCase().includes("obese") || 
        description.toLowerCase().includes("heavy") || 
        description.toLowerCase().includes("fat")) {
      bodyType = "overweight";
    } else if (description.toLowerCase().includes("thin") || 
              description.toLowerCase().includes("skinny") || 
              description.toLowerCase().includes("underweight")) {
      bodyType = "thin";
    } else {
      // If not specified, randomly assign overweight to ~50% of personas to match US demographics
      bodyType = Math.random() < 0.5 ? "slightly overweight" : "average weight";
    }
    
    // Check for common health conditions
    const conditionKeywords = {
      "diabetic": "diabetic",
      "diabetes": "with diabetes",
      "asthma": "with asthma",
      "high blood pressure": "with high blood pressure",
      "hypertension": "with hypertension",
      "heart condition": "with a heart condition",
      "obese": "who is obese"
    };
    
    Object.entries(conditionKeywords).forEach(([keyword, condition]) => {
      if (description.toLowerCase().includes(keyword)) {
        healthConditions.push(condition);
      }
    });
    
    // Default to confident, natural expression for professional portraits
    emotionalState = "with a confident, natural expression and genuine smile";
  }
  
  const clothing = getPersonaClothing(occupation, gender, age, socialClass, region, urbanRural, description);
  
  // Build the base prompt - using professional portrait specifications
  let imagePrompt = `A single professional headshot portrait of one ${age}-year-old ${ethnicity} ${gender}`;
  
  // Add body type if specified
  if (bodyType) {
    imagePrompt += ` with a ${bodyType} build`;
  }
  
  // Add occupation if available
  if (occupation) {
    imagePrompt += ` who works as a ${occupation}`;
  }
  
  // Add clothing description
  imagePrompt += `, ${clothing}`;
  
  // Add health conditions
  if (healthConditions.length > 0) {
    imagePrompt += `, ${healthConditions.join(", ")}`;
  }
  
  // Add emotional state
  if (emotionalState) {
    imagePrompt += `, ${emotionalState}`;
  }
  
  // Add professional portrait specifications focused on realism and quality
  imagePrompt += `. Professional corporate headshot photography taken in a modern studio. Shot with a Canon 5D Mark IV using an 85mm f/1.8 portrait lens at f/2.8 for optimal sharpness. Clean studio lighting with a key light at 45 degrees and a subtle fill light to eliminate harsh shadows. The subject is positioned directly facing the camera with good posture and professional bearing. Ultra-realistic skin texture showing natural pores, subtle skin variations, and authentic human characteristics. Sharp focus on the eyes with natural catchlights. The background is a simple, solid neutral color - either warm gray, soft beige, or clean white - completely out of focus to ensure the subject stands out clearly.`;
  
  // Additional specifics for body type
  if (bodyType === "overweight" || bodyType === "slightly overweight") {
    imagePrompt += " The person should have natural facial features that authentically reflect their build, photographed with flattering professional lighting and angles.";
  }
  
  // Add critical specifications to prevent artifacts and ensure single subject
  imagePrompt += " IMPORTANT: Generate only ONE person in the image. No reflections, no mirrors, no duplicates, no multiple faces or figures. The image should contain exactly one individual person as the sole subject. Avoid any reflective surfaces, glass, or elements that could create duplicate images. The background should be completely plain and non-reflective. Focus on creating a clean, professional single-person portrait with no visual artifacts, duplications, or confusing elements. This must be a straightforward headshot of one person only.";
  
  console.log("Generated prompt:", imagePrompt);
  
  return imagePrompt;
}

