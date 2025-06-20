
import { PersonaTemplate } from "./types.ts";
import { generatePersonaDemographics, generatePersonaTraits, generateInterviewResponses } from "./openaiService.ts";
import { validateAndCleanTraits } from "./traitValidator.ts";
import { 
  validateUserPrompt, 
  validateGeneratedPersona, 
  validateTraitValues 
} from "./validationService.ts";
import { 
  PersonaGenerationError, 
  wrapWithErrorHandling 
} from "./errorHandler.ts";
import { withRetry } from "./retryService.ts";
import { validateTraitRealism, validateDemographicStructure } from "./validationHelpers.ts";

export async function generateBasePersona(prompt: string): Promise<PersonaTemplate> {
  console.log('=== GENERATING BASE PERSONA ===');
  
  const basePersona = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePersonaDemographics(prompt),
      { maxRetries: 2 },
      'Demographics Generation'
    ),
    'demographics',
    { prompt: prompt.substring(0, 100) + '...' }
  );

  console.log(`Generated base persona "${basePersona.name}"`);
  
  // CRITICAL: Validate demographic structure
  const demographicValidation = validateDemographicStructure(basePersona.metadata);
  if (!demographicValidation.isValid) {
    console.error('❌ Demographic validation failed:', demographicValidation.errors);
    throw new PersonaGenerationError(
      'demographics',
      `Demographics validation failed: ${demographicValidation.errors.join(', ')}`,
      undefined,
      { personaName: basePersona.name, errors: demographicValidation.errors }
    );
  }
  
  return basePersona;
}

export async function generatePersonaTraitProfile(basePersona: PersonaTemplate, prompt: string): Promise<any> {
  console.log('=== GENERATING TRAIT PROFILE ===');
  
  let comprehensiveProfile;
  let attemptCount = 0;
  const maxTraitAttempts = 3;
  
  do {
    attemptCount++;
    console.log(`=== TRAIT GENERATION ATTEMPT ${attemptCount}/${maxTraitAttempts} ===`);
    
    try {
      comprehensiveProfile = await wrapWithErrorHandling(
        () => withRetry(
          () => generatePersonaTraits(basePersona, prompt),
          { maxRetries: 1 },
          'Traits Generation'
        ),
        'traits',
        { personaName: basePersona.name, attempt: attemptCount }
      );

      // CRITICAL: Validate trait realism before proceeding
      const traitValidation = validateTraitRealism(comprehensiveProfile.trait_profile);
      
      if (!traitValidation.isValid) {
        console.error(`❌ Trait validation failed on attempt ${attemptCount}:`, traitValidation.errors);
        console.error(`Default ratio: ${Math.round(traitValidation.defaultRatio * 100)}%`);
        
        if (attemptCount >= maxTraitAttempts) {
          throw new PersonaGenerationError(
            'traits',
            `Failed to generate realistic traits after ${maxTraitAttempts} attempts. Last error: ${traitValidation.errors.join(', ')}`,
            undefined,
            { 
              personaName: basePersona.name, 
              finalDefaultRatio: traitValidation.defaultRatio,
              attempts: attemptCount 
            }
          );
        }
        
        console.warn(`⚠️ Retrying trait generation (attempt ${attemptCount + 1}/${maxTraitAttempts})`);
        continue; // Retry trait generation
      }
      
      console.log(`✅ Trait validation passed on attempt ${attemptCount}`);
      console.log(`Default ratio: ${Math.round(traitValidation.defaultRatio * 100)}% (threshold: ≤30%)`);
      break; // Success - exit retry loop
      
    } catch (error) {
      console.error(`Trait generation attempt ${attemptCount} failed:`, error.message);
      
      if (attemptCount >= maxTraitAttempts) {
        throw new PersonaGenerationError(
          'traits',
          `All trait generation attempts failed. Last error: ${error.message}`,
          error,
          { personaName: basePersona.name, attempts: attemptCount }
        );
      }
    }
  } while (attemptCount < maxTraitAttempts);

  console.log('✅ Generated and validated realistic trait profile');
  
  // Validate trait values before proceeding
  const traitValidation = validateTraitValues(comprehensiveProfile.trait_profile);
  if (!traitValidation.isValid) {
    console.error('Final trait validation failed:', traitValidation.errors);
    // Continue but log the issues - the enhanced validation above should have caught this
  }
  
  return { comprehensiveProfile, attemptCount };
}

export async function generatePersonaInterview(basePersona: PersonaTemplate): Promise<any[]> {
  console.log('=== GENERATING INTERVIEW RESPONSES ===');
  
  try {
    const interviewResponses = await wrapWithErrorHandling(
      () => withRetry(
        () => generateInterviewResponses(basePersona),
        { maxRetries: 1 }, // Fewer retries for interview as it's optional
        'Interview Generation'
      ),
      'interview',
      { personaName: basePersona.name }
    );
    console.log(`Generated ${interviewResponses.length} interview sections`);
    return interviewResponses;
  } catch (error) {
    console.warn('Interview generation failed, using minimal fallback:', error.message);
    return [
      {
        section_title: "Personal Background",
        responses: [
          {
            question: "Tell me about yourself",
            answer: `Hi, I'm ${basePersona.name}. ${basePersona.metadata.background || 'I\'d be happy to share more about my experiences and perspective.'}`
          }
        ]
      }
    ];
  }
}

export function finalizePersona(basePersona: PersonaTemplate, comprehensiveProfile: any, interviewResponses: any[]): PersonaTemplate {
  console.log('=== FINALIZING PERSONA ===');
  
  // Merge the comprehensive profile into the base persona
  Object.assign(basePersona, {
    trait_profile: comprehensiveProfile.trait_profile,
    behavioral_modulation: comprehensiveProfile.behavioral_modulation,
    linguistic_profile: comprehensiveProfile.linguistic_profile,
    emotional_triggers: comprehensiveProfile.emotional_triggers,
    simulation_directives: comprehensiveProfile.simulation_directives,
    preinterview_tags: comprehensiveProfile.preinterview_tags
  });
  
  basePersona.interview_sections = interviewResponses;

  // CRITICAL: Final validation before saving
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

  // Clean and validate traits one final time
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

  return validatedPersona;
}
