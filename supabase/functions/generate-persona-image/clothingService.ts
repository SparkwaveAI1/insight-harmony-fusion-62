
export function getPersonaClothing(occupation: string, gender: string, age: string | number, socialClass: string, region: string, urbanRural: string, description: string): string {
  const ageNum = typeof age === 'string' ? parseInt(age) : age;
  const isUrban = urbanRural?.toLowerCase().includes('urban');
  const isFemale = gender?.toLowerCase() === 'female' || gender?.toLowerCase().includes('woman');
  
  // Check for specific clothing mentions in description
  let specificClothing = "";
  if (description) {
    const clothingKeywords = {
      "casual": "casual and comfortable",
      "formal": "formal and polished", 
      "creative": "creative and expressive",
      "bohemian": "bohemian and free-spirited",
      "trendy": "trendy and fashion-forward",
      "conservative": "conservative and traditional",
      "athletic": "athletic and active",
      "vintage": "vintage-inspired and classic",
      "minimalist": "clean and minimalist"
    };
    
    Object.entries(clothingKeywords).forEach(([keyword, style]) => {
      if (description.toLowerCase().includes(keyword)) {
        specificClothing = style;
      }
    });
  }
  
  // Professional occupation-based clothing with enhanced detail
  if (occupation) {
    const occupationLower = occupation.toLowerCase();
    
    // Medical professionals
    if (occupationLower.includes("doctor") || occupationLower.includes("physician") || 
        occupationLower.includes("surgeon") || occupationLower.includes("nurse")) {
      return isFemale ? 
        "wearing a crisp white medical coat over a professional blouse in navy or light blue, with a stethoscope around their neck and subtle, professional jewelry" :
        "wearing a clean white medical coat over a pressed dress shirt and tie, with a stethoscope visible and an air of professional competence";
    }
    
    // Legal professionals
    if (occupationLower.includes("lawyer") || occupationLower.includes("attorney") || 
        occupationLower.includes("judge")) {
      return isFemale ?
        "wearing a sophisticated charcoal or navy business suit with a crisp white or light blue blouse, understated professional jewelry, and an authoritative yet approachable demeanor" :
        "wearing a well-tailored dark business suit with a pressed white shirt and silk tie, polished and professional with an air of quiet authority";
    }
    
    // Corporate/Business
    if (occupationLower.includes("executive") || occupationLower.includes("manager") || 
        occupationLower.includes("consultant") || occupationLower.includes("finance") ||
        occupationLower.includes("analyst")) {
      return isFemale ?
        "wearing modern business attire - a tailored blazer in navy or charcoal over a silk blouse, with tasteful accessories and a confident, professional appearance" :
        "wearing contemporary business attire - a well-fitted suit jacket with a quality dress shirt, no tie for a modern look, appearing polished and successful";
    }
    
    // Education
    if (occupationLower.includes("teacher") || occupationLower.includes("professor") || 
        occupationLower.includes("educator")) {
      return isFemale ?
        "wearing professional casual attire - a soft cardigan or blazer over a comfortable blouse, with reading glasses and warm, approachable styling that reflects their educational role" :
        "wearing smart casual attire - a comfortable sweater or collared shirt with a sport coat, appearing knowledgeable and approachable with an intellectual bearing";
    }
    
    // Creative fields
    if (occupationLower.includes("artist") || occupationLower.includes("designer") || 
        occupationLower.includes("writer") || occupationLower.includes("photographer") ||
        occupationLower.includes("creative")) {
      return isFemale ?
        "wearing creative, expressive clothing - a unique blouse or artistic top with interesting textures or patterns, layered jewelry that reflects their creative spirit" :
        "wearing creative casual attire - an interesting shirt or jacket with artistic flair, perhaps a scarf or unique accessory that shows their creative personality";
    }
    
    // Tech/Engineering
    if (occupationLower.includes("engineer") || occupationLower.includes("developer") || 
        occupationLower.includes("programmer") || occupationLower.includes("tech")) {
      return isFemale ?
        "wearing modern casual professional attire - a comfortable yet stylish blouse or sweater, practical but contemporary styling that reflects the tech industry culture" :
        "wearing tech casual - a quality polo shirt or casual button-down, comfortable and modern with a relaxed but professional appearance";
    }
    
    // Service industry
    if (occupationLower.includes("retail") || occupationLower.includes("customer service") || 
        occupationLower.includes("hospitality")) {
      return isFemale ?
        "wearing neat, professional casual attire - a clean, well-fitted blouse or polo shirt appropriate for customer interaction, appearing friendly and approachable" :
        "wearing service industry appropriate attire - a clean polo shirt or casual dress shirt, neat and professional with a welcoming demeanor";
    }
    
    // Trades/Manual labor
    if (occupationLower.includes("construction") || occupationLower.includes("mechanic") || 
        occupationLower.includes("electrician") || occupationLower.includes("plumber")) {
      return isFemale ?
        "wearing practical work attire - a durable, well-fitted work shirt or polo, appearing competent and professional in their trade" :
        "wearing quality work attire - a sturdy work shirt or polo, clean and professional despite the hands-on nature of their work";
    }
    
    // Healthcare support
    if (occupationLower.includes("therapist") || occupationLower.includes("counselor") || 
        occupationLower.includes("social worker")) {
      return isFemale ?
        "wearing warm, approachable professional attire - a soft cardigan or blouse in calming colors, appearing trustworthy and compassionate" :
        "wearing approachable professional attire - a comfortable sweater or casual shirt, warm and trustworthy with a caring demeanor";
    }
    
    // Food service
    if (occupationLower.includes("chef") || occupationLower.includes("cook") || 
        occupationLower.includes("restaurant")) {
      return isFemale ?
        "wearing professional culinary attire - a clean chef's coat or kitchen uniform adapted for women, appearing skilled and passionate about their craft" :
        "wearing professional kitchen attire - a clean chef's coat or quality kitchen uniform, appearing experienced and dedicated to their culinary work";
    }
    
    // Law enforcement/Security
    if (occupationLower.includes("police") || occupationLower.includes("officer") ||
        occupationLower.includes("security") || occupationLower.includes("detective")) {
      return isFemale ?
        "wearing professional uniform or business attire appropriate for law enforcement, appearing authoritative yet approachable" :
        "wearing professional uniform or business attire appropriate for law enforcement, appearing confident and trustworthy";
    }
  }
  
  // Age-based defaults if no specific occupation with enhanced detail
  if (ageNum && ageNum < 25) {
    return isFemale ?
      "wearing contemporary young adult fashion - a stylish, on-trend top that reflects current fashion while remaining appropriate and authentic" :
      "wearing modern young adult attire - a contemporary shirt or sweater that shows they're current with fashion trends";
  } else if (ageNum && ageNum > 60) {
    return isFemale ?
      "wearing classic, elegant attire - a refined blouse or cardigan in quality fabrics, timeless and sophisticated with tasteful accessories" :
      "wearing distinguished mature attire - a quality shirt or sweater in classic styling, refined and dignified with an air of experience";
  }
  
  // Social class considerations with enhanced detail
  if (socialClass) {
    const classLower = socialClass.toLowerCase();
    if (classLower.includes("upper") || classLower.includes("wealthy")) {
      return isFemale ?
        "wearing high-quality, sophisticated attire - a beautifully tailored blouse or top in luxury fabrics, with subtle but expensive accessories that speak to refined taste" :
        "wearing upscale, well-made attire - a quality dress shirt or fine sweater in premium materials, sophisticated and understated luxury";
    } else if (classLower.includes("working")) {
      return isFemale ?
        "wearing practical, comfortable everyday attire - a modest, well-maintained blouse or shirt that reflects dignity and hard work" :
        "wearing honest, practical everyday attire - a clean, comfortable shirt that reflects their working-class values and dignity";
    }
  }
  
  // Regional considerations with enhanced detail
  if (region) {
    const regionLower = region.toLowerCase();
    if (regionLower.includes("south")) {
      return isFemale ?
        "wearing Southern-appropriate attire - a breathable, elegant blouse in lighter fabrics suitable for warm weather, with classic Southern style" :
        "wearing Southern gentleman attire - a quality collared shirt suitable for warm climate, classic and refined";
    } else if (regionLower.includes("north") || regionLower.includes("midwest")) {
      return isFemale ?
        "wearing weather-appropriate Northern attire - a comfortable blouse or sweater in layers suitable for variable weather, practical yet stylish" :
        "wearing Northern climate attire - a shirt or sweater appropriate for cooler weather, practical and well-made";
    }
  }
  
  // Use specific clothing style if mentioned in description
  if (specificClothing) {
    return isFemale ?
      `wearing ${specificClothing} attire - clothing that authentically reflects this aesthetic in women's fashion with attention to realistic detail and fabric texture` :
      `wearing ${specificClothing} attire - clothing that authentically reflects this aesthetic in men's fashion with realistic detail and quality materials`;
  }
  
  // Default general clothing with enhanced realism
  return isFemale ?
    "wearing authentic casual professional attire - a well-fitted, quality blouse or top in flattering colors, appearing naturally stylish and genuine" :
    "wearing genuine casual professional attire - a quality collared shirt or sweater that fits well and shows good taste, naturally confident and authentic";
}
