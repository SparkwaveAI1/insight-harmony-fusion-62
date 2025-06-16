
import { getPersonaClothing } from "./clothingService.ts";

export function buildImagePrompt(personaData: any): string {
  console.log("Generating enhanced image prompt from persona data");
  
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
  
  // Enhanced age-specific appearance descriptors
  let ageDescriptor = "";
  if (typeof age === 'number') {
    if (age <= 25) {
      ageDescriptor = "youthful, fresh-faced, with smooth skin and bright eyes";
    } else if (age <= 35) {
      ageDescriptor = "young adult appearance, with clear skin and confident demeanor";
    } else if (age <= 45) {
      ageDescriptor = "mature adult with refined features and professional bearing";
    } else if (age <= 55) {
      ageDescriptor = "distinguished middle-aged appearance with some character lines";
    } else {
      ageDescriptor = "mature, dignified appearance with natural aging";
    }
  }
  
  // Physical attributes and personality-based appearance
  let bodyType = "";
  let personalityBasedAppearance = "";
  let healthConditions = [];
  
  // Parse personality traits for appearance cues
  if (traits.big_five) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = traits.big_five;
    
    // High openness = more creative/artistic appearance
    if (openness > 0.7) {
      personalityBasedAppearance += " with an artistic, creative expression and slightly unconventional style";
    } else if (openness < 0.3) {
      personalityBasedAppearance += " with a traditional, conservative appearance";
    }
    
    // High extraversion = more animated, engaging expression
    if (extraversion > 0.7) {
      personalityBasedAppearance += ", animated and engaging facial expression";
    } else if (extraversion < 0.3) {
      personalityBasedAppearance += ", calm and introspective expression";
    }
    
    // High conscientiousness = more polished appearance
    if (conscientiousness > 0.7) {
      personalityBasedAppearance += ", very well-groomed and polished";
    }
  }
  
  // Parse the original description for physical attributes
  if (description) {
    // Body type analysis
    if (description.toLowerCase().includes("overweight") || 
        description.toLowerCase().includes("obese") || 
        description.toLowerCase().includes("heavy")) {
      bodyType = "fuller figure";
    } else if (description.toLowerCase().includes("thin") || 
              description.toLowerCase().includes("skinny")) {
      bodyType = "slender build";
    } else if (description.toLowerCase().includes("athletic") || 
              description.toLowerCase().includes("fit")) {
      bodyType = "athletic build";
    } else {
      bodyType = "average build";
    }
    
    // Health conditions
    const conditionKeywords = {
      "diabetic": "with health considerations",
      "diabetes": "with health considerations",
      "asthma": "with health considerations",
      "chronic": "with health considerations"
    };
    
    Object.entries(conditionKeywords).forEach(([keyword, condition]) => {
      if (description.toLowerCase().includes(keyword)) {
        healthConditions.push(condition);
      }
    });
  }
  
  // Enhanced clothing system
  const clothing = getPersonaClothing(occupation, gender, age, socialClass, region, urbanRural, description);
  
  // Background selection based on personality and occupation
  let backgroundStyle = "";
  if (occupation && occupation.toLowerCase().includes("artist")) {
    backgroundStyle = "artistic studio setting with creative elements softly blurred in the background";
  } else if (occupation && (occupation.toLowerCase().includes("consultant") || occupation.toLowerCase().includes("tarot"))) {
    backgroundStyle = "warm, inviting interior space with soft lighting and cultural elements";
  } else if (traits.big_five?.openness > 0.7) {
    backgroundStyle = "interesting urban environment or creative space, artistically blurred";
  } else if (traits.world_values?.traditional_vs_secular < 0.4) {
    backgroundStyle = "traditional, warm interior setting";
  } else {
    backgroundStyle = "modern, clean environment with interesting architectural elements";
  }
  
  // Photography style based on personality
  let photographyStyle = "";
  if (traits.big_five?.extraversion > 0.6) {
    photographyStyle = "dynamic portrait photography with confident posing and engaging eye contact";
  } else {
    photographyStyle = "intimate portrait photography with thoughtful, contemplative mood";
  }
  
  // Build the enhanced prompt
  let imagePrompt = `A stunning professional portrait photograph of one ${age}-year-old ${ethnicity} ${gender}`;
  
  // Add age-specific appearance
  if (ageDescriptor) {
    imagePrompt += ` with ${ageDescriptor}`;
  }
  
  // Add body type
  if (bodyType) {
    imagePrompt += `, ${bodyType}`;
  }
  
  // Add occupation context
  if (occupation) {
    imagePrompt += ` who works as a ${occupation}`;
  }
  
  // Add clothing
  imagePrompt += `, ${clothing}`;
  
  // Add personality-based appearance
  if (personalityBasedAppearance) {
    imagePrompt += personalityBasedAppearance;
  }
  
  // Add health considerations if any
  if (healthConditions.length > 0) {
    imagePrompt += `, ${healthConditions.join(", ")}`;
  }
  
  // Add photography and background style
  imagePrompt += `. ${photographyStyle} captured in ${backgroundStyle}.`;
  
  // Enhanced technical specifications for photorealism
  imagePrompt += ` Shot with a professional camera - Sony A7R V with 85mm f/1.4 lens at f/2.0 for beautiful bokeh. Perfect studio lighting setup with key light, fill light, and hair light for dimensional depth. Ultra-high resolution capture showing incredible detail - natural skin texture with subtle imperfections, authentic facial expressions, natural hair movement, and realistic fabric textures. Sharp focus on the eyes with natural catchlights that bring life to the portrait.`;
  
  // Age-accurate specifications
  if (typeof age === 'number' && age <= 35) {
    imagePrompt += ` Special attention to youthful features - smooth, clear skin appropriate for someone in their early thirties, bright and alert eyes, natural energy and vitality in expression.`;
  }
  
  // Enhanced realism specifications
  imagePrompt += ` Hyperrealistic photography quality with museum-grade detail. Natural lighting that enhances facial features without being harsh. The image should look like it was taken by a world-class portrait photographer for a premium magazine cover. Every detail should be crisp and lifelike - from individual eyelashes to the texture of clothing fabric.`;
  
  // Critical specifications to prevent artifacts
  imagePrompt += ` CRITICAL REQUIREMENTS: Generate exactly ONE person in the image. No reflections, no mirrors, no duplicates, no multiple faces or figures. Age accuracy is essential - the person must genuinely appear to be ${age} years old, not older or younger. The background should complement the subject without distracting from them. Focus on creating a clean, professional single-person portrait with no visual artifacts, duplications, or confusing elements. This must be a straightforward headshot of one person only.`;
  
  console.log("Generated enhanced prompt:", imagePrompt);
  
  return imagePrompt;
}
