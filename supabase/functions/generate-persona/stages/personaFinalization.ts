
import { PersonaTemplate } from "../types.ts";
import { validateGeneratedPersona } from "../validationService.ts";
import { validateAndCleanTraits } from "../traitValidator.ts";
import { PersonaGenerationError } from "../errorHandler.ts";

export function finalizePersona(
  basePersona: PersonaTemplate, 
  traitData: any, 
  behavioralLinguistic: any, 
  interviewResponses: any[]
): PersonaTemplate {
  console.log('=== FINALIZING PERSONA ===');
  
  // Merge all components into the base persona
  Object.assign(basePersona, {
    trait_profile: traitData.trait_profile,
    emotional_triggers: traitData.emotional_triggers,
    behavioral_modulation: behavioralLinguistic.behavioral_modulation,
    linguistic_profile: behavioralLinguistic.linguistic_profile,
    simulation_directives: behavioralLinguistic.simulation_directives,
    preinterview_tags: behavioralLinguistic.preinterview_tags
  });
  
  basePersona.interview_sections = interviewResponses;

  // Final validation before saving
  const finalValidation = validateGeneratedPersona(basePersona);
  if (!finalValidation.isValid) {
    console.error('Final persona validation failed:', finalValidation.errors);
    throw new PersonaGenerationError(
      'validation', 
      `Generated persona is incomplete: ${finalValidation.errors.join(', ')}`,
      undefined,
      { personaName: basePersona.name, errors: finalValidation.errors }
    );
  }

  // Clean and validate traits
  const validatedPersona = validateAndCleanTraits(basePersona);
  
  // Ensure all required fields have proper defaults
  validatedPersona.behavioral_modulation = validatedPersona.behavioral_modulation || {
    communication_style: { formality_level: 0.5, emotional_expressiveness: 0.6, directness: 0.7, humor_usage: 0.4 },
    response_patterns: { elaboration_tendency: 0.6, example_usage: 0.7, personal_anecdote_frequency: 0.5, technical_depth_preference: 0.4 },
    contextual_adaptability: { topic_sensitivity: 0.6, audience_awareness: 0.7, emotional_responsiveness: 0.6 }
  };

  validatedPersona.linguistic_profile = validatedPersona.linguistic_profile || {
    vocabulary_complexity: 0.6, sentence_structure_preference: 0.5, cultural_linguistic_markers: [],
    communication_pace: 0.6, filler_word_usage: 0.3, interruption_tendency: 0.4,
    question_asking_frequency: 0.5, storytelling_inclination: 0.6
  };

  validatedPersona.simulation_directives = validatedPersona.simulation_directives || {
    authenticity_level: 0.9, consistency_enforcement: 0.8, emotional_range_limit: 0.7,
    response_variability: 0.6, knowledge_boundary_respect: 0.9, personality_drift_prevention: 0.8
  };

  validatedPersona.preinterview_tags = validatedPersona.preinterview_tags || [
    "demographic_match", "trait_validated", "behavioral_profiled"
  ];

  validatedPersona.emotional_triggers = validatedPersona.emotional_triggers || {
    positive_triggers: [], negative_triggers: []
  };

  console.log('✅ Persona finalized and validated');
  return validatedPersona;
}
