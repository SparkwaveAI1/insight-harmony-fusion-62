import { PersonaV2 } from '../../../types/persona-v2';

export function validateCliches(persona: PersonaV2): number {
  // Check for generic/cliche language patterns
  const linguistic = persona.linguistic_style;
  
  let score = 0.8; // start high, deduct for problems
  
  const cliches = [
    "at the end of the day",
    "it is what it is", 
    "think outside the box",
    "low hanging fruit"
  ];
  
  // Check forbidden frames
  const forbiddenFrames = linguistic.anti_mode_collapse?.forbidden_frames || [];
  if (forbiddenFrames.length < 3) score -= 0.2;
  
  // Check for signature uniqueness
  const signatures = linguistic.syntax_and_rhythm?.signature_phrases || [];
  if (signatures.some(sig => cliches.some(cliche => sig.toLowerCase().includes(cliche)))) {
    score -= 0.3;
  }
  
  return Math.max(0, score);
}