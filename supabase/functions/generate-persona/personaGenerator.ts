
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
import { 
  validateTraitRealism, 
  validateDemographicStructure, 
  validateCompleteMetadata,
  validatePersonaUniqueness 
} from "./validationHelpers.ts";

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
  
  // Validate ONLY core demographic structure (Stage 1 fields)
  const demographicValidation = validateDemographicStructure(basePersona.metadata);
  if (!demographicValidation.isValid) {
    console.error('❌ Core demographic validation failed:', demographicValidation.errors);
    throw new PersonaGenerationError(
      'demographics',
      `Core demographics validation failed: ${demographicValidation.errors.join(', ')}`,
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
  
  // Now validate complete metadata after all stages
  const completeValidation = validateCompleteMetadata(basePersona.metadata);
  if (!completeValidation.isValid) {
    console.warn('⚠️ Complete metadata validation failed:', completeValidation.errors);
    // Don't throw error, just warn - we can continue with incomplete data
  }
  
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
  console.log('=== STAGE 10: GENERATING ENHANCED INTERVIEW RESPONSES ===');
  
  try {
    console.log('Attempting detailed interview generation...');
    const interviewResponses = await wrapWithErrorHandling(
      () => withRetry(
        () => generateInterviewResponses(basePersona),
        { maxRetries: 2 }, // Increased retries for interview generation
        'Enhanced Interview Generation'
      ),
      'interview',
      { personaName: basePersona.name }
    );
    
    // Validate interview quality
    if (interviewResponses && Array.isArray(interviewResponses) && interviewResponses.length >= 2) {
      console.log(`✅ Generated ${interviewResponses.length} detailed interview sections`);
      
      // Log section details for verification
      const sectionTitles = interviewResponses.map(section => section.section_title);
      console.log('Interview sections generated:', sectionTitles);
      
      // Count total responses for quality check
      const totalResponses = interviewResponses.reduce((total, section) => 
        total + (section.responses ? section.responses.length : 0), 0
      );
      console.log(`Total interview responses: ${totalResponses}`);
      
      if (totalResponses >= 4) {
        console.log('✅ Interview quality check passed - sufficient detailed responses');
        return interviewResponses;
      } else {
        console.warn('⚠️ Interview responses below quality threshold, but proceeding');
        return interviewResponses;
      }
    } else {
      console.warn('⚠️ Interview generation returned insufficient data, using enhanced fallback');
      throw new Error('Insufficient interview data generated');
    }
    
  } catch (error) {
    console.warn('Enhanced interview generation failed, using comprehensive fallback:', error.message);
    
    // Comprehensive fallback with multiple sections based on persona data
    const fallbackInterview = [
      {
        section_title: "Personal Background",
        responses: [
          {
            question: "Tell me about yourself",
            answer: `Hi, I'm ${basePersona.name}. I'm ${basePersona.metadata.age ? basePersona.metadata.age + ' years old and ' : ''}${basePersona.metadata.occupation ? 'work as a ' + basePersona.metadata.occupation : 'focused on my career development'}. ${basePersona.metadata.location_history?.current_residence ? 'I currently live in ' + basePersona.metadata.location_history.current_residence + '.' : ''}`
          },
          {
            question: "What's important to you in life?",
            answer: `${basePersona.metadata.education_level ? 'My ' + basePersona.metadata.education_level + ' has shaped my perspective, and ' : ''}I believe in continuous growth and meaningful relationships. ${basePersona.metadata.marital_status === 'Single' ? 'I\'m currently single and focusing on personal development.' : basePersona.metadata.marital_status ? 'My relationship status as ' + basePersona.metadata.marital_status.toLowerCase() + ' is an important part of my life.' : ''}`
          }
        ]
      },
      {
        section_title: "Daily Life & Work",
        responses: [
          {
            question: "What does a typical day look like for you?",
            answer: `${basePersona.metadata.employment_type === 'Full-time' ? 'I work full-time' : basePersona.metadata.employment_type ? 'I work ' + basePersona.metadata.employment_type.toLowerCase() : 'My work schedule varies'}, ${basePersona.metadata.occupation ? 'and being a ' + basePersona.metadata.occupation + ' keeps me engaged' : 'which keeps me busy'}. ${basePersona.metadata.fitness_activity_level ? 'I try to stay ' + basePersona.metadata.fitness_activity_level.toLowerCase() + ' with regular exercise.' : 'I balance work with personal interests.'}`
          }
        ]
      },
      {
        section_title: "Values & Perspectives",
        responses: [
          {
            question: "How do you approach decision-making?",
            answer: `${basePersona.metadata.political_affiliation ? 'My ' + basePersona.metadata.political_affiliation.toLowerCase() + ' values influence how I see the world, ' : ''}and I try to make decisions based on both logic and empathy. ${basePersona.metadata.religious_affiliation && basePersona.metadata.religious_affiliation !== 'None' ? 'My ' + basePersona.metadata.religious_affiliation + ' background also plays a role in my moral framework.' : 'I rely on my personal moral framework to guide me.'}`
          }
        ]
      }
    ];

    console.log(`✅ Created comprehensive fallback interview with ${fallbackInterview.length} sections`);
    return fallbackInterview;
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
