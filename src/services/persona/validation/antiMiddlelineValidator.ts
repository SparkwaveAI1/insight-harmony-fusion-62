import { PersonaV2 } from '../../../types/persona-v2';

export function validateAntiMiddleline(persona: PersonaV2): number {
  // Check for differentiation from middle-line responses
  const cognitive = persona.cognitive_profile;
  const linguistic = persona.linguistic_style;
  
  let score = 0.5; // baseline
  
  // Strong personality traits increase differentiation
  if (cognitive.big_five.openness > 0.7 || cognitive.big_five.openness < 0.3) score += 0.2;
  if (cognitive.big_five.neuroticism > 0.6 || cognitive.big_five.neuroticism < 0.2) score += 0.2;
  
  // Unique linguistic markers
  if (linguistic.syntax_and_rhythm?.signature_phrases?.length > 2) score += 0.1;
  if (linguistic.anti_mode_collapse?.forbidden_frames?.length > 5) score += 0.1;
  
  return Math.min(1, score);
}