import { PersonaV2 } from "../types/persona-v2";
import { VoicepackRuntime } from "../types/voicepack";

export function compilePersonaToVoicepack(persona: PersonaV2): VoicepackRuntime {
  // 1) Extract stance/topic salience from persona data
  const stance_biases = extractStanceBiases(persona);
  
  // 2) Build response shapes for different conversation types
  const response_shapes = buildResponseShapes(persona);
  
  // 3) Build lexicon from linguistic style and cultural markers
  const lexicon = buildLexicon(persona);
  
  // 4) Create syntax policy from communication preferences
  const syntax_policy = buildSyntaxPolicy(persona);
  
  // 5) Extract style probabilities from personality traits
  const style_probs = buildStyleProbs(persona);
  
  // 6) Create register rules for different audiences/contexts
  const register_rules = buildRegisterRules(persona);
  
  // 7) Build state hooks for emotional/stress responses
  const state_hooks = buildStateHooks(persona);
  
  // 8) Extract sexuality/privacy preferences
  const sexuality_hooks_summary = buildSexualityHooks(persona);
  
  // 9) Create anti-mode-collapse measures
  const anti_mode_collapse = buildAntiModeCollapse(persona);
  
  // 10) Extract key memory anchors
  const memory_keys = extractMemoryKeys(persona);

  return {
    stance_biases,
    response_shapes,
    lexicon,
    syntax_policy,
    style_probs,
    register_rules,
    state_hooks,
    sexuality_hooks_summary,
    anti_mode_collapse,
    topic_salience: stance_biases, // alias
    memory_keys
  };
}

function extractStanceBiases(persona: PersonaV2): Array<{ topic: string; w: number }> {
  const biases: Array<{ topic: string; w: number }> = [];
  
  // Extract from moral foundations
  if (persona.cognitive_profile?.moral_foundations) {
    const foundations = persona.cognitive_profile.moral_foundations;
    if (foundations.care_harm > 0.7) biases.push({ topic: "health", w: 0.9 });
    if (foundations.fairness_cheating > 0.7) biases.push({ topic: "social-justice", w: 0.8 });
    if (foundations.authority_subversion > 0.7) biases.push({ topic: "institutions", w: 0.7 });
    if (foundations.loyalty_betrayal > 0.7) biases.push({ topic: "community", w: 0.8 });
  }
  
  // Extract from life context (simplified since detailed fields may not exist)
  const background = persona.life_context?.background_narrative || "";
  if (background.includes("wealthy") || background.includes("affluent")) {
    biases.push({ topic: "luxury", w: 0.6 }, { topic: "investment", w: 0.7 });
  } else if (background.includes("struggle") || background.includes("poor")) {
    biases.push({ topic: "affordability", w: 0.9 }, { topic: "value", w: 0.8 });
  }
  
  // Extract from current situation and daily routine
  const currentSituation = persona.life_context?.current_situation || "";
  const dailyRoutine = persona.life_context?.daily_routine || "";
  const combined = (currentSituation + " " + dailyRoutine).toLowerCase();
  
  // Extract topics from text content
  if (combined.includes("tech") || combined.includes("computer")) biases.push({ topic: "technology", w: 0.6 });
  if (combined.includes("food") || combined.includes("cooking")) biases.push({ topic: "food", w: 0.6 });
  if (combined.includes("travel") || combined.includes("vacation")) biases.push({ topic: "travel", w: 0.6 });
  
  return biases.slice(0, 15); // Limit to most important stances
}

function buildResponseShapes(persona: PersonaV2): Record<string, string[]> {
  const personality = persona.cognitive_profile?.big_five;
  const communication = persona.linguistic_style?.base_voice;
  
  return {
    opinion: [
      getOpinionStarter(personality),
      getOpinionBody(communication),
      getOpinionCloser(personality)
    ],
    critique: [
      getCritiqueStarter(personality),
      getCritiqueBody(communication),
      getCritiqueCloser(personality)
    ],
    advice: [
      getAdviceStarter(personality),
      getAdviceBody(communication),
      getAdviceCloser(personality)
    ],
    story: [
      getStoryStarter(personality),
      getStoryBody(communication),
      getStoryCloser(personality)
    ],
    compare: [
      getCompareStarter(personality),
      getCompareBody(communication),
      getCompareCloser(personality)
    ]
  };
}

function buildLexicon(persona: PersonaV2): VoicepackRuntime['lexicon'] {
  const linguistic = persona.linguistic_style;
  const cultural = persona.identity;
  
  const signature_tokens: string[] = [];
  const discourse_markers: Array<{ term: string; p: number }> = [];
  const interjections: Array<{ term: string; p: number }> = [];
  
  // Extract signature tokens from communication style
  if (linguistic?.base_voice?.formality === "casual") {
    signature_tokens.push("honestly", "like", "you know", "kind of");
  } else if (linguistic?.base_voice?.formality === "formal") {
    signature_tokens.push("consequently", "furthermore", "nevertheless", "accordingly");
  }
  
  // Add discourse markers based on personality
  const extraversion = persona.cognitive_profile?.big_five?.extraversion || 0.5;
  if (extraversion > 0.7) {
    discourse_markers.push(
      { term: "So anyway", p: 0.3 },
      { term: "Oh, and", p: 0.4 },
      { term: "By the way", p: 0.2 }
    );
  }
  
  // Add interjections based on cultural background
  if (cultural) {
    const culturalStr = (cultural.ethnicity + " " + cultural.nationality).toLowerCase();
    if (culturalStr.includes("south") || culturalStr.includes("texas") || culturalStr.includes("alabama")) {
      interjections.push({ term: "Well", p: 0.4 }, { term: "Now", p: 0.3 });
    } else if (culturalStr.includes("west") || culturalStr.includes("california") || culturalStr.includes("oregon")) {
      interjections.push({ term: "Dude", p: 0.2 }, { term: "Man", p: 0.3 });
    }
  }
  
  return {
    signature_tokens: signature_tokens.slice(0, 8),
    discourse_markers: discourse_markers.slice(0, 6),
    interjections: interjections.slice(0, 6)
  };
}

function buildSyntaxPolicy(persona: PersonaV2): VoicepackRuntime['syntax_policy'] {
  const occupation = persona.identity?.occupation || ""; 
  const communication = persona.linguistic_style?.base_voice;
  
  let complexity: "simple" | "compound" | "complex" = "compound";
  let sentence_dist = { short: 0.4, medium: 0.4, long: 0.2 };
  
  if (occupation.includes("teacher") || occupation.includes("student") || occupation.includes("clerk")) {
    complexity = "simple";
    sentence_dist = { short: 0.6, medium: 0.3, long: 0.1 };
  } else if (occupation.includes("doctor") || occupation.includes("lawyer") || occupation.includes("professor") || occupation.includes("researcher")) {
    complexity = "complex";
    sentence_dist = { short: 0.2, medium: 0.4, long: 0.4 };
  }
  
  const lists_per_200toks_max = communication?.directness === "direct" ? 2 : 1;
  
  return {
    sentence_length_dist: sentence_dist,
    complexity,
    lists_per_200toks_max
  };
}

function buildStyleProbs(persona: PersonaV2): VoicepackRuntime['style_probs'] {
  const traits = persona.cognitive_profile?.big_five;
  const neuroticism = traits?.neuroticism || 0.5;
  const agreeableness = traits?.agreeableness || 0.5;
  const conscientiousness = traits?.conscientiousness || 0.5;
  
  return {
    hedge_rate: neuroticism * 0.4 + (1 - agreeableness) * 0.3,
    modal_rate: conscientiousness * 0.4 + neuroticism * 0.2,
    definitive_rate: (1 - neuroticism) * 0.5 + conscientiousness * 0.3,
    rhetorical_q_rate: Math.min(0.3, agreeableness * 0.4),
    profanity_rate: Math.max(0, (1 - conscientiousness) * 0.2 - agreeableness * 0.15)
  };
}

function buildRegisterRules(persona: PersonaV2): VoicepackRuntime['register_rules'] {
  const rules: Array<{ when: Record<string,string>; shift: Record<string,string|number> }> = [];
  
  // Authority figures -> more formal
  rules.push({
    when: { audience: "authority" },
    shift: { hedge_rate: "+0.2", formality: "formal" }
  });
  
  // In-group -> more casual
  rules.push({
    when: { audience: "in-group" },
    shift: { hedge_rate: "-0.1", formality: "casual" }
  });
  
  // High sensitivity topics -> more careful
  rules.push({
    when: { sensitivity: "high" },
    shift: { hedge_rate: "+0.3", definitive_rate: "-0.2" }
  });
  
  return rules;
}

function buildStateHooks(persona: PersonaV2): VoicepackRuntime['state_hooks'] {
  const hooks: Record<string, Record<string, number | string>> = {};
  
  // Stress affects hedging and sentence length
  hooks["stress>0.6"] = {
    hedge_rate: "+0.2",
    sentence_length_bias: "short"
  };
  
  // Fatigue reduces complexity
  hooks["fatigue>0.7"] = {
    complexity: "simple",
    lists_per_200toks_max: 0
  };
  
  // High familiarity increases casualness
  hooks["familiarity>0.8"] = {
    formality: "casual",
    definitive_rate: "+0.1"
  };
  
  return hooks;
}

function buildSexualityHooks(persona: PersonaV2): VoicepackRuntime['sexuality_hooks_summary'] {
  const sexuality = persona.sexuality_profile;
  
  let privacy: "private"|"selective"|"open" = "selective";
  let disclosure: "low"|"medium"|"high" = "medium";
  let humor_style_bias = "neutral";
  
  if (sexuality?.orientation === "asexual" || sexuality?.expression === "private") {
    disclosure = "low";
  }
  
  // Conservative estimate for privacy by default
  if (!sexuality || sexuality.expression === "private" || sexuality.expression === "conservative") {
    privacy = "private";
    disclosure = "low";
  } else if (sexuality.expression === "open" || sexuality.expression === "flamboyant") {
    privacy = "open";
    humor_style_bias = "playful";
  }
  
  return { privacy, disclosure, humor_style_bias };
}

function buildAntiModeCollapse(persona: PersonaV2): VoicepackRuntime['anti_mode_collapse'] {
  const forbidden_frames = [
    "It's clear what this is about",
    "Overall pretty solid", 
    "At the end of the day",
    "That being said",
    "It's important to note",
    "In terms of",
    "When it comes to",
    "The reality is",
    "Generally speaking",
    "To be honest"
  ];
  
  const must_include_one_of: Record<string,string[]> = {
    opinion: ["personal experience", "specific example", "concrete detail"],
    critique: ["specific flaw", "alternative approach", "measurable issue"],
    advice: ["actionable step", "personal anecdote", "specific resource"]
  };
  
  return { forbidden_frames, must_include_one_of };
}

function extractMemoryKeys(persona: PersonaV2): string[] {
  const keys: string[] = [];
  
  // Extract from identity and life context
  if (persona.identity?.age) {
    keys.push(`is ${persona.identity.age} years old`);
  }
  
  if (persona.identity?.occupation) {
    keys.push(`works as ${persona.identity.occupation}`);
  }
  
  // Extract from background narrative
  const background = persona.life_context?.background_narrative || "";
  if (background.length > 50) {
    keys.push(background.substring(0, 80) + "...");
  }
  
  return keys.slice(0, 6);
}

// Helper functions for response shapes
function getOpinionStarter(personality: any): string {
  const openness = personality?.openness || 0.5;
  if (openness > 0.7) return "From my perspective,";
  if (openness < 0.3) return "I think";
  return "In my experience,";
}

function getOpinionBody(communication: any): string {
  const directness = communication?.directness;
  if (directness === "direct") return "CONCRETE_STANCE with SPECIFIC_REASON";
  return "NUANCED_POSITION with PERSONAL_CONTEXT";
}

function getOpinionCloser(personality: any): string {
  const agreeableness = personality?.agreeableness || 0.5;
  if (agreeableness > 0.7) return "but that's just my take.";
  return "That's where I stand on it.";
}

function getCritiqueStarter(personality: any): string {
  const agreeableness = personality?.agreeableness || 0.5;
  if (agreeableness > 0.7) return "I appreciate what they're trying to do, but";
  return "The main issue I see is";
}

function getCritiqueBody(communication: any): string {
  return "SPECIFIC_PROBLEM with CONCRETE_EVIDENCE";
}

function getCritiqueCloser(personality: any): string {
  const conscientiousness = personality?.conscientiousness || 0.5;
  if (conscientiousness > 0.7) return "A better approach might be ALTERNATIVE_SOLUTION.";
  return "That's the core problem as I see it.";
}

function getAdviceStarter(personality: any): string {
  const extraversion = personality?.extraversion || 0.5;
  if (extraversion > 0.7) return "Oh, I've been there!";
  return "Here's what I'd suggest:";
}

function getAdviceBody(communication: any): string {
  return "ACTIONABLE_STEP with PERSONAL_EXPERIENCE";
}

function getAdviceCloser(personality: any): string {
  const agreeableness = personality?.agreeableness || 0.5;
  if (agreeableness > 0.7) return "Hope that helps!";
  return "That should get you started.";
}

function getStoryStarter(personality: any): string {
  const extraversion = personality?.extraversion || 0.5;
  if (extraversion > 0.7) return "Oh man, this reminds me of";
  return "Something similar happened to me";
}

function getStoryBody(communication: any): string {
  return "NARRATIVE_SETUP with SPECIFIC_DETAILS and OUTCOME";
}

function getStoryCloser(personality: any): string {
  const openness = personality?.openness || 0.5;
  if (openness > 0.7) return "Wild how things work out sometimes.";
  return "Anyway, that's the story.";
}

function getCompareStarter(personality: any): string {
  const conscientiousness = personality?.conscientiousness || 0.5;
  if (conscientiousness > 0.7) return "Let me break down the key differences:";
  return "Here's how I see it:";
}

function getCompareBody(communication: any): string {
  return "OPTION_A has SPECIFIC_PROS while OPTION_B offers SPECIFIC_BENEFITS";
}

function getCompareCloser(personality: any): string {
  const neuroticism = personality?.neuroticism || 0.5;
  if (neuroticism > 0.6) return "Both have trade-offs you'll need to consider.";
  return "Depends on your priorities really.";
}