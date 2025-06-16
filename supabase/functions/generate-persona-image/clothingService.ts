
export function getPersonaClothing(occupation: string, gender: string, age: string | number, socialClass: string, region: string, urbanRural: string, description: string): string {
  const ageNum = typeof age === 'string' ? parseInt(age) : age;
  const isUrban = urbanRural?.toLowerCase().includes('urban');
  const isFemale = gender?.toLowerCase() === 'female' || gender?.toLowerCase().includes('woman');
  
  // Check for specific style mentions in description for personality-based clothing
  let specificStyle = "";
  let culturalElements = "";
  
  if (description) {
    const styleKeywords = {
      "creative": "artistic and expressive",
      "artistic": "creative and bohemian",
      "unconventional": "unique and individualistic",
      "spiritual": "flowing and mystical",
      "tarot": "mystical with spiritual accessories",
      "consultant": "sophisticated professional",
      "border": "with subtle cultural influences",
      "bilingual": "multicultural style elements",
      "anthropology": "intellectual with cultural awareness",
      "bruja": "with meaningful jewelry and spiritual elements"
    };
    
    Object.entries(styleKeywords).forEach(([keyword, style]) => {
      if (description.toLowerCase().includes(keyword)) {
        specificStyle = style;
      }
    });
    
    // Look for cultural background cues
    if (description.toLowerCase().includes("mexican") || 
        description.toLowerCase().includes("latina") || 
        description.toLowerCase().includes("hispanic") ||
        description.toLowerCase().includes("border")) {
      culturalElements = "with subtle cultural jewelry or accessories that reflect heritage";
    }
  }
  
  // Enhanced occupation-based clothing with more variety and personality
  if (occupation) {
    const occupationLower = occupation.toLowerCase();
    
    // Creative and spiritual professions - more interesting clothing
    if (occupationLower.includes("cultural consultant") || 
        occupationLower.includes("tarot reader") ||
        occupationLower.includes("spiritual")) {
      return isFemale ? 
        `wearing sophisticated bohemian attire - a beautifully draped blouse or artistic wrap top with interesting textures, paired with meaningful jewelry including rings, layered necklaces, or spiritual symbols. The style is professional yet expressive, with rich colors like deep burgundy, forest green, or midnight blue ${culturalElements}` :
        `wearing creative professional attire - an interesting shirt with subtle patterns or rich textures, perhaps with a distinctive jacket or vest, paired with meaningful accessories ${culturalElements}`;
    }
    
    // Consultants and advisors
    if (occupationLower.includes("consultant") && !occupationLower.includes("cultural")) {
      return isFemale ?
        `wearing modern sophisticated attire - a well-tailored blazer in an interesting color like deep teal or rich purple, or a stylish wrap dress with contemporary accessories` :
        `wearing polished casual professional - a quality button-down in an interesting color or subtle pattern, perhaps with a modern jacket`;
    }
    
    // Creative fields - more artistic expression
    if (occupationLower.includes("artist") || occupationLower.includes("designer") || 
        occupationLower.includes("writer") || occupationLower.includes("creative")) {
      const creativeColors = ["rich emerald", "deep sapphire", "warm terracotta", "vintage burgundy", "charcoal with color accents"];
      const randomColor = creativeColors[Math.floor(Math.random() * creativeColors.length)];
      
      return isFemale ?
        `wearing artistic professional attire - a ${randomColor} blouse or creative top with interesting cut or texture, paired with distinctive jewelry or accessories that show personal style` :
        `wearing creative casual attire - a ${randomColor} shirt or interesting sweater that reflects artistic sensibility, with unique details or accessories`;
    }
    
    // Business and finance
    if (occupationLower.includes("business") || occupationLower.includes("finance") || 
        occupationLower.includes("analyst") || occupationLower.includes("manager")) {
      return isFemale ?
        `wearing sharp business attire - a perfectly tailored blazer in navy, charcoal, or deep jewel tone, with sophisticated accessories and polished details` :
        `wearing crisp business attire - a well-fitted dress shirt with a quality tie or modern business casual look`;
    }
    
    // Education and academia
    if (occupationLower.includes("teacher") || occupationLower.includes("professor") || 
        occupationLower.includes("educator") || occupationLower.includes("academic")) {
      return isFemale ?
        `wearing approachable professional attire - a comfortable yet polished cardigan or blazer in warm colors like rust, forest green, or navy, with thoughtful accessories` :
        `wearing academic casual - a quality sweater or button-down shirt in earthy tones, approachable and intellectual`;
    }
    
    // Tech and modern professions
    if (occupationLower.includes("tech") || occupationLower.includes("digital") || 
        occupationLower.includes("developer") || occupationLower.includes("engineer")) {
      return isFemale ?
        `wearing modern casual professional - a sleek blouse or contemporary top in colors like slate blue, graphite, or deep plum, with minimal modern accessories` :
        `wearing tech casual - a modern polo or casual button-down in contemporary colors, clean and current style`;
    }
    
    // Healthcare and wellness
    if (occupationLower.includes("doctor") || occupationLower.includes("nurse") || 
        occupationLower.includes("therapist") || occupationLower.includes("wellness")) {
      return isFemale ?
        `wearing professional healthcare attire - a clean, well-fitted top in calming colors like soft blue, sage green, or warm gray, with professional but caring appearance` :
        `wearing healthcare professional attire - a clean, professional shirt or polo in calming colors, trustworthy and approachable`;
    }
  }
  
  // Age-based styling with more variety
  if (ageNum && ageNum < 30) {
    const youthfulColors = ["vibrant teal", "deep coral", "rich purple", "emerald green", "sophisticated burgundy"];
    const randomColor = youthfulColors[Math.floor(Math.random() * youthfulColors.length)];
    
    return isFemale ?
      `wearing trendy young professional attire - a ${randomColor} blouse or contemporary top with modern styling and youthful energy` :
      `wearing modern young professional - a ${randomColor} shirt or contemporary sweater with current style elements`;
  } else if (ageNum && ageNum >= 30 && ageNum <= 40) {
    const sophisticatedColors = ["deep navy", "rich wine", "forest green", "charcoal with accents", "sophisticated plum"];
    const randomColor = sophisticatedColors[Math.floor(Math.random() * sophisticatedColors.length)];
    
    return isFemale ?
      `wearing sophisticated professional attire - a ${randomColor} blouse or elegant top with refined styling, showing confidence and expertise` :
      `wearing refined professional - a ${randomColor} shirt or quality sweater with sophisticated details`;
  }
  
  // Regional and cultural considerations
  if (region) {
    const regionLower = region.toLowerCase();
    if (regionLower.includes("southwest") || regionLower.includes("texas") || regionLower.includes("border")) {
      return isFemale ?
        `wearing southwestern professional style - rich earth tones or jewel colors with subtle southwestern influences, perhaps turquoise jewelry or cultural accessories ${culturalElements}` :
        `wearing southwestern professional - earth tones or rich colors with subtle regional style influences ${culturalElements}`;
    }
  }
  
  // Use specific style if mentioned in description
  if (specificStyle) {
    return isFemale ?
      `wearing ${specificStyle} attire - clothing that reflects this aesthetic with sophisticated touches and personal flair ${culturalElements}` :
      `wearing ${specificStyle} attire - clothing that reflects this aesthetic with thoughtful details ${culturalElements}`;
  }
  
  // Enhanced default with more variety
  const defaultColors = ["deep teal", "rich burgundy", "sophisticated navy", "forest green", "charcoal with color"];
  const randomDefaultColor = defaultColors[Math.floor(Math.random() * defaultColors.length)];
  
  return isFemale ?
    `wearing polished professional attire - a ${randomDefaultColor} blouse or top with interesting details, well-tailored and confidence-inspiring ${culturalElements}` :
    `wearing quality casual professional - a ${randomDefaultColor} shirt or sweater with refined details ${culturalElements}`;
}
