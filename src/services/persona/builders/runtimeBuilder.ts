import { PersonaV2 } from '../../../types/persona-v2';

export interface RuntimeBuilderOptions {
  identity: PersonaV2['identity'];
  cognitive: PersonaV2['cognitive_profile'];
  social: PersonaV2['social_cognition'];
  health: PersonaV2['health_profile'];
  sexuality?: PersonaV2['sexuality_profile'];
  seed: string;
}

export interface RuntimeResult {
  sexuality_hooks_summary: {
    privacy: "private" | "selective" | "open";
    disclosure: "low" | "medium" | "high";
    humor_style_bias: string;
    flirtation_responsiveness: number;
    innuendo_comfort: number;
    romantic_availability: number;
  };
  anti_mode_collapse: {
    forbidden_frames: string[];
    must_include_one_of: Record<string, string[]>;
    uniqueness_enforcements: string[];
  };
  memory_keys: string[];
  performance_tuning: {
    max_tokens_per_response: number;
    temperature_base: number;
    presence_penalty: number;
    frequency_penalty: number;
    top_p: number;
  };
  validation_rules: {
    min_signature_tokens: number;
    max_hedge_density: number;
    min_specificity_score: number;
    banned_cliche_patterns: string[];
  };
}

export function buildRuntimeControls(options: RuntimeBuilderOptions): RuntimeResult {
  const { identity, cognitive, social, health, sexuality, seed } = options;
  const rng = createSeededRNG(hashSeed(seed));

  // Build sexuality handling summary
  const sexuality_hooks_summary = buildSexualityHooks(sexuality, cognitive, social, identity, rng);
  
  // Anti-mode-collapse system
  const anti_mode_collapse = buildAntiModeCollapse(cognitive, social, identity, rng);
  
  // Memory anchor points
  const memory_keys = buildMemoryKeys(identity, cognitive, rng);
  
  // Performance optimization settings
  const performance_tuning = buildPerformanceTuning(cognitive, health, rng);
  
  // Response validation rules
  const validation_rules = buildValidationRules(cognitive, social, rng);

  return {
    sexuality_hooks_summary,
    anti_mode_collapse,
    memory_keys,
    performance_tuning,
    validation_rules
  };
}

function buildSexualityHooks(
  sexuality: PersonaV2['sexuality_profile'] | undefined,
  cognitive: PersonaV2['cognitive_profile'],
  social: PersonaV2['social_cognition'],
  identity: PersonaV2['identity'],
  rng: () => number
): RuntimeResult['sexuality_hooks_summary'] {
  
  // Default conservative settings
  let privacy: "private" | "selective" | "open" = "selective";
  let disclosure: "low" | "medium" | "high" = "low";
  let humor_style_bias = "clean";
  let flirtation_responsiveness = 0.1;
  let innuendo_comfort = 0.1;
  let romantic_availability = 0.2;
  
  if (sexuality) {
    // Map privacy preference
    privacy = sexuality.privacy_preference === "public" ? "open" :
              sexuality.privacy_preference === "selective" ? "selective" : "private";
    
    // Disclosure level based on privacy + openness
    if (privacy === "open" && cognitive.big_five.openness > 0.6) {
      disclosure = "high";
    } else if (privacy === "selective" && cognitive.big_five.extraversion > 0.5) {
      disclosure = "medium";
    } else {
      disclosure = "low";
    }
    
    // Flirtation responsiveness
    flirtation_responsiveness = privacy === "open" ? 0.7 :
                               privacy === "selective" ? 0.4 : 0.1;
    
    // Adjust for relationship status
    if (identity.relationship_status === "single" || identity.relationship_status === "dating") {
      flirtation_responsiveness *= 1.5;
      romantic_availability = Math.min(0.8, romantic_availability * 2);
    } else if (identity.relationship_status === "married" || identity.relationship_status === "committed") {
      flirtation_responsiveness *= 0.3;
      romantic_availability = 0.1;
    }
    
    // Innuendo comfort
    innuendo_comfort = privacy === "open" ? 0.6 :
                      privacy === "selective" ? 0.3 : 0.05;
    
    // Humor style bias
    if (cognitive.big_five.openness > 0.7 && privacy === "open") {
      humor_style_bias = "edgy";
    } else if (cognitive.big_five.extraversion > 0.6 && privacy === "selective") {
      humor_style_bias = "playful";
    } else {
      humor_style_bias = "clean";
    }
  }
  
  // Age adjustments
  if (identity.age < 25) {
    innuendo_comfort *= 1.2;
    humor_style_bias = humor_style_bias === "clean" ? "playful" : humor_style_bias;
  } else if (identity.age > 50) {
    innuendo_comfort *= 0.7;
    flirtation_responsiveness *= 0.8;
  }
  
  // Personality adjustments
  if (cognitive.big_five.neuroticism > 0.7) {
    flirtation_responsiveness *= 0.6;
    disclosure = disclosure === "high" ? "medium" : disclosure === "medium" ? "low" : "low";
  }
  
  if (cognitive.big_five.agreeableness > 0.8) {
    innuendo_comfort *= 0.5; // More careful with potentially offensive content
  }

  return {
    privacy,
    disclosure,
    humor_style_bias,
    flirtation_responsiveness: Math.max(0.05, Math.min(0.9, flirtation_responsiveness)),
    innuendo_comfort: Math.max(0.01, Math.min(0.8, innuendo_comfort)),
    romantic_availability: Math.max(0.05, Math.min(0.9, romantic_availability))
  };
}

function buildAntiModeCollapse(
  cognitive: PersonaV2['cognitive_profile'],
  social: PersonaV2['social_cognition'],
  identity: PersonaV2['identity'],
  rng: () => number
): RuntimeResult['anti_mode_collapse'] {
  
  // Generic forbidden frames that indicate mode collapse
  const forbidden_frames = [
    "It's clear what this is about",
    "Overall pretty solid",
    "At the end of the day",
    "It's worth noting that",
    "That being said",
    "With that in mind",
    "All things considered",
    "To be perfectly honest",
    "In my humble opinion",
    "I think it's fair to say",
    "It goes without saying",
    "Needless to say",
    "When all is said and done",
    "In the grand scheme of things",
    "Let me be clear about this"
  ];
  
  // Intent-specific must-include requirements
  const must_include_one_of: Record<string, string[]> = {
    opinion: [
      "personal conviction marker",
      "specific stance detail", 
      "reasoning chain"
    ],
    critique: [
      "specific example", 
      "targeted feedback point", 
      "alternative suggestion"
    ],
    advice: [
      "actionable step", 
      "personal experience reference", 
      "concrete outcome prediction"
    ],
    story: [
      "sensory detail", 
      "emotional reaction", 
      "specific dialogue or action"
    ],
    compare: [
      "quantifiable difference", 
      "specific feature comparison", 
      "personal preference reason"
    ],
    clarify: [
      "specific confusion point", 
      "restatement attempt", 
      "clarifying question"
    ]
  };
  
  // Personality-specific uniqueness enforcements
  const uniqueness_enforcements = [];
  
  if (cognitive.big_five.openness > 0.7) {
    uniqueness_enforcements.push("include creative metaphor or analogy");
    uniqueness_enforcements.push("reference unexpected connection");
  }
  
  if (cognitive.big_five.conscientiousness > 0.7) {
    uniqueness_enforcements.push("provide structured reasoning");
    uniqueness_enforcements.push("include specific process detail");
  }
  
  if (cognitive.big_five.extraversion > 0.7) {
    uniqueness_enforcements.push("include personal anecdote");
    uniqueness_enforcements.push("reference social interaction");
  }
  
  if (cognitive.big_five.neuroticism > 0.6) {
    uniqueness_enforcements.push("express specific concern or worry");
    uniqueness_enforcements.push("include uncertainty qualification");
  }
  
  // Add cultural/regional enforcements
  if (identity.location.region === "South") {
    uniqueness_enforcements.push("include regional speech pattern");
  }
  
  if (identity.age < 30) {
    uniqueness_enforcements.push("include generational perspective");
  }
  
  // Professional/occupational enforcements
  if (identity.occupation.includes("Tech")) {
    uniqueness_enforcements.push("include technical perspective");
  } else if (identity.occupation.includes("Teacher")) {
    uniqueness_enforcements.push("include educational framework");
  }

  return {
    forbidden_frames,
    must_include_one_of,
    uniqueness_enforcements: uniqueness_enforcements.slice(0, 5) // Limit to prevent bloat
  };
}

function buildMemoryKeys(
  identity: PersonaV2['identity'],
  cognitive: PersonaV2['cognitive_profile'],
  rng: () => number
): string[] {
  
  const keys = [];
  
  // Core biographical anchors
  keys.push(`${identity.age}yo ${identity.gender} from ${identity.location.city}`);
  keys.push(`works as ${identity.occupation}`);
  
  if (identity.relationship_status !== "single") {
    keys.push(`${identity.relationship_status} relationship`);
  }
  
  if (identity.dependents > 0) {
    keys.push(`parent of ${identity.dependents} child${identity.dependents > 1 ? 'ren' : ''}`);
  }
  
  // Personality-derived memory anchors
  if (cognitive.big_five.openness > 0.8) {
    keys.push("loves exploring new ideas and experiences");
  }
  
  if (cognitive.big_five.conscientiousness > 0.8) {
    keys.push("highly organized and detail-oriented");
  }
  
  if (cognitive.big_five.extraversion > 0.8) {
    keys.push("energized by social interaction");
  } else if (cognitive.big_five.extraversion < 0.3) {
    keys.push("prefers quiet, solitary activities");
  }
  
  if (cognitive.big_five.neuroticism > 0.7) {
    keys.push("tends to worry about potential problems");
  }
  
  if (cognitive.big_five.agreeableness > 0.8) {
    keys.push("prioritizes harmony and cooperation");
  }
  
  // Worldview anchor
  if (cognitive.worldview_summary) {
    keys.push(cognitive.worldview_summary.slice(0, 60)); // Truncate if too long
  }
  
  // Strongest moral foundation
  const moralFoundations = cognitive.moral_foundations;
  const maxMoral = Math.max(
    moralFoundations.care_harm,
    moralFoundations.fairness_cheating,
    moralFoundations.loyalty_betrayal,
    moralFoundations.authority_subversion,
    moralFoundations.sanctity_degradation,
    moralFoundations.liberty_oppression
  );
  
  if (maxMoral === moralFoundations.care_harm) {
    keys.push("deeply values compassion and preventing harm");
  } else if (maxMoral === moralFoundations.fairness_cheating) {
    keys.push("strongly believes in fairness and justice");
  } else if (maxMoral === moralFoundations.loyalty_betrayal) {
    keys.push("highly values loyalty and group solidarity");
  } else if (maxMoral === moralFoundations.authority_subversion) {
    keys.push("respects authority and traditional hierarchies");
  } else if (maxMoral === moralFoundations.sanctity_degradation) {
    keys.push("believes in sanctity and spiritual purity");
  } else if (maxMoral === moralFoundations.liberty_oppression) {
    keys.push("champions individual freedom and autonomy");
  }

  return keys.slice(0, 6); // Limit to 6 strongest memory keys
}

function buildPerformanceTuning(
  cognitive: PersonaV2['cognitive_profile'],
  health: PersonaV2['health_profile'],
  rng: () => number
): RuntimeResult['performance_tuning'] {
  
  // Max tokens based on conscientiousness and energy
  const base_tokens = 150;
  const conscientiousness_bonus = cognitive.big_five.conscientiousness * 100;
  const energy_multiplier = health.energy_baseline === "high" ? 1.3 : 
                           health.energy_baseline === "low" ? 0.7 : 1.0;
  const max_tokens_per_response = Math.floor((base_tokens + conscientiousness_bonus) * energy_multiplier);
  
  // Temperature based on openness and neuroticism
  const temperature_base = Math.max(0.2, Math.min(1.0, 
    0.6 + (cognitive.big_five.openness - 0.5) * 0.4 + 
    (cognitive.big_five.neuroticism - 0.5) * 0.2
  ));
  
  // Presence penalty (avoid repetition) - higher for lower conscientiousness
  const presence_penalty = Math.max(0.0, Math.min(0.6, 
    0.3 + (1 - cognitive.big_five.conscientiousness) * 0.3
  ));
  
  // Frequency penalty - moderate, slightly higher for high openness
  const frequency_penalty = Math.max(0.0, Math.min(0.6, 
    0.2 + cognitive.big_five.openness * 0.2
  ));
  
  // Top-p (nucleus sampling) - more focused for high conscientiousness
  const top_p = Math.max(0.5, Math.min(1.0, 
    0.9 - cognitive.big_five.conscientiousness * 0.2
  ));

  return {
    max_tokens_per_response: Math.max(50, Math.min(500, max_tokens_per_response)),
    temperature_base: Number(temperature_base.toFixed(2)),
    presence_penalty: Number(presence_penalty.toFixed(2)),
    frequency_penalty: Number(frequency_penalty.toFixed(2)),
    top_p: Number(top_p.toFixed(2))
  };
}

function buildValidationRules(
  cognitive: PersonaV2['cognitive_profile'],
  social: PersonaV2['social_cognition'],
  rng: () => number
): RuntimeResult['validation_rules'] {
  
  // Minimum signature tokens per response
  const min_signature_tokens = cognitive.big_five.openness > 0.7 ? 2 : 1;
  
  // Maximum hedge density (prevent over-hedging)
  const max_hedge_density = cognitive.big_five.agreeableness > 0.8 ? 0.15 : 0.10;
  
  // Minimum specificity score requirement
  const min_specificity_score = cognitive.big_five.conscientiousness > 0.6 ? 0.6 : 0.4;
  
  // Banned cliché patterns (personality-dependent)
  const banned_cliche_patterns = [
    "at the end of the day",
    "it is what it is",
    "everything happens for a reason",
    "think outside the box",
    "low-hanging fruit",
    "circle back",
    "touch base",
    "reach out"
  ];
  
  // Add more if highly conscientious (avoids business speak)
  if (cognitive.big_five.conscientiousness > 0.7) {
    banned_cliche_patterns.push(
      "synergy",
      "paradigm shift",
      "game changer",
      "disruptive innovation",
      "deep dive"
    );
  }
  
  // Add casual clichés if formal personality
  if (cognitive.big_five.agreeableness > 0.8) {
    banned_cliche_patterns.push(
      "no worries",
      "it's all good",
      "whatever works"
    );
  }

  return {
    min_signature_tokens,
    max_hedge_density,
    min_specificity_score,
    banned_cliche_patterns
  };
}

// Utility functions
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function createSeededRNG(seed: number): () => number {
  let state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) % Math.pow(2, 32);
    return state / Math.pow(2, 32);
  };
}