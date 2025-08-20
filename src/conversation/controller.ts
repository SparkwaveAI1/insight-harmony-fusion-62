import { VoicepackRuntime, TurnClassification, Plan, ConversationState } from '../types/voicepack';

export function classifyTurn(userText: string): TurnClassification {
  const text = userText.toLowerCase().trim();
  
  // Intent classification based on patterns
  let intent: TurnClassification['intent'] = "opinion";
  
  // Conversational greetings and check-ins
  if (text.includes("how are you") || text.includes("how you doing") || text.includes("what's up") || 
      text.includes("how's it going") || text.includes("how do you feel") || text.includes("feeling")) {
    intent = "opinion";
  } else if (text.includes("what's on your mind") || text.includes("what are you thinking") || 
             text.includes("thinking about") || text.includes("what do you think") && !text.includes("about")) {
    intent = "opinion";
  } else if (text.includes("hello") || text.includes("hi ") || text.includes("hey") || text.includes("good morning") || 
             text.includes("good afternoon") || text.includes("good evening")) {
    intent = "opinion";
  } else if (text.includes("what do you think about") || text.includes("opinion on")) {
    intent = "opinion";
  } else if (text.includes("what's wrong with") || text.includes("critique") || text.includes("problems with")) {
    intent = "critique";
  } else if (text.includes("how do i") || text.includes("what should i") || text.includes("advice")) {
    intent = "advice";
  } else if (text.includes("tell me about") || text.includes("story") || text.includes("experience")) {
    intent = "story";
  } else if (text.includes("compare") || text.includes("versus") || text.includes("vs") || text.includes("which is better")) {
    intent = "compare";
  } else if (text.includes("can you explain") || text.includes("what does") || text.includes("clarify") || text.includes("define")) {
    intent = "clarify";
  }
  
  // Topic extraction
  const topics = extractTopics(text);
  
  // Audience detection (default to peer for direct chat)
  const audience = detectAudience(text);
  
  // Sensitivity assessment
  const sensitivity = assessSensitivity(text, topics);
  
  return { intent, topics, audience, sensitivity };
}

export function planTurn(
  classification: TurnClassification, 
  voicepack: VoicepackRuntime, 
  state: ConversationState
): Plan {
  // Choose response shape based on intent
  const response_shape = classification.intent;
  
  // Project stance biases onto current topics
  const stance_hint = getStanceHints(classification.topics, voicepack.stance_biases);
  
  // Select must-include details to force specificity
  const must_include = selectMustInclude(classification, voicepack);
  
  // Get banned frames to avoid generic responses
  const banned_frames = voicepack.anti_mode_collapse.forbidden_frames.slice(0, 5);
  
  // Apply style deltas based on state and context
  const style_deltas = calculateStyleDeltas(classification, voicepack, state);
  
  // Determine brevity based on intent and state
  const brevity = determineBrevity(classification, voicepack, state);
  
  // Select relevant memory snippets
  const memory_snippets = selectMemorySnippets(classification.topics, voicepack.memory_keys);
  
  return {
    response_shape,
    stance_hint,
    must_include,
    banned_frames,
    style_deltas,
    brevity,
    memory_snippets
  };
}

export function updateStateFromText(
  currentState: ConversationState, 
  userMessage: string
): ConversationState {
  const newState = { ...currentState };
  
  // Increment turn count
  newState.turn_count += 1;
  
  // Update stress based on message content
  if (userMessage.includes("problem") || userMessage.includes("issue") || userMessage.includes("urgent")) {
    newState.stress = Math.min(1.0, newState.stress + 0.1);
  } else if (userMessage.includes("thanks") || userMessage.includes("great") || userMessage.includes("helpful")) {
    newState.stress = Math.max(0.0, newState.stress - 0.05);
  }
  
  // Update fatigue based on conversation length
  if (newState.turn_count > 10) {
    newState.fatigue = Math.min(1.0, newState.fatigue + 0.02);
  }
  
  // Update familiarity gradually
  newState.familiarity = Math.min(1.0, newState.familiarity + 0.02);
  
  // Track recent topics
  const newTopics = extractTopics(userMessage);
  newState.last_topics = [...newTopics, ...newState.last_topics].slice(0, 5);
  
  // Update topic engagement
  newTopics.forEach(topic => {
    newState.topic_engagement[topic] = (newState.topic_engagement[topic] || 0) + 0.1;
  });
  
  return newState;
}

function extractTopics(text: string): string[] {
  const topicKeywords = {
    "website-ux": ["website", "user interface", "ux", "ui", "design", "navigation"],
    "pricing": ["price", "cost", "expensive", "cheap", "budget", "money", "pricing"],
    "safety": ["safe", "secure", "security", "safety", "risk", "danger"],
    "health": ["health", "medical", "doctor", "medicine", "wellness", "fitness"],
    "family": ["family", "kids", "children", "parent", "spouse", "marriage"],
    "work": ["job", "career", "work", "employment", "boss", "colleague"],
    "technology": ["tech", "computer", "software", "app", "digital", "internet"],
    "food": ["food", "restaurant", "cooking", "recipe", "meal", "diet"],
    "travel": ["travel", "vacation", "trip", "hotel", "flight", "destination"],
    "education": ["school", "college", "university", "learning", "education", "study"]
  };
  
  const topics: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      topics.push(topic);
    }
  }
  
  return topics.slice(0, 3); // Limit to most relevant topics
}

function detectAudience(text: string): TurnClassification['audience'] {
  // For direct chat, assume peer unless context suggests otherwise
  if (text.includes("sir") || text.includes("ma'am") || text.includes("please advise")) {
    return "authority";
  }
  
  if (text.includes("everyone") || text.includes("we all") || text.includes("our community")) {
    return "in-group";
  }
  
  return "peer";
}

function assessSensitivity(text: string, topics: string[]): TurnClassification['sensitivity'] {
  const sensitiveKeywords = ["personal", "private", "sexual", "political", "religious", "money", "health"];
  const highSensitivityTopics = ["safety", "health", "family"];
  
  const lowerText = text.toLowerCase();
  const hasSensitiveKeywords = sensitiveKeywords.some(keyword => lowerText.includes(keyword));
  const hasSensitiveTopics = topics.some(topic => highSensitivityTopics.includes(topic));
  
  if (hasSensitiveKeywords || hasSensitiveTopics) {
    return "high";
  }
  
  if (topics.length > 0) {
    return "medium";
  }
  
  return "low";
}

function getStanceHints(topics: string[], stanceBiases: Array<{ topic: string; w: number }>): string[] {
  const hints: string[] = [];
  
  for (const topic of topics) {
    const bias = stanceBiases.find(b => b.topic === topic || topic.includes(b.topic.split('-')[0]));
    if (bias && bias.w > 0.6) {
      hints.push(`emphasize ${bias.topic} perspective (weight: ${bias.w.toFixed(1)})`);
    }
  }
  
  return hints.slice(0, 2);
}

function selectMustInclude(classification: TurnClassification, voicepack: VoicepackRuntime): string[] {
  const mustIncludeOptions = voicepack.anti_mode_collapse.must_include_one_of[classification.intent] || [];
  
  // Select 1-2 concrete details based on intent
  if (classification.intent === "advice") {
    return ["specific actionable step", "personal experience reference"];
  } else if (classification.intent === "critique") {
    return ["concrete example", "specific improvement suggestion"];
  } else if (classification.intent === "story") {
    return ["specific detail", "emotional outcome"];
  }
  
  return mustIncludeOptions.slice(0, 2);
}

function calculateStyleDeltas(
  classification: TurnClassification, 
  voicepack: VoicepackRuntime, 
  state: ConversationState
): Record<string, number | string> {
  const deltas: Record<string, number | string> = {};
  
  // Apply state hooks
  for (const [condition, adjustments] of Object.entries(voicepack.state_hooks)) {
    if (evaluateCondition(condition, state)) {
      Object.assign(deltas, adjustments);
    }
  }
  
  // Apply register rules
  for (const rule of voicepack.register_rules) {
    if (matchesRule(rule.when, classification)) {
      Object.assign(deltas, rule.shift);
    }
  }
  
  // Apply sexuality/privacy constraints
  if (classification.sensitivity === "high" && voicepack.sexuality_hooks_summary.privacy === "private") {
    deltas.disclosure_limit = "minimal";
    deltas.hedge_rate = "+0.3";
  }
  
  return deltas;
}

function determineBrevity(
  classification: TurnClassification, 
  voicepack: VoicepackRuntime, 
  state: ConversationState
): "short"|"medium"|"long" {
  // High stress or fatigue -> shorter responses
  if (state.stress > 0.7 || state.fatigue > 0.8) {
    return "short";
  }
  
  // Story intent typically needs more space
  if (classification.intent === "story") {
    return "long";
  }
  
  // Complex topics might need medium responses
  if (classification.topics.length > 2) {
    return "medium";
  }
  
  // Default based on sentence length distribution
  const dist = voicepack.syntax_policy.sentence_length_dist;
  if (dist.short > 0.5) return "short";
  if (dist.long > 0.4) return "long";
  return "medium";
}

function selectMemorySnippets(topics: string[], memoryKeys: string[]): string[] {
  // Find relevant memory keys based on topic overlap
  const relevant = memoryKeys.filter(key => 
    topics.some(topic => 
      key.toLowerCase().includes(topic.split('-')[0]) || 
      topic.split('-')[0].includes(key.split(' ')[1] || '')
    )
  );
  
  return relevant.slice(0, 2);
}

function evaluateCondition(condition: string, state: ConversationState): boolean {
  // Parse conditions like "stress>0.6" or "fatigue>0.7"
  const match = condition.match(/(\w+)([><=]+)([\d.]+)/);
  if (!match) return false;
  
  const [, property, operator, valueStr] = match;
  const value = parseFloat(valueStr);
  const stateValue = (state as any)[property];
  
  if (typeof stateValue !== 'number') return false;
  
  switch (operator) {
    case '>': return stateValue > value;
    case '<': return stateValue < value;
    case '>=': return stateValue >= value;
    case '<=': return stateValue <= value;
    case '=': return Math.abs(stateValue - value) < 0.01;
    default: return false;
  }
}

function matchesRule(when: Record<string,string>, classification: TurnClassification): boolean {
  return Object.entries(when).every(([key, value]) => {
    return (classification as any)[key] === value;
  });
}