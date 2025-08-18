import { VoicepackRuntime, Plan } from '../../../types/voicepack';

/**
 * Serializes voicepack for inclusion in LLM developer prompt
 */
export function serializeVoicepack(voicepack: VoicepackRuntime): string {
  // Create a compact representation for the LLM
  const compact = {
    // Core style probabilities
    style: {
      hedge: voicepack.style_probs.hedge_rate,
      definitive: voicepack.style_probs.definitive_rate,
      rhetorical_q: voicepack.style_probs.rhetorical_q_rate,
      modal: voicepack.style_probs.modal_rate
    },

    // Key lexical elements
    lexicon: {
      signature: voicepack.lexicon.signature_tokens.slice(0, 8), // Limit for space
      discourse: voicepack.lexicon.discourse_markers.slice(0, 5).map(d => d.term),
      interjections: voicepack.lexicon.interjections.slice(0, 5).map(i => i.term)
    },

    // Syntax preferences
    syntax: {
      length_pref: voicepack.syntax_policy.sentence_length_dist,
      complexity: voicepack.syntax_policy.complexity,
      max_lists_per_200tok: voicepack.syntax_policy.lists_per_200toks_max
    },

    // Top stance biases
    stances: voicepack.stance_biases.slice(0, 6).map(s => ({ topic: s.topic, weight: s.w })),

    // Memory anchors
    memory: voicepack.memory_keys.slice(0, 4),

    // Privacy/disclosure settings
    privacy: {
      level: voicepack.sexuality_hooks_summary.privacy,
      disclosure: voicepack.sexuality_hooks_summary.disclosure,
      humor_bias: voicepack.sexuality_hooks_summary.humor_style_bias
    }
  };

  return JSON.stringify(compact, null, 0);
}

/**
 * Serializes execution plan for LLM assistant planning prompt
 */
export function serializePlan(plan: Plan): string {
  const planSummary = {
    shape: plan.response_shape,
    brevity: plan.brevity,
    stances: plan.stance_hint,
    must_include: plan.must_include,
    style_adjustments: plan.style_deltas,
    memory_cues: plan.memory_snippets || []
  };

  // Create natural language instructions for the LLM
  const instructions = [
    `Respond in ${plan.response_shape} format`,
    `Target length: ${plan.brevity}`,
  ];

  if (plan.stance_hint.length > 0) {
    instructions.push(`Perspective: ${plan.stance_hint.join(', ')}`);
  }

  if (plan.must_include.length > 0) {
    instructions.push(`Must reference: ${plan.must_include.join(', ')}`);
  }

  if (plan.memory_snippets && plan.memory_snippets.length > 0) {
    instructions.push(`Draw from: ${plan.memory_snippets.join(', ')}`);
  }

  // Add style adjustments
  const styleNotes = [];
  for (const [key, value] of Object.entries(plan.style_deltas)) {
    if (typeof value === 'number') {
      const direction = value > 0 ? 'increase' : 'decrease';
      styleNotes.push(`${direction} ${key}`);
    } else {
      styleNotes.push(`${key}: ${value}`);
    }
  }
  if (styleNotes.length > 0) {
    instructions.push(`Style: ${styleNotes.join(', ')}`);
  }

  return instructions.join(' | ');
}

/**
 * Selects temperature based on persona state and voicepack
 */
export function pickTempFromTraits(state: Record<string, any>, voicepack: VoicepackRuntime): number {
  let baseTemp = 0.7; // Default temperature
  
  // Adjust for openness (assuming we can infer from style patterns)
  const isCreative = voicepack.lexicon.signature_tokens.some(token => 
    ['creative', 'innovative', 'unique', 'artistic'].some(creative => 
      token.toLowerCase().includes(creative)
    )
  );
  if (isCreative) baseTemp += 0.15;

  // Adjust for state
  const stress = state.stress || 0.3;
  const fatigue = state.fatigue || 0.3;
  
  // High stress = more focused/deterministic
  if (stress > 0.7) baseTemp -= 0.1;
  
  // High fatigue = less creative
  if (fatigue > 0.7) baseTemp -= 0.15;

  // Clamp to reasonable bounds
  return Math.max(0.3, Math.min(1.0, baseTemp));
}

/**
 * Selects presence penalty based on state and voicepack
 */
export function pickPresencePenalty(state: Record<string, any>, voicepack: VoicepackRuntime): number {
  let penalty = 0.0; // Default
  
  // Higher penalty for verbose personas to encourage variety
  if (voicepack.syntax_policy.sentence_length_dist.long > 0.5) {
    penalty += 0.2;
  }
  
  // Adjust for repetitive signature tokens
  if (voicepack.lexicon.signature_tokens.length < 5) {
    penalty += 0.3; // Prevent overuse of limited vocab
  }
  
  return Math.min(2.0, penalty);
}

/**
 * Selects frequency penalty based on state and voicepack
 */
export function pickFrequencyPenalty(state: Record<string, any>, voicepack: VoicepackRuntime): number {
  let penalty = 0.0; // Default
  
  // Higher penalty for anti-mode-collapse
  if (voicepack.anti_mode_collapse.forbidden_frames.length > 5) {
    penalty += 0.3;
  }
  
  return Math.min(2.0, penalty);
}

/**
 * Selects max tokens based on plan and voicepack
 */
export function pickMaxTokens(plan: Plan, voicepack: VoicepackRuntime): number {
  let maxTokens = 150; // Default medium response
  
  switch (plan.brevity) {
    case 'short':
      maxTokens = 80;
      break;
    case 'medium':
      maxTokens = 150;
      break;
    case 'long':
      maxTokens = 300;
      break;
  }
  
  // Adjust for complexity
  if (voicepack.syntax_policy.complexity === 'complex') {
    maxTokens = Math.floor(maxTokens * 1.3);
  } else if (voicepack.syntax_policy.complexity === 'simple') {
    maxTokens = Math.floor(maxTokens * 0.8);
  }
  
  return Math.min(500, maxTokens); // Hard cap
}

/**
 * Creates the system prompt for voicepack-driven conversations
 */
export function createSystemPrompt(): string {
  return `You are a conversational AI that must strictly follow the provided voicepack and plan. 

The voicepack contains your linguistic personality profile, including:
- Style probabilities (hedging, definitiveness, etc.)
- Signature lexicon and discourse markers  
- Syntax preferences and complexity level
- Stance biases on various topics
- Memory anchors from your background
- Privacy and disclosure preferences

The plan contains your response strategy for this specific turn:
- Response shape/format to use
- Brevity requirements
- Specific elements you must include
- Style adjustments for current context

CRITICAL RULES:
1. Always use the specified response shape format
2. Include your signature tokens naturally
3. Never use the banned phrases from your anti-mode-collapse settings
4. Respect privacy levels - be more guarded if privacy="private"
5. Apply style probabilities (hedge more if hedge_rate is high, etc.)
6. Reference your memory anchors when relevant
7. Follow brevity requirements strictly

Be authentic to the voicepack personality while addressing the user's input meaningfully.`;
}