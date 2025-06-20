
import { PersonaTemplate } from "./types.ts";
import { 
  generateCoreDemographics,
  generateLocationContext,
  generateFamilyRelationships,
  generateHealthAttributes,
  generatePhysicalDescription,
  generateKnowledgeDomains,
  generatePsychologicalCultural,
  generateTraitProfile,
  generateBehavioralLinguistic,
  generateInterviewResponses
} from "./openaiService.ts";
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
  console.log('=== STAGE 1: GENERATING CORE DEMOGRAPHICS ===');
  
  const basePersona = await wrapWithErrorHandling(
    () => withRetry(
      () => generateCoreDemographics(prompt),
      { maxRetries: 2 },
      'Core Demographics Generation'
    ),
    'demographics',
    { prompt: prompt.substring(0, 100) + '...' }
  );

  console.log(`✅ Generated base persona "${basePersona.name}"`);
  
  // Validate demographic structure
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

export async function enhancePersonaMetadata(basePersona: PersonaTemplate, prompt: string): Promise<PersonaTemplate> {
  console.log('=== STAGE 2-7: ENHANCING METADATA ===');
  
  // Stage 2: Location & Context
  console.log('Generating location & context...');
  const locationContext = await wrapWithErrorHandling(
    () => withRetry(
      () => generateLocationContext(basePersona, prompt),
      { maxRetries: 1 },
      'Location Context Generation'
    ),
    'location_context',
    { personaName: basePersona.name }
  );
  
  // Stage 3: Family & Relationships
  console.log('Generating family & relationships...');
  const familyRelationships = await wrapWithErrorHandling(
    () => withRetry(
      () => generateFamilyRelationships(basePersona, prompt),
      { maxRetries: 1 },
      'Family Relationships Generation'
    ),
    'family_relationships',
    { personaName: basePersona.name }
  );
  
  // Stage 4: Health Attributes
  console.log('Generating health attributes...');
  const healthAttributes = await wrapWithErrorHandling(
    () => withRetry(
      () => generateHealthAttributes(basePersona, prompt),
      { maxRetries: 1 },
      'Health Attributes Generation'
    ),
    'health_attributes',
    { personaName: basePersona.name }
  );
  
  // Stage 5: Physical Description
  console.log('Generating physical description...');
  const physicalDescription = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePhysicalDescription(basePersona, prompt),
      { maxRetries: 1 },
      'Physical Description Generation'
    ),
    'physical_description',
    { personaName: basePersona.name }
  );
  
  // Stage 6: Knowledge Domains
  console.log('Generating knowledge domains...');
  const knowledgeDomains = await wrapWithErrorHandling(
    () => withRetry(
      () => generateKnowledgeDomains(basePersona, prompt),
      { maxRetries: 1 },
      'Knowledge Domains Generation'
    ),
    'knowledge_domains',
    { personaName: basePersona.name }
  );
  
  // Stage 7: Psychological & Cultural
  console.log('Generating psychological & cultural data...');
  const psychologicalCultural = await wrapWithErrorHandling(
    () => withRetry(
      () => generatePsychologicalCultural(basePersona, prompt),
      { maxRetries: 1 },
      'Psychological Cultural Generation'
    ),
    'psychological_cultural',
    { personaName: basePersona.name }
  );
  
  // Merge all metadata
  Object.assign(basePersona.metadata, {
    ...locationContext.location_context,
    ...familyRelationships.relationships_family,
    ...healthAttributes.health_attributes,
    ...physicalDescription.physical_description,
    ...knowledgeDomains.knowledge_domains,
    ...psychologicalCultural.psychological_cultural
  });
  
  console.log('✅ Enhanced metadata with all comprehensive attributes');
  return basePersona;
}

export async function generatePersonaTraitProfile(basePersona: PersonaTemplate, prompt: string): Promise<any> {
  console.log('=== STAGE 8: GENERATING TRAIT PROFILE ===');
  
  let traitData;
  let attemptCount = 0;
  const maxTraitAttempts = 3;
  
  do {
    attemptCount++;
    console.log(`=== TRAIT GENERATION ATTEMPT ${attemptCount}/${maxTraitAttempts} ===`);
    
    try {
      traitData = await wrapWithErrorHandling(
        () => withRetry(
          () => generateTraitProfile(basePersona, prompt),
          { maxRetries: 1 },
          'Trait Profile Generation'
        ),
        'traits',
        { personaName: basePersona.name, attempt: attemptCount }
      );

      // Validate trait realism
      const traitValidation = validateTraitRealism(traitData.trait_profile);
      
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
        continue;
      }
      
      console.log(`✅ Trait validation passed on attempt ${attemptCount}`);
      console.log(`Default ratio: ${Math.round(traitValidation.defaultRatio * 100)}% (threshold: ≤30%)`);
      break;
      
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
  
  // Validate trait values
  const traitValidation = validateTraitValues(traitData.trait_profile);
  if (!traitValidation.isValid) {
    console.error('Final trait validation failed:', traitValidation.errors);
  }
  
  return { traitData, attemptCount };
}

export async function generatePersonaBehavioralLinguistic(basePersona: PersonaTemplate, prompt: string): Promise<any> {
  console.log('=== STAGE 9: GENERATING BEHAVIORAL & LINGUISTIC PROFILES ===');
  
  const behavioralLinguistic = await wrapWithErrorHandling(
    () => withRetry(
      () => generateBehavioralLinguistic(basePersona, prompt),
      { maxRetries: 1 },
      'Behavioral Linguistic Generation'
    ),
    'behavioral_linguistic',
    { personaName: basePersona.name }
  );
  
  console.log('✅ Generated behavioral and linguistic profiles');
  return behavioralLinguistic;
}

export async function generatePersonaInterview(basePersona: PersonaTemplate): Promise<any[]> {
  console.log('=== STAGE 10: GENERATING INTERVIEW RESPONSES ===');
  
  try {
    const interviewResponses = await wrapWithErrorHandling(
      () => withRetry(
        () => generateInterviewResponses(basePersona),
        { maxRetries: 1 },
        'Interview Generation'
      ),
      'interview',
      { personaName: basePersona.name }
    );
    console.log(`✅ Generated ${interviewResponses.length} interview sections`);
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
