import { VoicepackRuntime, Plan, VoicepackTelemetry } from '../types/voicepack';

export function postProcess(text: string, vp: VoicepackRuntime, plan: Plan): string {
  let processedText = text.trim();
  
  // 1) Enforce selected response_shape (restructure if needed)
  processedText = enforceResponseShape(processedText, plan.response_shape, vp);
  
  // 2) Inject signature tokens if none present
  processedText = injectSignatureTokens(processedText, vp.lexicon.signature_tokens);
  
  // 3) Remove banned frames and enforce must_include
  processedText = removeBannedFrames(processedText, plan.banned_frames);
  processedText = enforceMustInclude(processedText, plan.must_include);
  
  // 4) Privacy guardrail for sexuality content
  processedText = applyPrivacyGuardrail(processedText, vp.sexuality_hooks_summary);
  
  // 5) Brevity enforcement
  processedText = enforceBrevity(processedText, plan.brevity, vp.syntax_policy);
  
  return processedText;
}

function enforceResponseShape(text: string, responseShape: string, vp: VoicepackRuntime): string {
  const shape = vp.response_shapes[responseShape];
  if (!shape || shape.length < 3) return text;
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 3) return text;
  
  // Cap lists according to policy
  const maxLists = vp.syntax_policy.lists_per_200toks_max;
  let listCount = 0;
  
  return sentences.map(sentence => {
    // Count and limit lists
    if (sentence.includes('•') || sentence.includes('-') || sentence.includes('1.')) {
      listCount++;
      if (listCount > maxLists) {
        // Convert list to prose
        return sentence.replace(/[•\-]\s*/g, '').replace(/\d+\.\s*/g, '');
      }
    }
    return sentence;
  }).join('. ').trim() + '.';
}

function injectSignatureTokens(text: string, signatureTokens: string[]): string {
  if (signatureTokens.length === 0) return text;
  
  // Check if any signature tokens are already present
  const hasSignatureToken = signatureTokens.some(token => 
    text.toLowerCase().includes(token.toLowerCase())
  );
  
  if (!hasSignatureToken && signatureTokens.length > 0) {
    // Inject one signature token naturally
    const token = signatureTokens[Math.floor(Math.random() * signatureTokens.length)];
    const sentences = text.split('. ');
    
    if (sentences.length > 1) {
      // Insert in the middle
      const midPoint = Math.floor(sentences.length / 2);
      sentences[midPoint] = `${token}, ${sentences[midPoint].toLowerCase()}`;
      return sentences.join('. ');
    } else {
      // Prepend to single sentence
      return `${token}, ${text.toLowerCase()}`;
    }
  }
  
  return text;
}

function removeBannedFrames(text: string, bannedFrames: string[]): string {
  let processedText = text;
  
  for (const frame of bannedFrames) {
    const regex = new RegExp(frame.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    processedText = processedText.replace(regex, '');
  }
  
  // Clean up any double spaces or punctuation
  return processedText
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim();
}

function enforceMustInclude(text: string, mustInclude: string[]): string {
  if (mustInclude.length === 0) return text;
  
  // Check if any must-include elements are present
  const hasMustInclude = mustInclude.some(element =>
    text.toLowerCase().includes(element.toLowerCase()) ||
    text.toLowerCase().includes(element.replace(/\s+/g, '').toLowerCase())
  );
  
  if (!hasMustInclude) {
    // Add a must-include element naturally
    const element = mustInclude[0];
    const sentences = text.split('. ');
    
    if (sentences.length > 1) {
      // Add to the last sentence
      const lastSentence = sentences[sentences.length - 1];
      sentences[sentences.length - 1] = `${lastSentence} For instance, ${element.toLowerCase()}.`;
      return sentences.join('. ');
    } else {
      return `${text} Specifically, ${element.toLowerCase()}.`;
    }
  }
  
  return text;
}

function applyPrivacyGuardrail(text: string, sexualityHooks: VoicepackRuntime['sexuality_hooks_summary']): string {
  if (sexualityHooks.privacy !== "private") return text;
  
  const intimateKeywords = [
    'sexual', 'intimate', 'bedroom', 'aroused', 'desire', 'attraction',
    'romantic details', 'personal relationship', 'physical intimacy'
  ];
  
  let processedText = text;
  
  for (const keyword of intimateKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    processedText = processedText.replace(regex, '[private]');
  }
  
  // Remove sentences with too many [private] markers
  const sentences = processedText.split('. ');
  const filteredSentences = sentences.filter(sentence => 
    (sentence.match(/\[private\]/g) || []).length < 2
  );
  
  return filteredSentences.join('. ').replace(/\[private\]/g, '');
}

function enforceBrevity(text: string, brevity: "short"|"medium"|"long", syntaxPolicy: VoicepackRuntime['syntax_policy']): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let maxSentences: number;
  let targetLength: number;
  
  switch (brevity) {
    case "short":
      maxSentences = 3;
      targetLength = 100;
      break;
    case "medium":
      maxSentences = 5;
      targetLength = 200;
      break;
    case "long":
      maxSentences = 8;
      targetLength = 350;
      break;
  }
  
  // Trim to max sentences
  let trimmedSentences = sentences.slice(0, maxSentences);
  
  // Apply sentence length distribution
  trimmedSentences = trimmedSentences.map(sentence => {
    const words = sentence.trim().split(/\s+/);
    const dist = syntaxPolicy.sentence_length_dist;
    
    // Determine target length based on distribution
    let targetWords: number;
    const rand = Math.random();
    
    if (rand < dist.short) {
      targetWords = Math.min(words.length, 8);
    } else if (rand < dist.short + dist.medium) {
      targetWords = Math.min(words.length, 15);
    } else {
      targetWords = Math.min(words.length, 25);
    }
    
    if (words.length > targetWords) {
      return words.slice(0, targetWords).join(' ') + '...';
    }
    
    return sentence;
  });
  
  const result = trimmedSentences.join('. ').trim();
  
  // Final length check
  if (result.length > targetLength) {
    return result.substring(0, targetLength - 3) + '...';
  }
  
  return result;
}

export function generateTelemetry(
  text: string,
  voicepack: VoicepackRuntime,
  plan: Plan,
  latencyMs: number,
  personaId: string,
  voicepackHash: string
): VoicepackTelemetry {
  return {
    voicepack_hash: voicepackHash,
    used_response_shape: plan.response_shape,
    signature_token_count: countSignatureTokens(text, voicepack.lexicon.signature_tokens),
    banned_frame_hits: countBannedFrameHits(text, plan.banned_frames),
    must_include_satisfied: checkMustIncludeSatisfied(text, plan.must_include),
    rhetorical_q_count: countRhetoricalQuestions(text),
    avg_sentence_length: calculateAverageSentenceLength(text),
    latency_ms: latencyMs,
    turn_classification: {
      intent: plan.response_shape as any,
      topics: plan.stance_hint.map(hint => hint.split(' ')[1] || 'unknown'),
      audience: "peer", // Would be passed from classification
      sensitivity: "medium" // Would be passed from classification
    },
    state_deltas_applied: extractNumericDeltas(plan.style_deltas)
  };
}

function countSignatureTokens(text: string, tokens: string[]): number {
  const lowerText = text.toLowerCase();
  return tokens.filter(token => lowerText.includes(token.toLowerCase())).length;
}

function countBannedFrameHits(text: string, bannedFrames: string[]): number {
  const lowerText = text.toLowerCase();
  return bannedFrames.filter(frame => lowerText.includes(frame.toLowerCase())).length;
}

function checkMustIncludeSatisfied(text: string, mustInclude: string[]): boolean {
  if (mustInclude.length === 0) return true;
  const lowerText = text.toLowerCase();
  return mustInclude.some(element => lowerText.includes(element.toLowerCase()));
}

function countRhetoricalQuestions(text: string): number {
  return (text.match(/\?/g) || []).length;
}

function calculateAverageSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  
  const totalWords = sentences.reduce((sum, sentence) => {
    return sum + sentence.trim().split(/\s+/).length;
  }, 0);
  
  return Math.round((totalWords / sentences.length) * 100) / 100;
}

function extractNumericDeltas(styleDeltas: Record<string, number | string>): Record<string, number> {
  const numericDeltas: Record<string, number> = {};
  
  for (const [key, value] of Object.entries(styleDeltas)) {
    if (typeof value === 'number') {
      numericDeltas[key] = value;
    } else if (typeof value === 'string' && value.startsWith('+')) {
      numericDeltas[key] = parseFloat(value.substring(1)) || 0;
    } else if (typeof value === 'string' && value.startsWith('-')) {
      numericDeltas[key] = -parseFloat(value.substring(1)) || 0;
    }
  }
  
  return numericDeltas;
}