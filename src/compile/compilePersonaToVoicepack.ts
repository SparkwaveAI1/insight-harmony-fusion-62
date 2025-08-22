import { VoicepackRuntime } from "../types/voicepack";

export interface PersonaForCompilation {
  id: string;
  full_profile?: any;
  conversation_summary?: any;
  knowledge_domains?: Record<string, number>;
  linguistic_style?: any;
  updated_at?: string;
}

export function compilePersonaToVoicepack(p: PersonaForCompilation): VoicepackRuntime {
  const profile = p.full_profile || {};
  const summary = p.conversation_summary || {};
  
  // Extract stance/topic salience from various sources
  const stance_biases = extractStanceBiases(profile, summary);
  
  // Build response shapes for different intents
  const response_shapes = buildResponseShapes(profile);
  
  // Build lexicon from linguistic style and cultural markers
  const lexicon = buildLexicon(profile, summary);
  
  // Derive syntax policy from communication patterns
  const syntax_policy = buildSyntaxPolicy(profile);
  
  // Calculate style probabilities from personality traits
  const style_probs = buildStyleProbs(profile);
  
  // Create register rules for audience/topic adaptation
  const register_rules = buildRegisterRules(profile);
  
  // Build state hooks for dynamic adjustments
  const state_hooks = buildStateHooks(profile);
  
  // Extract sexuality-related communication patterns
  const sexuality_hooks_summary = buildSexualityHooks(profile);
  
  // Anti-mode collapse safeguards
  const anti_mode_collapse = buildAntiModeCollapse(profile);
  
  // Extract strongest autobiographical anchors
  const memory_keys = extractMemoryKeys(summary, profile);

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
    memory_keys
  };
}

function extractStanceBiases(profile: any, summary: any): Array<{ topic: string; w: number }> {
  const biases: Array<{ topic: string; w: number }> = [];
  
  // Extract from political identity
  const political = profile.identity_salience?.political_identity;
  if (political?.orientation && political.strength > 0.3) {
    biases.push({ 
      topic: "politics", 
      w: political.strength * (political.orientation === "conservative" ? -0.8 : 0.8) 
    });
    
    if (political.key_issues) {
      political.key_issues.forEach((issue: string) => {
        biases.push({ topic: issue, w: political.strength * 0.6 });
      });
    }
  }
  
  // Extract from motivations
  const motivations = profile.motivation_profile?.primary_drivers;
  if (motivations) {
    if (motivations.family > 0.6) biases.push({ topic: "family", w: motivations.family });
    if (motivations.status > 0.6) biases.push({ topic: "status", w: motivations.status });
    if (motivations.security > 0.6) biases.push({ topic: "security", w: motivations.security });
    if (motivations.care > 0.6) biases.push({ topic: "healthcare", w: motivations.care });
  }
  
  // Extract from occupation-based stances
  const occupation = profile.identity?.occupation;
  if (occupation) {
    if (occupation.includes("nurse") || occupation.includes("healthcare")) {
      biases.push({ topic: "healthcare", w: 0.7 });
    }
    if (occupation.includes("truck") || occupation.includes("driver")) {
      biases.push({ topic: "transportation", w: 0.6 });
      biases.push({ topic: "regulations", w: -0.4 });
    }
  }
  
  return biases.slice(0, 8); // Limit to most important
}

function buildResponseShapes(profile: any): Record<string, string[]> {
  const communication = profile.communication_style || {};
  const directness = communication.voice_foundation?.directness_level || "balanced";
  const emotional = communication.voice_foundation?.emotional_expression || "moderate";
  
  const shapes: Record<string, string[]> = {
    opinion: [],
    critique: [],
    advice: [],
    story: [],
    compare: []
  };
  
  // Build templates based on communication style
  if (directness === "blunt" || directness === "direct") {
    shapes.opinion = [
      "I think {stance}. Here's why: {evidence}.",
      "Look, {stance}. {supporting_point}.",
      "{stance}, plain and simple."
    ];
    shapes.critique = [
      "The problem with {target} is {issue}. {solution}.",
      "{target} is wrong because {reason}.",
      "This doesn't work. {specific_problem}."
    ];
  } else if (directness === "diplomatic" || directness === "indirect") {
    shapes.opinion = [
      "I tend to think {stance}, though {consideration}.",
      "From my perspective, {stance}. That said, {nuance}.",
      "I'd probably lean toward {stance}."
    ];
    shapes.critique = [
      "I see some concerns with {target}. Perhaps {suggestion}?",
      "While {positive}, I think {concern} could be addressed.",
      "One thing that might help is {improvement}."
    ];
  }
  
  // Add emotional variation
  if (emotional === "expressive" || emotional === "dramatic") {
    shapes.story = [
      "Oh man, {setup}! So {complication}, and {resolution}!",
      "This reminds me of {context}. {dramatic_moment}. {outcome}.",
      "You won't believe {setup}. {twist}!"
    ];
  }
  
  return shapes;
}

function buildLexicon(profile: any, summary: any): VoicepackRuntime['lexicon'] {
  const communication = profile.communication_style || {};
  const lexical = communication.lexical_profile || {};
  const regional = lexical.regional_markers || [];
  const jargon = lexical.domain_jargon || [];
  const signature = communication.linguistic_signature?.signature_phrases || [];
  
  // Extract signature tokens (unique phrases this person uses)
  const signature_tokens = [
    ...signature.slice(0, 4),
    ...regional.slice(0, 3),
    ...jargon.slice(0, 2)
  ].filter(Boolean);
  
  // Build discourse markers with probabilities
  const discourse_markers = [];
  if (lexical.hedging_language && lexical.hedging_language[0] !== "none") {
    lexical.hedging_language.forEach((hedge: string) => {
      discourse_markers.push({ term: hedge, p: 0.3 });
    });
  }
  
  // Add intensifiers as discourse markers
  if (lexical.intensifiers) {
    lexical.intensifiers.forEach((intensifier: string) => {
      discourse_markers.push({ term: intensifier, p: 0.2 });
    });
  }
  
  return {
    signature_tokens: signature_tokens.slice(0, 10),
    discourse_markers: discourse_markers.slice(0, 8),
    interjections: [] // Would extract from emotional expressions
  };
}

function buildSyntaxPolicy(profile: any): VoicepackRuntime['syntax_policy'] {
  const communication = profile.communication_style || {};
  const education = profile.knowledge_profile?.education_level || "high_school";
  const pace = communication.voice_foundation?.pace_rhythm || "measured_academic";
  
  // Determine sentence length distribution
  let sentence_length_dist = { short: 0.4, medium: 0.4, long: 0.2 };
  
  if (education === "doctorate" || education === "masters") {
    sentence_length_dist = { short: 0.2, medium: 0.5, long: 0.3 };
  } else if (education === "high_school" || pace === "clipped_military") {
    sentence_length_dist = { short: 0.6, medium: 0.3, long: 0.1 };
  }
  
  // Determine complexity
  let complexity: "simple" | "compound" | "complex" = "compound";
  if (education === "high_school") {
    complexity = "simple";
  } else if (education === "doctorate") {
    complexity = "complex";
  }
  
  return {
    sentence_length_dist,
    complexity,
    lists_per_200toks_max: communication.voice_foundation?.directness_level === "blunt" ? 1 : 2
  };
}

function buildStyleProbs(profile: any): VoicepackRuntime['style_probs'] {
  const communication = profile.communication_style || {};
  const emotional = profile.emotional_profile || {};
  const inhibitor = profile.inhibitor_profile || {};
  const directness = communication.voice_foundation?.directness_level || "balanced";
  
  // Calculate hedge rate from confidence and directness
  const confidence = inhibitor.confidence_level || 0.5;
  let hedge_rate = 0.3;
  if (directness === "blunt") hedge_rate = 0.1;
  if (directness === "diplomatic") hedge_rate = 0.5;
  if (confidence < 0.4) hedge_rate += 0.2;
  
  // Modal rate (should, would, might)
  const modal_rate = directness === "indirect" ? 0.4 : 0.2;
  
  // Definitive rate (absolutely, definitely, clearly)
  const definitive_rate = directness === "blunt" ? 0.3 : 0.1;
  
  // Rhetorical questions
  const rhetorical_q_rate = communication.voice_foundation?.emotional_expression === "dramatic" ? 0.2 : 0.05;
  
  // Profanity rate (very conservative estimate)
  const emotional_regulation = emotional.emotional_regulation || "high_control";
  const profanity_rate = emotional_regulation === "low_control" ? 0.1 : 0.02;
  
  return {
    hedge_rate: Math.min(0.6, hedge_rate),
    modal_rate: Math.min(0.5, modal_rate),
    definitive_rate: Math.min(0.4, definitive_rate),
    rhetorical_q_rate: Math.min(0.3, rhetorical_q_rate),
    profanity_rate: Math.min(0.15, profanity_rate)
  };
}

function buildRegisterRules(profile: any): VoicepackRuntime['register_rules'] {
  const rules = [];
  const truth_flexibility = profile.truth_honesty_profile?.truth_flexibility_by_context || {};
  
  // Add context-based formality shifts
  if (truth_flexibility.authority && truth_flexibility.authority > 0.6) {
    rules.push({
      when: { audience: "authority" },
      shift: { formality: "+1", hedge_rate: "+0.2" }
    });
  }
  
  if (truth_flexibility.family && truth_flexibility.family < 0.4) {
    rules.push({
      when: { audience: "in-group" },
      shift: { formality: "-1", definitive_rate: "+0.1" }
    });
  }
  
  return rules;
}

function buildStateHooks(profile: any): VoicepackRuntime['state_hooks'] {
  const hooks: Record<string, Record<string, number | string>> = {};
  
  // Stress responses
  const stress_responses = profile.emotional_profile?.stress_responses || [];
  if (stress_responses.length > 0) {
    hooks["stress>0.6"] = {
      hedge_rate: "+0.1",
      sentence_length_dist: '{"short":0.7,"medium":0.2,"long":0.1}'
    };
  }
  
  // Emotional regulation impact
  const emotional_regulation = profile.emotional_profile?.emotional_regulation;
  if (emotional_regulation === "low_control") {
    hooks["emotional_intensity>0.7"] = {
      definitive_rate: "+0.2",
      profanity_rate: "+0.05"
    };
  }
  
  return hooks;
}

function buildSexualityHooks(profile: any): VoicepackRuntime['sexuality_hooks_summary'] {
  const sexuality = profile.sexuality_profile || {};
  
  return {
    privacy: sexuality.expression_style || "selective",
    disclosure: sexuality.boundaries?.comfort_level === "conservative" ? "low" : 
               sexuality.boundaries?.comfort_level === "liberal" ? "high" : "medium",
    humor_style_bias: sexuality.linguistic_influences?.humor_boundaries || "suggestive"
  };
}

function buildAntiModeCollapse(profile: any): VoicepackRuntime['anti_mode_collapse'] {
  const communication = profile.communication_style || {};
  const forbidden = communication.authenticity_filters?.forbidden_phrases || [];
  
  return {
    forbidden_frames: [
      "It's clear what this is about",
      "Overall pretty solid", 
      "At the end of the day",
      "This is a complex issue",
      "There are valid points on both sides",
      ...forbidden.slice(0, 5)
    ],
    must_include_one_of: {
      opinion: ["specific example", "personal experience", "concrete detail"],
      advice: ["actionable step", "personal relevance", "specific outcome"],
      critique: ["specific problem", "alternative suggestion", "concrete improvement"]
    }
  };
}

function extractMemoryKeys(summary: any, profile: any): string[] {
  const keys = [];
  
  // Extract from identity
  const identity = profile.identity || {};
  if (identity.occupation) keys.push(`Works as ${identity.occupation}`);
  if (identity.location) keys.push(`Lives in ${identity.location.city}`);
  
  // Extract from goals
  const goals = profile.motivation_profile?.goal_orientation?.primary_goals || [];
  goals.slice(0, 2).forEach((goal: any) => {
    keys.push(goal.goal);
  });
  
  // Extract from contradictions
  const contradictions = profile.contradictions?.primary_tension;
  if (contradictions?.description) {
    keys.push(contradictions.description);
  }
  
  return keys.slice(0, 6);
}