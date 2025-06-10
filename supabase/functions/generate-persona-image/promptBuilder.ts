
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
    
    // Check for emotional states - focus on natural, subtle expressions
    const emotionalKeywords = {
      "depression": "with a gentle, contemplative expression",
      "depressed": "with a gentle, contemplative expression", 
      "sad": "with a subtle melancholy in their eyes",
      "anxious": "with a slightly concerned but composed expression",
      "anxiety": "with a slightly concerned but composed expression",
      "tired": "with a naturally tired but dignified expression",
      "exhausted": "with a weary but resilient expression",
      "stressed": "with a composed but slightly tense expression",
      "happy": "with a genuine, natural smile and bright eyes",
      "cheerful": "with a warm, authentic smile",
      "optimistic": "with a hopeful, confident expression"
    };
    
    Object.entries(emotionalKeywords).forEach(([keyword, state]) => {
      if (description.toLowerCase().includes(keyword)) {
        emotionalState = state;
      }
    });
    
    // Default to natural, authentic expression if none specified
    if (!emotionalState) {
      emotionalState = "with a natural, authentic expression showing genuine character";
    }
  }
  
  const clothing = getPersonaClothing(occupation, gender, age, socialClass, region, urbanRural, description);
  
  // Build the base prompt - emphasizing photographic realism and natural character
  let imagePrompt = `A professional portrait photograph of a real ${age}-year-old ${ethnicity} ${gender}`;
  
  // Add body type if specified
  if (bodyType) {
    imagePrompt += ` with a naturally ${bodyType} build`;
  }
  
  // Add occupation if available
  if (occupation) {
    imagePrompt += ` who works as a ${occupation}`;
  }
  
  // Add detailed clothing description
  imagePrompt += `, ${clothing}`;
  
  // Add health conditions subtly
  if (healthConditions.length > 0) {
    imagePrompt += `, ${healthConditions.join(", ")}`;
  }
  
  // Add natural emotional state
  if (emotionalState) {
    imagePrompt += `, ${emotionalState}`;
  }
  
  // Enhanced photo-realistic specifications with professional portrait quality
  imagePrompt += `. This is a high-quality professional portrait photograph taken with a full-frame DSLR camera using an 85mm portrait lens. The image should have exceptional detail and realism - natural skin texture with visible pores, fine lines, and authentic human imperfections that make the person look completely real and relatable. Use professional portrait lighting with soft, even illumination that brings out natural skin tones and subtle facial details. The depth of field should be shallow, keeping the subject in sharp focus against a gently blurred, neutral background in soft gray or warm beige tones.`;
  
  // Additional specifics for realistic appearance
  imagePrompt += ` The photograph should capture the authentic character and personality of this individual - not a posed or artificial look, but a genuine moment that reveals their humanity. Focus on realistic facial features, natural hair texture, and authentic details in clothing and accessories.`;
  
  // Body type and age-appropriate details
  if (bodyType === "overweight" || bodyType === "slightly overweight") {
    imagePrompt += " Show realistic facial fullness and body proportions that naturally reflect their weight, portrayed with dignity and authenticity.";
  }
  
  // Final technical specifications
  imagePrompt += " The final image should look like it was taken by a skilled portrait photographer for a professional but approachable headshot - crystal clear, naturally lit, with the warm humanity of the subject shining through. This is not an illustration, artwork, or stylized image - it is a real photograph of a real person.";
  
  console.log("Generated enhanced prompt:", imagePrompt);
  
  return imagePrompt;
}
