import { VoicepackRuntime, TurnClassification, Plan } from "../types/voicepack";

export function classifyTurn(userText: string): TurnClassification {
  const input = userText.toLowerCase();
  
  // Classify intent based on user input patterns
  let intent: TurnClassification['intent'] = "opinion";
  
  if (input.includes("what do you think") || input.includes("opinion") || input.includes("feel about")) {
    intent = "opinion";
  } else if (input.includes("problem") || input.includes("wrong") || input.includes("issue") || input.includes("criticize")) {
    intent = "critique";
  } else if (input.includes("should") || input.includes("advice") || input.includes("recommend") || input.includes("help")) {
    intent = "advice";
  } else if (input.includes("tell me about") || input.includes("experience") || input.includes("story") || input.includes("time when")) {
    intent = "story";
  } else if (input.includes("compare") || input.includes("versus") || input.includes("vs") || input.includes("better than")) {
    intent = "compare";
  } else if (input.includes("explain") || input.includes("clarify") || input.includes("what do you mean")) {
    intent = "clarify";
  }
  
  // Extract topics
  const topics = extractTopics(input);
  
  // Determine audience context
  let audience: TurnClassification['audience'] = "peer";
  if (input.includes("professional") || input.includes("work") || input.includes("business")) {
    audience = "authority";
  } else if (input.includes("family") || input.includes("personal")) {
    audience = "in-group";
  }
  
  // Assess sensitivity
  let sensitivity: TurnClassification['sensitivity'] = "low";
  const sensitiveTopics = ["politics", "religion", "sex", "money", "health", "immigration"];
  if (sensitiveTopics.some(topic => input.includes(topic))) {
    sensitivity = "high";
  } else if (topics.some(topic => ["relationships", "career", "family"].includes(topic))) {
    sensitivity = "medium";
  }
  
  return {
    intent,
    topics,
    audience,
    sensitivity
  };
}

function extractTopics(input: string): string[] {
  const topics = [];
  
  // Define topic keywords
  const topicMap = {
    "politics": ["politics", "political", "government", "election", "policy"],
    "healthcare": ["health", "medical", "doctor", "hospital", "insurance"],
    "technology": ["tech", "technology", "software", "app", "digital"],
    "finance": ["money", "financial", "bank", "investment", "savings"],
    "family": ["family", "children", "kids", "parent", "spouse"],
    "work": ["work", "job", "career", "employment", "professional"],
    "education": ["school", "education", "learning", "study", "college"],
    "transportation": ["car", "driving", "traffic", "public transport", "commute"],
    "religion": ["religion", "faith", "church", "spiritual", "belief"],
    "relationships": ["relationship", "dating", "marriage", "friend"],
    "housing": ["house", "home", "rent", "mortgage", "apartment"],
    "food": ["food", "restaurant", "cooking", "meal", "diet"]
  };
  
  for (const [topic, keywords] of Object.entries(topicMap)) {
    if (keywords.some(keyword => input.includes(keyword))) {
      topics.push(topic);
    }
  }
  
  return topics.length > 0 ? topics : ["general"];
}

export function planTurn(
  classification: TurnClassification, 
  voicepack: VoicepackRuntime, 
  state: Record<string, any> = {}
): Plan {
  const { intent, topics, audience, sensitivity } = classification;
  
  // Choose response shape based on intent
  const response_shape = intent;
  
  // Project stance biases onto current topics
  const stance_hint = [];
  for (const topic of topics) {
    const bias = voicepack.stance_biases.find(b => b.topic === topic);
    if (bias) {
      if (bias.w > 0.3) {
        stance_hint.push(`Positive stance on ${topic} (${bias.w.toFixed(1)})`);
      } else if (bias.w < -0.3) {
        stance_hint.push(`Critical stance on ${topic} (${bias.w.toFixed(1)})`);
      }
    }
  }
  
  // Select must_include based on response shape and anti-mode collapse
  const must_include = [];
  const shapeRequirements = voicepack.anti_mode_collapse.must_include_one_of[response_shape];
  if (shapeRequirements) {
    must_include.push(shapeRequirements[0]); // Take first requirement
  }
  
  // Add topic-specific requirements
  if (topics.includes("finance") || topics.includes("money")) {
    must_include.push("avoid sophisticated financial jargon");
  }
  if (topics.includes("technology")) {
    must_include.push("use appropriate tech knowledge level");
  }
  
  // Extract banned frames
  const banned_frames = voicepack.anti_mode_collapse.forbidden_frames.slice(0, 4);
  
  // Apply style deltas based on state hooks
  const style_deltas: Record<string, number | string> = {};
  
  // Check state hooks
  for (const [condition, deltas] of Object.entries(voicepack.state_hooks)) {
    if (evaluateStateCondition(condition, state)) {
      Object.assign(style_deltas, deltas);
    }
  }
  
  // Apply sensitivity-based adjustments
  if (sensitivity === "high") {
    style_deltas.hedge_rate = (style_deltas.hedge_rate as number || 0) + 0.1;
  }
  
  // Apply audience-based register rules
  for (const rule of voicepack.register_rules) {
    if (rule.when.audience === audience) {
      Object.assign(style_deltas, rule.shift);
    }
  }
  
  // Determine brevity based on intent and syntax policy
  let brevity: Plan['brevity'] = "medium";
  if (intent === "opinion" && classification.topics.includes("politics")) {
    brevity = "long"; // Political opinions tend to be elaborate
  } else if (intent === "clarify" || classification.sensitivity === "low") {
    brevity = "short";
  }
  
  // Add memory snippets if relevant
  const memory_snippets = [];
  for (const memoryKey of voicepack.memory_keys.slice(0, 2)) {
    if (topics.some(topic => memoryKey.toLowerCase().includes(topic))) {
      memory_snippets.push(memoryKey);
    }
  }
  
  return {
    response_shape,
    stance_hint: stance_hint.slice(0, 2),
    must_include: must_include.slice(0, 2),
    banned_frames,
    style_deltas,
    brevity,
    memory_snippets: memory_snippets.length > 0 ? memory_snippets : undefined
  };
}

function evaluateStateCondition(condition: string, state: Record<string, any>): boolean {
  // Parse conditions like "stress>0.6" or "emotional_intensity>0.7"
  const match = condition.match(/(\w+)([><=]+)([\d.]+)/);
  if (!match) return false;
  
  const [, variable, operator, valueStr] = match;
  const threshold = parseFloat(valueStr);
  const currentValue = state[variable] || 0;
  
  switch (operator) {
    case '>':
      return currentValue > threshold;
    case '<':
      return currentValue < threshold;
    case '>=':
      return currentValue >= threshold;
    case '<=':
      return currentValue <= threshold;
    case '=':
    case '==':
      return currentValue === threshold;
    default:
      return false;
  }
}

// Helper function to update state from conversation context
export function updateStateFromText(previousState: Record<string, any>, userMessage: string): Record<string, any> {
  const state = { ...previousState };
  
  // Detect stress indicators
  const stressKeywords = ["stressed", "overwhelmed", "anxious", "pressure", "deadline"];
  if (stressKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
    state.stress = Math.min(1.0, (state.stress || 0) + 0.3);
  }
  
  // Detect emotional intensity
  const emotionalKeywords = ["angry", "furious", "excited", "thrilled", "devastated", "heartbroken"];
  if (emotionalKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
    state.emotional_intensity = Math.min(1.0, (state.emotional_intensity || 0) + 0.4);
  }
  
  // Decay states over time (simple approach)
  state.stress = Math.max(0, (state.stress || 0) - 0.1);
  state.emotional_intensity = Math.max(0, (state.emotional_intensity || 0) - 0.2);
  
  return state;
}