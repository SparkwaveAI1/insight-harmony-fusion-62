
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
    
    // Check for emotional states
    const emotionalKeywords = {
      "depression": "with a slightly sad expression",
      "depressed": "with a slightly sad expression",
      "sad": "with a slightly sad expression",
      "anxious": "with a slightly worried expression",
      "anxiety": "with a slightly worried expression",
      "tired": "looking slightly tired",
      "exhausted": "looking slightly tired",
      "stressed": "looking slightly stressed",
      "happy": "with a warm smile",
      "cheerful": "with a friendly smile",
      "optimistic": "with a positive expression"
    };
    
    Object.entries(emotionalKeywords).forEach(([keyword, state]) => {
      if (description.toLowerCase().includes(keyword)) {
        emotionalState = state;
      }
    });
    
    // Default to neutral expression if none specified
    if (!emotionalState) {
      emotionalState = "with a neutral expression";
    }
  }
  
  const clothing = getPersonaClothing(occupation, gender, age, socialClass, region, urbanRural, description);
  
  // Build the base prompt - using photo-realistic specifications
  let imagePrompt = `A photo-realistic portrait of a ${age}-year-old ${ethnicity} ${gender}`;
  
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
  
  // Add photo-realistic specifications
  imagePrompt += `. A photo-realistic portrait, shot with a DSLR camera, natural lighting, ultra-detailed skin texture, shallow depth of field, clean background, 35mm lens, no artistic filters, no drawing or painting effects. This is not an illustration or 3D render — it is a real photograph. Professional headshot style with proper studio lighting, realistic skin texture, and natural facial features. The photo should be well-composed with the subject's face being the main focus, with shoulders visible.`;
  
  // Additional specifics for body type
  if (bodyType === "overweight" || bodyType === "slightly overweight") {
    imagePrompt += " The person should have a realistic face with appropriate fullness that suggests their weight, without exaggeration.";
  }
  
  // Add specifics about photo quality
  imagePrompt += " The photograph should look like it was taken by a professional portrait photographer with clean, natural lighting, shallow depth of field, and accurate skin tones. The background should be simple and neutral (like light gray, soft blue, or beige) to make the subject stand out.";
  
  console.log("Generated prompt:", imagePrompt);
  
  return imagePrompt;
}
