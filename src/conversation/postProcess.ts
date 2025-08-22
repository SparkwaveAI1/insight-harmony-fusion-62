import { VoicepackRuntime } from "../types/voicepack";
import { Plan } from "../types/voicepack";

export function postProcess(text: string, vp: VoicepackRuntime, plan: Plan): string {
  let processed = text.trim();
  
  // 1. Enforce selected response_shape structure
  processed = enforceResponseShape(processed, plan.response_shape, vp);
  
  // 2. Inject signature tokens if none present
  processed = injectSignatureTokens(processed, vp);
  
  // 3. Remove banned frames and enforce must_include
  processed = removeBannedFrames(processed, plan.banned_frames);
  processed = enforceMustInclude(processed, plan.must_include);
  
  // 4. Apply privacy guardrails
  processed = applyPrivacyGuardrails(processed, vp);
  
  // 5. Apply brevity constraints
  processed = applyBrevity(processed, plan.brevity, vp);
  
  return processed;
}

function enforceResponseShape(text: string, shape: string, vp: VoicepackRuntime): string {
  const shapes = vp.response_shapes[shape];
  if (!shapes || shapes.length === 0) return text;
  
  // Check if text already follows one of the acceptable shapes
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return text;
  
  // For now, just ensure basic structure compliance
  // More sophisticated shape enforcement would require NLP analysis
  
  // Limit lists per policy
  const listMatches = text.match(/^\s*[-•*]\s+/gm) || [];
  if (listMatches.length > vp.syntax_policy.lists_per_200toks_max) {
    // Convert excess list items to sentences
    const words = text.split(' ');
    const tokensPerList = Math.floor(200 / vp.syntax_policy.lists_per_200toks_max);
    if (words.length > tokensPerList * vp.syntax_policy.lists_per_200toks_max) {
      // Simplify by converting lists to prose
      text = text.replace(/^\s*[-•*]\s+/gm, '');
    }
  }
  
  return text;
}

function injectSignatureTokens(text: string, vp: VoicepackRuntime): string {
  const signatureTokens = vp.lexicon.signature_tokens;
  if (signatureTokens.length === 0) return text;
  
  // Check if any signature tokens are already present
  const hasSignature = signatureTokens.some(token => 
    text.toLowerCase().includes(token.toLowerCase())
  );
  
  if (!hasSignature && signatureTokens.length > 0) {
    // Inject a signature token naturally
    const token = signatureTokens[Math.floor(Math.random() * signatureTokens.length)];
    
    // Try to inject at natural positions
    if (text.includes('.')) {
      // Insert after first sentence
      text = text.replace(/\./, `. ${token}.`);
    } else {
      // Append at end
      text += ` ${token}.`;
    }
  }
  
  return text;
}

function removeBannedFrames(text: string, bannedFrames: string[]): string {
  let processed = text;
  
  for (const frame of bannedFrames) {
    // Remove exact matches and close variations
    const pattern = new RegExp(frame.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    processed = processed.replace(pattern, '');
  }
  
  // Clean up any double spaces or empty sentences
  processed = processed.replace(/\s+/g, ' ').trim();
  
  return processed;
}

function enforceMustInclude(text: string, mustInclude: string[]): string {
  let processed = text;
  
  for (const requirement of mustInclude) {
    if (requirement === "specific example" && !hasSpecificExample(text)) {
      // Add a generic example prompt
      processed += " For example, in my experience...";
    } else if (requirement === "personal relevance" && !hasPersonalRelevance(text)) {
      // Add personal connection
      processed = "From my perspective, " + processed;
    } else if (requirement === "concrete detail" && !hasConcreteDetail(text)) {
      // Flag for more specificity (in real implementation, might trigger regeneration)
      processed = processed.replace(/things?/gi, "specific things");
    } else if (requirement.includes("avoid sophisticated financial jargon")) {
      // Replace sophisticated terms with simpler ones
      processed = replaceSophisticatedJargon(processed);
    }
  }
  
  return processed;
}

function replaceSophisticatedJargon(text: string): string {
  const replacements = {
    "high-yield savings account": "savings account with good interest",
    "diversified portfolio": "mix of investments",
    "asset allocation": "how you split up your money",
    "compound interest": "interest that builds on itself",
    "risk tolerance": "how much risk you're comfortable with",
    "market volatility": "how much prices go up and down",
    "liquidity": "how easy it is to get your money out",
    "capital gains": "money you make when investments go up",
    "dividend yield": "money companies pay you for owning their stock"
  };
  
  let processed = text;
  for (const [sophisticated, simple] of Object.entries(replacements)) {
    processed = processed.replace(new RegExp(sophisticated, 'gi'), simple);
  }
  
  return processed;
}

function hasSpecificExample(text: string): boolean {
  const exampleMarkers = ["for example", "like when", "such as", "for instance", "like the time"];
  return exampleMarkers.some(marker => text.toLowerCase().includes(marker));
}

function hasPersonalRelevance(text: string): boolean {
  const personalMarkers = ["i", "my", "me", "in my experience", "from my perspective"];
  return personalMarkers.some(marker => text.toLowerCase().includes(marker));
}

function hasConcreteDetail(text: string): boolean {
  // Check for specific numbers, names, or detailed descriptions
  const hasNumbers = /\d+/.test(text);
  const hasSpecificTerms = /\b(specific|exactly|precisely|particular)\b/i.test(text);
  const hasDetailedDescription = text.split(' ').length > 20; // Basic heuristic
  
  return hasNumbers || hasSpecificTerms || hasDetailedDescription;
}

function applyPrivacyGuardrails(text: string, vp: VoicepackRuntime): string {
  if (vp.sexuality_hooks_summary.privacy === "private") {
    // Remove intimate disclosures
    const intimateTerms = ["intimate", "sexual", "bedroom", "private parts", "aroused"];
    let processed = text;
    
    for (const term of intimateTerms) {
      processed = processed.replace(new RegExp(`\\b${term}\\b`, 'gi'), '[private]');
    }
    
    return processed;
  }
  
  return text;
}

function applyBrevity(text: string, brevity: Plan['brevity'], vp: VoicepackRuntime): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let targetSentences: number;
  switch (brevity) {
    case "short":
      targetSentences = 1;
      break;
    case "medium":
      targetSentences = 2;
      break;
    case "long":
      targetSentences = 4;
      break;
    default:
      targetSentences = 2;
  }
  
  // Apply sentence length distribution from syntax policy
  const lengthDist = vp.syntax_policy.sentence_length_dist;
  
  if (sentences.length > targetSentences) {
    // Truncate to target length
    const truncated = sentences.slice(0, targetSentences);
    return truncated.join('. ') + '.';
  }
  
  // If too short and brevity allows, could expand (not implemented here)
  return text;
}