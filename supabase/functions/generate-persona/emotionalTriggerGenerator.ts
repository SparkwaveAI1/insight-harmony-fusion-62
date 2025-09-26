import { PersonaTemplate } from "./types.ts";

// Comprehensive emotional trigger database
const EMOTIONAL_TRIGGER_DATABASE = {
  // Basic Emotions
  anger: {
    keywords: ["stupid", "idiotic", "waste", "corruption", "injustice", "unfair", "cheating", "lying"],
    intensity: 6,
    description: "Experiences strong anger when encountering perceived injustice or stupidity"
  },
  
  joy: {
    keywords: ["achievement", "success", "celebration", "victory", "accomplished", "proud", "excellent"],
    intensity: 5,
    description: "Feels genuine happiness and excitement about positive outcomes"
  },
  
  sadness: {
    keywords: ["loss", "death", "goodbye", "ending", "failure", "disappointed", "broken"],
    intensity: 4,
    description: "Becomes melancholy when facing loss or disappointment"
  },
  
  fear: {
    keywords: ["dangerous", "threat", "risk", "unsafe", "scary", "worried", "anxious"],
    intensity: 5,
    description: "Experiences genuine fear and anxiety about threats or uncertainty"
  },
  
  disgust: {
    keywords: ["revolting", "disgusting", "immoral", "unethical", "gross", "repulsive"],
    intensity: 6,
    description: "Shows strong moral or physical revulsion"
  },
  
  // Complex Emotions
  contempt: {
    keywords: ["pathetic", "inferior", "worthless", "beneath", "lowly", "peasant"],
    intensity: 7,
    description: "Displays disdain and superiority toward perceived inferiors"
  },
  
  pride: {
    keywords: ["my work", "I created", "I built", "my achievement", "I accomplished"],
    intensity: 5,
    description: "Takes great pride in personal accomplishments and contributions"
  },
  
  shame: {
    keywords: ["embarrassing", "humiliating", "ashamed", "guilty", "regret"],
    intensity: 6,
    description: "Feels deep shame and embarrassment about failures or mistakes"
  },
  
  envy: {
    keywords: ["they have", "others get", "not fair that", "why them", "I deserve"],
    intensity: 5,
    description: "Experiences jealousy and resentment about others' advantages"
  },
  
  nostalgia: {
    keywords: ["back then", "the old days", "used to be", "remember when", "those times"],
    intensity: 4,
    description: "Becomes wistful and emotional about past experiences"
  },
  
  // Social Emotions
  embarrassment: {
    keywords: ["awkward", "cringe", "uncomfortable", "social mistake", "foolish"],
    intensity: 5,
    description: "Feels acute social discomfort and self-consciousness"
  },
  
  loyalty: {
    keywords: ["my people", "my group", "my team", "us vs them", "betray"],
    intensity: 6,
    description: "Shows fierce loyalty to in-group and anger at betrayal"
  },
  
  protective: {
    keywords: ["harm", "protect", "defend", "family", "children", "vulnerable"],
    intensity: 7,
    description: "Becomes intensely protective of loved ones or vulnerable people"
  },
  
  // Cognitive Emotions
  curiosity: {
    keywords: ["how does", "why", "interesting", "tell me more", "fascinating"],
    intensity: 4,
    description: "Shows genuine intellectual interest and engagement"
  },
  
  confusion: {
    keywords: ["don't understand", "makes no sense", "confusing", "unclear"],
    intensity: 3,
    description: "Expresses genuine bewilderment and need for clarification"
  },
  
  skepticism: {
    keywords: ["doubt", "suspicious", "prove it", "evidence", "really?"],
    intensity: 5,
    description: "Displays healthy doubt and demands evidence for claims"
  },
  
  // Values-Based Emotions
  moral_outrage: {
    keywords: ["wrong", "evil", "immoral", "should be ashamed", "disgusting behavior"],
    intensity: 8,
    description: "Experiences intense moral indignation about ethical violations"
  },
  
  righteousness: {
    keywords: ["right thing", "moral duty", "principle", "stand up for"],
    intensity: 6,
    description: "Feels strong conviction about moral principles and doing right"
  },
  
  betrayal: {
    keywords: ["trusted you", "stabbed in back", "broke promise", "let me down"],
    intensity: 7,
    description: "Feels deep hurt and anger when trust is violated"
  },
  
  validation: {
    keywords: ["you understand", "exactly", "finally someone", "you get it"],
    intensity: 5,
    description: "Feels relief and connection when understood or validated"
  }
};

// Personality-based trigger assignment patterns
const TRAIT_TRIGGER_PATTERNS = {
  // Big Five
  high_neuroticism: ["fear", "anxiety", "embarrassment", "shame", "worry"],
  low_neuroticism: ["calm", "stable", "resilient"],
  high_extraversion: ["social_excitement", "validation", "attention"],
  low_extraversion: ["overstimulation", "social_exhaustion"],
  high_openness: ["curiosity", "intellectual_excitement", "novelty"],
  low_openness: ["change_resistance", "tradition_comfort"],
  high_agreeableness: ["harmony_disruption", "conflict_distress", "protective"],
  low_agreeableness: ["contempt", "competitive_anger"],
  high_conscientiousness: ["disorder_frustration", "achievement_pride"],
  low_conscientiousness: ["pressure_resistance", "structure_rebellion"],
  
  // Moral Foundations
  high_care: ["suffering_distress", "protective", "empathy"],
  high_fairness: ["injustice_anger", "inequality_outrage"],
  high_loyalty: ["betrayal", "group_pride", "tribal_anger"],
  high_authority: ["disrespect_anger", "hierarchy_comfort"],
  high_sanctity: ["disgust", "moral_outrage", "purity_concern"],
  high_liberty: ["oppression_anger", "freedom_joy"],
  
  // Occupation-based
  teacher: ["student_success_joy", "ignorance_frustration", "learning_excitement"],
  doctor: ["healing_satisfaction", "suffering_distress", "life_protection"],
  engineer: ["problem_solving_joy", "inefficiency_frustration", "precision_pride"],
  artist: ["creativity_joy", "criticism_sensitivity", "beauty_appreciation"],
  business: ["success_pride", "competition_excitement", "failure_fear"],
  military: ["duty_pride", "discipline_respect", "chaos_frustration"],
  
  // Cultural background
  individualistic: ["personal_achievement", "independence_pride", "group_pressure_resistance"],
  collectivistic: ["group_harmony", "family_pride", "isolation_distress"],
  
  // Political orientation
  conservative: ["tradition_comfort", "change_anxiety", "order_preference"],
  liberal: ["progress_excitement", "inequality_anger", "diversity_celebration"],
  
  // Education level
  high_education: ["intellectual_pride", "ignorance_frustration", "evidence_demand"],
  low_education: ["condescension_anger", "practical_wisdom", "elite_skepticism"]
};

export function generateEmotionalTriggers(persona: PersonaTemplate, userPrompt: string): any {
  console.log('Generating emotional triggers for persona:', persona.name);
  
  const triggers = {
    positive_triggers: [] as any[],
    negative_triggers: [] as any[]
  };
  
  try {
    // Analyze user prompt for specific emotional contexts
    const promptTriggers = analyzePromptForTriggers(userPrompt);
    triggers.positive_triggers.push(...promptTriggers.positive);
    triggers.negative_triggers.push(...promptTriggers.negative);
    
    // Generate trait-based triggers
    const traitTriggers = generateTraitBasedTriggers(persona);
    triggers.positive_triggers.push(...traitTriggers.positive);
    triggers.negative_triggers.push(...traitTriggers.negative);
    
    // Generate demographic-based triggers
    const demoTriggers = generateDemographicTriggers(persona);
    triggers.positive_triggers.push(...demoTriggers.positive);
    triggers.negative_triggers.push(...demoTriggers.negative);
    
    // Generate background-based triggers
    const backgroundTriggers = generateBackgroundTriggers(persona);
    triggers.positive_triggers.push(...backgroundTriggers.positive);
    triggers.negative_triggers.push(...backgroundTriggers.negative);
    
    // Ensure we have at least some basic triggers
    if (triggers.positive_triggers.length === 0) {
      triggers.positive_triggers.push(createTrigger("curiosity", ["interesting", "tell me more"], 4, "Shows interest in learning"));
    }
    
    if (triggers.negative_triggers.length === 0) {
      triggers.negative_triggers.push(createTrigger("frustration", ["waste", "pointless"], 5, "Gets frustrated with inefficiency"));
    }
    
    console.log(`Generated ${triggers.positive_triggers.length} positive and ${triggers.negative_triggers.length} negative triggers`);
    return triggers;
    
  } catch (error) {
    console.error('Error generating emotional triggers:', error);
    // Return basic fallback triggers
    return {
      positive_triggers: [
        createTrigger("curiosity", ["interesting", "tell me more"], 4, "Shows interest in learning")
      ],
      negative_triggers: [
        createTrigger("frustration", ["waste", "pointless"], 5, "Gets frustrated with inefficiency")
      ]
    };
  }
}

function analyzePromptForTriggers(prompt: string): { positive: any[], negative: any[] } {
  const triggers = { positive: [] as any[], negative: [] as any[] };
  const lowerPrompt = prompt.toLowerCase();
  
  // Look for emotional cues in the user's description
  if (lowerPrompt.includes("angry") || lowerPrompt.includes("frustrated")) {
    triggers.negative.push(createTrigger("anger", ["incompetence", "waste", "stupid"], 7, "Gets frustrated with incompetence and waste"));
  }
  
  if (lowerPrompt.includes("passionate") || lowerPrompt.includes("caring")) {
    triggers.positive.push(createTrigger("passion", ["making a difference", "helping", "meaningful"], 6, "Shows passion for meaningful causes"));
  }
  
  if (lowerPrompt.includes("skeptical") || lowerPrompt.includes("critical")) {
    triggers.negative.push(createTrigger("skepticism", ["unproven", "claims", "believe"], 5, "Questions unsubstantiated claims"));
  }
  
  if (lowerPrompt.includes("proud") || lowerPrompt.includes("achievement")) {
    triggers.positive.push(createTrigger("pride", ["accomplishment", "success", "achievement"], 5, "Takes pride in accomplishments"));
  }
  
  // Extract specific topics mentioned in prompt for context-sensitive triggers
  const topics = extractTopicsFromPrompt(prompt);
  for (const topic of topics) {
    triggers.positive.push(createTrigger("interest", [topic, `${topic} discussion`], 4, `Shows interest in ${topic}`));
  }
  
  return triggers;
}

function generateTraitBasedTriggers(persona: PersonaTemplate): { positive: any[], negative: any[] } {
  const triggers = { positive: [] as any[], negative: [] as any[] };
  
  // Big Five based triggers
  if (parseFloat(persona.trait_profile.big_five.neuroticism || '0') > 0.6) {
    triggers.negative.push(createTrigger("anxiety", ["uncertain", "risky", "unknown"], 6, "Gets anxious about uncertainty"));
    triggers.negative.push(createTrigger("overwhelm", ["too much", "pressure", "stress"], 5, "Feels overwhelmed by pressure"));
  }
  
  if (parseFloat(persona.trait_profile.big_five.openness || '0') > 0.7) {
    triggers.positive.push(createTrigger("curiosity", ["new idea", "different perspective", "innovative"], 5, "Excited by new ideas"));
    triggers.positive.push(createTrigger("creativity", ["creative", "artistic", "original"], 6, "Appreciates creativity and originality"));
  }
  
  if (parseFloat(persona.trait_profile.big_five.agreeableness || '0') > 0.7) {
    triggers.negative.push(createTrigger("conflict_distress", ["argument", "fighting", "hostile"], 6, "Distressed by conflict and hostility"));
    triggers.positive.push(createTrigger("harmony", ["cooperation", "working together", "unity"], 5, "Values harmony and cooperation"));
  }
  
  if (parseFloat(persona.trait_profile.big_five.conscientiousness || '0') > 0.7) {
    triggers.negative.push(createTrigger("disorder_frustration", ["messy", "disorganized", "chaotic"], 5, "Frustrated by disorder"));
    triggers.positive.push(createTrigger("achievement", ["goal", "complete", "accomplish"], 6, "Motivated by achievement"));
  }
  
  // Moral foundations triggers
  if (parseFloat(persona.trait_profile.moral_foundations.care || '0') > 0.7) {
    triggers.negative.push(createTrigger("suffering", ["pain", "hurt", "suffering"], 7, "Distressed by others' suffering"));
    triggers.positive.push(createTrigger("healing", ["help", "heal", "comfort"], 6, "Gratified by helping others"));
  }
  
  if (parseFloat(persona.trait_profile.moral_foundations.fairness || '0') > 0.7) {
    triggers.negative.push(createTrigger("injustice", ["unfair", "biased", "discrimination"], 8, "Outraged by unfairness"));
    triggers.positive.push(createTrigger("justice", ["fair", "equal", "justice"], 6, "Satisfied by fairness"));
  }
  
  return triggers;
}

function generateDemographicTriggers(persona: PersonaTemplate): { positive: any[], negative: any[] } {
  const triggers = { positive: [] as any[], negative: [] as any[] };
  
  // Age-based triggers
  const age = persona.metadata.age;
  if (age && age > 50) {
    triggers.positive.push(createTrigger("nostalgia", ["back then", "the old days", "remember when"], 4, "Nostalgic about past eras"));
    triggers.negative.push(createTrigger("change_resistance", ["these days", "modern", "new way"], 3, "Skeptical of modern changes"));
  }
  
  if (age && age < 30) {
    triggers.positive.push(createTrigger("progress", ["future", "innovation", "change"], 5, "Excited about progress and change"));
    triggers.negative.push(createTrigger("outdated", ["old-fashioned", "traditional", "outdated"], 4, "Dismissive of outdated approaches"));
  }
  
  // Gender-specific considerations (carefully avoiding stereotypes, focusing on societal experiences)
  if (persona.metadata.gender === "female") {
    triggers.negative.push(createTrigger("dismissal", ["mansplaining", "talked over", "dismissed"], 6, "Frustrated by being dismissed or patronized"));
  }
  
  // Regional triggers
  if (persona.metadata.region?.includes("South")) {
    triggers.positive.push(createTrigger("hospitality", ["welcoming", "hospitality", "manners"], 5, "Values hospitality and manners"));
  }
  
  return triggers;
}

function generateBackgroundTriggers(persona: PersonaTemplate): { positive: any[], negative: any[] } {
  const triggers = { positive: [] as any[], negative: [] as any[] };
  
  // Occupation-based triggers
  const occupation = persona.metadata.occupation?.toLowerCase();
  
  if (occupation?.includes("teacher") || occupation?.includes("education")) {
    triggers.positive.push(createTrigger("learning", ["understand", "learn", "teach"], 5, "Excited by learning opportunities"));
    triggers.negative.push(createTrigger("ignorance", ["don't want to learn", "stupid", "ignorant"], 6, "Frustrated by willful ignorance"));
  }
  
  if (occupation?.includes("doctor") || occupation?.includes("medical")) {
    triggers.positive.push(createTrigger("healing", ["health", "healing", "helping people"], 6, "Motivated by helping heal people"));
    triggers.negative.push(createTrigger("suffering", ["pain", "illness", "death"], 7, "Deeply affected by suffering"));
  }
  
  if (occupation?.includes("engineer") || occupation?.includes("technical")) {
    triggers.positive.push(createTrigger("problem_solving", ["solve", "fix", "efficient"], 5, "Enjoys solving complex problems"));
    triggers.negative.push(createTrigger("inefficiency", ["wasteful", "inefficient", "broken"], 5, "Frustrated by inefficiency"));
  }
  
  // Education level triggers
  if (persona.metadata.education_level?.includes("graduate") || persona.metadata.education_level?.includes("PhD")) {
    triggers.positive.push(createTrigger("intellectual", ["research", "evidence", "analysis"], 5, "Appreciates intellectual rigor"));
    triggers.negative.push(createTrigger("anti_intellectual", ["don't need experts", "common sense", "ivory tower"], 6, "Frustrated by anti-intellectual attitudes"));
  }
  
  return triggers;
}

function createTrigger(emotionType: string, keywords: string[], intensity: number, description: string) {
  return {
    keywords,
    emotion_type: emotionType,
    intensity_multiplier: intensity,
    description
  };
}

function extractTopicsFromPrompt(prompt: string): string[] {
  const topics: string[] = [];
  const commonTopics = ["politics", "technology", "art", "music", "sports", "science", "business", "education", "health", "environment"];
  
  for (const topic of commonTopics) {
    if (prompt.toLowerCase().includes(topic)) {
      topics.push(topic);
    }
  }
  
  return topics;
}
