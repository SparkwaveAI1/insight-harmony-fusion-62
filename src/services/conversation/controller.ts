import { VoicepackRuntime, TurnClassification, Plan } from '../../types/voicepack';

/**
 * Classifies user input to determine response strategy
 */
export function classifyTurn(userText: string): TurnClassification {
  const text = userText.toLowerCase();
  
  // Intent classification (rule-based for now)
  let intent: TurnClassification['intent'] = 'clarify';
  
  if (text.includes('what do you think') || text.includes('opinion') || text.includes('feel about')) {
    intent = 'opinion';
  } else if (text.includes('wrong') || text.includes('bad') || text.includes('problem') || text.includes('critique')) {
    intent = 'critique';
  } else if (text.includes('should i') || text.includes('how do i') || text.includes('advice') || text.includes('recommend')) {
    intent = 'advice';
  } else if (text.includes('tell me about') || text.includes('story') || text.includes('experience') || text.includes('remember when')) {
    intent = 'story';
  } else if (text.includes('vs') || text.includes('compare') || text.includes('better') || text.includes('difference')) {
    intent = 'compare';
  }

  // Topic extraction (simple keyword matching)
  const topics: string[] = [];
  const topicMap = {
    'work': ['work', 'job', 'career', 'office', 'boss', 'colleague'],
    'money': ['money', 'finance', 'budget', 'cost', 'price', 'salary', 'pay'],
    'family': ['family', 'parent', 'sibling', 'child', 'mother', 'father'],
    'health': ['health', 'doctor', 'medicine', 'sick', 'hospital', 'fitness'],
    'technology': ['tech', 'computer', 'app', 'software', 'internet', 'digital'],
    'relationship': ['relationship', 'dating', 'love', 'partner', 'marriage'],
    'politics': ['politics', 'government', 'election', 'policy', 'law']
  };

  for (const [topic, keywords] of Object.entries(topicMap)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      topics.push(topic);
    }
  }

  // Audience classification
  let audience: TurnClassification['audience'] = 'peer';
  if (text.includes('sir') || text.includes('ma\'am') || text.includes('professor') || text.includes('doctor')) {
    audience = 'authority';
  } else if (text.includes('stranger') || text.includes('hello') || text.includes('nice to meet')) {
    audience = 'stranger';
  }

  // Sensitivity assessment
  let sensitivity: TurnClassification['sensitivity'] = 'low';
  const sensitivePhrases = ['personal', 'private', 'secret', 'confidential', 'trauma', 'abuse', 'death'];
  if (sensitivePhrases.some(phrase => text.includes(phrase))) {
    sensitivity = 'high';
  } else if (topics.includes('relationship') || topics.includes('family') || topics.includes('health')) {
    sensitivity = 'medium';
  }

  return {
    intent,
    topics,
    audience,
    sensitivity
  };
}

/**
 * Creates an execution plan based on classification and voicepack
 */
export function planTurn(
  classification: TurnClassification, 
  voicepack: VoicepackRuntime, 
  state: Record<string, any> = {}
): Plan {
  
  // Choose response shape based on intent
  const responseShape = classification.intent;
  
  // Project stance biases onto current topics
  const stanceHints: string[] = [];
  for (const topic of classification.topics) {
    const bias = voicepack.stance_biases.find(b => b.topic === topic);
    if (bias && bias.w > 0.6) {
      stanceHints.push(`Strong positive stance on ${topic}`);
    } else if (bias && bias.w < 0.4) {
      stanceHints.push(`Skeptical stance on ${topic}`);
    }
  }

  // Select must_include elements to force specificity
  const mustInclude: string[] = [];
  const mustIncludeKeys = voicepack.anti_mode_collapse.must_include_one_of[classification.intent];
  if (mustIncludeKeys && mustIncludeKeys.length > 0) {
    // Pick 1-2 random elements to ensure variety
    const selected = mustIncludeKeys.slice(0, Math.min(2, mustIncludeKeys.length));
    mustInclude.push(...selected);
  }

  // Use forbidden frames from anti-mode-collapse
  const bannedFrames = voicepack.anti_mode_collapse.forbidden_frames;

  // Apply style deltas based on state and voicepack hooks
  const styleDeltas: Record<string, number | string> = {};
  
  // Check state hooks
  for (const [condition, shifts] of Object.entries(voicepack.state_hooks)) {
    if (shouldApplyStateHook(condition, state)) {
      Object.assign(styleDeltas, shifts);
    }
  }

  // Sexuality privacy adjustments
  if (classification.sensitivity === 'high' && voicepack.sexuality_hooks_summary.privacy === 'private') {
    styleDeltas['disclosure_rate'] = 'low';
    styleDeltas['boundary_enforcement'] = 'firm';
  }

  // Determine brevity based on intent and syntax policy
  let brevity: Plan['brevity'] = 'medium';
  if (classification.intent === 'clarify' || classification.audience === 'authority') {
    brevity = 'short';
  } else if (classification.intent === 'story' || voicepack.syntax_policy.complexity === 'complex') {
    brevity = 'long';
  }

  // Memory snippets (0-2 relevant memories)
  const memorySnippets: string[] = [];
  if (voicepack.memory_keys.length > 0 && classification.topics.length > 0) {
    // Simple matching - in real implementation, this would be more sophisticated
    const relevantMemories = voicepack.memory_keys.filter(key => 
      classification.topics.some(topic => key.toLowerCase().includes(topic))
    );
    memorySnippets.push(...relevantMemories.slice(0, 2));
  }

  return {
    response_shape: responseShape,
    stance_hint: stanceHints,
    must_include: mustInclude,
    banned_frames: bannedFrames,
    style_deltas: styleDeltas,
    brevity,
    memory_snippets: memorySnippets.length > 0 ? memorySnippets : undefined
  };
}

/**
 * Helper to determine if a state hook condition is met
 */
function shouldApplyStateHook(condition: string, state: Record<string, any>): boolean {
  // Parse conditions like "stress>0.6" or "fatigue>0.5"
  const match = condition.match(/(\w+)([><=]+)([\d.]+)/);
  if (!match) return false;
  
  const [, stateKey, operator, thresholdStr] = match;
  const threshold = parseFloat(thresholdStr);
  const currentValue = state[stateKey];
  
  if (typeof currentValue !== 'number') return false;
  
  switch (operator) {
    case '>': return currentValue > threshold;
    case '>=': return currentValue >= threshold;
    case '<': return currentValue < threshold;
    case '<=': return currentValue <= threshold;
    case '=': return Math.abs(currentValue - threshold) < 0.1;
    default: return false;
  }
}

/**
 * Updates state based on user input and previous state
 */
export function updateStateFromText(
  previousState: Record<string, any>,
  userText: string
): Record<string, any> {
  const newState = { ...previousState };
  
  // Simple state updates based on text analysis
  const text = userText.toLowerCase();
  
  // Stress indicators
  if (text.includes('urgent') || text.includes('deadline') || text.includes('pressure')) {
    newState.stress = Math.min(1.0, (newState.stress || 0.3) + 0.2);
  }
  
  // Fatigue indicators
  if (text.includes('tired') || text.includes('exhausted') || text.includes('worn out')) {
    newState.fatigue = Math.min(1.0, (newState.fatigue || 0.3) + 0.3);
  }
  
  // Mood indicators
  if (text.includes('happy') || text.includes('excited') || text.includes('great')) {
    newState.mood_valence = Math.min(1.0, (newState.mood_valence || 0.5) + 0.2);
  } else if (text.includes('sad') || text.includes('angry') || text.includes('upset')) {
    newState.mood_valence = Math.max(0.0, (newState.mood_valence || 0.5) - 0.2);
  }
  
  // Time pressure
  if (text.includes('quick') || text.includes('fast') || text.includes('hurry')) {
    newState.time_pressure = Math.min(1.0, (newState.time_pressure || 0.3) + 0.3);
  }
  
  // Social safety
  if (text.includes('comfortable') || text.includes('safe') || text.includes('trust')) {
    newState.social_safety = Math.min(1.0, (newState.social_safety || 0.7) + 0.1);
  } else if (text.includes('uncomfortable') || text.includes('unsafe') || text.includes('awkward')) {
    newState.social_safety = Math.max(0.0, (newState.social_safety || 0.7) - 0.2);
  }
  
  return newState;
}