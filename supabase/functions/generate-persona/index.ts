
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { 
  validateUserPrompt 
} from "./validationService.ts";
import { 
  handleGenerationError, 
  PersonaGenerationError 
} from "./errorHandler.ts";
import { validateUserAuthentication } from "./authService.ts";
import { validatePersonaUniqueness } from "./validationHelpers.ts";
import { 
  generateBasePersona, 
  generatePersonaTraitProfile, 
  generatePersonaInterview, 
  finalizePersona 
} from "./personaGenerator.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security validation: Verify user authentication
    const authHeader = req.headers.get('Authorization');
    const { user, supabase } = await validateUserAuthentication(authHeader);

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
    
    // STEP 1: Generate demographics with retry logic and enhanced validation
    const basePersona = await generateBasePersona(prompt);
    console.log(`Step 1 Complete: Generated base persona "${basePersona.name}"`);
    
    // Validate persona_id uniqueness and add user_id
    basePersona.persona_id = await validatePersonaUniqueness(supabase, basePersona);
    basePersona.user_id = user.id;
    
    // STEP 2: Generate comprehensive trait profile with enhanced validation and retry
    const { comprehensiveProfile, attemptCount } = await generatePersonaTraitProfile(basePersona, prompt);
    console.log('Step 2 Complete: Generated and validated realistic trait profile');
    
    // STEP 3: Generate interview responses with enhanced error handling
    const interviewResponses = await generatePersonaInterview(basePersona);
    console.log(`Step 3 Complete: Generated ${interviewResponses.length} interview sections`);

    // STEP 4: Finalize and validate the complete persona
    const validatedPersona = finalizePersona(basePersona, comprehensiveProfile, interviewResponses);

    console.log('=== PERSONA GENERATION COMPLETED SUCCESSFULLY ===');
    console.log(`Final persona: ${validatedPersona.name} for user: ${user.id}`);
    console.log(`- Demographics: ✓ (${Object.keys(validatedPersona.metadata).length} fields)`);
    console.log(`- Trait profile: ✓ (${Object.keys(validatedPersona.trait_profile).length} categories)`);
    console.log(`- Emotional triggers: ✓ (${validatedPersona.emotional_triggers?.positive_triggers?.length || 0}+${validatedPersona.emotional_triggers?.negative_triggers?.length || 0} triggers)`);
    console.log(`- Interview sections: ✓ (${validatedPersona.interview_sections?.length || 0} sections)`);

    return new Response(
      JSON.stringify({
        success: true,
        persona: validatedPersona,
        warnings: [],
        metadata: {
          traitGenerationAttempts: attemptCount,
          hasRealisticTraits: true,
          demographicFieldsGenerated: Object.keys(validatedPersona.metadata).length
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
