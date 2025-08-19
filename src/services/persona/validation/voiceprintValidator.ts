import { PersonaV2 } from '../../../types/persona-v2';

export function validateVoiceprint(persona: PersonaV2): number {
  // Validate linguistic consistency and uniqueness
  const linguistic = persona.linguistic_style;
  const cognitive = persona.cognitive_profile;
  
  let score = 0.4; // baseline
  
  // Consistent formality and directness
  if (linguistic.base_voice?.formality && linguistic.base_voice?.directness) score += 0.2;
  
  // Personality-aligned language patterns
  if (cognitive.big_five.agreeableness > 0.6 && linguistic.lexical_preferences?.hedges?.length > 2) score += 0.2;
  
  // Unique signature elements
  if (linguistic.syntax_and_rhythm?.signature_phrases?.length > 0) score += 0.2;
  
  return Math.min(1, score);
}