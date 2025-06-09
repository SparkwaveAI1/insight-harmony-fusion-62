
export function getPersonaClothing(occupation: string, gender: string, age: string | number, socialClass: string, region: string, urbanRural: string, description: string): string {
  const ageNum = typeof age === 'string' ? parseInt(age) : age;
  const isUrban = urbanRural?.toLowerCase().includes('urban');
  const isFemale = gender?.toLowerCase() === 'female' || gender?.toLowerCase().includes('woman');
  
  // Check for specific clothing mentions in description
  let specificClothing = "";
  if (description) {
    const clothingKeywords = {
      "casual": "casual",
      "formal": "formal business",
      "creative": "creative and artistic",
      "bohemian": "bohemian style",
      "trendy": "trendy and fashionable",
      "conservative": "conservative and traditional",
      "athletic": "athletic and sporty",
      "vintage": "vintage-inspired",
      "minimalist": "clean and minimalist"
    };
    
    Object.entries(clothingKeywords).forEach(([keyword, style]) => {
      if (description.toLowerCase().includes(keyword)) {
        specificClothing = style;
      }
    });
  }
  
  // Professional occupation-based clothing
  if (occupation) {
    const occupationLower = occupation.toLowerCase();
    
    // Medical professionals
    if (occupationLower.includes("doctor") || occupationLower.includes("physician") || 
        occupationLower.includes("surgeon") || occupationLower.includes("nurse")) {
      return isFemale ? 
        "wearing professional medical attire - a white coat over a blouse or scrubs with a professional appearance" :
        "wearing professional medical attire - a white coat over a dress shirt or medical scrubs";
    }
    
    // Legal professionals
    if (occupationLower.includes("lawyer") || occupationLower.includes("attorney") || 
        occupationLower.includes("judge")) {
      return isFemale ?
        "wearing a sophisticated business suit or blazer with a blouse, professional and authoritative" :
        "wearing a formal business suit with tie, professional and authoritative";
    }
    
    // Corporate/Business
    if (occupationLower.includes("executive") || occupationLower.includes("manager") || 
        occupationLower.includes("consultant") || occupationLower.includes("finance") ||
        occupationLower.includes("analyst")) {
      return isFemale ?
        "wearing modern business attire - a tailored blazer or professional dress" :
        "wearing business formal attire - a suit or dress shirt with slacks";
    }
    
    // Education
    if (occupationLower.includes("teacher") || occupationLower.includes("professor") || 
        occupationLower.includes("educator")) {
      return isFemale ?
        "wearing professional casual attire - a cardigan or blouse with modest jewelry" :
        "wearing smart casual attire - a collared shirt or sweater, approachable and professional";
    }
    
    // Creative fields
    if (occupationLower.includes("artist") || occupationLower.includes("designer") || 
        occupationLower.includes("writer") || occupationLower.includes("photographer") ||
        occupationLower.includes("creative")) {
      return isFemale ?
        "wearing creative and expressive clothing - an artistic blouse or unique accessories that reflect creativity" :
        "wearing creative casual attire - an interesting shirt or jacket that shows artistic sensibility";
    }
    
    // Tech/Engineering
    if (occupationLower.includes("engineer") || occupationLower.includes("developer") || 
        occupationLower.includes("programmer") || occupationLower.includes("tech")) {
      return isFemale ?
        "wearing modern casual attire - a comfortable blouse or sweater, practical yet stylish" :
        "wearing tech casual - a polo shirt or casual button-down, comfortable and modern";
    }
    
    // Service industry
    if (occupationLower.includes("retail") || occupationLower.includes("customer service") || 
        occupationLower.includes("hospitality")) {
      return isFemale ?
        "wearing neat casual attire - a clean blouse or uniform-appropriate top" :
        "wearing service industry attire - a polo shirt or clean casual shirt";
    }
    
    // Trades/Manual labor
    if (occupationLower.includes("construction") || occupationLower.includes("mechanic") || 
        occupationLower.includes("electrician") || occupationLower.includes("plumber")) {
      return isFemale ?
        "wearing practical work attire - a durable shirt or uniform appropriate for manual work" :
        "wearing work attire - a sturdy shirt or work uniform, practical and durable";
    }
    
    // Healthcare support
    if (occupationLower.includes("therapist") || occupationLower.includes("counselor") || 
        occupationLower.includes("social worker")) {
      return isFemale ?
        "wearing approachable professional attire - a soft blouse or cardigan, warm and trustworthy" :
        "wearing approachable casual attire - a sweater or casual shirt, warm and professional";
    }
    
    // Food service
    if (occupationLower.includes("chef") || occupationLower.includes("cook") || 
        occupationLower.includes("restaurant")) {
      return isFemale ?
        "wearing culinary attire - chef's coat or restaurant uniform adapted for women" :
        "wearing chef attire - a chef's coat or professional kitchen uniform";
    }
    
    // Law enforcement/Security
    if (occupationLower.includes("police") || occupationLower.includes("officer") ||
        occupationLower.includes("security") || occupationLower.includes("detective")) {
      return isFemale ?
        "wearing professional uniform or business attire appropriate for law enforcement" :
        "wearing professional uniform or business attire appropriate for law enforcement";
    }
  }
  
  // Age-based defaults if no specific occupation
  if (ageNum && ageNum < 25) {
    return isFemale ?
      "wearing trendy young adult clothing - a stylish top that reflects current fashion" :
      "wearing modern young adult attire - a contemporary shirt or sweater";
  } else if (ageNum && ageNum > 60) {
    return isFemale ?
      "wearing classic mature attire - an elegant blouse or cardigan, timeless and refined" :
      "wearing distinguished mature attire - a quality shirt or sweater, classic and refined";
  }
  
  // Social class considerations
  if (socialClass) {
    const classLower = socialClass.toLowerCase();
    if (classLower.includes("upper") || classLower.includes("wealthy")) {
      return isFemale ?
        "wearing upscale attire - a high-quality blouse or designer top, sophisticated and well-tailored" :
        "wearing upscale attire - a quality dress shirt or fine sweater, sophisticated and well-made";
    } else if (classLower.includes("working")) {
      return isFemale ?
        "wearing practical everyday attire - a comfortable and modest blouse or shirt" :
        "wearing practical everyday attire - a comfortable shirt or casual wear";
    }
  }
  
  // Regional considerations
  if (region) {
    const regionLower = region.toLowerCase();
    if (regionLower.includes("south")) {
      return isFemale ?
        "wearing Southern-appropriate attire - a nice blouse or top suitable for warm weather" :
        "wearing Southern-appropriate attire - a collared shirt suitable for warm climate";
    } else if (regionLower.includes("north") || regionLower.includes("midwest")) {
      return isFemale ?
        "wearing weather-appropriate attire - a blouse or sweater suitable for variable weather" :
        "wearing weather-appropriate attire - a shirt or sweater suitable for cooler climate";
    }
  }
  
  // Use specific clothing style if mentioned in description
  if (specificClothing) {
    return isFemale ?
      `wearing ${specificClothing} attire - clothing that reflects this aesthetic in women's fashion` :
      `wearing ${specificClothing} attire - clothing that reflects this aesthetic in men's fashion`;
  }
  
  // Default general clothing
  return isFemale ?
    "wearing casual professional attire - a nice blouse or top, approachable and well-dressed" :
    "wearing casual professional attire - a collared shirt or sweater, approachable and well-dressed";
}
