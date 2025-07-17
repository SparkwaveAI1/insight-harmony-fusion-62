
import { HistoricalCharacterFormData } from '../schemas/historicalCharacterSchema';
import { EmotionalTriggersProfile } from '../../services/persona/types/trait-profile';

// Emotional trigger database adapted for historical characters
const CHARACTER_EMOTIONAL_TRIGGERS = {
  // Historical Period Based Triggers
  ancient: {
    positive: [
      { keywords: ["gods", "divine favor", "blessing", "ritual"], emotion_type: "spiritual_connection", intensity_multiplier: 7, description: "Feels deeply connected to divine and spiritual matters" },
      { keywords: ["harvest", "abundance", "plenty", "feast"], emotion_type: "abundance_joy", intensity_multiplier: 6, description: "Celebrates abundance and successful harvests" },
      { keywords: ["honor", "glory", "victory", "triumph"], emotion_type: "honor_pride", intensity_multiplier: 6, description: "Takes great pride in honor and victory" }
    ],
    negative: [
      { keywords: ["famine", "drought", "scarcity", "hunger"], emotion_type: "scarcity_fear", intensity_multiplier: 8, description: "Deep anxiety about resource scarcity" },
      { keywords: ["bad omen", "curse", "angry gods"], emotion_type: "divine_fear", intensity_multiplier: 7, description: "Fears divine displeasure and curses" },
      { keywords: ["exile", "banishment", "outcast"], emotion_type: "isolation_despair", intensity_multiplier: 8, description: "Terrified of being cast out from community" }
    ]
  },

  medieval: {
    positive: [
      { keywords: ["salvation", "blessed", "holy", "sacred"], emotion_type: "religious_devotion", intensity_multiplier: 7, description: "Deeply moved by religious and sacred matters" },
      { keywords: ["duty", "service", "loyalty", "oath"], emotion_type: "duty_satisfaction", intensity_multiplier: 6, description: "Finds fulfillment in duty and service" },
      { keywords: ["guild", "craft", "mastery", "skill"], emotion_type: "craft_pride", intensity_multiplier: 5, description: "Takes pride in skilled craftsmanship" }
    ],
    negative: [
      { keywords: ["heresy", "sin", "damnation", "devil"], emotion_type: "moral_terror", intensity_multiplier: 8, description: "Horrified by sin and spiritual corruption" },
      { keywords: ["plague", "disease", "death", "pestilence"], emotion_type: "mortality_fear", intensity_multiplier: 9, description: "Deep fear of disease and death" },
      { keywords: ["betrayal", "treachery", "broken oath"], emotion_type: "betrayal_rage", intensity_multiplier: 7, description: "Intense anger at broken oaths and betrayal" }
    ]
  },

  // Occupation-based triggers
  healer: {
    positive: [
      { keywords: ["healing", "recovery", "cure", "wellness"], emotion_type: "healing_joy", intensity_multiplier: 8, description: "Deep satisfaction from healing others" },
      { keywords: ["knowledge", "remedy", "treatment"], emotion_type: "knowledge_excitement", intensity_multiplier: 6, description: "Excited by medical knowledge and remedies" }
    ],
    negative: [
      { keywords: ["suffering", "pain", "incurable", "death"], emotion_type: "helplessness_despair", intensity_multiplier: 8, description: "Anguished by inability to help suffering" },
      { keywords: ["ignorance", "superstition", "false cure"], emotion_type: "ignorance_frustration", intensity_multiplier: 6, description: "Frustrated by medical ignorance" }
    ]
  },

  warrior: {
    positive: [
      { keywords: ["battle", "combat", "victory", "courage"], emotion_type: "battle_excitement", intensity_multiplier: 7, description: "Thrilled by combat and shows of courage" },
      { keywords: ["comrades", "brothers", "solidarity"], emotion_type: "brotherhood_bond", intensity_multiplier: 6, description: "Strong bonds with fellow warriors" }
    ],
    negative: [
      { keywords: ["cowardice", "retreat", "dishonor"], emotion_type: "honor_shame", intensity_multiplier: 8, description: "Deeply shamed by cowardice and dishonor" },
      { keywords: ["innocent death", "civilian harm"], emotion_type: "innocent_guilt", intensity_multiplier: 7, description: "Guilt over harm to innocents" }
    ]
  },

  farmer: {
    positive: [
      { keywords: ["good harvest", "fertile soil", "rain"], emotion_type: "abundance_relief", intensity_multiplier: 7, description: "Relief and joy at successful harvests" },
      { keywords: ["family", "children", "legacy"], emotion_type: "family_love", intensity_multiplier: 6, description: "Deep love for family and future generations" }
    ],
    negative: [
      { keywords: ["crop failure", "blight", "drought"], emotion_type: "survival_panic", intensity_multiplier: 9, description: "Panic about survival and family welfare" },
      { keywords: ["tax", "tribute", "seizure"], emotion_type: "exploitation_anger", intensity_multiplier: 7, description: "Anger at exploitation by authorities" }
    ]
  },

  // Social class triggers
  nobility: {
    positive: [
      { keywords: ["respect", "deference", "status"], emotion_type: "status_satisfaction", intensity_multiplier: 5, description: "Satisfied by recognition of status" },
      { keywords: ["legacy", "lineage", "ancestry"], emotion_type: "heritage_pride", intensity_multiplier: 6, description: "Pride in noble heritage and lineage" }
    ],
    negative: [
      { keywords: ["disrespect", "insolence", "challenge"], emotion_type: "authority_outrage", intensity_multiplier: 7, description: "Outraged by challenges to authority" },
      { keywords: ["peasant uprising", "rebellion"], emotion_type: "order_anxiety", intensity_multiplier: 6, description: "Anxious about threats to social order" }
    ]
  },

  common: {
    positive: [
      { keywords: ["fairness", "justice", "equality"], emotion_type: "justice_hope", intensity_multiplier: 6, description: "Hopeful about fair treatment" },
      { keywords: ["community", "neighbors", "mutual aid"], emotion_type: "community_solidarity", intensity_multiplier: 7, description: "Strong bonds with community" }
    ],
    negative: [
      { keywords: ["oppression", "tyranny", "abuse"], emotion_type: "oppression_anger", intensity_multiplier: 8, description: "Angry about oppression and abuse of power" },
      { keywords: ["starvation", "poverty", "desperation"], emotion_type: "desperation_despair", intensity_multiplier: 9, description: "Despair from extreme poverty" }
    ]
  }
};

export function generateCharacterEmotionalTriggers(
  formData: HistoricalCharacterFormData,
  aiGeneratedTraits: any
): EmotionalTriggersProfile {
  console.log('🎭 Generating emotional triggers for character:', formData.name);
  
  const triggers: EmotionalTriggersProfile = {
    positive_triggers: [],
    negative_triggers: []
  };

  try {
    // Analyze character description for emotional contexts
    const descriptionTriggers = analyzeDescriptionForTriggers(formData.description || '');
    triggers.positive_triggers.push(...descriptionTriggers.positive);
    triggers.negative_triggers.push(...descriptionTriggers.negative);

    // Generate historical period-based triggers
    const historicalTriggers = generateHistoricalPeriodTriggers(
      aiGeneratedTraits.historical_period || 'Historical Period',
      formData.date_of_birth
    );
    triggers.positive_triggers.push(...historicalTriggers.positive);
    triggers.negative_triggers.push(...historicalTriggers.negative);

    // Generate occupation-based triggers
    const occupationTriggers = generateOccupationTriggers(
      aiGeneratedTraits.occupation || formData.occupation || 'traditional role'
    );
    triggers.positive_triggers.push(...occupationTriggers.positive);
    triggers.negative_triggers.push(...occupationTriggers.negative);

    // Generate social class triggers
    const socialTriggers = generateSocialClassTriggers(
      aiGeneratedTraits.social_class || formData.social_class || 'common'
    );
    triggers.positive_triggers.push(...socialTriggers.positive);
    triggers.negative_triggers.push(...socialTriggers.negative);

    // Generate personality-based triggers from traits
    const personalityTriggers = generatePersonalityTriggers(formData.personality_traits);
    triggers.positive_triggers.push(...personalityTriggers.positive);
    triggers.negative_triggers.push(...personalityTriggers.negative);

    // Ensure minimum triggers
    if (triggers.positive_triggers.length === 0) {
      triggers.positive_triggers.push({
        keywords: ["success", "accomplishment", "recognition"],
        emotion_type: "achievement",
        intensity_multiplier: 5,
        description: "Feels satisfaction from personal accomplishments"
      });
    }

    if (triggers.negative_triggers.length === 0) {
      triggers.negative_triggers.push({
        keywords: ["injustice", "unfairness", "corruption"],
        emotion_type: "moral_outrage",
        intensity_multiplier: 6,
        description: "Becomes upset by unfairness and corruption"
      });
    }

    console.log(`✅ Generated ${triggers.positive_triggers.length} positive and ${triggers.negative_triggers.length} negative triggers`);
    return triggers;

  } catch (error) {
    console.error('❌ Error generating character emotional triggers:', error);
    return {
      positive_triggers: [{
        keywords: ["kindness", "help", "success"],
        emotion_type: "general_positive",
        intensity_multiplier: 5,
        description: "Responds positively to kindness and success"
      }],
      negative_triggers: [{
        keywords: ["cruelty", "injustice", "harm"],
        emotion_type: "general_negative",
        intensity_multiplier: 6,
        description: "Upset by cruelty and injustice"
      }]
    };
  }
}

function analyzeDescriptionForTriggers(description: string): { positive: any[], negative: any[] } {
  const triggers = { positive: [] as any[], negative: [] as any[] };
  const lowerDesc = description.toLowerCase();

  // Look for specific emotional contexts in description
  if (lowerDesc.includes('healer') || lowerDesc.includes('medicine') || lowerDesc.includes('cure')) {
    triggers.positive.push({
      keywords: ["healing", "recovery", "wellness", "cure"], 
      emotion_type: "healing_satisfaction", 
      intensity_multiplier: 7,
      description: "Deeply satisfied by successful healing"
    });
    triggers.negative.push({
      keywords: ["suffering", "incurable", "death", "pain"], 
      emotion_type: "healing_failure", 
      intensity_multiplier: 8,
      description: "Anguished by inability to heal suffering"
    });
  }

  if (lowerDesc.includes('leader') || lowerDesc.includes('chief') || lowerDesc.includes('elder')) {
    triggers.positive.push({
      keywords: ["respect", "wisdom", "guidance", "unity"], 
      emotion_type: "leadership_pride", 
      intensity_multiplier: 6,
      description: "Pride in providing wise leadership"
    });
    triggers.negative.push({
      keywords: ["discord", "rebellion", "disrespect", "chaos"], 
      emotion_type: "leadership_failure", 
      intensity_multiplier: 7,
      description: "Troubled by group discord and challenges to authority"
    });
  }

  if (lowerDesc.includes('spiritual') || lowerDesc.includes('religious') || lowerDesc.includes('divine')) {
    triggers.positive.push({
      keywords: ["blessing", "divine", "sacred", "holy"], 
      emotion_type: "spiritual_connection", 
      intensity_multiplier: 7,
      description: "Deeply moved by spiritual and sacred experiences"
    });
    triggers.negative.push({
      keywords: ["blasphemy", "sacrilege", "corruption", "sin"], 
      emotion_type: "spiritual_outrage", 
      intensity_multiplier: 8,
      description: "Outraged by spiritual corruption and blasphemy"
    });
  }

  return triggers;
}

function generateHistoricalPeriodTriggers(period: string, dateOfBirth?: string): { positive: any[], negative: any[] } {
  const triggers = { positive: [] as any[], negative: [] as any[] };
  
  if (period.toLowerCase().includes('paleolithic') || period.toLowerCase().includes('stone age')) {
    triggers.positive.push(...CHARACTER_EMOTIONAL_TRIGGERS.ancient.positive);
    triggers.negative.push(...CHARACTER_EMOTIONAL_TRIGGERS.ancient.negative);
  } else if (period.toLowerCase().includes('medieval') || period.toLowerCase().includes('middle ages')) {
    triggers.positive.push(...CHARACTER_EMOTIONAL_TRIGGERS.medieval.positive);
    triggers.negative.push(...CHARACTER_EMOTIONAL_TRIGGERS.medieval.negative);
  } else {
    // Default to ancient for most historical periods
    triggers.positive.push(...CHARACTER_EMOTIONAL_TRIGGERS.ancient.positive.slice(0, 2));
    triggers.negative.push(...CHARACTER_EMOTIONAL_TRIGGERS.ancient.negative.slice(0, 2));
  }

  return triggers;
}

function generateOccupationTriggers(occupation: string): { positive: any[], negative: any[] } {
  const triggers = { positive: [] as any[], negative: [] as any[] };
  const lowerOccupation = occupation.toLowerCase();

  if (lowerOccupation.includes('heal') || lowerOccupation.includes('medic') || lowerOccupation.includes('shaman')) {
    triggers.positive.push(...CHARACTER_EMOTIONAL_TRIGGERS.healer.positive);
    triggers.negative.push(...CHARACTER_EMOTIONAL_TRIGGERS.healer.negative);
  } else if (lowerOccupation.includes('warrior') || lowerOccupation.includes('soldier') || lowerOccupation.includes('fighter')) {
    triggers.positive.push(...CHARACTER_EMOTIONAL_TRIGGERS.warrior.positive);
    triggers.negative.push(...CHARACTER_EMOTIONAL_TRIGGERS.warrior.negative);
  } else if (lowerOccupation.includes('farmer') || lowerOccupation.includes('agricult') || lowerOccupation.includes('crop')) {
    triggers.positive.push(...CHARACTER_EMOTIONAL_TRIGGERS.farmer.positive);
    triggers.negative.push(...CHARACTER_EMOTIONAL_TRIGGERS.farmer.negative);
  }

  return triggers;
}

function generateSocialClassTriggers(socialClass: string): { positive: any[], negative: any[] } {
  const triggers = { positive: [] as any[], negative: [] as any[] };
  const lowerClass = socialClass.toLowerCase();

  if (lowerClass.includes('noble') || lowerClass.includes('upper') || lowerClass.includes('elite')) {
    triggers.positive.push(...CHARACTER_EMOTIONAL_TRIGGERS.nobility.positive);
    triggers.negative.push(...CHARACTER_EMOTIONAL_TRIGGERS.nobility.negative);
  } else {
    triggers.positive.push(...CHARACTER_EMOTIONAL_TRIGGERS.common.positive);
    triggers.negative.push(...CHARACTER_EMOTIONAL_TRIGGERS.common.negative);
  }

  return triggers;
}

function generatePersonalityTriggers(personalityTraits?: string): { positive: any[], negative: any[] } {
  const triggers = { positive: [] as any[], negative: [] as any[] };
  
  if (!personalityTraits) return triggers;
  
  const lowerTraits = personalityTraits.toLowerCase();

  if (lowerTraits.includes('curious') || lowerTraits.includes('inquis')) {
    triggers.positive.push({
      keywords: ["mystery", "discovery", "learning", "knowledge"],
      emotion_type: "curiosity_excitement",
      intensity_multiplier: 6,
      description: "Excited by mysteries and opportunities to learn"
    });
  }

  if (lowerTraits.includes('protective') || lowerTraits.includes('caring')) {
    triggers.negative.push({
      keywords: ["threat", "danger", "harm to others", "vulnerability"],
      emotion_type: "protective_anxiety",
      intensity_multiplier: 7,
      description: "Anxious about threats to those under their protection"
    });
  }

  if (lowerTraits.includes('proud') || lowerTraits.includes('honor')) {
    triggers.negative.push({
      keywords: ["dishonor", "shame", "humiliation", "disrespect"],
      emotion_type: "honor_wounded",
      intensity_multiplier: 7,
      description: "Deeply wounded by dishonor and disrespect"
    });
  }

  return triggers;
}
