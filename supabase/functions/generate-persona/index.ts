
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { corsHeaders } from "../_shared/cors.ts";
import { generatePersonaDemographics, generatePersonaTraits, generateInterviewResponses } from "./openaiService.ts";
import { validateAndCleanTraits } from "./traitValidator.ts";
import { 
  validateUserPrompt, 
  validateGeneratedPersona, 
  validateTraitValues 
} from "./validationService.ts";
import { 
  handleGenerationError, 
  PersonaGenerationError, 
  wrapWithErrorHandling 
} from "./errorHandler.ts";
import { withRetry } from "./retryService.ts";

// Initialize Supabase client for user validation
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Enhanced trait validation to catch default values
function validateTraitRealism(traitProfile: any): { isValid: boolean; errors: string[]; defaultRatio: number } {
  console.log("=== VALIDATING TRAIT REALISM ===");
  
  if (!traitProfile || typeof traitProfile !== 'object') {
    return { isValid: false, errors: ["Trait profile is missing or invalid"], defaultRatio: 1.0 };
  }

  const allValues: number[] = [];
  
  // Extract all numeric values from trait profile
  const extractValues = (obj: any) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'number') {
        allValues.push(value);
      } else if (typeof value === 'object' && value !== null) {
        extractValues(value);
      }
    }
  };
  
  extractValues(traitProfile);
  
  if (allValues.length === 0) {
    return { isValid: false, errors: ["No numeric trait values found"], defaultRatio: 1.0 };
  }
  
  // Count values that are exactly 0.5 (defaults)
  const exactHalfCount = allValues.filter(val => val === 0.5).length;
  const defaultRatio = exactHalfCount / allValues.length;
  
  console.log(`Trait validation: ${allValues.length} total values, ${exactHalfCount} are 0.5 (${Math.round(defaultRatio * 100)}% defaults)`);
  
  // If more than 30% are exactly 0.5, it's likely a failed generation
  if (defaultRatio > 0.3) {
    return { 
      isValid: false, 
      errors: [`Too many default values: ${Math.round(defaultRatio * 100)}% are 0.5`], 
      defaultRatio 
    };
  }
  
  console.log("✅ Trait profile has realistic variation");
  return { isValid: true, errors: [], defaultRatio };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security validation: Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new PersonaGenerationError('authentication', 'Authentication required');
    }

    // Verify the JWT token and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new PersonaGenerationError('authentication', 'Invalid authentication token');
    }

    const { prompt } = await req.json();

    // Validate user input
    const promptValidation = validateUserPrompt(prompt);
    if (!promptValidation.isValid) {
      throw new PersonaGenerationError('validation', promptValidation.errors.join(', '));
    }

    if (promptValidation.warnings.length > 0) {
      console.warn('Prompt validation warnings:', promptValidation.warnings);
    }

    console.log('=== STARTING ENHANCED PERSONA GENERATION ===');
    console.log(`User: ${user.id}`);
    console.log(`Prompt length: ${prompt.length} characters`);
    
    // STEP 1: Generate demographics with retry logic
    const basePersona = await wrapWithErrorHandling(
      () => withRetry(
        () => generatePersonaDemographics(prompt),
        { maxRetries: 2 },
        'Demographics Generation'
      ),
      'demographics',
      { prompt: prompt.substring(0, 100) + '...' }
    );

    console.log(`Step 1 Complete: Generated base persona "${basePersona.name}"`);
    
    // Validate persona_id uniqueness
    const { data: existingPersona } = await supabase
      .from('personas')
      .select('persona_id')
      .eq('persona_id', basePersona.persona_id)
      .single();

    if (existingPersona) {
      basePersona.persona_id = `${basePersona.persona_id}-${Math.random().toString(36).substr(2, 4)}`;
      console.log(`Persona ID collision detected, using: ${basePersona.persona_id}`);
    }

    // Add user_id to persona
    basePersona.user_id = user.id;
    
    // STEP 2: Generate comprehensive trait profile with enhanced validation and retry
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

    console.log('Step 2 Complete: Generated and validated realistic trait profile');
    
    // Validate trait values before proceeding
    const traitValidation = validateTraitValues(comprehensiveProfile.trait_profile);
    if (!traitValidation.isValid) {
      console.error('Final trait validation failed:', traitValidation.errors);
      // Continue but log the issues - the enhanced validation above should have caught this
    }
    
    // Merge the comprehensive profile into the base persona
    Object.assign(basePersona, {
      trait_profile: comprehensiveProfile.trait_profile,
      behavioral_modulation: comprehensiveProfile.behavioral_modulation,
      linguistic_profile: comprehensiveProfile.linguistic_profile,
      emotional_triggers: comprehensiveProfile.emotional_triggers,
      simulation_directives: comprehensiveProfile.simulation_directives,
      preinterview_tags: comprehensiveProfile.preinterview_tags
    });
    
    // STEP 3: Generate interview responses with enhanced error handling
    let interviewResponses;
    try {
      interviewResponses = await wrapWithErrorHandling(
        () => withRetry(
          () => generateInterviewResponses(basePersona),
          { maxRetries: 1 }, // Fewer retries for interview as it's optional
          'Interview Generation'
        ),
        'interview',
        { personaName: basePersona.name }
      );
      console.log(`Step 3 Complete: Generated ${interviewResponses.length} interview sections`);
    } catch (error) {
      console.warn('Interview generation failed, using minimal fallback:', error.message);
      interviewResponses = [
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

    console.log('=== PERSONA GENERATION COMPLETED SUCCESSFULLY ===');
    console.log(`Final persona: ${validatedPersona.name} for user: ${user.id}`);
    console.log(`- Demographics: ✓`);
    console.log(`- Trait profile: ✓ (${Object.keys(validatedPersona.trait_profile).length} categories)`);
    console.log(`- Emotional triggers: ✓ (${validatedPersona.emotional_triggers?.positive_triggers?.length || 0}+${validatedPersona.emotional_triggers?.negative_triggers?.length || 0} triggers)`);
    console.log(`- Interview sections: ✓ (${validatedPersona.interview_sections?.length || 0} sections)`);

    return new Response(
      JSON.stringify({
        success: true,
        persona: validatedPersona,
        warnings: finalValidation.warnings,
        metadata: {
          traitGenerationAttempts: attemptCount,
          hasRealisticTraits: true
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    if (error instanceof PersonaGenerationError) {
      return handleGenerationError({
        step: error.step,
        error: error.originalError || error,
        context: error.context
      });
    }
    
    console.error('Unexpected error in persona generation:', error);
    return handleGenerationError({
      step: 'unknown',
      error: error as Error,
      context: { unexpected: true }
    });
  }
});
