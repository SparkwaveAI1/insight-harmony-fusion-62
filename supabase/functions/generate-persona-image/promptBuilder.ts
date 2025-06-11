
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
  let imagePrompt = `Professional studio portrait of a ${age}-year-old ${ethnicity} ${gender}`;
  
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
  imagePrompt += `. Professional headshot photography, shot with a high-end DSLR camera using an 85mm portrait lens. Studio lighting setup with key light and fill light for even, flattering illumination. Ultra-realistic skin texture with natural pores, fine lines, and authentic skin tone. Sharp focus on the eyes with beautiful catchlights. Natural facial expression showing genuine personality. Shot against a neutral, softly blurred background in warm gray or beige tones. The photograph should capture authentic human characteristics - natural skin imperfections, realistic hair texture, and genuine facial expressions. Professional photographer quality with perfect color grading and skin tone accuracy. The lighting should be soft and even, eliminating harsh shadows while maintaining natural dimensionality. Focus on creating a warm, approachable, yet professional appearance that looks like a real person photographed in a high-end portrait studio.`;
  
  // Additional specifics for body type
  if (bodyType === "overweight" || bodyType === "slightly overweight") {
    imagePrompt += " The person should have natural facial fullness that authentically reflects their build, photographed with flattering angles and lighting.";
  }
  
  // Add specifics about photo realism and quality
  imagePrompt += " This must be an absolutely photorealistic image that could pass for a real photograph taken by a professional portrait photographer. The skin should show natural texture, subtle variations in tone, and realistic lighting. Avoid any artificial, overly smooth, or plastic-looking skin. The overall image should have the authentic quality of professional corporate headshots or LinkedIn profile photos.";
  
  console.log("Generated prompt:", imagePrompt);
  
  return imagePrompt;
}
