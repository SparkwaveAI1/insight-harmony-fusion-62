import { PersonaV2 } from '../../../types/persona-v2';

export interface TraitMapBuilderOptions {
  identity: PersonaV2['identity'];
  cognitive: PersonaV2['cognitive_profile'];
  social: PersonaV2['social_cognition'];
  health: PersonaV2['health_profile'];
  seed: string;
  sexuality?: PersonaV2['sexuality_profile'];
}

export interface TraitMapResult {
  stance_biases: Array<{ topic: string; w: number }>;
  topic_salience: Array<{ topic: string; w: number }>;
  response_shapes: Record<string, string[]>;
  style_probabilities: {
    hedge_rate: number;
    modal_rate: number;
    definitive_rate: number;
    rhetorical_q_rate: number;
    profanity_rate: number;
    humor_rate: number;
    sarcasm_rate: number;
  };
  register_rules: Array<{ 
    when: Record<string, string>; 
    shift: Record<string, string | number> 
  }>;
}

export function buildTraitMapping(options: TraitMapBuilderOptions): TraitMapResult {
  const { identity, cognitive, social, health, sexuality, seed } = options;
  const rng = createSeededRNG(hashSeed(seed));

  // Build topic-based stance biases
  const stance_biases = buildStanceBiases(identity, cognitive, social, health, rng, sexuality);
  
  // Topic salience (alias for stance_biases with different weighting)
  const topic_salience = buildTopicSalience(stance_biases, rng);
  
  // Response shape templates
  const response_shapes = buildResponseShapes(cognitive, social, rng);
  
  // Style probability weights
  const style_probabilities = calculateStyleProbabilities(cognitive, social, health, rng);
  
  // Context-aware register shifting rules
  const register_rules = buildRegisterRules(cognitive, social, identity, rng);

  return {
    stance_biases,
    topic_salience,
    response_shapes,
    style_probabilities,
    register_rules
  };
}

function buildStanceBiases(
  identity: PersonaV2['identity'],
  cognitive: PersonaV2['cognitive_profile'],
  social: PersonaV2['social_cognition'],
  health: PersonaV2['health_profile'],
  rng: () => number,
  sexuality?: PersonaV2['sexuality_profile']
): Array<{ topic: string; w: number }> {
  
  const stances = [];
  
  // Family & Relationships
  const familyWeight = identity.dependents > 0 ? 0.8 : 
                      identity.relationship_status === "married" ? 0.7 :
                      identity.relationship_status === "single" ? 0.3 : 0.5;
  stances.push({ topic: "family", w: familyWeight + (rng() - 0.5) * 0.2 });
  
  // Money & Economics (based on occupation and conscientiousness)
  const isHighEarner = identity.occupation.includes("Doctor") || identity.occupation.includes("Executive");
  const moneyWeight = (isHighEarner ? 0.7 : 0.4) + cognitive.big_five.conscientiousness * 0.3;
  stances.push({ topic: "money", w: Math.min(0.95, moneyWeight + (rng() - 0.5) * 0.15) });
  
  // Health (personal health status influence)
  const healthWeight = health.physical_health.includes("chronic_illness") ? 0.8 :
                      health.mental_health.length > 0 ? 0.6 : 0.4;
  stances.push({ topic: "health", w: healthWeight + (rng() - 0.5) * 0.2 });
  
  // Politics (moral foundations + openness)
  const politicsWeight = (cognitive.moral_foundations.authority_subversion + 
                         cognitive.moral_foundations.liberty_oppression) / 2 + 
                         cognitive.big_five.openness * 0.3;
  stances.push({ topic: "politics", w: Math.min(0.9, politicsWeight + (rng() - 0.5) * 0.2) });
  
  // Religion/Spirituality (moral foundations)
  const religionWeight = cognitive.moral_foundations.sanctity_degradation + 
                        (cognitive.big_five.conscientiousness * 0.2);
  stances.push({ topic: "religion", w: Math.min(0.85, religionWeight + (rng() - 0.5) * 0.25) });
  
  // Technology (age + occupation)
  const techWeight = identity.age < 35 ? 0.7 : identity.age < 50 ? 0.5 : 0.3;
  const techOccupationBonus = identity.occupation.includes("Tech") || identity.occupation.includes("Engineer") ? 0.3 : 0;
  stances.push({ topic: "technology", w: Math.min(0.9, techWeight + techOccupationBonus + (rng() - 0.5) * 0.15) });
  
  // Education (based on own education level)
  const isHighEducated = identity.occupation.includes("Doctor") || identity.occupation.includes("Professor");
  const educationWeight = isHighEducated ? 0.8 : 0.5;
  stances.push({ topic: "education", w: educationWeight + (rng() - 0.5) * 0.2 });
  
  // Work/Career (conscientiousness + age)
  const careerWeight = cognitive.big_five.conscientiousness * 0.6 + 
                      (identity.age > 25 && identity.age < 55 ? 0.3 : 0.1);
  stances.push({ topic: "work", w: Math.min(0.9, careerWeight + (rng() - 0.5) * 0.15) });
  
  // Sexuality (if profile exists)
  if (sexuality) {
    const sexualityWeight = sexuality.privacy_preference === "public" ? 0.6 :
                           sexuality.privacy_preference === "selective" ? 0.4 : 0.2;
    stances.push({ topic: "sexuality", w: sexualityWeight + (rng() - 0.5) * 0.2 });
  }
  
  // Safety/Security (neuroticism + life stage)
  const safetyWeight = cognitive.big_five.neuroticism * 0.5 + 
                      (identity.dependents > 0 ? 0.3 : 0.1);
  stances.push({ topic: "safety", w: Math.min(0.85, safetyWeight + (rng() - 0.5) * 0.2) });
  
  // Social Issues (agreeableness + moral foundations)
  const socialWeight = cognitive.big_five.agreeableness * 0.4 + 
                      cognitive.moral_foundations.care_harm * 0.4;
  stances.push({ topic: "social_issues", w: Math.min(0.9, socialWeight + (rng() - 0.5) * 0.2) });
  
  // Environment (openness + care/harm)
  const envWeight = cognitive.big_five.openness * 0.5 + 
                   cognitive.moral_foundations.care_harm * 0.3;
  stances.push({ topic: "environment", w: Math.min(0.8, envWeight + (rng() - 0.5) * 0.25) });

  // Normalize weights to ensure they sum appropriately
  const total = stances.reduce((sum, stance) => sum + stance.w, 0);
  return stances.map(stance => ({ 
    ...stance, 
    w: Math.max(0.05, Math.min(0.95, stance.w / total * stances.length * 0.5)) 
  }));
}

function buildTopicSalience(
  stance_biases: Array<{ topic: string; w: number }>,
  rng: () => number
): Array<{ topic: string; w: number }> {
  
  // Topic salience emphasizes different aspects than stance
  return stance_biases.map(bias => ({
    topic: bias.topic,
    w: Math.max(0.1, Math.min(0.9, bias.w * (0.8 + rng() * 0.4)))
  }));
}

function buildResponseShapes(
  cognitive: PersonaV2['cognitive_profile'],
  social: PersonaV2['social_cognition'],
  rng: () => number
): Record<string, string[]> {
  
  const shapes: Record<string, string[]> = {};
  
  // Opinion responses (confidence-based)
  if (cognitive.big_five.extraversion > 0.6 && cognitive.big_five.neuroticism < 0.4) {
    shapes.opinion = [
      "Here's what I think: [assertion] because [reasoning]",
      "I'm convinced that [position] and here's why:",
      "My take is [stance] - [supporting evidence]"
    ];
  } else {
    shapes.opinion = [
      "I tend to think that [hedged_assertion] because [reasoning]",
      "From my perspective, [position] seems [qualification]",
      "I'd probably say [stance] though [uncertainty_marker]"
    ];
  }
  
  // Critique responses (agreeableness-dependent)
  if (cognitive.big_five.agreeableness < 0.4) {
    shapes.critique = [
      "The problem with [target] is [specific_issue]",
      "I have to disagree with [aspect] because [counter_argument]",
      "[Target] falls short in [area] - [detailed_criticism]"
    ];
  } else {
    shapes.critique = [
      "While I appreciate [positive_aspect], I think [gentle_criticism]",
      "I see the value in [target], but [constructive_feedback]",
      "[Target] has merit, though [diplomatic_concern]"
    ];
  }
  
  // Advice responses (conscientiousness + social cognition)
  if (cognitive.big_five.conscientiousness > 0.6) {
    shapes.advice = [
      "I'd recommend [specific_action] because [logical_reasoning]",
      "The best approach would be to [structured_steps]",
      "Have you considered [alternative] since [rationale]"
    ];
  } else {
    shapes.advice = [
      "You might want to try [suggestion] - it worked for [personal_reference]",
      "I'd probably [casual_recommendation] if I were you",
      "Maybe [loose_suggestion]? Just a thought"
    ];
  }
  
  // Story responses (extraversion + openness)
  if (cognitive.big_five.extraversion > 0.5 && cognitive.big_five.openness > 0.5) {
    shapes.story = [
      "That reminds me of [vivid_anecdote] - [detailed_narrative]",
      "I had a similar experience where [engaging_story]",
      "So there I was [dramatic_setup] and [compelling_development]"
    ];
  } else {
    shapes.story = [
      "I remember [simple_anecdote] which [brief_connection]",
      "Something similar happened to [reference] once",
      "That's like when [short_story] - [quick_parallel]"
    ];
  }
  
  // Compare responses (analytical thinking)
  if (cognitive.big_five.openness > 0.6) {
    shapes.compare = [
      "Compared to [reference], [target] is [detailed_analysis]",
      "The key difference between [A] and [B] is [insight]",
      "While [A] does [strength], [B] excels at [alternative_strength]"
    ];
  } else {
    shapes.compare = [
      "[A] is better than [B] because [simple_reason]",
      "I prefer [choice] over [alternative] since [basic_logic]",
      "[Target] beats [comparison] in [straightforward_aspect]"
    ];
  }
  
  // Clarify responses (conscientiousness + theory of mind)
  shapes.clarify = [
    "Just to make sure I understand - are you saying [restatement]?",
    "Can you help me understand [specific_confusion]?",
    "I want to be clear about [clarification_point]"
  ];

  return shapes;
}

function calculateStyleProbabilities(
  cognitive: PersonaV2['cognitive_profile'],
  social: PersonaV2['social_cognition'],
  health: PersonaV2['health_profile'],
  rng: () => number
): TraitMapResult['style_probabilities'] {
  
  // Hedge rate (uncertainty language)
  const hedge_rate = cognitive.big_five.agreeableness * 0.3 + 
                    cognitive.big_five.neuroticism * 0.4 + 
                    (social.trust_baseline === "low" ? 0.2 : 0) +
                    (rng() - 0.5) * 0.1;
  
  // Modal rate (should, would, could, might)
  const modal_rate = cognitive.big_five.conscientiousness * 0.3 + 
                    (cognitive.decision_style === "procedural" ? 0.2 : 0) +
                    (rng() - 0.5) * 0.1;
  
  // Definitive rate (absolutely, definitely, clearly)
  const definitive_rate = (1 - cognitive.big_five.neuroticism) * 0.4 + 
                         cognitive.big_five.extraversion * 0.3 +
                         (rng() - 0.5) * 0.1;
  
  // Rhetorical question rate
  const rhetorical_q_rate = cognitive.big_five.openness * 0.3 + 
                           (social.persuasion_style === "story-led" ? 0.2 : 0) +
                           (rng() - 0.5) * 0.05;
  
  // Profanity rate (low conscientiousness + stress)
  const profanity_rate = Math.max(0, (1 - cognitive.big_five.conscientiousness) * 0.2 + 
                                 (health.mental_health.includes("anxiety") ? 0.05 : 0) +
                                 (rng() - 0.5) * 0.05);
  
  // Humor rate
  const humor_rate = cognitive.big_five.extraversion * 0.4 + 
                    cognitive.big_five.openness * 0.3 +
                    (rng() - 0.5) * 0.1;
  
  // Sarcasm rate (openness + low agreeableness)
  const sarcasm_rate = cognitive.big_five.openness * 0.3 + 
                      (1 - cognitive.big_five.agreeableness) * 0.2 +
                      (rng() - 0.5) * 0.1;

  return {
    hedge_rate: Math.max(0.01, Math.min(0.8, hedge_rate)),
    modal_rate: Math.max(0.01, Math.min(0.6, modal_rate)),
    definitive_rate: Math.max(0.01, Math.min(0.7, definitive_rate)),
    rhetorical_q_rate: Math.max(0.01, Math.min(0.3, rhetorical_q_rate)),
    profanity_rate: Math.max(0, Math.min(0.15, profanity_rate)),
    humor_rate: Math.max(0.05, Math.min(0.8, humor_rate)),
    sarcasm_rate: Math.max(0.01, Math.min(0.4, sarcasm_rate))
  };
}

function buildRegisterRules(
  cognitive: PersonaV2['cognitive_profile'],
  social: PersonaV2['social_cognition'],
  identity: PersonaV2['identity'],
  rng: () => number
): Array<{ when: Record<string, string>; shift: Record<string, string | number> }> {
  
  const rules = [];
  
  // Authority audience rules
  rules.push({
    when: { audience: "authority" },
    shift: {
      formality: "+0.3",
      hedge_rate: cognitive.big_five.agreeableness > 0.6 ? "+0.2" : "+0.1",
      profanity_rate: "-0.8",
      definitive_rate: "-0.2"
    }
  });
  
  // Peer audience (age-dependent)
  rules.push({
    when: { audience: "peer" },
    shift: {
      formality: identity.age > 35 ? "0" : "-0.2",
      humor_rate: "+0.1",
      slang_rate: identity.age < 35 ? "+0.3" : "0"
    }
  });
  
  // Stranger audience (social caution)
  rules.push({
    when: { audience: "stranger" },
    shift: {
      personal_disclosure: "-0.4",
      hedge_rate: "+0.15",
      politeness_markers: "+0.2"
    }
  });
  
  // High sensitivity topics
  rules.push({
    when: { sensitivity: "high" },
    shift: {
      hedge_rate: "+0.25",
      qualification_rate: "+0.2",
      definitive_rate: "-0.3",
      personal_example_rate: social.empathy === "high" ? "+0.1" : "-0.1"
    }
  });
  
  // In-group audience (trust + familiarity)
  rules.push({
    when: { audience: "in-group" },
    shift: {
      formality: "-0.3",
      personal_disclosure: "+0.3",
      assumption_rate: "+0.2",
      shared_reference_rate: "+0.4"
    }
  });
  
  // Brand/professional context
  rules.push({
    when: { audience: "brand" },
    shift: {
      formality: "+0.4",
      profanity_rate: "-0.9",
      controversy_avoidance: "+0.5",
      solution_orientation: "+0.3"
    }
  });
  
  // Topic-specific shifts
  if (cognitive.moral_foundations.sanctity_degradation > 0.7) {
    rules.push({
      when: { topic: "religion" },
      shift: {
        reverence_tone: "+0.4",
        challenge_rate: "-0.3",
        personal_conviction: "+0.2"
      }
    });
  }
  
  // Personality-based contextual rules
  if (cognitive.big_five.neuroticism > 0.7) {
    rules.push({
      when: { sensitivity: "medium" },
      shift: {
        anxiety_indicators: "+0.2",
        reassurance_seeking: "+0.15",
        worst_case_mentions: "+0.1"
      }
    });
  }

  return rules;
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