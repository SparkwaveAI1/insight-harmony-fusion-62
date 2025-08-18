import { VoicepackRuntime, Plan } from '../../types/voicepack';

/**
 * Post-processes LLM output to enforce voicepack constraints
 */
export function postProcess(text: string, voicepack: VoicepackRuntime, plan: Plan): string {
  let processedText = text.trim();
  
  // 1. Enforce response shape structure
  processedText = enforceResponseShape(processedText, plan, voicepack);
  
  // 2. Inject signature tokens if missing
  processedText = ensureSignatureTokens(processedText, voicepack);
  
  // 3. Remove banned frames
  processedText = removeBannedFrames(processedText, plan.banned_frames);
  
  // 4. Enforce must-include requirements
  processedText = enforceMustInclude(processedText, plan.must_include);
  
  // 5. Apply privacy guardrails
  processedText = applyPrivacyGuardrails(processedText, voicepack);
  
  // 6. Enforce brevity constraints
  processedText = enforceBrevity(processedText, plan.brevity, voicepack);
  
  return processedText;
}

/**
 * Restructures text to match expected response shape
 */
function enforceResponseShape(text: string, plan: Plan, voicepack: VoicepackRuntime): string {
  const shapes = voicepack.response_shapes[plan.response_shape];
  if (!shapes || shapes.length === 0) return text;
  
  // If text doesn't start with any expected shape, prepend a random one
  const startsWithShape = shapes.some(shape => 
    text.toLowerCase().startsWith(shape.toLowerCase().replace('...', ''))
  );
  
  if (!startsWithShape && text.length > 0) {
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    const connector = randomShape.endsWith('...') ? ' ' : ': ';
    text = randomShape.replace('...', '') + connector + text;
  }
  
  // Limit lists per voicepack policy
  const maxLists = voicepack.syntax_policy.lists_per_200toks_max;
  const approxTokens = text.length / 4;
  const maxListsForText = Math.ceil((approxTokens / 200) * maxLists);
  
  // Simple list detection and truncation
  const listMatches = text.match(/^\s*[-•*]\s/gm);
  if (listMatches && listMatches.length > maxListsForText) {
    const lines = text.split('\n');
    let listCount = 0;
    const filteredLines = lines.filter(line => {
      if (line.match(/^\s*[-•*]\s/)) {
        listCount++;
        return listCount <= maxListsForText;
      }
      return true;
    });
    text = filteredLines.join('\n');
  }
  
  return text;
}

/**
 * Ensures at least one signature token is present
 */
function ensureSignatureTokens(text: string, voicepack: VoicepackRuntime): string {
  const signatureTokens = voicepack.lexicon.signature_tokens;
  if (signatureTokens.length === 0) return text;
  
  // Check if any signature token is already present
  const hasSignatureToken = signatureTokens.some(token => 
    text.toLowerCase().includes(token.toLowerCase())
  );
  
  if (!hasSignatureToken) {
    // Inject a random signature token
    const randomToken = signatureTokens[Math.floor(Math.random() * signatureTokens.length)];
    
    // Find a good insertion point (end of first sentence or beginning)
    const firstSentenceEnd = text.search(/[.!?]\s/);
    if (firstSentenceEnd > 0 && firstSentenceEnd < text.length / 2) {
      const beforePunct = text.substring(0, firstSentenceEnd);
      const afterPunct = text.substring(firstSentenceEnd);
      text = beforePunct + ` (${randomToken})` + afterPunct;
    } else {
      text = `${randomToken} — ` + text;
    }
  }
  
  return text;
}

/**
 * Removes forbidden frames from text
 */
function removeBannedFrames(text: string, bannedFrames: string[]): string {
  let processedText = text;
  
  for (const frame of bannedFrames) {
    // Case-insensitive removal
    const regex = new RegExp(frame.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    processedText = processedText.replace(regex, '');
  }
  
  // Clean up extra spaces and punctuation
  processedText = processedText
    .replace(/\s+/g, ' ')
    .replace(/\s+([.!?])/g, '$1')
    .replace(/([.!?])\s*([.!?])/g, '$1')
    .trim();
  
  return processedText;
}

/**
 * Ensures must-include elements are present
 */
function enforceMustInclude(text: string, mustInclude: string[]): string {
  let processedText = text;
  
  for (const requirement of mustInclude) {
    // Check if requirement is already satisfied
    const isPresent = text.toLowerCase().includes(requirement.toLowerCase());
    
    if (!isPresent) {
      // Light rewrite to include the requirement
      const sentences = processedText.split(/[.!?]+/).filter(s => s.trim());
      if (sentences.length > 0) {
        // Add to the last sentence
        const lastSentence = sentences[sentences.length - 1].trim();
        sentences[sentences.length - 1] = lastSentence + ` (thinking about ${requirement})`;
        processedText = sentences.join('. ') + '.';
      } else {
        processedText += ` Regarding ${requirement}: this is definitely relevant.`;
      }
    }
  }
  
  return processedText;
}

/**
 * Applies privacy guardrails based on sexuality profile
 */
function applyPrivacyGuardrails(text: string, voicepack: VoicepackRuntime): string {
  const privacy = voicepack.sexuality_hooks_summary.privacy;
  
  if (privacy === 'private') {
    // Remove intimate disclosures
    const intimateTerms = [
      'sexual', 'intimate', 'bedroom', 'hookup', 'makeout', 
      'flirting', 'attracted to', 'turned on', 'aroused'
    ];
    
    let processedText = text;
    for (const term of intimateTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      processedText = processedText.replace(regex, '[private]');
    }
    
    // Remove overly personal relationship details
    processedText = processedText.replace(
      /\b(my (partner|boyfriend|girlfriend|husband|wife) and I)\b/gi, 
      'someone I know'
    );
    
    return processedText;
  }
  
  return text;
}

/**
 * Enforces brevity constraints
 */
function enforceBrevity(text: string, brevity: Plan['brevity'], voicepack: VoicepackRuntime): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  
  let maxSentences: number;
  switch (brevity) {
    case 'short':
      maxSentences = 2;
      break;
    case 'medium':
      maxSentences = 4;
      break;
    case 'long':
      maxSentences = 6;
      break;
    default:
      maxSentences = 4;
  }
  
  // Adjust based on syntax policy
  if (voicepack.syntax_policy.sentence_length_dist.short > 0.6) {
    maxSentences = Math.min(maxSentences, 3);
  } else if (voicepack.syntax_policy.sentence_length_dist.long > 0.4) {
    maxSentences += 1;
  }
  
  if (sentences.length > maxSentences) {
    // Keep the most important sentences (first and last)
    const keptSentences = [
      ...sentences.slice(0, Math.ceil(maxSentences / 2)),
      ...sentences.slice(-Math.floor(maxSentences / 2))
    ];
    return keptSentences.join('. ') + '.';
  }
  
  return text;
}

/**
 * Analyzes response for telemetry metrics
 */
export function analyzeResponse(
  text: string, 
  voicepack: VoicepackRuntime, 
  plan: Plan
): Record<string, any> {
  const metrics: Record<string, any> = {
    response_length: text.length,
    estimated_tokens: Math.ceil(text.length / 4),
    sentence_count: text.split(/[.!?]+/).filter(s => s.trim()).length
  };

  // Count signature tokens
  metrics.signature_token_count = voicepack.lexicon.signature_tokens.reduce((count, token) => {
    const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  // Check for banned frames
  metrics.banned_frame_hits = plan.banned_frames.reduce((count, frame) => {
    const regex = new RegExp(frame.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  // Check must-include satisfaction
  metrics.must_include_satisfied = plan.must_include.every(requirement =>
    text.toLowerCase().includes(requirement.toLowerCase())
  );

  // Count rhetorical questions
  const rhetoricalQuestions = text.match(/\?/g);
  metrics.rhetorical_q_count = rhetoricalQuestions ? rhetoricalQuestions.length : 0;

  // Calculate average sentence length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  if (sentences.length > 0) {
    const totalTokens = sentences.reduce((sum, sentence) => sum + Math.ceil(sentence.length / 4), 0);
    metrics.avg_sentence_length = totalTokens / sentences.length;
  } else {
    metrics.avg_sentence_length = 0;
  }

  // Response shape validation
  const shapes = voicepack.response_shapes[plan.response_shape] || [];
  metrics.used_response_shape = shapes.some(shape => 
    text.toLowerCase().startsWith(shape.toLowerCase().replace('...', ''))
  );

  return metrics;
}
